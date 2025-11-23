import { useState, useEffect, useRef, useLayoutEffect } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { Share2, Star, ChevronLeft, ChevronRight, X } from "lucide-react"
import { getWallImages } from "../lib/actions"
import OptimizedImage from "./OptimizedImage"

// Custom Hooks
const useMedia = (queries: string[], values: number[], defaultValue: number) => {
    const isClient = typeof window !== "undefined"

    const get = () => {
        if (!isClient) return defaultValue
        const index = queries.findIndex((q) => matchMedia(q).matches)
        return index > -1 ? values[index] : defaultValue
    }

    const [value, setValue] = useState(get)

    useEffect(() => {
        if (!isClient) return
        const handler = () => setValue(get)
        queries.forEach((q) => matchMedia(q).addEventListener("change", handler))
        return () => queries.forEach((q) => matchMedia(q).removeEventListener("change", handler))
    }, [queries, isClient])

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

// Image interface for ImageKit
interface WallImage {
    id: string
    url: string
    aspectRatio: number
    category: string
    tags: string[]
    created_at: string
    index: number
    x?: number
    y?: number
    w?: number
    h?: number
    col?: number
}

// Masonry Grid Component
interface MasonryGridProps {
    images: WallImage[]
    onImageClick: (image: WallImage) => void
}

const MasonryGrid = ({ images, onImageClick }: MasonryGridProps) => {
    const columns = useMedia(
        ["(min-width:1024px)", "(min-width:640px)", "(min-width:400px)"],
        [4, 3, 2],
        2
    )

    const [containerRef, { width }] = useMeasure()

    // Calculate masonry grid layout
    const calculatedGrid = (() => {
        if (!width) return []
        const colHeights = new Array(columns).fill(0)
        const gap = 12
        const totalGaps = (columns - 1) * gap
        const columnWidth = (width - totalGaps) / columns

        return images.map((image, idx) => {
            const col = colHeights.indexOf(Math.min(...colHeights))
            const x = col * (columnWidth + gap)

            const aspectRatio = image.aspectRatio || 9 / 16
            const height = columnWidth / aspectRatio

            const y = colHeights[col]

            colHeights[col] += height + gap
            return { ...image, x, y, w: columnWidth, h: height, col, index: idx }
        })
    })()

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
                        return (
                            <motion.div
                                key={item.id}
                                data-key={item.id}
                                initial={{ opacity: 0, y: 50, scale: 0.9, filter: "blur(4px)" }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    filter: "blur(0px)",
                                    x: item.x,
                                    top: item.y,
                                }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                transition={{
                                    duration: 0.5,
                                    delay: index * 0.02,
                                    type: "spring",
                                    stiffness: 120,
                                    damping: 20,
                                }}
                                whileHover={{
                                    scale: 1.03,
                                    zIndex: 10,
                                    transition: { duration: 0.2 },
                                }}
                                className="absolute cursor-pointer"
                                style={{
                                    width: item.w,
                                    height: item.h,
                                    willChange: "transform",
                                }}
                                onClick={() => onImageClick(item)}
                            >
                                <div className="relative w-full h-full bg-white p-1.5 shadow-md hover:shadow-2xl transition-shadow">
                                    <OptimizedImage
                                        src={item.url}
                                        alt={`Star ${item.index + 1}`}
                                        width={item.w!}
                                        height={item.h!}
                                        className="w-full h-full object-cover"
                                        aspectRatio={item.aspectRatio}
                                        loading="lazy"
                                        showPlaceholder={true}
                                        showFallback={true}
                                    />

                                    {/* Hover overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 hover:opacity-100 transition-opacity flex items-end p-2">
                                        <span className="text-white text-xs font-bold flex items-center gap-1">
                                            <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                            Supporter #{item.index + 1}
                                        </span>
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
const PhotoFeed = () => {
    const [images, setImages] = useState<WallImage[]>([])
    const [filteredImages, setFilteredImages] = useState<WallImage[]>([])
    const [selectedImage, setSelectedImage] = useState<WallImage | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState("All")

    // Swipe gesture state
    const x = useMotionValue(0)
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

    const CATEGORIES = ["All", "Featured"]

    // Fetch images from ImageKit
    useEffect(() => {
        const fetchImages = async () => {
            try {
                const wallImages = await getWallImages()

                const imageData: WallImage[] = wallImages.map((img: any, idx: number) => {
                    let category = "Newest"
                    if (img.tags?.includes("featured")) {
                        category = "Featured"
                    }

                    return {
                        id: img.fileId,
                        url: img.url,
                        aspectRatio: img.width && img.height ? img.width / img.height : 9 / 16,
                        category: category,
                        tags: img.tags || [],
                        created_at: img.createdAt,
                        index: idx,
                    }
                })

                setImages(imageData)
                setFilteredImages(imageData)
            } catch (error) {
                console.error("Failed to fetch images", error)
            }
        }

        fetchImages()
    }, [])

    useEffect(() => {
        if (selectedCategory === "All") {
            setFilteredImages(images)
        } else if (selectedCategory === "Newest") {
            setFilteredImages(images)
        } else if (selectedCategory === "Featured") {
            setFilteredImages(images.filter((img) => img.tags?.includes("featured")))
        } else {
            setFilteredImages(images.filter((img) => img.category === selectedCategory))
        }
    }, [selectedCategory, images])

    const handleImageClick = (image: WallImage) => {
        const index = filteredImages.findIndex((img) => img.id === image.id)
        setSelectedIndex(index)
        setSelectedImage(image)
    }

    const handleCloseZoom = () => {
        setSelectedImage(null)
        x.set(0)
    }

    // Navigation functions
    const goToNext = () => {
        const nextIndex = (selectedIndex + 1) % filteredImages.length
        setSelectedIndex(nextIndex)
        setSelectedImage(filteredImages[nextIndex])
        x.set(0)
    }

    const goToPrev = () => {
        const prevIndex = (selectedIndex - 1 + filteredImages.length) % filteredImages.length
        setSelectedIndex(prevIndex)
        setSelectedImage(filteredImages[prevIndex])
        x.set(0)
    }

    // Swipe gesture handler
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

    const metrics = {
        totalPhotos: images.length + 120,
    }

    return (
        <div className="h-full w-full bg-neutral-950 flex flex-col text-white overflow-hidden relative">
            {/* Zoomed Image Modal with Swipe */}
            <AnimatePresence mode="wait">
                {selectedImage && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={handleCloseZoom}
                    >
                        {/* Darkened background */}
                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" />

                        {/* Navigation arrows */}
                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                goToPrev()
                            }}
                            className="absolute left-4 top-1/2 -translate-y-1/2 bg-red-600 p-3 rounded-full hover:bg-red-700 z-50 backdrop-blur-md shadow-xl active:scale-95 transition-transform"
                        >
                            <ChevronLeft className="w-6 h-6" />
                        </button>

                        <button
                            onClick={(e) => {
                                e.stopPropagation()
                                goToNext()
                            }}
                            className="absolute right-4 top-1/2 -translate-y-1/2 bg-red-600 p-3 rounded-full hover:bg-red-700 z-50 backdrop-blur-md shadow-xl active:scale-95 transition-transform"
                        >
                            <ChevronRight className="w-6 h-6" />
                        </button>

                        {/* Close button */}
                        <button
                            onClick={handleCloseZoom}
                            className="absolute top-4 right-4 bg-white/10 p-3 rounded-full hover:bg-white/20 z-50 backdrop-blur-md"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Swipeable image container */}
                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            style={{ x, opacity }}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.8, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="relative z-10 max-w-sm w-full cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white p-2 shadow-2xl border-4 border-red-600 transform -rotate-1">
                                <div style={{ aspectRatio: selectedImage.aspectRatio || 9 / 16 }}>
                                    <OptimizedImage
                                        src={selectedImage.url}
                                        alt={`Supporter ${selectedImage.index + 1}`}
                                        width={400}
                                        height={400}
                                        className="w-full h-full object-cover"
                                        aspectRatio={selectedImage.aspectRatio}
                                        loading="eager"
                                        priority={true}
                                        showPlaceholder={true}
                                        showFallback={true}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-600 text-white mt-2">
                                    <span className="font-black italic text-sm uppercase">
                                        Supporter #{selectedImage.index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase opacity-80">
                                            {selectedImage.aspectRatio === 1
                                                ? "Square"
                                                : selectedImage.aspectRatio === 16 / 9
                                                    ? "Wide"
                                                    : "Story"}
                                        </span>
                                        <Star className="w-5 h-5 fill-white" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => alert("Share functionality")}
                                className="mt-4 w-full bg-red-600 text-white px-6 py-3 rounded font-black italic uppercase shadow-lg flex items-center justify-center gap-2 hover:bg-red-700 transition-transform active:scale-95"
                            >
                                <Share2 className="w-4 h-4" /> Share This Star
                            </button>

                            {/* Swipe indicator */}
                            <div className="mt-3 flex items-center justify-center gap-2 text-white/60 text-xs">
                                <ChevronLeft className="w-4 h-4" />
                                <span className="font-bold uppercase">Swipe to navigate</span>
                                <ChevronRight className="w-4 h-4" />
                            </div>
                        </motion.div>

                        {/* Position indicator */}
                        <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-1 z-50">
                            {filteredImages.map((_, idx) => (
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
                        <h1 className="text-2xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6">
                            Star Wall
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                            {metrics.totalPhotos} Proud Supporters
                        </p>
                    </div>
                </div>

                {/* Filter Tabs */}
                <div className="bg-red-900/50 border-t border-red-600/30 px-4 py-3 overflow-x-auto scrollbar-hide">
                    <div className="flex gap-2 justify-center min-w-max">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`px-5 py-2 text-xs font-sans font-black italic uppercase tracking-wide transition-all transform -skew-x-6 rounded-sm ${selectedCategory === cat
                                        ? "bg-white text-red-700 shadow-lg scale-105"
                                        : "bg-red-950/50 text-red-200 hover:bg-red-900 hover:text-white"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Masonry Gallery */}
            <div className="flex-1 bg-neutral-100 relative overflow-hidden">
                <MasonryGrid images={filteredImages} onImageClick={handleImageClick} />
            </div>
        </div>
    )
}

export default PhotoFeed
