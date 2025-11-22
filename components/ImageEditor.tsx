"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { ArrowLeft, Check, RotateCw, FlipHorizontal, Sun, Contrast, Sliders, Wand2, Crop } from "lucide-react"

interface ImageEditorProps {
  imageSrc: string
  onSave: (editedImage: string) => void
  onBack: () => void
}

type FilterType = "none" | "ulp-contrast" | "bw" | "vintage" | "warm"

const FILTERS: { id: FilterType; name: string; filter: string }[] = [
  { id: "none", name: "Normal", filter: "none" },
  { id: "ulp-contrast", name: "Voter", filter: "contrast(1.3) saturate(1.2)" },
  { id: "bw", name: "History", filter: "grayscale(100%) contrast(1.2)" },
  { id: "vintage", name: "Classic", filter: "sepia(0.5) contrast(0.9)" },
  { id: "warm", name: "Rally", filter: "sepia(0.2) saturate(1.4)" },
]

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onSave, onBack }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [activeTab, setActiveTab] = useState<"filters" | "adjust" | "crop">("filters")

  // Edit State
  const [rotation, setRotation] = useState(0)
  const [flipX, setFlipX] = useState(false)
  const [brightness, setBrightness] = useState(100)
  const [contrast, setContrast] = useState(100)
  const [activeFilter, setActiveFilter] = useState<FilterType>("none")
  const [isProcessing, setIsProcessing] = useState(false)

  const applyChanges = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const img = new Image()
    img.onload = () => {
      // 1. Setup Canvas Dimensions (handling rotation)
      if (rotation % 180 !== 0) {
        canvas.width = img.height
        canvas.height = img.width
      } else {
        canvas.width = img.width
        canvas.height = img.height
      }

      // 2. Clear and Save Context
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      ctx.save()

      // 3. Move to Center for Rotation/Flip
      ctx.translate(canvas.width / 2, canvas.height / 2)
      ctx.rotate((rotation * Math.PI) / 180)
      ctx.scale(flipX ? -1 : 1, 1)

      // 4. Apply Filters (CSS-style string)
      const filterString = [
        activeFilter !== "none" ? FILTERS.find((f) => f.id === activeFilter)?.filter : "",
        `brightness(${brightness}%)`,
        `contrast(${contrast}%)`,
      ]
        .filter(Boolean)
        .join(" ")

      ctx.filter = filterString

      // 5. Draw Image (Centered)
      ctx.drawImage(img, -img.width / 2, -img.height / 2)

      // 6. Restore Context
      ctx.restore()
    }
    img.src = imageSrc
  }, [imageSrc, rotation, flipX, brightness, contrast, activeFilter])

  useEffect(() => {
    applyChanges()
  }, [applyChanges])

  const handleSave = () => {
    setIsProcessing(true)
    setTimeout(() => {
      if (canvasRef.current) {
        const editedDataUrl = canvasRef.current.toDataURL("image/jpeg", 0.95)
        onSave(editedDataUrl)
      }
      setIsProcessing(false)
    }, 100)
  }

  const rotate = () => setRotation((prev) => (prev + 90) % 360)
  const flip = () => setFlipX((prev) => !prev)

  return (
    <div className="h-full w-full bg-neutral-950 flex flex-col text-white">
      {/* Header */}
      <header className="bg-red-700 shadow-lg z-10 flex-none flex items-center justify-between p-4">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white hover:bg-red-800 p-2 rounded transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-sans font-black italic text-sm uppercase hidden sm:inline">Back</span>
        </button>
        <h2 className="text-xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6">
          Edit Photo
        </h2>
        <button
          onClick={handleSave}
          disabled={isProcessing}
          className="bg-white text-red-700 px-4 py-2 rounded font-black italic uppercase text-sm flex items-center gap-2 hover:bg-gray-100 transition-colors shadow-md"
        >
          {isProcessing ? "Saving..." : "Next"}
          <Check className="w-4 h-4" />
        </button>
      </header>

      {/* Canvas Area */}
      <div className="flex-1 bg-neutral-900 flex items-center justify-center overflow-hidden p-4 relative">
        {/* Checkerboard background for transparency indication */}
        <div
          className="absolute inset-4 opacity-10 pointer-events-none"
          style={{ backgroundImage: "radial-gradient(#333 1px, transparent 1px)", backgroundSize: "20px 20px" }}
        ></div>

        <canvas
          ref={canvasRef}
          className="max-w-full max-h-full object-contain shadow-2xl border-2 border-neutral-800"
        />
      </div>

      {/* Controls */}
      <div className="bg-neutral-900 border-t border-neutral-800 flex-none z-10">
        {/* Tab Content */}
        <div className="h-32 p-4 overflow-y-auto">
          {activeTab === "filters" && (
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {FILTERS.map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setActiveFilter(filter.id)}
                  className={`flex-none flex flex-col items-center gap-2 transition-all active:scale-95 ${activeFilter === filter.id ? "opacity-100 scale-105" : "opacity-60 hover:opacity-80"}`}
                >
                  <div
                    className={`w-16 h-16 rounded-lg border-2 overflow-hidden ${activeFilter === filter.id ? "border-red-600 ring-2 ring-red-600/30" : "border-neutral-600"}`}
                  >
                    {/* Preview thumbnail using the same image but scaled down CSS */}
                    <div
                      className="w-full h-full bg-cover bg-center"
                      style={{ backgroundImage: `url(${imageSrc})`, filter: filter.filter }}
                    ></div>
                  </div>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider ${activeFilter === filter.id ? "text-red-500" : "text-neutral-400"}`}
                  >
                    {filter.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {activeTab === "adjust" && (
            <div className="space-y-4 px-2">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Sun className="w-3 h-3" /> Brightness
                  </span>
                  <span>{brightness}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase text-neutral-400">
                  <span className="flex items-center gap-1">
                    <Contrast className="w-3 h-3" /> Contrast
                  </span>
                  <span>{contrast}%</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="150"
                  value={contrast}
                  onChange={(e) => setContrast(Number(e.target.value))}
                  className="w-full h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                />
              </div>
            </div>
          )}

          {activeTab === "crop" && (
            <div className="flex justify-center gap-8 items-center h-full">
              <button
                onClick={rotate}
                className="flex flex-col items-center gap-2 text-neutral-300 hover:text-red-500 transition-colors"
              >
                <div className="p-3 bg-neutral-800 rounded-full">
                  <RotateCw className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase">Rotate</span>
              </button>
              <button
                onClick={flip}
                className="flex flex-col items-center gap-2 text-neutral-300 hover:text-red-500 transition-colors"
              >
                <div className="p-3 bg-neutral-800 rounded-full">
                  <FlipHorizontal className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-bold uppercase">Flip</span>
              </button>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="flex border-t border-neutral-800">
          <button
            onClick={() => setActiveTab("filters")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${activeTab === "filters" ? "bg-neutral-800 text-white border-t-2 border-red-600" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <Wand2 className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Filters</span>
          </button>
          <button
            onClick={() => setActiveTab("adjust")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${activeTab === "adjust" ? "bg-neutral-800 text-white border-t-2 border-red-600" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <Sliders className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Adjust</span>
          </button>
          <button
            onClick={() => setActiveTab("crop")}
            className={`flex-1 py-4 flex flex-col items-center gap-1 transition-colors ${activeTab === "crop" ? "bg-neutral-800 text-white border-t-2 border-red-600" : "text-neutral-500 hover:text-neutral-300"}`}
          >
            <Crop className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Transform</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ImageEditor
