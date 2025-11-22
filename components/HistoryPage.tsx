"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { ArrowLeft, Clock, Download, Share2, Trash2, X, Check, Copy, ImagePlus, ChevronLeft, ChevronRight, ArrowUpDown } from "lucide-react"
import { getPhotoHistory } from "../lib/storage"
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion"

const HistoryPage = () => {
    const [history, setHistory] = useState<string[]>([])
    const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest")
    const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null)

    // Swipe gesture state
    const x = useMotionValue(0)
    const opacity = useTransform(x, [-200, 0, 200], [0.5, 1, 0.5])

    useEffect(() => {
        // Assuming getPhotoHistory returns array where last item is newest (pushed)
        // We'll reverse it initially for "newest first" if that's the case, 
        // or just trust the storage order. 
        // Usually local storage history is pushed, so newest is last.
        // Let's assume we want to reverse it by default for "Newest".
        const stored = getPhotoHistory()
        setHistory(stored)
    }, [])

    const sortedHistory = [...history].sort((a, b) => {
        // We don't have timestamps in the simple string array, so we rely on index.
        // "newest" = higher index (assuming push), "oldest" = lower index.
        // So for Newest First: reverse the array.
        // For Oldest First: keep original order.
        // WAIT: If we sort, we lose the original index mapping if we just use index.
        // But we can just reverse the display list.
        return 0 // We'll handle order in rendering or derived state
    })

    // Actually, let's just derive the display list
    const displayHistory = sortOrder === "newest" ? [...history].reverse() : history

    const handleImageClick = (originalIndex: number) => {
        // We need to find the index in the *display* list if we want to swipe through *that* order
        // OR we swipe through the chronological order? 
        // Usually swipe follows the visible order.
        // Let's find the clicked image in the displayHistory
        const image = history[originalIndex]
        const displayIndex = displayHistory.indexOf(image)
        setSelectedImageIndex(displayIndex)
    }

    const handleCloseModal = () => {
        setSelectedImageIndex(null)
        x.set(0)
    }

    const handleDownload = () => {
        if (selectedImageIndex === null) return
        const url = displayHistory[selectedImageIndex]
        const a = document.createElement("a")
        a.href = url
        a.download = `ulp-star-history-${Date.now()}.jpg`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
    }

    const handleShare = async () => {
        if (selectedImageIndex === null) return
        const url = displayHistory[selectedImageIndex]

        try {
            const response = await fetch(url);
            const blob = await response.blob();
            const file = new File([blob], "star-history.jpg", { type: "image/jpeg" });

            if (navigator.share) {
                await navigator.share({
                    title: "My ULP Star History",
                    text: "Check out this design I made!",
                    files: [file]
                });
            } else {
                alert("Sharing is not supported on this device.");
            }
        } catch (err) {
            console.error("Share failed:", err);
            // Fallback to clipboard if file sharing fails or fetch fails (e.g. CORS)
            try {
                await navigator.clipboard.writeText(url)
                alert("Link copied to clipboard!")
            } catch (e) {
                console.error("Clipboard failed", e)
            }
        }
    }

    const goToNext = () => {
        if (selectedImageIndex === null) return
        const nextIndex = (selectedImageIndex + 1) % displayHistory.length
        setSelectedImageIndex(nextIndex)
        x.set(0)
    }

    const goToPrev = () => {
        if (selectedImageIndex === null) return
        const prevIndex = (selectedImageIndex - 1 + displayHistory.length) % displayHistory.length
        setSelectedImageIndex(prevIndex)
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

    return (
        <div className="h-full w-full bg-white flex flex-col text-neutral-900 relative">
            {/* Image Detail Modal */}
            <AnimatePresence>
                {selectedImageIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4"
                    >
                        <button
                            onClick={handleCloseModal}
                            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 text-white z-50"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        {/* Navigation Arrows */}
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

                        <div className="w-full max-w-sm flex flex-col gap-4 relative z-10">
                            <motion.div
                                drag="x"
                                dragConstraints={{ left: 0, right: 0 }}
                                dragElastic={0.2}
                                onDragEnd={handleDragEnd}
                                style={{ x, opacity }}
                                className="cursor-grab active:cursor-grabbing"
                            >
                                <img
                                    src={displayHistory[selectedImageIndex] || "/placeholder.svg"}
                                    alt="History Detail"
                                    className="w-full rounded-sm border-4 border-white shadow-2xl pointer-events-none"
                                />
                            </motion.div>

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={handleDownload}
                                    className="bg-white text-red-700 py-3 rounded font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-100"
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

                            <div className="text-center text-white/50 text-xs font-bold uppercase tracking-widest">
                                {selectedImageIndex + 1} of {displayHistory.length}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <header className="bg-red-700 p-4 shadow-xl z-10 flex-none border-b border-red-800">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/10 p-2 rounded-full">
                            <Clock className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6 text-white">
                                Your History
                            </h1>
                            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
                                {history.length} Saved Designs
                            </p>
                        </div>
                    </div>

                    <button
                        onClick={() => setSortOrder(prev => prev === "newest" ? "oldest" : "newest")}
                        className="flex items-center gap-1 text-xs font-bold uppercase text-red-100 hover:text-white transition-colors bg-black/20 hover:bg-black/30 px-3 py-1.5 rounded-full"
                    >
                        <ArrowUpDown className="w-3 h-3" />
                        {sortOrder}
                    </button>
                </div>
            </header>

            {/* Grid */}
            <div className="flex-1 overflow-y-auto p-4 bg-white">
                {displayHistory.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                        {displayHistory.map((url, index) => (
                            <button
                                key={url} // Use URL as key if unique, otherwise index might be unstable with sorting
                                onClick={() => {
                                    // We need to pass the original index or handle finding it
                                    // Actually, we can just find the index in displayHistory directly here
                                    setSelectedImageIndex(index)
                                }}
                                className="aspect-[9/16] bg-gray-100 rounded overflow-hidden border-2 border-transparent hover:border-red-600 transition-all relative group shadow-sm"
                            >
                                <img
                                    src={url || "/placeholder.svg"}
                                    alt={`History ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                    <Share2 className="w-6 h-6 text-white" />
                                </div>
                            </button>
                        ))}
                    </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-neutral-400 gap-4">
                        <div className="bg-gray-50 p-6 rounded-full">
                            <ImagePlus className="w-12 h-12 text-gray-300" />
                        </div>
                        <div className="text-center">
                            <p className="font-black italic uppercase text-lg text-neutral-300">No History Yet</p>
                            <p className="text-xs font-bold uppercase tracking-wide mt-1 max-w-[200px] text-neutral-300">
                                Photos you create will appear here
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default HistoryPage
