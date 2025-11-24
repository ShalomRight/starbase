"use client"

import { useState, useRef, useLayoutEffect, useMemo } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Share2, Star, ChevronLeft, ChevronRight, X, Heart, RefreshCw } from "lucide-react"
import { useWallPhotos, useFeaturedPhotos, useTrendingPhotos } from "@/hooks/usePhotos"
import { useLike } from "@/hooks/useLike"
import { useAnonymousUser } from "@/hooks/useAnonymousUser"
import OptimizedImage from "./OptimizedImage"
import type { PhotoWithId } from "@/lib/firebase/types"

// Custom Hooks
const useMedia = (queries: string[], values: number[], defaultValue: number) => {
    const isClient = typeof window !== "undefined"

    const get = () => {
        if (!isClient) return defaultValue
        const index = queries.findIndex((q) => matchMedia(q).matches)
        return index > -1 ? values[index] : defaultValue
    }

    const [value, setValue] = useState(get)

    useState(() => {
        if (!isClient) return
        const handler = () => setValue(get)
        queries.forEach((q) => matchMedia(q).addEventListener("change", handler))
        return () => queries.forEach((q) => matchMedia(q).removeEventListener("change", handler))
    })

    return value
}

const useMeasure = () => {
    const ref = useRef<HTMLDivElement>(null)
    const [size, setSize] = useState({ width: 0, height: 0 })

    useLayoutEffect(() => {
        if (!ref.current) return
        const ro = new ResizeObserver(([entry]) => {
            const { width, height } = entry.contentRect
            setSize({ width, height })
        })
        ro.observe(ref.current)
        return () => ro.disconnect()
    }, [])

    return [ref, size] as const
}

// Like Button Component
interface LikeButtonProps {
    photoId: string
    initialLikes: number
    initialLiked: boolean
    compact?: boolean
}

function LikeButton({ photoId, initialLikes, initialLiked, compact = false }: LikeButtonProps) {
    // Use Firebase Anonymous Auth for user ID
    const { uid, isLoading: userLoading } = useAnonymousUser()
    const { likes, liked, toggleLike, isLoading } = useLike(photoId, initialLikes, initialLiked)

    const handleClick = (e: React.MouseEvent) => {
        e.stopPropagation()
        if (uid) {
            toggleLike(uid)
        }
    }

    if (compact) {
        return (
            <button
                onClick={handleClick}
                disabled={isLoading}
                className="flex items-center gap-1 transition-transform active:scale-90 disabled:opacity-50"
            >
                <Heart
                    className={`w-4 h-4 transition-all ${liked ? "fill-red-500 text-red-500" : "text-white"
                        }`}
                />
                <span className="text-xs font-bold">{likes}</span>
            </button>
        )
    }

    return (
        <button
            onClick={handleClick}
            disabled={isLoading}
            className={`px-4 py-2 rounded-full font-bold transition-all flex items-center gap-2 ${liked
                ? "bg-red-500 text-white"
                : "bg-white/10 text-white hover:bg-white/20"
                } disabled:opacity-50 disabled:cursor-not-allowed`}
        >
            <Heart className={`w-5 h-5 ${liked ? "fill-white" : ""}`} />
            <span>{likes} {likes === 1 ? "Like" : "Likes"}</span>
        </button>
    )
}

// Masonry Grid Component
interface MasonryGridProps {
    photos: PhotoWithId[]
    onPhotoClick: (photo: PhotoWithId) => void
}

const MasonryGrid = ({ photos, onPhotoClick }: MasonryGridProps) => {
    const columns = useMedia(
        ["(min-width:1024px)", "(min-width:640px)", "(min-width:400px)"],
        [4, 3, 2],
        2
    )

    const [containerRef, { width }] = useMeasure()

    // Get current user ID for like status
    const { uid } = useAnonymousUser()

    const calculatedGrid = useMemo(() => {
        if (!width) return []
        const colHeights = new Array(columns).fill(0)
        const gap = 12
        const totalGaps = (columns - 1) * gap
        const columnWidth = (width - totalGaps) / columns

        return photos.map((photo, idx) => {
            const col = colHeights.indexOf(Math.min(...colHeights))
            const x = col * (columnWidth + gap)
            const height = columnWidth / photo.aspectRatio
            const y = colHeights[col]

            colHeights[col] += height + gap
            return { ...photo, x, y, w: columnWidth, h: height, col, index: idx }
        })
    }, [width, photos, columns])

    // Generate userId for like status
    const userId = useMemo(() => {
        if (typeof window === "undefined") return "guest"
        return localStorage.getItem("userId") || "guest"
    }, [])

    return (
        <div
            className="relative w-full h-full overflow-y-auto overflow-x-hidden scroll-smooth"
            style={{
                scrollbarWidth: "thin",
                scrollbarColor: "#b91c1c #404040",
            }}
        >
            <div
                ref={containerRef}
                className="relative w-full"
                style={{ height: Math.max(...calculatedGrid.map((i) => i.y! + i.h!), 100) }}
            >
                <AnimatePresence>
                    {calculatedGrid.map((item, index) => {
                        const isLiked = uid ? item.likedBy?.includes(uid) : false

                        return (
                            <motion.div
                                key={item.id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{
                                    opacity: 1,
                                    scale: 1,
                                    x: item.x,
                                    top: item.y,
                                }}
                                exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                                transition={{
                                    type: "spring",
                                    stiffness: 300,
                                    damping: 30,
                                    mass: 1
                                }}
                                whileHover={{
                                    scale: 1.05,
                                    zIndex: 10,
                                    transition: { duration: 0.2 },
                                }}
                                className="absolute cursor-pointer"
                                style={{
                                    width: item.w,
                                    height: item.h,
                                }}
                                onClick={() => onPhotoClick(item)}
                            >
                                <div className="relative w-full h-full bg-white p-1.5 shadow-md hover:shadow-2xl transition-shadow">
                                    <OptimizedImage
                                        src={item.thumbnailUrl || item.url}
                                        alt={`Photo by ${item.userName || "User"}`}
                                        width={item.w!}
                                        height={item.h!}
                                        className="w-full h-full object-cover"
                                        aspectRatio={item.aspectRatio}
                                        loading="lazy"
                                        showPlaceholder={true}
                                        showFallback={true}
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 hover:opacity-100 transition-opacity flex flex-col justify-end p-2">
                                        <div className="flex items-center justify-between text-white">
                                            <span className="text-xs font-bold flex items-center gap-1">
                                                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                                {item.userName || "Supporter"}
                                            </span>
                                            <LikeButton
                                                photoId={item.id}
                                                initialLikes={item.likes}
                                                initialLiked={isLiked}
                                                compact
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        )
                    })}
                </AnimatePresence>
            </div>
        </div>
    )
}

// Main PhotoFeed Component
const FireFeed = () => {
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithId | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState<"all" | "featured" | "trending">("all")

    const x = useMotionValue(0)
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

    // Get anonymous user
    const { uid, isLoading: userLoading } = useAnonymousUser()

    // Real-time data from Firestore
    const { photos: allPhotos, loading: loadingAll } = useWallPhotos()
    const { photos: featuredPhotos, loading: loadingFeatured } = useFeaturedPhotos()
    const { photos: trendingPhotos, loading: loadingTrending } = useTrendingPhotos()

    const photos = selectedCategory === "featured"
        ? featuredPhotos
        : selectedCategory === "trending"
            ? trendingPhotos
            : allPhotos

    const loading = selectedCategory === "featured"
        ? loadingFeatured
        : selectedCategory === "trending"
            ? loadingTrending
            : loadingAll

    const handlePhotoClick = (photo: PhotoWithId) => {
        const index = photos.findIndex((p) => p.id === photo.id)
        setSelectedIndex(index)
        setSelectedPhoto(photo)
    }

    const handleCloseZoom = () => {
        setSelectedPhoto(null)
        x.set(0)
    }

    const goToNext = () => {
        const nextIndex = (selectedIndex + 1) % photos.length
        setSelectedIndex(nextIndex)
        setSelectedPhoto(photos[nextIndex])
        x.set(0)
    }

    const goToPrev = () => {
        const prevIndex = (selectedIndex - 1 + photos.length) % photos.length
        setSelectedIndex(prevIndex)
        setSelectedPhoto(photos[prevIndex])
        x.set(0)
    }

    const handleDragEnd = (event: any, info: any) => {
        const swipeThreshold = 50
        if (info.offset.x > swipeThreshold) {
            goToPrev()
        } else if (info.offset.x < -swipeThreshold) {
            goToNext()
        } else {
            x.set(0)
        }
    }

    const isLikedByUser = uid && selectedPhoto ? selectedPhoto.likedBy?.includes(uid) : false

    return (
        <div className="h-full w-full bg-neutral-950 flex flex-col text-white overflow-hidden relative">
            {/* Zoomed Photo Modal */}
            <AnimatePresence mode="wait">
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleCloseZoom}
                    >
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                goToPrev()
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-600 p-3 rounded-full hover:bg-red-700 z-50"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                goToNext()
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600 p-3 rounded-full hover:bg-red-700 z-50"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        <button
                            onClick={handleCloseZoom}
                            className="absolute top-4 right-4 bg-white/10 p-3 rounded-full hover:bg-white/20 z-50"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            style={{ x, opacity }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            className="relative z-10 max-w-sm w-full cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white p-2 shadow-2xl border-4 border-red-600">
                                <OptimizedImage
                                    src={selectedPhoto.url}
                                    alt={`Photo by ${selectedPhoto.userName || "User"}`}
                                    width={400}
                                    height={400}
                                    aspectRatio={selectedPhoto.aspectRatio}
                                    className="w-full h-full object-cover"
                                    loading="eager"
                                    priority={true}
                                />
                                <div className="p-3 bg-red-600 text-white mt-2">
                                    <p className="font-bold">{selectedPhoto.userName || "Supporter"}</p>
                                    {selectedPhoto.caption && (
                                        <p className="text-sm mt-1">{selectedPhoto.caption}</p>
                                    )}
                                </div>
                            </div>

                            <div className="mt-4 flex gap-2">
                                <LikeButton
                                    photoId={selectedPhoto.id}
                                    initialLikes={selectedPhoto.likes}
                                    initialLiked={isLikedByUser}
                                />
                                <button className="flex-1 bg-white/10 px-4 py-2 rounded-full font-bold hover:bg-white/20 flex items-center justify-center gap-2">
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>
                        </motion.div>

                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 z-50">
                            {photos.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1.5 rounded-full transition-all ${idx === selectedIndex ? "w-8 bg-red-600" : "w-1.5 bg-white/30"
                                        }`}
                                />
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-gradient-to-r from-red-700 to-red-800 shadow-xl z-10 flex-none">
                <div className="flex items-center justify-between p-4">
                    <div className="text-center w-full">
                        <h1 className="text-2xl font-black italic uppercase">Star Wall</h1>
                        <p className="text-xs uppercase text-red-200">
                            {photos.length} Proud Supporters · Real-time Updates
                        </p>
                    </div>
                </div>

                <div className="bg-red-900/50 border-t border-red-600/30 px-4 py-3">
                    <div className="flex gap-2 justify-center">
                        <button
                            onClick={() => setSelectedCategory("all")}
                            className={`px-5 py-2 text-xs font-black italic uppercase rounded-sm ${selectedCategory === "all"
                                ? "bg-white text-red-700"
                                : "bg-red-950/50 text-red-200"
                                }`}
                        >
                            All
                        </button>
                        <button
                            onClick={() => setSelectedCategory("trending")}
                            className={`px-5 py-2 text-xs font-black italic uppercase rounded-sm ${selectedCategory === "trending"
                                ? "bg-white text-red-700"
                                : "bg-red-950/50 text-red-200"
                                }`}
                        >
                            Trending
                        </button>
                        <button
                            onClick={() => setSelectedCategory("featured")}
                            className={`px-5 py-2 text-xs font-black italic uppercase rounded-sm ${selectedCategory === "featured"
                                ? "bg-white text-red-700"
                                : "bg-red-950/50 text-red-200"
                                }`}
                        >
                            Featured
                        </button>
                    </div>
                </div>
            </header>

            {/* Gallery */}
            <div className="flex-1 bg-neutral-100 relative overflow-hidden">
                {loading ? (
                    <div className="flex items-center justify-center h-full">
                        <RefreshCw className="w-12 h-12 animate-spin text-red-600" />
                    </div>
                ) : (
                    <MasonryGrid photos={photos} onPhotoClick={handlePhotoClick} />
                )}
            </div>
        </div>
    )
}

export default FireFeed