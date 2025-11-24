"use client"

import type React from "react"
import { useRef, useEffect, useState, useCallback } from "react"
import {
  ArrowLeft,
  Download,
  Share2,
  Loader2,
  RefreshCw,
  Star,
  Instagram,
  Facebook,
  Twitter,
  X,
  ImageIcon,
  Type,
  MoveVertical,
  Palette,
} from "lucide-react"
import type { Frame } from "../types"
import { uploadPhotoToWall } from "@/lib/actions"
import { useAnonymousUser } from "@/hooks/useAnonymousUser"
import { savePhotoToHistory } from "../lib/storage"

interface CameraPageProps {
  imageSrc: string
  frame: Frame | null
  onBack: () => void
  onStartOver: () => void
  onGoToWall: (url: string) => void
}

const CameraPage: React.FC<CameraPageProps> = ({ imageSrc, frame, onBack, onStartOver, onGoToWall }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [compositedImage, setCompositedImage] = useState<string | null>(null)
  const [isProcessing, setIsProcessing] = useState(true)
  const [isStarLinking, setIsStarLinking] = useState(false)
  const [shareError, setShareError] = useState<string | null>(null)
  const [loadingText, setLoadingText] = useState("Generating...")
  const [showDownloadOptions, setShowDownloadOptions] = useState(false)

  // Text Customization State
  const [showTextControls, setShowTextControls] = useState(false)
  const [customText, setCustomText] = useState("")

  // Get anonymous user
  const { uid } = useAnonymousUser()
  const [textPosition, setTextPosition] = useState<"bottom" | "top">("bottom")
  const [textColor, setTextColor] = useState<"white" | "red">("white")

  const drawCanvas = useCallback(async () => {
    setIsProcessing(true)
    setLoadingText("Generating...")
    try {
      if (!canvasRef.current) return
      const canvas = canvasRef.current
      const ctx = canvas.getContext("2d")
      if (!ctx) return

      const userImage = new Image()
      const userImagePromise = new Promise<void>((resolve, reject) => {
        userImage.onload = () => resolve()
        userImage.onerror = reject
        userImage.src = imageSrc
      })

      await userImagePromise

      if (frame) {
        const frameImage = new Image()
        frameImage.crossOrigin = "anonymous"
        const frameImagePromise = new Promise<void>((resolve, reject) => {
          frameImage.onload = () => resolve()
          frameImage.onerror = reject
          frameImage.src = frame.url
        })
        await frameImagePromise

        const frameAspectRatio =
          frameImage.width > 0 && frameImage.height > 0 ? frameImage.width / frameImage.height : 9 / 16
        canvas.width = 1080
        canvas.height = 1080 / frameAspectRatio

        const userImageRatio = userImage.width / userImage.height
        const canvasRatio = canvas.width / canvas.height
        let sx, sy, sWidth, sHeight

        if (userImageRatio > canvasRatio) {
          sHeight = userImage.height
          sWidth = sHeight * canvasRatio
          sx = (userImage.width - sWidth) / 2
          sy = 0
        } else {
          sWidth = userImage.width
          sHeight = sWidth / canvasRatio
          sy = (userImage.height - sHeight) / 2
          sx = 0
        }

        ctx.drawImage(userImage, sx, sy, sWidth, sHeight, 0, 0, canvas.width, canvas.height)
        ctx.drawImage(frameImage, 0, 0, canvas.width, canvas.height)
      } else {
        const aspectRatio = userImage.width / userImage.height
        const MAX_DIMENSION = 1920
        if (userImage.width > userImage.height) {
          canvas.width = Math.min(userImage.width, MAX_DIMENSION)
          canvas.height = canvas.width / aspectRatio
        } else {
          canvas.height = Math.min(userImage.height, MAX_DIMENSION)
          canvas.width = canvas.height * aspectRatio
        }
        ctx.drawImage(userImage, 0, 0, canvas.width, canvas.height)
      }

      // Draw Custom Text Overlay
      if (customText.trim()) {
        const text = customText.toUpperCase()

        // Dynamic font size based on text length and canvas width
        // Base size is ~10% of width, scale down if text is long
        const baseSize = canvas.width * 0.12
        const charCount = text.length
        const fontSize = charCount > 8 ? baseSize * (8 / charCount) : baseSize

        ctx.font = `italic 900 ${fontSize}px Inter, sans-serif`
        ctx.textAlign = "center"
        ctx.textBaseline = textPosition === "top" ? "top" : "bottom"

        const x = canvas.width / 2
        // Padding from edges
        const yPadding = canvas.height * 0.05
        const y = textPosition === "top" ? yPadding : canvas.height - yPadding

        // Shadow/Glow
        ctx.shadowColor = "rgba(0,0,0,0.8)"
        ctx.shadowBlur = 20
        ctx.shadowOffsetX = 0
        ctx.shadowOffsetY = 4

        // Stroke (Thick outline for readability)
        ctx.strokeStyle = "black"
        ctx.lineWidth = fontSize * 0.08
        ctx.lineJoin = "round"
        ctx.strokeText(text, x, y)

        // Fill
        ctx.fillStyle = textColor === "red" ? "#b91c1c" : "#ffffff"
        ctx.fillText(text, x, y)

        // Reset shadow for next draw
        ctx.shadowColor = "transparent"
      }

      setCompositedImage(canvas.toDataURL("image/jpeg", 0.9))
    } catch (error) {
      console.error("Error loading images for canvas", error)
    } finally {
      setIsProcessing(false)
    }
  }, [imageSrc, frame, customText, textPosition, textColor])

  useEffect(() => {
    drawCanvas()
  }, [drawCanvas])

  const processDownload = async (width?: number, height?: number) => {
    if (!compositedImage) return

    // Close modal immediately to show feedback
    setShowDownloadOptions(false)
    setLoadingText("Optimizing...")
    setIsProcessing(true)

    try {
      let finalUrl = compositedImage

      if (width && height) {
        const img = new Image()
        img.src = compositedImage
        await new Promise((r) => (img.onload = r))

        const canvas = document.createElement("canvas")
        canvas.width = width
        canvas.height = height
        const ctx = canvas.getContext("2d")

        if (ctx) {
          // 1. Draw Blurred Background (Fill)
          ctx.filter = "blur(20px) brightness(0.7)"
          const scaleCover = Math.max(width / img.width, height / img.height)
          const wCover = img.width * scaleCover
          const hCover = img.height * scaleCover
          const xCover = (width - wCover) / 2
          const yCover = (height - hCover) / 2
          ctx.drawImage(img, xCover, yCover, wCover, hCover)

          ctx.filter = "none"

          // 2. Draw Shadow
          ctx.shadowColor = "rgba(0,0,0,0.5)"
          ctx.shadowBlur = 30
          ctx.shadowOffsetX = 0
          ctx.shadowOffsetY = 10

          // 3. Draw Main Image (Fit)
          const scaleFit = Math.min(width / img.width, height / img.height) * 0.9 // 90% scale for padding
          const wFit = img.width * scaleFit
          const hFit = img.height * scaleFit
          const xFit = (width - wFit) / 2
          const yFit = (height - hFit) / 2

          ctx.drawImage(img, xFit, yFit, wFit, hFit)

          finalUrl = canvas.toDataURL("image/jpeg", 0.95)
        }
      }

      // Save to history
      savePhotoToHistory(finalUrl)

      // Trigger Download
      const a = document.createElement("a")
      a.href = finalUrl
      a.download = `ulp-star-${Date.now()}.jpg`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
    } catch (err) {
      console.error("Download failed", err)
      setShareError("Optimization failed. Try original size.")
    } finally {
      setIsProcessing(false)
    }
  }

  const handleShare = async () => {
    if (!compositedImage) return
    setShareError(null)
    savePhotoToHistory(compositedImage)

    try {
      const res = await fetch(compositedImage)
      const blob = await res.blob()
      const file = new File([blob], `star-photo-${Date.now()}.jpg`, { type: "image/jpeg" })

      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: "My ULP Photo",
          text: "Check out my photo!",
        })
      } else {
        setShareError("Native sharing not supported. Please use Download.")
      }
    } catch (error) {
      console.error("Error sharing:", error)
      setShareError("Could not share photo.")
    }
  }

  const handleStarLink = async () => {
    if (!compositedImage || isStarLinking) return
    setIsStarLinking(true)
    setShareError(null)
    setLoadingText("Posting...")

    try {
      const { url } = await uploadPhotoToWall(compositedImage, {
        tags: ["star-pic"],
        folder: "/ulp-stars",
        userId: uid,
        userName: "Supporter", // Could add input for name later
        caption: customText || undefined
      })
      savePhotoToHistory(url)
      onGoToWall(url)
    } catch (error) {
      console.error("Star Link error:", error)
      if (error instanceof Error) {
        setShareError(`Star Link failed: ${error.message}.`)
      } else {
        setShareError("An unknown error occurred.")
      }
    } finally {
      setIsStarLinking(false)
    }
  }

  const DOWNLOAD_OPTIONS = [
    { name: "Original", width: 0, height: 0, icon: ImageIcon },
    { name: "Instagram Post", width: 1080, height: 1080, icon: Instagram },
    { name: "Instagram Story", width: 1080, height: 1920, icon: Instagram },
    { name: "Facebook Post", width: 1200, height: 630, icon: Facebook },
    { name: "Twitter / X", width: 1200, height: 675, icon: Twitter },
  ]

  return (
    <div className="h-full flex flex-col bg-red-700 text-white relative">
      {/* Download Options Modal */}
      {showDownloadOptions && (
        <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-end sm:items-center justify-center animate-fade-in">
          <div className="bg-white w-full sm:w-80 sm:rounded-xl rounded-t-3xl overflow-hidden animate-slide-up">
            <div className="bg-red-700 p-4 flex justify-between items-center">
              <h3 className="font-sans font-black italic uppercase text-white tracking-wide">Save Format</h3>
              <button onClick={() => setShowDownloadOptions(false)} className="text-white/80 hover:text-white">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-2">
              {DOWNLOAD_OPTIONS.map((opt, idx) => (
                <button
                  key={idx}
                  onClick={() => processDownload(opt.width, opt.height)}
                  className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 border-b border-gray-100 last:border-0 text-neutral-800 transition-colors"
                >
                  <div className="bg-red-50 p-2 rounded-full text-red-700">
                    <opt.icon className="w-5 h-5" />
                  </div>
                  <div className="text-left">
                    <p className="font-bold text-sm">{opt.name}</p>
                    <p className="text-xs text-neutral-400 font-mono">
                      {opt.width ? `${opt.width} x ${opt.height}` : "Best Quality"}
                    </p>
                  </div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowDownloadOptions(false)}
              className="w-full p-4 text-center text-neutral-500 font-bold text-sm uppercase hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-red-700 z-10 flex-none">
        <div className="flex items-center gap-1">
          <button onClick={onBack} className="p-2 hover:bg-red-800 rounded transition-colors">
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
        </div>
        <h2 className="text-xl font-sans font-black italic text-white uppercase tracking-tighter transform -skew-x-6">
          Review
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setShowTextControls(!showTextControls)}
            className={`p-2 rounded transition-colors ${showTextControls ? "bg-white text-red-700" : "hover:bg-red-800 text-white"}`}
          >
            <Type className="w-5 h-5" />
          </button>
          <button onClick={onStartOver} className="p-2 hover:bg-red-800 rounded transition-colors">
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Canvas Container */}
      <main className="flex-1 bg-neutral-100 flex items-center justify-center p-4 overflow-hidden relative">
        <div className="w-full h-full flex items-center justify-center">
          <canvas ref={canvasRef} className="hidden" />

          {isProcessing && (
            <div className="flex flex-col items-center gap-3 text-neutral-900">
              <Loader2 className="w-10 h-10 animate-spin text-red-600" />
              <p className="font-sans font-black italic uppercase tracking-wider">{loadingText}</p>
            </div>
          )}

          {compositedImage && !isProcessing && (
            <img
              src={compositedImage || "/placeholder.svg"}
              alt="Preview"
              className="max-w-full max-h-full object-contain shadow-2xl border-4 border-white"
            />
          )}
        </div>
      </main>

      {/* Text Controls Toolbar */}
      {showTextControls && (
        <div className="bg-neutral-900 p-3 border-b border-neutral-800 animate-slide-up z-20 flex-none">
          <div className="flex flex-col gap-3">
            <input
              type="text"
              placeholder="ENTER NAME OR TEXT..."
              value={customText}
              onChange={(e) => setCustomText(e.target.value)}
              className="w-full bg-neutral-800 border border-neutral-700 text-white px-3 py-2 rounded font-bold italic uppercase placeholder-neutral-500 focus:border-red-600 outline-none"
            />
            <div className="flex gap-2">
              <button
                onClick={() => setTextPosition((prev) => (prev === "bottom" ? "top" : "bottom"))}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <MoveVertical className="w-4 h-4" />
                {textPosition === "bottom" ? "Bottom" : "Top"}
              </button>
              <button
                onClick={() => setTextColor((prev) => (prev === "white" ? "red" : "white"))}
                className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white py-2 rounded text-xs font-bold uppercase flex items-center justify-center gap-2"
              >
                <Palette className="w-4 h-4" />
                {textColor === "white" ? "White Text" : "Red Text"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Controls */}
      <footer className="p-4 bg-red-700 z-10 flex-none shadow-[0_-4px_20px_rgba(0,0,0,0.2)]">
        <div className="grid grid-cols-3 gap-3">
          {/* Download */}
          <button
            onClick={() => setShowDownloadOptions(true)}
            disabled={isProcessing || !compositedImage}
            className="flex flex-col items-center justify-center gap-1 bg-white border-2 border-white text-red-700 font-black italic py-3 rounded-sm hover:bg-red-50 transition-all active:scale-95 disabled:opacity-50"
          >
            <Download className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Save</span>
          </button>

          {/* Share */}
          <button
            onClick={handleShare}
            disabled={isProcessing || !compositedImage}
            className="flex flex-col items-center justify-center gap-1 bg-red-800 border-2 border-red-800 text-white font-black italic py-3 rounded-sm hover:bg-red-900 transition-all active:scale-95 disabled:opacity-50"
          >
            <Share2 className="w-5 h-5" />
            <span className="text-[10px] uppercase tracking-wider">Share</span>
          </button>

          {/* Star Link */}
          <button
            onClick={handleStarLink}
            disabled={isProcessing || !compositedImage || isStarLinking}
            className="flex flex-col items-center justify-center gap-1 bg-neutral-900 text-white font-black italic py-3 rounded-sm hover:bg-black transition-all active:scale-95 disabled:opacity-50 shadow-lg border-2 border-neutral-900"
          >
            {isStarLinking ? <Loader2 className="w-5 h-5 animate-spin" /> : <Star className="w-5 h-5 fill-white" />}
            <span className="text-[10px] uppercase tracking-wider">{isStarLinking ? loadingText : "Star Link"}</span>
          </button>
        </div>
        {shareError && (
          <p className="text-white bg-red-800 p-2 mt-3 text-center text-xs font-black uppercase italic border border-red-600">
            {shareError}
          </p>
        )}
      </footer>
    </div>
  )
}

export default CameraPage
