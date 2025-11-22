"use client"

import type React from "react"
import { useRef, useEffect, useState } from "react"
import { ArrowLeft, Loader2, RefreshCw, Zap, ZapOff, Timer, Grid3x3, Smartphone, Square, Monitor } from "lucide-react"

interface CapturePageProps {
  onPhotoTaken: (image: string) => void
  onBack: () => void
}

const RATIOS = [
  { id: "story", name: "9:16", value: 9 / 16, icon: Smartphone },
  { id: "square", name: "1:1", value: 1, icon: Square },
  { id: "wide", name: "16:9", value: 16 / 9, icon: Monitor },
]

const CapturePage: React.FC<CapturePageProps> = ({ onPhotoTaken, onBack }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Camera State
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isInitializing, setIsInitializing] = useState(true)
  const [facingMode, setFacingMode] = useState<"user" | "environment">("environment")

  // Features State
  const [hasFlash, setHasFlash] = useState(false)
  const [flashEnabled, setFlashEnabled] = useState(false)
  const [isFlashing, setIsFlashing] = useState(false) // Visual effect for front camera
  const [showGrid, setShowGrid] = useState(false)
  const [countdown, setCountdown] = useState<number | null>(null)

  // Aspect Ratio State
  const [ratioIndex, setRatioIndex] = useState(0)
  const activeRatio = RATIOS[ratioIndex]

  // Initialize Camera
  useEffect(() => {
    const startCamera = async (mode: "user" | "environment") => {
      setIsInitializing(true)
      setError(null)
      setFlashEnabled(false)

      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }

      try {
        const newStream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: mode,
            // We ask for a high ideal resolution, but CSS will constrain the display
            width: { ideal: 1920 },
            height: { ideal: 1080 },
            aspectRatio: { ideal: 9 / 16 },
          },
        })

        if (videoRef.current) {
          videoRef.current.srcObject = newStream
          setStream(newStream)
        }

        // Check for Torch capability
        const track = newStream.getVideoTracks()[0]
        const capabilities = track.getCapabilities()
        // @ts-ignore - 'torch' exists in modern browsers but TS might complain
        setHasFlash(!!capabilities.torch)
      } catch (err) {
        console.error("Error accessing camera:", err)
        setError("Could not access the camera. Please check permissions.")
        setIsInitializing(false)
      }
    }

    startCamera(facingMode)

    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [facingMode])

  // Toggle Flash (Torch)
  const toggleFlash = async () => {
    if (!stream || !hasFlash) return
    const track = stream.getVideoTracks()[0]
    const newStatus = !flashEnabled

    try {
      // @ts-ignore
      await track.applyConstraints({ advanced: [{ torch: newStatus }] })
      setFlashEnabled(newStatus)
    } catch (e) {
      console.error("Flash toggle failed", e)
    }
  }

  // Trigger Countdown
  const startCountdown = () => {
    if (countdown !== null) return // Prevent double clicks
    setCountdown(3)
  }

  // Handle Countdown Tick
  useEffect(() => {
    if (countdown === null) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      // Countdown finished
      handleCapture()
      setCountdown(null)
    }
  }, [countdown])

  // Capture Logic
  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current) return
    const video = videoRef.current
    const canvas = canvasRef.current

    // Visual Flash Effect (Software Flash)
    setIsFlashing(true)
    setTimeout(() => setIsFlashing(false), 150)

    // Calculate Dimensions based on Ratio
    const videoW = video.videoWidth
    const videoH = video.videoHeight
    const targetRatio = activeRatio.value

    let cropW, cropH, sx, sy

    // Determine crop dimensions centered on the video feed
    if (videoW / videoH > targetRatio) {
      // Video is wider than target -> Crop Width
      cropH = videoH
      cropW = cropH * targetRatio
      sx = (videoW - cropW) / 2
      sy = 0
    } else {
      // Video is taller than target (or equal) -> Crop Height
      cropW = videoW
      cropH = cropW / targetRatio
      sx = 0
      sy = (videoH - cropH) / 2
    }

    // Set canvas to the crop size (for high res output)
    canvas.width = cropW
    canvas.height = cropH

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Mirror if front camera
    if (facingMode === "user") {
      // Translate context to the center of the crop, flip, then draw
      // For a simple crop + flip:
      // 1. Translate to width, 0
      ctx.translate(canvas.width, 0)
      // 2. Scale x by -1
      ctx.scale(-1, 1)
    }

    // Draw the cropped portion of the video
    ctx.drawImage(video, sx, sy, cropW, cropH, 0, 0, canvas.width, canvas.height)

    // High quality export
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95)
    onPhotoTaken(dataUrl)
  }

  const handleSwitchCamera = () => {
    setFacingMode((prev) => (prev === "user" ? "environment" : "user"))
  }

  const toggleRatio = () => {
    setRatioIndex((prev) => (prev + 1) % RATIOS.length)
  }

  return (
    <div className="h-full w-full bg-neutral-950 text-white flex flex-col relative overflow-hidden">
      {/* Header */}
      <header className="flex items-center justify-between p-4 bg-gradient-to-b from-black/80 to-transparent z-20 absolute top-0 left-0 right-0">
        <button onClick={onBack} className="p-2 hover:bg-white/10 rounded-full transition-colors">
          <ArrowLeft className="w-6 h-6" />
        </button>

        <div className="flex items-center gap-2">
          {/* Ratio Toggle */}
          <button
            onClick={toggleRatio}
            className="p-2 hover:bg-white/10 rounded-full transition-colors flex items-center gap-1"
          >
            <activeRatio.icon className="w-5 h-5" />
            <span className="text-[10px] font-bold uppercase w-6 text-center">{activeRatio.name}</span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => setShowGrid(!showGrid)}
            className={`p-2 rounded-full transition-colors ${showGrid ? "text-red-500 bg-white/10" : "text-white hover:bg-white/10"}`}
          >
            <Grid3x3 className="w-6 h-6" />
          </button>

          {/* Flash Toggle */}
          {hasFlash && (
            <button
              onClick={toggleFlash}
              className={`p-2 rounded-full transition-colors ${flashEnabled ? "text-yellow-400 bg-white/10" : "text-white hover:bg-white/10"}`}
            >
              {flashEnabled ? <Zap className="w-6 h-6 fill-current" /> : <ZapOff className="w-6 h-6" />}
            </button>
          )}

          {/* Camera Switch */}
          <button
            onClick={handleSwitchCamera}
            disabled={isInitializing}
            className="p-2 hover:bg-white/10 rounded-full transition-colors"
          >
            <RefreshCw className="w-6 h-6" />
          </button>
        </div>
      </header>

      {/* Main Viewfinder */}
      {/* Using flex-1 relative overflow-hidden ensures the container takes available space but NEVER expands beyond it */}
      <main className="flex-1 relative bg-black overflow-hidden w-full h-full flex items-center justify-center">
        {isInitializing && (
          <div className="absolute inset-0 flex flex-col items-center justify-center z-10 bg-neutral-900">
            <Loader2 className="w-10 h-10 animate-spin text-red-600 mb-2" />
            <p className="font-sans font-black italic uppercase text-sm">Starting Camera...</p>
          </div>
        )}

        {error && (
          <p className="text-red-400 p-4 text-center z-10 absolute inset-0 flex items-center justify-center">{error}</p>
        )}

        {/* Absolute positioning ensures video fits container exactly without pushing boundaries */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          style={{ maxHeight: "100dvh", maxWidth: "100vw" }}
          className={`absolute inset-0 w-full h-full object-cover ${facingMode === "user" ? "scale-x-[-1]" : ""}`}
          onLoadedData={() => setIsInitializing(false)}
        />

        {/* Software Flash Overlay */}
        {isFlashing && <div className="absolute inset-0 bg-white z-30 animate-pulse pointer-events-none" />}

        {/* BETTER MASKING: Center Box with Border */}
        <div className="absolute inset-0 z-10 pointer-events-none flex items-center justify-center overflow-hidden">
          {/* This div is the "safe area". We give it a huge box shadow to dim the outside. */}
          <div
            className="relative transition-all duration-300 ease-out border border-white/30 shadow-[0_0_0_9999px_rgba(0,0,0,0.7)]"
            style={{
              aspectRatio: `${activeRatio.value}`,
              width: activeRatio.value > 9 / 16 ? "100%" : "auto",
              height: activeRatio.value <= 9 / 16 ? "100%" : "auto",
              maxHeight: "100%",
              maxWidth: "100%",
            }}
          >
            {/* Grid lines inside the safe area */}
            {showGrid && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3">
                <div className="border-r border-b border-white/30 shadow-sm"></div>
                <div className="border-r border-b border-white/30 shadow-sm"></div>
                <div className="border-b border-white/30 shadow-sm"></div>
                <div className="border-r border-b border-white/30 shadow-sm"></div>
                <div className="border-r border-b border-white/30 shadow-sm"></div>
                <div className="border-b border-white/30 shadow-sm"></div>
                <div className="border-r border-white/30 shadow-sm"></div>
                <div className="border-r border-white/30 shadow-sm"></div>
                <div className=""></div>
              </div>
            )}
          </div>
        </div>

        {/* Countdown Overlay */}
        {countdown !== null && (
          <div className="absolute inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
            <div className="text-[10rem] font-black italic text-white animate-bounce drop-shadow-lg">{countdown}</div>
          </div>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </main>

      {/* Footer Controls */}
      <footer className="p-8 bg-gradient-to-t from-black/90 to-transparent z-20 flex items-center justify-center gap-12 relative">
        {/* Timer Button */}
        <button
          onClick={() => setCountdown(countdown === null ? 3 : null)}
          className={`flex flex-col items-center gap-1 transition-colors ${countdown ? "text-red-500" : "text-white/80 hover:text-white"}`}
        >
          <Timer className="w-6 h-6" />
          <span className="text-[10px] font-bold uppercase tracking-wider">{countdown ? "On" : "Timer"}</span>
        </button>

        {/* Shutter Button */}
        <button
          onClick={startCountdown}
          disabled={isInitializing || !!error || countdown !== null}
          aria-label="Take Photo"
          className="w-20 h-20 rounded-full bg-white flex items-center justify-center border-4 border-neutral-400 disabled:opacity-50 transition-all active:scale-95 shadow-lg"
        >
          <div
            className={`w-16 h-16 rounded-full bg-white ring-2 ring-inset ring-black ${countdown !== null ? "animate-pulse bg-red-500" : ""}`}
          ></div>
        </button>

        {/* Spacer for balance */}
        <div className="w-10"></div>
      </footer>
    </div>
  )
}

export default CapturePage
