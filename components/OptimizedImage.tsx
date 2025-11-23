"use client"

import { Image, buildSrc } from "@imagekit/next"
import { useState } from "react"
import { IMAGEKIT_CONFIG } from "@/lib/constants"

interface OptimizedImageProps {
    src: string
    alt: string
    width: number
    height: number
    className?: string
    aspectRatio?: number
    showPlaceholder?: boolean
    showFallback?: boolean
    loading?: "lazy" | "eager"
    priority?: boolean
    onClick?: (e: any) => void
    transformation?: any[]
    style?: React.CSSProperties
}

/**
 * Optimized ImageKit component with:
 * - Lazy loading
 * - Blur placeholder
 * - Error fallback
 * - Loading spinner
 */
export default function OptimizedImage({
    src,
    alt,
    width,
    height,
    className = "",
    aspectRatio,
    showPlaceholder = true,
    showFallback = true,
    loading = "lazy",
    priority = false,
    onClick,
    transformation = [],
    style,
}: OptimizedImageProps) {
    const [showBlur, setShowBlur] = useState(showPlaceholder)
    const [hasError, setHasError] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const { urlEndpoint } = IMAGEKIT_CONFIG

    // Generate placeholder URL with blur and low quality
    const placeholderUrl = showPlaceholder
        ? buildSrc({
            urlEndpoint,
            src,
            transformation: [
                {
                    quality: 5,
                    blur: 90,
                    width: Math.floor(width / 10),
                },
            ],
        })
        : undefined

    // Handle image load
    const handleLoad = () => {
        setShowBlur(false)
        setIsLoading(false)
    }

    // Handle error
    const handleError = () => {
        setHasError(true)
        setIsLoading(false)
    }

    // Error fallback component
    if (hasError && showFallback) {
        return (
            <div
                className={`bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center border border-gray-300 ${className}`}
                style={{ width, height, aspectRatio, ...style }}
            >
                <div className="text-center p-2">
                    <svg
                        className="w-8 h-8 mx-auto mb-1 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="text-gray-600 text-xs">Image unavailable</p>
                </div>
            </div>
        )
    }

    return (
        <div className="relative" style={{ aspectRatio }}>
            {/* Loading spinner */}
            {isLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 z-10">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-600"></div>
                </div>
            )}

            <Image
                urlEndpoint={urlEndpoint}
                src={src}
                alt={alt}
                width={width}
                height={height}
                loading={loading}
                priority={priority}
                transformation={transformation}
                className={className}
                style={{
                    ...(showBlur && placeholderUrl
                        ? {
                            backgroundImage: `url(${placeholderUrl})`,
                            backgroundSize: "cover",
                            backgroundRepeat: "no-repeat",
                            backgroundPosition: "center",
                        }
                        : {}),
                    ...style,
                }}
                onLoad={handleLoad}
                onError={handleError}
                onClick={onClick}
            />
        </div>
    )
}
