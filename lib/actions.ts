"use server"

import type { CloudinaryUploadResponse } from "@/types"
import { CLOUDINARY_CONFIG } from "@/lib/constants"



export async function uploadToCloudinary(imageDataUrl: string): Promise<string> {
  const { cloudName, uploadPreset, wallTag } = CLOUDINARY_CONFIG

  if (!cloudName || !uploadPreset) {
    throw new Error("Cloudinary credentials not configured")
  }

  const formData = new FormData()
  formData.append("file", imageDataUrl)
  formData.append("upload_preset", uploadPreset)
  formData.append("tags", wallTag)
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

export async function getWallImages(): Promise<string[]> {
  const { cloudName, wallTag, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG

  if (!cloudName || !apiKey || !apiSecret) {
    return []
  }

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${wallTag}?max_results=100`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        next: { revalidate: 60 }, // Cache for 1 minute
      },
    )

    if (!response.ok) {
      console.warn("Failed to fetch by tag, falling back to listing all images")
      const fallbackResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=100`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
          },
          next: { revalidate: 60 },
        },
      )

      if (!fallbackResponse.ok) return []

      const data = await fallbackResponse.json()
      return data.resources?.map((r: { secure_url: string }) => r.secure_url) || []
    }

    const data = await response.json()
    return data.resources?.map((r: { secure_url: string }) => r.secure_url) || []
  } catch (error) {
    console.error("Error fetching wall images:", error)
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

export async function getAdminImages(): Promise<any[]> {
  const { cloudName, wallTag, ApiKey: apiKey, ApiSecret: apiSecret } = CLOUDINARY_CONFIG

  if (!cloudName || !apiKey || !apiSecret) {
    return []
  }

  try {
    // Fetch resources by tag with context/metadata
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/resources/image/tags/${wallTag}?max_results=100&context=true`,
      {
        headers: {
          Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
        },
        next: { revalidate: 0 }, // No cache for admin
      },
    )

    if (!response.ok) {
      // Fallback to listing all images if tag fetch fails
      const fallbackResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/resources/image?max_results=100`,
        {
          headers: {
            Authorization: `Basic ${Buffer.from(`${apiKey}:${apiSecret}`).toString("base64")}`,
          },
          next: { revalidate: 0 },
        },
      )

      if (!fallbackResponse.ok) return []
      const data = await fallbackResponse.json()
      return data.resources || []
    }

    const data = await response.json()
    return data.resources || []
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
