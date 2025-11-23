"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { ArrowLeft, Slash, Loader2 } from "lucide-react"
import type { Frame, CloudinaryResource } from "../types"
import { CATEGORIES } from "../lib/constants"
import { getFrames } from "../lib/actions"

interface FrameSelectionProps {
  onSelectFrame: (frame: Frame | null) => void
  onBack: () => void
}

const FrameSelection: React.FC<FrameSelectionProps> = ({ onSelectFrame, onBack }) => {
  const [frames, setFrames] = useState<CloudinaryResource[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState("All")

  useEffect(() => {
    const fetchFrames = async () => {
      setIsLoading(true)
      try {
        const data = await getFrames()
        setFrames(data)
      } catch (error) {
        console.error("Failed to fetch frames", error)
      } finally {
        setIsLoading(false)
      }
    }
    fetchFrames()
  }, [])

  const filteredFrames =
    selectedCategory === "All"
      ? frames
      : frames.filter((f: CloudinaryResource) => f.tags?.includes(selectedCategory))

  return (
    <div className="h-full flex flex-col bg-gray-50">
      {/* Header */}
      <header className="bg-red-700 shadow-lg z-10 flex-none">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="flex items-center gap-2 px-3 py-2 text-white hover:bg-red-800 transition-colors rounded"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-sans font-black italic text-sm uppercase tracking-wide">Back</span>
          </button>
          <h2 className="text-xl font-sans font-black italic text-white uppercase tracking-tighter transform -skew-x-6">
            Pick a Frame
          </h2>
          <div className="w-16" /> {/* Spacer */}
        </div>

        {/* Categories */}
        <div className="flex gap-2 px-4 pb-4 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setSelectedCategory("All")}
            className={`px-5 py-2 text-sm font-sans font-black italic uppercase tracking-wide whitespace-nowrap transition-all transform -skew-x-6 ${selectedCategory === "All"
              ? "bg-neutral-900 text-white shadow-md"
              : "bg-red-800 text-red-200 hover:bg-red-900"
              }`}
          >
            All
          </button>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-sm font-sans font-black italic uppercase tracking-wide whitespace-nowrap transition-all transform -skew-x-6 ${selectedCategory === cat
                ? "bg-neutral-900 text-white shadow-md"
                : "bg-red-800 text-red-200 hover:bg-red-900"
                }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </header>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4 bg-neutral-100">
        <div className="grid grid-cols-2 gap-4 pb-24">
          {/* No Frame Option */}
          <button
            onClick={() => onSelectFrame(null)}
            className="group bg-white border-2 border-gray-200 hover:border-red-600 transition-all active:scale-95 flex flex-col shadow-sm"
          >
            <div className="aspect-[9/16] w-full flex items-center justify-center bg-gray-50 group-hover:bg-white">
              <Slash className="w-10 h-10 text-gray-300 group-hover:text-red-500 transition-colors" />
            </div>
            <div className="p-3 text-center bg-white w-full border-t border-gray-100">
              <h3 className="font-sans font-black italic text-neutral-900 text-sm uppercase">No Frame</h3>
            </div>
          </button>

          {isLoading ? (
            <div className="col-span-2 flex justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-red-600" />
            </div>
          ) : (
            filteredFrames.map((frame: CloudinaryResource) => (
              <button
                key={frame.public_id}
                onClick={() => onSelectFrame({ id: frame.public_id, name: frame.public_id, url: frame.secure_url, category: "custom" })}
                className="group bg-white border-2 border-gray-200 hover:border-red-600 transition-all active:scale-95 flex flex-col shadow-sm"
              >
                <div className="aspect-[9/16] w-full bg-gray-100 relative overflow-hidden">
                  <img src={frame.secure_url || "/placeholder.svg"} alt="Frame" className="w-full h-full object-cover" />
                </div>
                <div className="p-3 text-left bg-white w-full border-t border-gray-100">
                  <div className="flex flex-wrap gap-1 mt-1">
                    {frame.tags?.filter((t: string) => t !== 'frames').map((tag: string) => (
                      <span key={tag} className="text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-bold uppercase tracking-wider">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default FrameSelection
