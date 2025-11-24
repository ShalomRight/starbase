"use client"

import { useState } from "react"
import { Activity, Heart, Image as ImageIcon, X, Share2, Download, ChevronLeft, ChevronRight } from "lucide-react"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"
import { usePhotos } from "@/hooks/usePhotos"
import { useAnonymousUser } from "@/hooks/useAnonymousUser"
import OptimizedImage from "./OptimizedImage"
import type { PhotoWithId } from "@/lib/firebase/types"

const ActivityPage = () => {
    const [activeTab, setActiveTab] = useState<"yours" | "liked">("yours")
    const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithId | null>(null)
    const [selectedIndex, setSelectedIndex] = useState(0)

    const { uid } = useAnonymousUser()

    // Fetch photos
    const { photos: yourPhotos, loading: loadingYours } = usePhotos({
        userId: uid,
        status: "active"
    })

    const { photos: likedPhotos, loading: loadingLiked } = usePhotos({
        likedBy: uid,
        status: "active"
    })

    const photos = activeTab === "yours" ? yourPhotos : likedPhotos
    const loading = activeTab === "yours" ? loadingYours : loadingLiked

    // Swipe gesture state
    const x = useMotionValue(0)
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

    const handlePhotoClick = (photo: PhotoWithId) => {
        const index = photos.findIndex(p => p.id === photo.id)
        setSelectedIndex(index)
        setSelectedPhoto(photo)
    }

    const handleCloseModal = () => {
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

    const handleDownload = () => {
        if (!selectedPhoto) return
        const a = document.createElement("a")
        a.href = selectedPhoto.url
        a.download = `ulp-star-${selectedPhoto.id}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const handleShare = async () => {
        if (!selectedPhoto) return
        try {
            if (navigator.share) {
                await navigator.share({
                    title: "Check out this photo!",
                    text: selectedPhoto.caption || "Awesome photo on StarsApp",
                    url: selectedPhoto.url
                })
            } else {
                await navigator.clipboard.writeText(selectedPhoto.url)
                alert("Link copied to clipboard!")
            }
        } catch (err) {
            console.error("Share failed:", err)
        }
    }

    return (
        <div className="h-full w-full bg-neutral-950 flex flex-col text-white relative">
            {/* Header */}
            <header className="bg-red-700 shadow-xl z-10 flex-none">
                <div className="p-4 flex items-center gap-3 border-b border-red-800">
                    <div className="bg-white/10 p-2 rounded-full">
                        <Activity className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black italic uppercase tracking-tighter transform -skew-x-6">
                            Activity
                        </h1>
                        <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                            Your Interactions
                        </p>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex">
                    <button
                        onClick={() => setActiveTab("yours")}
                        className={`flex-1 py-3 text-xs font-black italic uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === "yours"
                            ? "bg-white text-red-700"
                            : "bg-red-900/50 text-red-200 hover:bg-red-800"
                            }`}
                    >
                        <ImageIcon className="w-4 h-4" />
                        Your Photos ({yourPhotos.length})
                    </button>
                    <button
                        onClick={() => setActiveTab("liked")}
                        className={`flex-1 py-3 text-xs font-black italic uppercase tracking-wider flex items-center justify-center gap-2 transition-colors ${activeTab === "liked"
                            ? "bg-white text-red-700"
                            : "bg-red-900/50 text-red-200 hover:bg-red-800"
                            }`}
                    >
                        <Heart className="w-4 h-4" />
                        Liked ({likedPhotos.length})
                    </button>
                </div>
            </header>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-1 bg-neutral-900">
                {loading ? (
                    <div className="flex items-center justify-center h-full text-neutral-500">
                        Loading...
                    </div>
                ) : photos.length > 0 ? (
                    <motion.div layout className="grid grid-cols-3 gap-1">
                        <AnimatePresence mode="popLayout">
                            {photos.map((photo) => (
                                <motion.button
                                    layout
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.8 }}
                                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    key={photo.id}
                                    onClick={() => handlePhotoClick(photo)}
                                    className="aspect-[9/16] bg-neutral-800 relative group overflow-hidden"
                                >
                                    <OptimizedImage
                                        src={photo.thumbnailUrl || photo.url}
                                        alt="Activity Photo"
                                        width={200}
                                        height={350}
                                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                    />
                                    {activeTab === "liked" && (
                                        <div className="absolute bottom-1 right-1 bg-red-600 p-1 rounded-full">
                                            <Heart className="w-3 h-3 fill-white text-white" />
                                        </div>
                                    )}
                                </motion.button>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-neutral-500 gap-4">
                        <div className="bg-neutral-800 p-6 rounded-full">
                            {activeTab === "yours" ? (
                                <ImageIcon className="w-12 h-12 opacity-50" />
                            ) : (
                                <Heart className="w-12 h-12 opacity-50" />
                            )}
                        </div>
                        <p className="font-bold uppercase text-sm">
                            {activeTab === "yours"
                                ? "No photos uploaded yet"
                                : "No liked photos yet"}
                        </p>
                    </div>
                )}
            </div>

            {/* Photo Modal */}
            <AnimatePresence>
                {selectedPhoto && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                        onClick={handleCloseModal}
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 text-white z-50"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <button
                            onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                            className="absolute left-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white z-50"
                        >
                            <ChevronLeft className="w-8 h-8" />
                        </button>
                        <button
                            onClick={(e) => { e.stopPropagation(); goToNext(); }}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-white/50 hover:text-white z-50"
                        >
                            <ChevronRight className="w-8 h-8" />
                        </button>

                        <motion.div
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={0.2}
                            onDragEnd={handleDragEnd}
                            style={{ x, opacity }}
                            className="w-full max-w-sm relative z-10 cursor-grab active:cursor-grabbing"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white p-1 shadow-2xl">
                                <OptimizedImage
                                    src={selectedPhoto.url}
                                    alt="Detail"
                                    width={400}
                                    height={600}
                                    className="w-full h-auto"
                                />
                            </div>

                            <div className="mt-4 grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="bg-white text-red-900 py-3 rounded font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-100"
                                >
                                    <Download className="w-4 h-4" /> Save
                                </button>
                                <button
                                    onClick={handleShare}
                                    className="bg-red-600 text-white py-3 rounded font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:bg-red-700"
                                >
                                    <Share2 className="w-4 h-4" /> Share
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default ActivityPage
