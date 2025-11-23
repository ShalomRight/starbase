"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { UploadCloud, Loader2, Camera, Star, Clock, X, Download, Copy, Check, ImagePlus } from "lucide-react"
import { getPhotoHistory } from "../lib/storage"

interface LandingPageProps {
  onImageSelect: (image: string) => void
  onTakePicture: () => void
}

const LandingPage: React.FC<LandingPageProps> = ({ onImageSelect, onTakePicture }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  const [selectedHistoryImage, setSelectedHistoryImage] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    setHistory(getPhotoHistory())
  }, [])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      processFile(file)
    }
  }

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/")) {
      setError("Please select an image file.")
      return
    }

    setIsLoading(true)
    setError(null)
    const reader = new FileReader()
    reader.onload = (e) => {
      if (e.target?.result) {
        onImageSelect(e.target.result as string)
      } else {
        setError("Could not read the image.")
      }
      setIsLoading(false)
    }
    reader.onerror = () => {
      setError("Error reading file.")
      setIsLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleHistoryClick = (url: string) => {
    setSelectedHistoryImage(url)
  }

  const handleDownloadHistory = () => {
    if (!selectedHistoryImage) return
    const a = document.createElement("a")
    a.href = selectedHistoryImage
    a.download = `ulp-star-history-${Date.now()}.jpg`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  const handleCopyHistory = async () => {
    if (!selectedHistoryImage) return
    try {
      // If it's an ImageKit URL (starts with https://ik.imagekit.io/), copy the link
      // If base64, we can't really copy the "link" easily to clipboard as text
      if (selectedHistoryImage.startsWith("https://ik.imagekit.io/")) {
        await navigator.clipboard.writeText(selectedHistoryImage)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      } else {
        alert("This photo is saved locally. Use 'Save' to download it.")
      }
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="h-full w-full bg-white flex flex-col relative">
      {/* History Modal */}
      {selectedHistoryImage && (
        <div className="absolute inset-0 z-50 bg-black/95 flex items-center justify-center p-4 animate-fade-in">
          <button
            onClick={() => setSelectedHistoryImage(null)}
            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="w-full max-w-sm flex flex-col gap-4">
            <img
              src={selectedHistoryImage || "/placeholder.svg"}
              alt="History"
              className="w-full rounded-sm border-4 border-white shadow-2xl"
            />
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={handleDownloadHistory}
                className="bg-white text-red-700 py-3 rounded font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:bg-gray-100"
              >
                <Download className="w-4 h-4" /> Save
              </button>
              {selectedHistoryImage.startsWith("https://ik.imagekit.io/") && (
                <button
                  onClick={handleCopyHistory}
                  className="bg-red-600 text-white py-3 rounded font-black italic uppercase text-sm flex items-center justify-center gap-2 hover:bg-red-700"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? "Copied" : "Copy Link"}
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-red-700 p-8 pb-12 rounded-b-[3rem] shadow-xl relative overflow-hidden flex-none">
        <div className="absolute top-[-20px] right-[-20px] text-red-800 opacity-50">
          <Star className="w-32 h-32 fill-current" />
        </div>

        <div className="flex justify-center mb-4 relative z-10">
          <div className="w-16 h-16 bg-white flex items-center justify-center rounded-full shadow-md border-4 border-neutral-900">
            <Star className="w-8 h-8 text-red-700 fill-current" />
          </div>
        </div>
        <h1 className="text-4xl font-sans font-black italic text-center text-white mb-1 uppercase tracking-tighter relative z-10 transform -skew-x-6">
          Join The Team
        </h1>
        <p className="text-red-100 text-center mt-2 font-sans font-bold uppercase tracking-wide text-sm relative z-10">
          Upload your photo to show support
        </p>
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col p-6 relative overflow-y-auto">
        <div className="space-y-4 mt-4">
          {/* Upload Button */}
          <label
            htmlFor="image-upload"
            className="w-full cursor-pointer bg-neutral-900 text-white font-black italic py-5 px-6 shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider transform -skew-x-3"
          >
            <div className="transform skew-x-3 flex items-center gap-3">
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <UploadCloud className="w-6 h-6" />
                  Select a Photo
                </>
              )}
            </div>
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
            disabled={isLoading}
          />

          {/* Separator */}
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t-2 border-gray-100"></div>
            <span className="flex-shrink-0 mx-4 text-red-700 font-black italic text-xl">OR</span>
            <div className="flex-grow border-t-2 border-gray-100"></div>
          </div>

          {/* Camera Button */}
          <button
            onClick={onTakePicture}
            className="w-full cursor-pointer bg-white text-red-700 border-4 border-red-700 font-black italic py-5 px-6 shadow-sm hover:bg-red-50 transition-all active:scale-95 flex items-center justify-center gap-3 uppercase tracking-wider transform -skew-x-3"
            disabled={isLoading}
          >
            <div className="transform skew-x-3 flex items-center gap-3">
              <Camera className="w-6 h-6" />
              Take a Picture
            </div>
          </button>
        </div>

        {/* History Section */}
        <div className="mt-8 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <Clock className="w-4 h-4 text-red-600" />
            <h3 className="font-black italic uppercase text-neutral-900 tracking-wide text-sm">Your Stars</h3>
          </div>

          {history.length > 0 ? (
            <div className="flex gap-3 overflow-x-auto pb-4 scrollbar-hide snap-x">
              {history.map((url, index) => (
                <button
                  key={index}
                  onClick={() => handleHistoryClick(url)}
                  className="flex-none w-20 h-32 rounded border-2 border-neutral-200 overflow-hidden shadow-sm hover:border-red-600 transition-colors snap-start relative bg-gray-100"
                >
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`History ${index}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-red-200 bg-red-50/50 rounded-lg p-6 flex flex-col items-center justify-center text-center">
              <div className="bg-white p-3 rounded-full shadow-sm mb-3">
                <ImagePlus className="w-6 h-6 text-red-300" />
              </div>
              <p className="font-black italic uppercase text-neutral-400 text-sm">No Stars Yet</p>
              <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wide mt-1">
                Create your first design to see it here
              </p>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-red-50 text-red-600 p-3 font-bold text-center border-2 border-red-100 uppercase italic mt-4">
            {error}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-6 text-center bg-neutral-100 border-t border-gray-200 flex-none">
        <p className="text-xs text-neutral-400 font-sans font-black tracking-widest uppercase italic">
          Unity Labour Party
        </p>
      </div>
    </div>
  )
}

export default LandingPage
