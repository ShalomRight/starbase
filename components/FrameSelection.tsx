"use client"

import type React from "react"
import { useState } from "react"
import { ArrowLeft, Slash } from "lucide-react"
import type { Frame } from "../types"
import { FRAMES, CATEGORIES } from "../lib/constants"

interface FrameSelectionProps {
  onSelectFrame: (frame: Frame | null) => void
  onBack: () => void
}

const FrameSelection: React.FC<FrameSelectionProps> = ({ onSelectFrame, onBack }) => {
  const [selectedCategory, setSelectedCategory] = useState("All Frames")

  const filteredFrames =
    selectedCategory === "All Frames" ? FRAMES : FRAMES.filter((f) => f.category === selectedCategory.toLowerCase())

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
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 text-sm font-sans font-black italic uppercase tracking-wide whitespace-nowrap transition-all transform -skew-x-6 ${
                selectedCategory === cat
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
            <div className="aspect-[4/5] w-full flex items-center justify-center bg-gray-50 group-hover:bg-white">
              <Slash className="w-10 h-10 text-gray-300 group-hover:text-red-500 transition-colors" />
            </div>
            <div className="p-3 text-center bg-white w-full border-t border-gray-100">
              <h3 className="font-sans font-black italic text-neutral-900 text-sm uppercase">No Frame</h3>
            </div>
          </button>

          {filteredFrames.map((frame) => (
            <button
              key={frame.id}
              onClick={() => onSelectFrame(frame)}
              className="group bg-white border-2 border-gray-200 hover:border-red-600 transition-all active:scale-95 flex flex-col shadow-sm"
            >
              <div className="aspect-[4/5] w-full bg-gray-100 relative overflow-hidden">
                <img src={frame.url || "/placeholder.svg"} alt={frame.name} className="w-full h-full object-cover" />
              </div>
              <div className="p-3 text-left bg-white w-full border-t border-gray-100">
                <h3 className="font-sans font-black italic text-neutral-900 text-sm uppercase truncate">
                  {frame.name}
                </h3>
                <p className="text-[10px] text-red-600 font-bold uppercase tracking-wider">{frame.category}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default FrameSelection
