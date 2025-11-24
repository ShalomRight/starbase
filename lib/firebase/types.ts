// lib/firebase/types.ts
import { Timestamp } from "firebase/firestore"

/**
 * IP information from ipinfo.io
 */
export interface IPData {
    ip: string
    hostname?: string
    city?: string
    region?: string
    country?: string
    loc?: string // Latitude,Longitude
    org?: string
    postal?: string
    timezone?: string
}

/**
 * Photo document stored in Firestore
 */
export interface Photo {
    // ImageKit data
    fileId: string
    url: string
    thumbnailUrl: string
    filePath: string
    folder: string
    aspectRatio: number
    width: number
    height: number
    size: number
    tags: string[]

    // User data
    userId?: string | null
    userName?: string | null
    userEmail?: string | null

    // Engagement
    likes: number
    likedBy: string[] // Array of user IDs who liked this photo
    views: number
    shares: number

    // Metadata
    createdAt: Timestamp
    updatedAt: Timestamp
    featured: boolean
    status: "active" | "pending" | "removed"

    // Optional
    location?: string | null
    event?: string | null
    caption?: string | null
    ipdata?: IPData | null // IP information from upload
}

/**
 * User document stored in Firestore (optional)
 */
export interface User {
    id: string
    name: string
    email?: string
    photoURL?: string
    uploadedPhotos: number
    totalLikes: number
    joinedAt: Timestamp
}

/**
 * Photo with ID (for UI components)
 */
export interface PhotoWithId extends Photo {
    id: string
}

/**
 * Like action data
 */
export interface LikeAction {
    photoId: string
    userId: string
    timestamp: Timestamp
}

/**
 * Photo upload data (from ImageKit)
 */
export interface PhotoUploadData {
    fileId: string
    url: string
    filePath: string
    width: number
    height: number
    size: number
    tags: string[]
    folder: string
}