"use server"

import { getUploadAuthParams } from "@imagekit/next/server"
import { IMAGEKIT_CONFIG, TAGS } from "@/lib/constants"
import { getAdminDb, FieldValue, Timestamp } from "@/lib/firebase/admin"
import type { Photo, PhotoUploadData } from "@/lib/firebase/types"

// ImageKit file interface
export interface ImageKitFile {
  fileId: string
  name: string
  filePath: string
  url: string
  tags?: string[]
  width?: number
  height?: number
  size: number
  createdAt: string
}

// Helper to call ImageKit API with authentication
async function imagekitApiCall(endpoint: string, options: RequestInit = {}) {
  const { privateKey, publicKey } = IMAGEKIT_CONFIG

  if (!privateKey || !publicKey) {
    throw new Error("ImageKit credentials not configured")
  }

  const baseUrl = "https://api.imagekit.io/v1"
  const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`

  const response = await fetch(`${baseUrl}${endpoint}`, {
    ...options,
    headers: {
      Authorization: authHeader,
      "Content-Type": "application/json",
      ...options.headers,
    },
  })

  if (!response.ok) {
    const errorText = await response.text()
    console.error("ImageKit API Error:", {
      endpoint,
      status: response.status,
      error: errorText,
    })
    throw new Error(`ImageKit API error: ${response.status} - ${errorText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Get upload authentication parameters
export async function getImageKitUploadAuth() {
  const { privateKey, publicKey } = IMAGEKIT_CONFIG

  if (!privateKey || !publicKey) {
    throw new Error("ImageKit credentials not configured")
  }

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  })

  return { token, expire, signature, publicKey }
}

/**
 * Upload image to ImageKit and store metadata in Firestore
 * This is the main upload function that coordinates both services
 */
export async function uploadPhotoToWall(
  imageDataUrl: string,
  options?: {
    tags?: string[]
    folder?: string
    userId?: string
    userName?: string
    userEmail?: string
    caption?: string
    location?: string
    event?: string
  }
): Promise<{ photoId: string; url: string }> {
  const db = getAdminDb()

  const {
    tags = [TAGS.STAR_PIC],
    folder = "/ulp-stars",
    userId,
    userName,
    userEmail,
    caption,
    location,
    event,
  } = options || {}

  console.log("📤 Starting photo upload to wall...")

  // Fetch IP data from ipinfo.io
  let ipData = null
  let generatedUserName = userName

  try {
    const ipResponse = await fetch("https://ipinfo.io/json")
    if (ipResponse.ok) {
      ipData = await ipResponse.json()
      console.log("📍 IP Data fetched:", ipData)

      // Generate unique username if not provided
      if (!generatedUserName || generatedUserName === "Supporter") {
        const today = new Date().toISOString().split('T')[0].replace(/-/g, '') // Format: YYYYMMDD
        const ipLast = ipData.ip ? ipData.ip.split('.').pop() : "unknown"
        generatedUserName = `Supporter_${today}_${ipLast}`
      }
    }
  } catch (e) {
    console.log("Could not fetch IP data:", e)
    // Fallback username generation
    if (!generatedUserName || generatedUserName === "Supporter") {
      const today = new Date().toISOString().split('T')[0].replace(/-/g, '')
      generatedUserName = `Supporter_${today}_unknown`
    }
  }

  try {
    // Step 1: Upload to ImageKit
    const { publicKey } = IMAGEKIT_CONFIG
    const authParams = await getImageKitUploadAuth()

    const formData = new FormData()
    formData.append("file", imageDataUrl)
    formData.append("fileName", `upload_${Date.now()}.jpg`)
    formData.append("publicKey", authParams.publicKey)
    formData.append("signature", authParams.signature)
    formData.append("expire", authParams.expire.toString())
    formData.append("token", authParams.token)
    formData.append("tags", tags.join(","))
    formData.append("folder", folder)

    const uploadResponse = await fetch(
      "https://upload.imagekit.io/api/v1/files/upload",
      {
        method: "POST",
        body: formData,
      }
    )

    if (!uploadResponse.ok) {
      const errorData = await uploadResponse.json()
      throw new Error(errorData.message || "Failed to upload to ImageKit")
    }

    const imageKitData = await uploadResponse.json()

    console.log("✅ ImageKit upload successful:", imageKitData.fileId)

    // Step 2: Generate thumbnail URL
    const thumbnailUrl = `${imageKitData.url}?tr=w-400,h-400,c-at_max,q-80`

    // Step 3: Store metadata in Firestore
    const photoData: Omit<Photo, "id"> = {
      // ImageKit data
      fileId: imageKitData.fileId,
      url: imageKitData.url,
      thumbnailUrl,
      filePath: imageKitData.filePath,
      folder,
      aspectRatio:
        imageKitData.width && imageKitData.height
          ? imageKitData.width / imageKitData.height
          : 9 / 16,
      width: imageKitData.width || 1080,
      height: imageKitData.height || 1920,
      size: imageKitData.size || 0,
      tags,

      // User data
      userId,
      userName: generatedUserName,
      userEmail: userEmail || null,

      // Engagement
      likes: 0,
      likedBy: [],
      views: 0,
      shares: 0,

      // Metadata
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now(),
      featured: tags.includes(TAGS.FEATURED),
      status: "active",

      // Optional
      caption: caption || null,
      location: location || null,
      event: event || null,
      ipdata: ipData || null,
    }

    const photoRef = await db.collection("photos").add(photoData)

    console.log("✅ Firestore document created:", photoRef.id)

    return {
      photoId: photoRef.id,
      url: imageKitData.url,
    }
  } catch (error) {
    console.error("❌ Upload failed:", error)
    throw error
  }
}

/**
 * Legacy function for backward compatibility
 * Redirects to new uploadPhotoToWall function
 */
export async function uploadToImageKit(
  imageDataUrl: string,
  tags?: string[],
  folder?: string,
  userOptions?: { userId?: string; userName?: string; userEmail?: string }
): Promise<string> {
  const result = await uploadPhotoToWall(imageDataUrl, { tags, folder, ...userOptions })
  return result.url
}

/**
 * Toggle like on a photo
 */
export async function toggleLike(
  photoId: string,
  userId: string
): Promise<{ liked: boolean; likes: number }> {
  const db = getAdminDb()
  const photoRef = db.collection("photos").doc(photoId)

  try {
    const photoDoc = await photoRef.get()

    if (!photoDoc.exists) {
      throw new Error("Photo not found")
    }

    const photoData = photoDoc.data() as Photo
    const alreadyLiked = photoData.likedBy?.includes(userId) || false

    if (alreadyLiked) {
      // Unlike
      await photoRef.update({
        likes: FieldValue.increment(-1),
        likedBy: FieldValue.arrayRemove(userId),
        updatedAt: Timestamp.now(),
      })

      return { liked: false, likes: (photoData.likes || 0) - 1 }
    } else {
      // Like
      await photoRef.update({
        likes: FieldValue.increment(1),
        likedBy: FieldValue.arrayUnion(userId),
        updatedAt: Timestamp.now(),
      })

      return { liked: true, likes: (photoData.likes || 0) + 1 }
    }
  } catch (error) {
    console.error("Error toggling like:", error)
    throw error
  }
}

/**
 * Increment view count
 */
export async function incrementViews(photoId: string): Promise<void> {
  const db = getAdminDb()
  const photoRef = db.collection("photos").doc(photoId)

  try {
    await photoRef.update({
      views: FieldValue.increment(1),
    })
  } catch (error) {
    console.error("Error incrementing views:", error)
  }
}

/**
 * Update photo status (admin only - for blocking/unblocking photos)
 */
export async function updatePhotoStatus(
  photoId: string,
  newStatus: "active" | "pending" | "removed"
): Promise<boolean> {
  const db = getAdminDb()
  const photoRef = db.collection("photos").doc(photoId)

  try {
    const photoDoc = await photoRef.get()

    if (!photoDoc.exists) {
      console.error("Photo not found:", photoId)
      return false
    }

    await photoRef.update({
      status: newStatus,
      updatedAt: Timestamp.now(),
    })

    console.log(`✅ Photo ${photoId} status updated to: ${newStatus}`)
    return true
  } catch (error) {
    console.error("Error updating photo status:", error)
    return false
  }
}

/**
 * Toggle featured status (admin only)
 */
export async function toggleFeatured(photoId: string): Promise<boolean> {
  const db = getAdminDb()
  const photoRef = db.collection("photos").doc(photoId)

  try {
    const photoDoc = await photoRef.get()

    if (!photoDoc.exists) {
      throw new Error("Photo not found")
    }

    const photoData = photoDoc.data() as Photo
    const newFeaturedStatus = !photoData.featured

    // Update Firestore
    await photoRef.update({
      featured: newFeaturedStatus,
      updatedAt: Timestamp.now(),
    })

    // Update ImageKit tags
    const newTags = newFeaturedStatus
      ? [...(photoData.tags || []), TAGS.FEATURED]
      : (photoData.tags || []).filter((tag) => tag !== TAGS.FEATURED)

    await updateImageTags(photoData.fileId, newTags)

    return newFeaturedStatus
  } catch (error) {
    console.error("Error toggling featured:", error)
    throw error
  }
}

/**
 * Delete photo (from both ImageKit and Firestore)
 */
export async function deletePhoto(photoId: string): Promise<boolean> {
  const db = getAdminDb()
  const photoRef = db.collection("photos").doc(photoId)

  try {
    // Get photo data
    const photoDoc = await photoRef.get()

    if (!photoDoc.exists) {
      console.error("Photo not found in Firestore")
      return false
    }

    const photoData = photoDoc.data() as Photo

    // Delete from ImageKit
    await imagekitApiCall(`/files/${photoData.fileId}`, {
      method: "DELETE",
    })

    // Delete from Firestore
    await photoRef.delete()

    console.log("✅ Photo deleted:", photoId)
    return true
  } catch (error) {
    console.error("Error deleting photo:", error)
    return false
  }
}

// ===== ImageKit-only functions (kept for admin/frames) =====

export async function deleteImage(fileId: string): Promise<boolean> {
  try {
    await imagekitApiCall(`/files/${fileId}`, {
      method: "DELETE",
    })
    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}

// ===== ImageKit-only functions (kept for backward compatibility) =====

export async function getWallImages(folder: string = "/ulp-stars"): Promise<ImageKitFile[]> {
  try {
    const { privateKey } = IMAGEKIT_CONFIG
    if (!privateKey) throw new Error("ImageKit private key missing")

    const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`
    const baseUrl = "https://api.imagekit.io/v1/files"

    // Fetch images from the specified folder
    const response = await fetch(`${baseUrl}?path=${folder}&sort=DESC_CREATED&limit=100`, {
      headers: { Authorization: authHeader },
      next: { revalidate: 60 },
    })

    if (!response.ok) throw new Error("Failed to fetch wall images")

    const files = await response.json()
    return files.map((file: any) => ({
      fileId: file.fileId,
      name: file.name,
      filePath: file.filePath,
      url: file.url,
      tags: file.tags || [],
      width: file.width,
      height: file.height,
      size: file.size,
      createdAt: file.createdAt,
    }))
  } catch (error) {
    console.error("Error fetching wall images:", error)
    return []
  }
}

export async function getFrames(): Promise<ImageKitFile[]> {
  const { FRAME } = TAGS

  try {
    return await searchImagesByTag(FRAME, "/frames")
  } catch (error) {
    console.error("Error fetching frames:", error)
    return []
  }
}

export async function updateImageTags(
  fileId: string,
  tags: string[]
): Promise<boolean> {
  try {
    await imagekitApiCall(`/files/${fileId}/details`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ tags }),
    })
    return true
  } catch (error) {
    console.error("Error updating tags:", error)
    return false
  }
}

async function searchImagesByTag(
  tag: string,
  folder?: string
): Promise<ImageKitFile[]> {
  try {
    let endpoint = `/files?tags=${encodeURIComponent(tag)}&limit=100`

    if (folder) {
      endpoint += `&path=${encodeURIComponent(folder)}`
    }

    const data = await imagekitApiCall(endpoint, {
      next: { revalidate: 60 },
    })

    return data.map((file: any) => ({
      fileId: file.fileId,
      name: file.name,
      filePath: file.filePath,
      url: file.url,
      tags: file.tags || [],
      width: file.width,
      height: file.height,
      size: file.size,
      createdAt: file.createdAt,
    }))
  } catch (error) {
    console.error(`Error fetching tag ${tag}:`, error)
    return []
  }
}

export async function getAdminImages(folder: string = "/ulp-stars"): Promise<ImageKitFile[]> {
  try {
    const { privateKey } = IMAGEKIT_CONFIG
    if (!privateKey) throw new Error("ImageKit private key missing")

    const authHeader = `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`
    const baseUrl = "https://api.imagekit.io/v1/files"

    const response = await fetch(`${baseUrl}?path=${folder}&sort=DESC_CREATED&limit=100`, {
      headers: { Authorization: authHeader },
      next: { revalidate: 0 }, // No cache for admin
    })

    if (!response.ok) throw new Error("Failed to fetch admin images")

    const files = await response.json()
    return files.map((file: any) => ({
      fileId: file.fileId,
      name: file.name,
      filePath: file.filePath,
      url: file.url,
      tags: file.tags || [],
      width: file.width,
      height: file.height,
      size: file.size,
      createdAt: file.createdAt,
    }))
  } catch (error) {
    console.error("Error fetching admin images:", error)
    return []
  }
}

/**
 * Get photos from Firestore for admin dashboard
 * Returns all photos with full metadata
 */
export async function getAdminPhotos(
  statusFilter?: "all" | "active" | "removed"
): Promise<(Photo & { id: string })[]> {
  try {
    const db = getAdminDb()
    const photosRef = db.collection("photos")

    // Build query based on status filter
    let query = photosRef.orderBy("createdAt", "desc").limit(100)

    if (statusFilter && statusFilter !== "all") {
      query = photosRef
        .where("status", "==", statusFilter)
        .orderBy("createdAt", "desc")
        .limit(100)
    }

    const snapshot = await query.get()

    const photos = snapshot.docs.map((doc) => {
      const data = doc.data() as Photo
      return {
        id: doc.id,
        ...data,
        // Convert Firestore Timestamps to ISO strings for client compatibility
        createdAt: data.createdAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString?.() || new Date().toISOString(),
      }
    })

    console.log(`📸 Fetched ${photos.length} photos from Firestore for admin (filter: ${statusFilter || "all"})`)
    return photos as any
  } catch (error) {
    console.error("Error fetching admin photos from Firestore:", error)
    return []
  }
}

/**
 * Get all users with photo statistics for admin dashboard
 * Aggregates data from photos collection
 */
export async function getAdminUsers(): Promise<any[]> {
  try {
    const adminDb = getAdminDb()
    const photosRef = adminDb.collection("photos")
    const snapshot = await photosRef.orderBy("createdAt", "desc").get()

    const usersMap = new Map<string, {
      userId: string
      userName: string
      userEmail: string
      userIp: string
      totalPhotos: number
      activePhotos: number
      firstUpload: string
      lastUpload: string
      blocked: boolean
    }>()

    // Get all blocked statuses first by querying users collection
    const blockedSnapshot = await adminDb.collection("users").where("blocked", "==", true).get()
    const blockedUsers = new Set<string>()
    blockedSnapshot.docs.forEach(doc => {
      blockedUsers.add(doc.id)
    })

    snapshot.docs.forEach(doc => {
      const data = doc.data() as Photo
      // Skip if no userId
      if (!data.userId) return

      if (!usersMap.has(data.userId)) {
        usersMap.set(data.userId, {
          userId: data.userId,
          userName: data.userName || "Anonymous",
          userEmail: data.userEmail || "No Email",
          userIp: data.ipdata?.ip || "Unknown",
          totalPhotos: 0,
          activePhotos: 0,
          firstUpload: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          lastUpload: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
          blocked: blockedUsers.has(data.userId)
        })
      }

      const user = usersMap.get(data.userId)!
      user.totalPhotos++
      if (data.status === "active") {
        user.activePhotos++
      }

      // Update first upload date if this photo is older
      const photoDate = data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString()
      if (photoDate < user.firstUpload) {
        user.firstUpload = photoDate
      }

      // Update IP if this photo is newer
      if (photoDate > user.lastUpload) {
        user.lastUpload = photoDate
        if (data.ipdata?.ip) {
          user.userIp = data.ipdata.ip
        }
      }
    })

    const users = Array.from(usersMap.values())
    // Sort by total photos descending
    users.sort((a, b) => b.totalPhotos - a.totalPhotos)

    console.log(`👥 Fetched ${users.length} users from Firestore`)
    return users
  } catch (error) {
    console.error("Error fetching admin users from Firestore:", error)
    return []
  }
}

/**
 * Get all photos for a specific user
 */
export async function getUserPhotos(userId: string): Promise<(Photo & { id: string })[]> {
  try {
    const db = getAdminDb()
    const photosRef = db.collection("photos")

    console.log(`🔍 Fetching photos for user: ${userId}`)
    const snapshot = await photosRef
      .where("userId", "==", userId)
      .orderBy("createdAt", "desc")
      .get()

    console.log(`📸 Found ${snapshot.size} photos for user ${userId}`)

    return snapshot.docs.map(doc => {
      const data = doc.data() as Photo
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
        updatedAt: data.updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      }
    }) as any
  } catch (error) {
    console.error("Error fetching user photos from Firestore:", error)
    return []
  }
}

/**
 * Update user status (block/unblock)
 */
export async function updateUserStatus(
  userId: string,
  blocked: boolean
): Promise<boolean> {
  try {
    const db = getAdminDb()
    const userRef = db.collection("users").doc(userId)

    await userRef.set({
      blocked,
      updatedAt: Timestamp.now(),
    }, { merge: true })

    console.log(`✅ User ${userId} ${blocked ? 'blocked' : 'unblocked'}`)
    return true
  } catch (error) {
    console.error("Error updating user status:", error)
    return false
  }
}

/**
 * Get user status (check if blocked)
 */
export async function getUserStatus(userId: string): Promise<{ blocked: boolean }> {
  try {
    const db = getAdminDb()
    const userDoc = await db.collection("users").doc(userId).get()

    if (!userDoc.exists) {
      return { blocked: false }
    }

    return {
      blocked: userDoc.data()?.blocked || false
    }
  } catch (error) {
    console.error("Error getting user status:", error)
    return { blocked: false }
  }
}
import { ADMIN_WHITELIST } from "@/lib/whitelist"

/**
 * Create or update admin user
 */
export async function createAdminUser(userId: string, email: string): Promise<boolean> {
  try {
    if (!ADMIN_WHITELIST.includes(email)) {
      console.error(`❌ Unauthorized admin attempt: ${email}`)
      return false
    }

    const db = getAdminDb()
    const userRef = db.collection("users").doc(userId)

    await userRef.set({
      email,
      isAdmin: true,
      blocked: false,
      updatedAt: Timestamp.now(),
      createdAt: Timestamp.now(), // This might overwrite, but merge handles it
    }, { merge: true })

    console.log(`✅ Admin user created/updated: ${userId}`)
    return true
  } catch (error) {
    console.error("Error creating admin user:", error)
    return false
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD

  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not set")
    return false
  }

  if (password === adminPassword) {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24,
    })
    return true
  }

  return false
}

export async function logoutAdmin() {
  const { cookies } = await import("next/headers")
  const cookieStore = await cookies()
  cookieStore.delete("admin_session")
}
// Temporary test function - remove after testing
export async function testImageKitAuth() {
  const { privateKey, publicKey } = IMAGEKIT_CONFIG

  console.log("Testing ImageKit Auth...")
  console.log("Public Key:", publicKey)
  console.log("Private Key exists:", !!privateKey)
  console.log("Private Key length:", privateKey?.length)
  console.log("Private Key prefix:", privateKey?.substring(0, 8))

  try {
    const result = await imagekitApiCall("/files?limit=1")
    console.log("✅ Authentication successful!")
    return { success: true, result }
  } catch (error) {
    console.error("❌ Authentication failed:", error)
    return { success: false, error }
  }
}