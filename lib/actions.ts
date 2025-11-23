"use server"

import type { CloudinaryUploadResponse, CloudinaryResource } from "@/types"
import { CLOUDINARY_CONFIG, TAGS } from "@/lib/constants"



export async function uploadToCloudinary(imageDataUrl: string, tags?: string[]): Promise<string> {
  const { cloudName, uploadPreset, wallTag } = CLOUDINARY_CONFIG

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary credentials not configured")
  }

  const formData = new FormData()
  formData.append("file", imageDataUrl)
  formData.append("upload_preset", uploadPreset)
  const tagsToUse = tags && tags.length > 0 ? tags.join(",") : wallTag
  formData.append("tags", tagsToUse)
  // formData.append("folder", "ulp-stars")

  const response = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    throw new Error("Failed to upload image")
  }

  const data: CloudinaryUploadResponse = await response.json()
  return data.secure_url
}

export async function getWallImages(): Promise<CloudinaryResource[]> {
  const { cloudName, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG
  const { STAR_PIC, FEATURED } = TAGS

  if (!cloudName || !apiKey || !apiSecret) {
    return []
  }

  try {
    const [starPics, featuredPics] = await Promise.all([
      fetchTagImages(STAR_PIC),
      fetchTagImages(FEATURED)
    ])

    // Merge and deduplicate by public_id
    const allResources = [...starPics, ...featuredPics]
    const uniqueResources = Array.from(new Map(allResources.map(item => [item.public_id, item])).values())

    // Sort by created_at desc
    return uniqueResources.sort((a, b) => {
      return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
    })
  } catch (error) {
    console.error("Error fetching wall images:", error)
    return []
  }
}

async function fetchTagImages(tag: string): Promise<CloudinaryResource[]> {
  const { cloudName, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG
  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${tag}?max_results=100&context=true&tags=true`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        next: { revalidate: 60 },
      },
    )
    if (!response.ok) return []
    const data = await response.json()
    return data.resources || []
  } catch (e) {
    console.error(`Error fetching tag ${tag}:`, e)
    return []
  }
}

export async function verifyAdminPassword(password: string): Promise<boolean> {
  const adminPassword = process.env.ADMIN_PASSWORD
  if (!adminPassword) {
    console.error("ADMIN_PASSWORD not set")
    return false
  }

  // In a real app, use a secure session/cookie. 
  // For this simple requirement, we'll just return true/false and let the client handle the cookie.
  // However, server actions can set cookies directly.

  if (password === adminPassword) {
    const { cookies } = await import("next/headers")
    const cookieStore = await cookies()
    cookieStore.set("admin_session", "true", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 // 1 day
    })
    return true
  }

  return false
}

export async function getAdminImages(): Promise<CloudinaryResource[]> {
  const { cloudName, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG

  if (!cloudName || !apiKey || !apiSecret) {
    return []
  }

  try {
    // Fetch all resources with context/metadata
    // We want ALL photos except those tagged 'frames'
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=100&context=true&tags=true`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        next: { revalidate: 0 }, // No cache for admin
      },
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    const resources: CloudinaryResource[] = data.resources || []

    // Filter out frames
    return resources.filter(r => !r.tags?.includes(TAGS.FRAME))
  } catch (error) {
    console.error("Error fetching admin images:", error)
    return []
  }
}

export async function deleteImage(publicId: string): Promise<boolean> {
  const { cloudName, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary credentials")
    return false
  }

  try {
    // Use Cloudinary Admin API to delete resources
    // Endpoint: DELETE /resources/image/upload
    const params = new URLSearchParams()
    params.append("public_ids[]", publicId)

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/upload?${params.toString()}`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Cloudinary Delete Failed:", response.status, errorText)
      return false
    }

    return true
  } catch (error) {
    console.error("Error deleting image:", error)
    return false
  }
}

export async function getFrames(): Promise<CloudinaryResource[]> {
  const { cloudName, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG
  const { FRAME } = TAGS

  if (!cloudName || !apiKey || !apiSecret) {
    return []
  }

  try {
    // Fetch resources by tag 'frames' with context/metadata and tags
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${FRAME}?max_results=100&context=true&tags=true`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        next: { revalidate: 0 }, // No cache for admin
      },
    )

    if (!response.ok) {
      return []
    }

    const data = await response.json()
    return data.resources || []
  } catch (error) {
    console.error("Error fetching frames:", error)
    return []
  }
}

export async function updateImageTags(publicId: string, tags: string[]): Promise<boolean> {
  const { cloudName, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG

  if (!cloudName || !apiKey || !apiSecret) {
    console.error("Missing Cloudinary credentials")
    return false
  }

  try {
    // Use Cloudinary Admin API to update tags
    // Endpoint: PUT /resources/image/tags
    // Note: Cloudinary API for replacing tags is slightly different.
    // We'll use the 'replace' command on the tags endpoint.

    const params = new URLSearchParams()
    params.append("public_ids[]", publicId)
    params.append("command", "replace")

    // Append each tag
    tags.forEach(tag => params.append("tags[]", tag))

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags?${params.toString()}`,
      {
        method: "POST", // It's actually a POST to the tags endpoint with command=replace
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
      }
    )

    if (!response.ok) {
      const errorText = await response.text()
      console.error("Cloudinary Tag Update Failed:", response.status, errorText)
      return false
    }

    return true
  } catch (error) {
    console.error("Error updating tags:", error)
    return false
  }
}
