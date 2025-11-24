// lib/hooks/useLike.ts
"use client"

import { useState, useCallback } from "react"
import { toggleLike as toggleLikeAction } from "@/lib/actions"

/**
 * Hook to handle photo likes
 */
export function useLike(photoId: string, initialLikes: number, initialLiked: boolean) {
    const [likes, setLikes] = useState(initialLikes)
    const [liked, setLiked] = useState(initialLiked)
    const [isLoading, setIsLoading] = useState(false)

    const toggleLike = useCallback(
        async (userId: string) => {
            if (isLoading) return

            // Optimistic update
            const previousLikes = likes
            const previousLiked = liked

            setLiked(!liked)
            setLikes(liked ? likes - 1 : likes + 1)
            setIsLoading(true)

            try {
                const result = await toggleLikeAction(photoId, userId)

                // Update with server response
                setLiked(result.liked)
                setLikes(result.likes)
            } catch (error) {
                console.error("Failed to toggle like:", error)

                // Revert optimistic update on error
                setLiked(previousLiked)
                setLikes(previousLikes)
            } finally {
                setIsLoading(false)
            }
        },
        [photoId, likes, liked, isLoading]
    )

    return { likes, liked, toggleLike, isLoading }
}