"use client"

import { useState } from "react"
import { X, ChevronLeft, ChevronRight } from "lucide-react"

interface GalleryModalProps {
  images: string[]
  initialIndex: number
  onClose: () => void
}

export default function GalleryModal({ images, initialIndex, onClose }: GalleryModalProps) {
  const [currentIndex, setCurrentIndex] = useState(initialIndex)

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : images.length - 1))
  }

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < images.length - 1 ? prev + 1 : 0))
  }

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <span className="text-white font-bold">
          {currentIndex + 1} / {images.length}
        </span>
        <button onClick={onClose} className="p-2 text-white hover:bg-white/10 rounded-full transition-colors">
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Image */}
      <div className="flex-1 flex items-center justify-center p-4">
        <img
          src={images[currentIndex] || "/placeholder.svg"}
          alt={`Star ${currentIndex + 1}`}
          className="max-w-full max-h-full object-contain"
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between p-4 bg-black/50">
        <button
          onClick={handlePrevious}
          className="p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
        <div className="text-white text-sm font-bold uppercase">Supporter #{currentIndex + 1}</div>
        <button
          onClick={handleNext}
          className="p-3 text-white bg-white/10 hover:bg-white/20 rounded-full transition-colors"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>
    </div>
  )
}
