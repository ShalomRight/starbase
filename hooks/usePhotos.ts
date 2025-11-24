// lib/hooks/usePhotos.ts
"use client"

import { useEffect, useState } from "react"
import {
    collection,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    QueryConstraint,
} from "firebase/firestore"
import { getClientDb } from "@/lib/firebase/client"
import type { Photo, PhotoWithId } from "@/lib/firebase/types"

interface UsePhotosOptions {
    featured?: boolean
    status?: "active" | "pending" | "removed"
    limitCount?: number
    userId?: string
    orderByField?: string
    orderByDirection?: "asc" | "desc"
    minLikes?: number
    likedBy?: string
}

/**
 * Real-time hook to fetch photos from Firestore
 * Automatically updates when photos are added, updated, or deleted
 */
export function usePhotos(options: UsePhotosOptions = {}) {
    const {
        featured,
        status = "active",
        limitCount = 100,
        userId,
        orderByField = "createdAt",
        orderByDirection = "desc",
        minLikes,
        likedBy
    } = options

    const [photos, setPhotos] = useState<PhotoWithId[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<Error | null>(null)

    useEffect(() => {
        const db = getClientDb()
        const photosRef = collection(db, "photos")

        // Build query constraints
        const constraints: QueryConstraint[] = [
            where("status", "==", status),
        ]

        if (featured !== undefined) {
            constraints.push(where("featured", "==", featured))
        }

        if (userId) {
            constraints.push(where("userId", "==", userId))
        }

        if (minLikes !== undefined) {
            constraints.push(where("likes", ">", minLikes))
        }

        if (likedBy) {
            constraints.push(where("likedBy", "array-contains", likedBy))
        }

        // Add sorting
        constraints.push(orderBy(orderByField, orderByDirection))

        // Add limit
        constraints.push(limit(limitCount))

        const q = query(photosRef, ...constraints)

        // Set up real-time listener
        const unsubscribe = onSnapshot(
            q,
            (snapshot) => {
                const photosData: PhotoWithId[] = []

                snapshot.forEach((doc) => {
                    photosData.push({
                        id: doc.id,
                        ...doc.data(),
                    } as PhotoWithId)
                })

                setPhotos(photosData)
                setLoading(false)

                console.log(`📸 Photos updated: ${photosData.length} photos`)
            },
            (err) => {
                console.error("Error fetching photos:", err)
                setError(err as Error)
                setLoading(false)
            }
        )

        // Cleanup listener on unmount
        return () => unsubscribe()
    }, [featured, status, limitCount, userId, orderByField, orderByDirection, minLikes, likedBy])

    return { photos, loading, error }
}

/**
 * Hook to fetch all photos (for wall display)
 */
export function useWallPhotos() {
    return usePhotos({ status: "active", limitCount: 100 })
}

/**
 * Hook to fetch featured photos only
 */
export function useFeaturedPhotos() {
    return usePhotos({ featured: true, status: "active", limitCount: 50 })
}

/**
 * Hook to fetch trending photos (most likes)
 */
export function useTrendingPhotos() {
    return usePhotos({
        status: "active",
        minLikes: 0,
        orderByField: "likes",
        orderByDirection: "desc",
        limitCount: 50
    })
}