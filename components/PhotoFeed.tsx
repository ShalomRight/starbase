import { useState, useEffect, useRef, useLayoutEffect, useCallback } from "react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import {
    Share2, Star, Zap, ChevronLeft, ChevronRight, X
} from "lucide-react"
import { getWallImages } from "../lib/actions"

// Custom Hooks
const useMedia = (queries: string[], values: number[], defaultValue: number) => {
    // Check if window is defined (client-side)
    const isClient = typeof window !== "undefined"

    const get = () => {
        if (!isClient) return defaultValue
        const index = queries.findIndex(q => matchMedia(q).matches)
        return index > -1 ? values[index] : defaultValue
    }

    const [value, setValue] = useState(get)

    useEffect(() => {
        if (!isClient) return
        const handler = () => setValue(get)
        queries.forEach(q => matchMedia(q).addEventListener('change', handler))
        return () => queries.forEach(q => matchMedia(q).removeEventListener('change', handler))
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

// Masonry Grid Component
interface MasonryGridProps {
    images: any[]
    onImageClick: (image: any) => void
}

const MasonryGrid = ({ images, onImageClick }: MasonryGridProps) => {
    const columns = useMedia(
        ['(min-width:1024px)', '(min-width:640px)', '(min-width:400px)'],
        [4, 3, 2],
        2
    )

    const [containerRef, { width }] = useMeasure()

    // Calculate masonry grid layout with proper aspect ratios
    const calculatedGrid = (() => {
        if (!width) return []
        const colHeights = new Array(columns).fill(0)
        const gap = 12
        const totalGaps = (columns - 1) * gap
        const columnWidth = (width - totalGaps) / columns

        return images.map((image, idx) => {
            const col = colHeights.indexOf(Math.min(...colHeights))
            const x = col * (columnWidth + gap)

            // Calculate height based on the image's aspect ratio
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
                scrollbarWidth: 'thin',
                scrollbarColor: '#b91c1c #404040'
            }}
        >
            <div ref={containerRef} className="relative w-full" style={{ height: Math.max(...calculatedGrid.map(i => i.y + i.h), 100) }}>
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
                                    damping: 20
                                }}
                                whileHover={{
                                    scale: 1.03,
                                    zIndex: 10,
                                    transition: { duration: 0.2 }
                                }}
                                className="absolute cursor-pointer"
                                style={{
                                    width: item.w,
                                    height: item.h,
                                    willChange: 'transform'
                                }}
                                onClick={() => onImageClick(item)}
                            >
                                <div className="relative w-full h-full bg-white p-1.5 shadow-md hover:shadow-2xl transition-shadow">
                                    <img
                                        src={item.url}
                                        alt={`Star ${item.index + 1}`}
                                        className="w-full h-full object-cover"
                                        loading="lazy"
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
    const [images, setImages] = useState<any[]>([])
    const [filteredImages, setFilteredImages] = useState<any[]>([])
    const [selectedImage, setSelectedImage] = useState<any>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)
    const [selectedCategory, setSelectedCategory] = useState("All")

    // Swipe gesture state
    const x = useMotionValue(0)
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

    const CATEGORIES = ["All", "Trending", "Newest", "Featured"]

    // Fetch images from Cloudinary
    useEffect(() => {
        const fetchImages = async () => {
            try {
                // Fetch real images
                const wallImages = await getWallImages()

                // Mock data for fallback/demo
                const mockImages = [
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeF6yAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D", aspectRatio: 9 / 16, category: "Trending" },
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39", aspectRatio: 9 / 16, category: "Newest" },
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0", aspectRatio: 9 / 16, category: "Featured" },
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0", aspectRatio: 1, category: "Trending" },
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0", aspectRatio: 1, category: "Newest" },
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B", aspectRatio: 1, category: "Featured" },
                    { url: "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582", aspectRatio: 16 / 9, category: "Trending" },
                ]

                // Process real images
                // Since we don't have metadata for aspect ratio/category from the simple URL list,
                // we'll assign defaults or random values for the demo feel.
                const processedRealImages = wallImages.map((url, idx) => ({
                    url,
                    aspectRatio: 9 / 16, // Default to portrait for user uploads
                    category: "Newest", // Assume user uploads are new
                }))

                // Combine real and mock
                // Filter out duplicates if any
                const allRawImages = [...processedRealImages, ...mockImages]
                const uniqueImages = Array.from(new Set(allRawImages.map(i => i.url)))
                    .map(url => allRawImages.find(i => i.url === url))
                    .filter(Boolean) as any[]

                const imageData = uniqueImages.map((img, idx) => ({
                    id: `img-${idx}`,
                    url: img.url,
                    aspectRatio: img.aspectRatio,
                    category: img.category,
                    index: idx
                }))

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
        } else {
            setFilteredImages(images.filter(img => img.category === selectedCategory))
        }
    }, [selectedCategory, images])

    const handleImageClick = (image: any) => {
        const index = filteredImages.findIndex(img => img.id === image.id)
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
        totalPhotos: images.length + 120
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
                        {/* Darkened background with visible grid behind */}
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
                                    <img
                                        src={selectedImage.url}
                                        alt={`Supporter ${selectedImage.index + 1}`}
                                        className="w-full h-full object-cover"
                                        draggable={false}
                                    />
                                </div>
                                <div className="flex items-center justify-between p-3 bg-red-600 text-white mt-2">
                                    <span className="font-black italic text-sm uppercase">
                                        Supporter #{selectedImage.index + 1}
                                    </span>
                                    <div className="flex items-center gap-2">
                                        <span className="text-[10px] font-bold uppercase opacity-80">
                                            {selectedImage.aspectRatio === 1 ? "Square" : selectedImage.aspectRatio === 16 / 9 ? "Wide" : "Story"}
                                        </span>
                                        <Star className="w-5 h-5 fill-white" />
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={() => alert('Share functionality')}
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
                                    className={`h-1.5 rounded-full transition-all ${idx === selectedIndex
                                        ? 'w-8 bg-red-600'
                                        : 'w-1.5 bg-white/30'
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

                {/* Filter Tabs (Replacing Stats Bar) */}
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
                <MasonryGrid
                    images={filteredImages}
                    onImageClick={handleImageClick}
                />
            </div>
        </div>
    )
}

export default PhotoFeed
