"use server"

import { getUploadAuthParams } from "@imagekit/next/server"
import { IMAGEKIT_CONFIG, TAGS } from "@/lib/constants"

// ImageKit file interface
interface ImageKitFile {
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
  // ImageKit requires "privateKey:" format (with colon, no public key in Basic auth)
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
      privateKeyLength: privateKey.length,
      privateKeyPrefix: privateKey.substring(0, 8) + "..."
    })
    throw new Error(`ImageKit API error: ${response.status} - ${errorText}`)
  }

  if (response.status === 204) {
    return null
  }

  return response.json()
}

// Get upload authentication parameters for client-side uploads
export async function getImageKitUploadAuth() {
  const { privateKey, publicKey } = IMAGEKIT_CONFIG

  if (!privateKey || !publicKey) {
    console.error("ImageKit credentials missing:", {
      hasPrivateKey: !!privateKey,
      hasPublicKey: !!publicKey,
      privateKeyLength: privateKey?.length,
      publicKeyLength: publicKey?.length
    })
    throw new Error("ImageKit credentials not configured")
  }

  console.log("Generating upload auth with:", {
    publicKey,
    privateKeyPrefix: privateKey.substring(0, 8) + "...",
    privateKeyLength: privateKey.length
  })

  const { token, expire, signature } = getUploadAuthParams({
    privateKey,
    publicKey,
  })

  console.log("Generated auth params:", {
    token: token.substring(0, 10) + "...",
    expire,
    signatureLength: signature.length
  })

  return { token, expire, signature, publicKey }
}

// Upload image to ImageKit (server-side)
export async function uploadToImageKit(
  imageDataUrl: string,
  tags?: string[],
  folder?: string
): Promise<string> {
  const { publicKey, folder: defaultFolder } = IMAGEKIT_CONFIG

  if (!publicKey) {
    throw new Error("ImageKit public key not configured")
  }

  console.log("Starting ImageKit upload...")

  // Get auth params
  const authParams = await getImageKitUploadAuth()

  console.log("Upload auth params received:", {
    hasToken: !!authParams.token,
    hasSignature: !!authParams.signature,
    expire: authParams.expire,
    publicKey: authParams.publicKey
  })

  // Prepare form data
  const formData = new FormData()
  formData.append("file", imageDataUrl)
  formData.append("fileName", `upload_${Date.now()}.jpg`)
  formData.append("publicKey", authParams.publicKey)
  formData.append("signature", authParams.signature)
  formData.append("expire", authParams.expire.toString())
  formData.append("token", authParams.token)

  // Add tags
  const tagsToUse = tags && tags.length > 0 ? tags : [TAGS.STAR_PIC]
  formData.append("tags", tagsToUse.join(","))

  console.log("Upload tags:", tagsToUse.join(","))

  // Add folder - use provided folder or default from config
  const folderToUse = folder || defaultFolder
  if (folderToUse) {
    formData.append("folder", folderToUse)
    console.log("Upload folder:", folderToUse)
  }

  // Upload to ImageKit
  try {
    const response = await fetch("https://upload.imagekit.io/api/v1/files/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.error("ImageKit Upload Error:", errorData)
      throw new Error(errorData.message || "Failed to upload image")
    }

    const data = await response.json()
    console.log("Upload successful:", {
      url: data.url,
      fileId: data.fileId
    })

    return data.url
  } catch (error) {
    console.error("Upload fetch error:", error)
    throw error
  }
}

// Get wall images by tags from specific folders
export async function getWallImages(): Promise<ImageKitFile[]> {
  const { STAR_PIC, FEATURED } = TAGS

  try {
    // Search for images with specific tags in their respective folders
    const [starPics, featuredPics] = await Promise.all([
      searchImagesByTag(STAR_PIC, "/ulp-stars"),
      searchImagesByTag(FEATURED, "/featured"),
    ])

    // Merge and deduplicate by fileId
    const allFiles = [...starPics, ...featuredPics]
    const uniqueFiles = Array.from(
      new Map(allFiles.map((item) => [item.fileId, item])).values()
    )

    // Sort by createdAt desc
    return uniqueFiles.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  } catch (error) {
    console.error("Error fetching wall images:", error)
    return []
  }
}

// Helper function to search images by tag and optional folder
async function searchImagesByTag(tag: string, folder?: string): Promise<ImageKitFile[]> {
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
    console.error(`Error fetching tag ${tag} in folder ${folder}:`, error)
    return []
  }
}

// Get admin images (User photos and Featured)
export async function getAdminImages(): Promise<ImageKitFile[]> {
  try {
    // Fetch from specific folders
    const [userPhotos, featuredPhotos] = await Promise.all([
      imagekitApiCall("/files?path=/ulp-stars&limit=100", { next: { revalidate: 0 } }),
      imagekitApiCall("/files?path=/featured&limit=100", { next: { revalidate: 0 } })
    ])

    const rawFiles = [...(Array.isArray(userPhotos) ? userPhotos : []), ...(Array.isArray(featuredPhotos) ? featuredPhotos : [])]

    const files: ImageKitFile[] = rawFiles.map((file: any) => ({
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

    // Deduplicate just in case
    const uniqueFiles = Array.from(
      new Map(files.map((item) => [item.fileId, item])).values()
    )

    return uniqueFiles.sort((a, b) => {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })
  } catch (error) {
    console.error("Error fetching admin images:", error)
    return []
  }
}

// Delete image by fileId
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

// Get frames from /frames folder
export async function getFrames(): Promise<ImageKitFile[]> {
  const { FRAME } = TAGS

  try {
    return await searchImagesByTag(FRAME, "/frames")
  } catch (error) {
    console.error("Error fetching frames:", error)
    return []
  }
}

// Update image tags
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

// Verify admin password
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
      maxAge: 60 * 60 * 24, // 1 day
    })
    return true
  }

  return false
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