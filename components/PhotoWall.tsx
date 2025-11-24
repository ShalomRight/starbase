"use client"

import React, { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ArrowLeft,
  Camera,
  Star,
  Loader2,
  Share2,
  Sparkles,
  Check,
  LinkIcon,
  Heart,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
} from "lucide-react"
import { useWallPhotos } from "@/hooks/usePhotos"
import { useLike } from "@/hooks/useLike"
import { useAnonymousUser } from "@/hooks/useAnonymousUser"
import type { PhotoWithId } from "@/lib/firebase/types"
import OptimizedImage from "./OptimizedImage"

interface PhotoWallProps {
  currentUpload?: string | null
  onBack: () => void
  userName?: string
}

interface PhotoMetrics {
  totalPhotos: number
  yourContribution: number
  trending: string[]
}

// Like Button Component
function LikeButton({ photoId, initialLikes, initialLiked }: { photoId: string, initialLikes: number, initialLiked: boolean }) {
  const { uid } = useAnonymousUser()
  const { likes, liked, toggleLike, isLoading } = useLike(photoId, initialLikes, initialLiked)

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (uid) {
      toggleLike(uid)
    }
  }

  return (
    <button
      onClick={handleClick}
      disabled={isLoading}
      className={`
                flex items-center gap-1.5 px-3 py-1.5 rounded-full backdrop-blur-md transition-all duration-300
                ${liked
          ? "bg-red-600/90 text-white shadow-[0_0_10px_rgba(220,38,38,0.5)]"
          : "bg-black/40 text-white hover:bg-black/60 border border-white/10"
        }
            `}
    >
      <Heart className={`w-3.5 h-3.5 ${liked ? "fill-current animate-heartbeat" : ""}`} />
      <span className="text-xs font-bold">{likes}</span>
    </button>
  )
}

interface MasonryGridProps {
  photos: PhotoWithId[]
  onPhotoClick: (photo: PhotoWithId) => void
}

const MasonryGrid = ({ photos, onPhotoClick }: MasonryGridProps) => {
  const [width, setWidth] = useState(0)
  const gridRef = React.useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (gridRef.current) {
      setWidth(gridRef.current.offsetWidth)
    }
  }, [])

  const columns = 2 // Fixed to 2 columns for now

  const calculatedGrid = useMemo(() => {
    if (!width || photos.length === 0) return []
    const colHeights = new Array(columns).fill(0)
    const gap = 16 // Increased gap for better spacing
    const totalGaps = (columns - 1) * gap
    const columnWidth = (width - totalGaps) / columns

    return photos.map((photo, idx) => {
      const col = colHeights.indexOf(Math.min(...colHeights))
      const x = col * (columnWidth + gap)
      // Use aspect ratio from photo or calculate from width/height
      const aspectRatio = photo.aspectRatio || (photo.width && photo.height ? photo.width / photo.height : 0.75)
      const height = columnWidth / aspectRatio
      const y = colHeights[col]

      colHeights[col] += height + gap
      return { ...photo, x, y, w: columnWidth, h: height, col, index: idx }
    })
  }, [width, photos, columns])

  const maxHeight = Math.max(...calculatedGrid.map(item => item.y + item.h), 0)

  const { uid } = useAnonymousUser()

  return (
    <div ref={gridRef} className="relative w-full" style={{ height: maxHeight }}>
      {calculatedGrid.map((item: PhotoWithId & { x: number; y: number; w: number; h: number; index: number }) => {
        const isLiked = uid ? item.likedBy?.includes(uid) : false
        return (
          <div
            key={item.id}
            className="absolute bg-white p-1.5 shadow-md hover:shadow-xl transform transition-all hover:scale-105 cursor-pointer group relative"
            style={{
              left: item.x,
              top: item.y,
              width: item.w,
              height: item.h,
            }}
            onClick={() => onPhotoClick(item)}
          >
            <OptimizedImage
              src={item.url}
              alt={`Star ${item.index + 1}`}
              width={item.w}
              height={item.h}
              className="w-full h-full object-cover"
              loading="lazy"
              aspectRatio={item.aspectRatio}
              showPlaceholder={true}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
              <span className="text-white text-xs font-bold">Supporter #{item.index + 1}</span>
            </div>
            <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <LikeButton
                photoId={item.id}
                initialLikes={item.likes || 0}
                initialLiked={isLiked}
              />
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default function PhotoWall({ currentUpload, onBack, userName = "Star" }: PhotoWallProps) {
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<PhotoWithId | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [modalCopiedLink, setModalCopiedLink] = useState(false)

  // Use real-time photos hook
  const { photos, loading } = useWallPhotos()

  // Get anonymous user
  const { uid } = useAnonymousUser()

  useEffect(() => {
    // Show success modal if we have a fresh upload
    if (currentUpload) {
      setShowSuccessModal(true)
      // Extended timeout to allow user to interact with share buttons
      setTimeout(() => setShowSuccessModal(false), 3000)
    }
  }, [currentUpload])

  const handleShare = async (specificUrl?: string) => {
    const urlToShare = specificUrl || window.location.href
    const shareData = {
      title: "Join the ULP Movement!",
      text: `I just joined ${photos.length}+ supporters on the ULP Star Wall! Check out my photo.`, // Updated to use photos.length
      url: urlToShare,
    }

    try {
      if (navigator.share) {
        await navigator.share(shareData)
      } else {
        // Fallback: copy to clipboard
        await navigator.clipboard.writeText(urlToShare)
        if (specificUrl) {
          setModalCopiedLink(true)
          setTimeout(() => setModalCopiedLink(false), 2000)
        } else {
          setCopiedLink(true)
          setTimeout(() => setCopiedLink(false), 2000)
        }
      }
    } catch (err) {
      console.error("Share failed:", err)
    }
  }

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url)
      setModalCopiedLink(true)
      setTimeout(() => setModalCopiedLink(false), 2000)
    } catch (err) {
      console.error("Copy failed", err)
    }
  }

  const handlePhotoClick = (photo: PhotoWithId) => {
    setSelectedPhoto(photo)
  }

  const closeModal = () => {
    setSelectedPhoto(null)
  }

  return (
    <div className="h-full w-full bg-neutral-950 flex flex-col text-white overflow-hidden relative">
      {/* Success Modal */}
      {showSuccessModal && currentUpload && (
        <div className="absolute inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-gradient-to-br from-red-700 to-red-900 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl border-4 border-white/20 animate-scale-in relative overflow-hidden">
            {/* Decorative BG */}
            <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-20 pointer-events-none"></div>

            <div className="mb-6 relative">
              <div className="absolute inset-0 bg-white/20 blur-3xl rounded-full"></div>
              <Star className="w-24 h-24 mx-auto text-white fill-white animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <Sparkles className="w-10 h-10 absolute top-0 right-8 text-white animate-bounce" />
            </div>

            <h3 className="text-4xl font-sans font-black italic uppercase mb-2 text-white tracking-tighter transform -skew-x-6">
              You're a Star!
            </h3>
            <p className="text-red-100 mb-6 font-bold text-sm uppercase tracking-wide">
              Your photo is live on the wall
            </p>

            {/* Modal Actions */}
            <div className="grid grid-cols-2 gap-3 mb-6">
              <button
                onClick={() => handleShare(currentUpload)}
                className="bg-white text-red-800 py-3 px-2 rounded font-black italic uppercase text-xs hover:bg-red-50 transition-colors flex flex-col items-center gap-1 shadow-lg active:scale-95"
              >
                <Share2 className="w-5 h-5" />
                Share Photo
              </button>
              <button
                onClick={() => handleCopyLink(currentUpload)}
                className="bg-red-950/50 border border-red-500/30 text-white py-3 px-2 rounded font-black italic uppercase text-xs hover:bg-red-900/50 transition-colors flex flex-col items-center gap-1 shadow-lg active:scale-95"
              >
                {modalCopiedLink ? <Check className="w-5 h-5 text-green-400" /> : <LinkIcon className="w-5 h-5" />}
                {modalCopiedLink ? "Copied!" : "Copy Link"}
              </button>
            </div>

            <div className="bg-black/20 rounded p-3 mb-6">
              <p className="text-[10px] uppercase tracking-widest opacity-80 font-bold">
                {/* You are Supporter #{metrics.totalPhotos} */}
              </p>
            </div>

            <button
              onClick={() => setShowSuccessModal(false)}
              className="w-full bg-transparent border-2 border-white/30 text-white py-3 rounded font-bold uppercase text-xs tracking-widest hover:bg-white/10 transition-colors"
            >
              View Wall
            </button>
          </div>
        </div>
      )}

      {/* Image Detail Modal */}
      {selectedPhoto && (
        <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="relative aspect-[9/16] bg-black/50 rounded-lg overflow-hidden border border-white/10 shadow-2xl">
            <OptimizedImage
              src={selectedPhoto.url}
              alt="Selected photo"
              width={400}
              height={711}
              className="w-full h-full object-contain"
              showPlaceholder={false}
              priority={true}
            />

            {/* Like Button Overlay */}
            <div className="absolute bottom-4 right-4">
              <LikeButton
                photoId={selectedPhoto.id}
                initialLikes={selectedPhoto.likes || 0}
                initialLiked={uid ? selectedPhoto.likedBy?.includes(uid) : false}
              />
            </div>
          </div>
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare(selectedPhoto.url)
              }}
              className="pointer-events-auto bg-red-600 text-white px-6 py-3 rounded-full font-bold uppercase shadow-lg flex items-center gap-2 hover:bg-red-700 transition-transform active:scale-95"
            >
              <Share2 className="w-4 h-4" /> Share
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-gradient-to-r from-red-700 to-red-800 shadow-xl z-10 flex-none">
        <div className="flex items-center justify-between p-4">
          <button
            onClick={onBack}
            className="bg-neutral-900 p-2 rounded hover:bg-black transition-colors"
            aria-label="Go back"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="text-center">
            <h1 className="text-2xl font-sans font-black italic uppercase tracking-tighter transform -skew-x-6">
              You're a Star!
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
              Thank you for being a Proud Supporters
            </p>
          </div>
          <button
            onClick={() => handleShare()}
            className="bg-neutral-900 p-2 rounded hover:bg-black transition-colors relative"
            aria-label="Share wall"
          >
            {copiedLink ? <Check className="w-5 h-5 text-green-400" /> : <Share2 className="w-5 h-5" />}
          </button>
        </div>

        {/* Your Contribution Badge */}
        {currentUpload && (
          <div className="bg-red-800 text-neutral-900 px-4 py-2 flex items-center justify-center gap-2">
            {/* <Star className="w-4 h-4 fill-current" />
            <p className="text-neutral-600 italic text-sm uppercase">You're part of the movement!</p> */}
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-100 scroll-smooth">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            <p className="font-sans font-black italic uppercase text-neutral-600">Loading Stars...</p>
          </div>
        ) : (
          <>
            {photos.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-neutral-400 p-6 text-center">
                <Star className="w-20 h-20 mb-4 text-neutral-300" />
                <p className="font-sans font-black italic uppercase text-xl mb-2 text-neutral-600">
                  Be the First Star!
                </p>
                <p className="text-sm text-neutral-500 max-w-xs">Start the movement by adding your photo to the wall</p>
              </div>
            ) : (
              <div className="p-4">
                {/* Highlight: Most Recent */}
                {currentUpload && (
                  <div className="mb-6 animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-3">
                      <Sparkles className="w-5 h-5 text-red-600" />
                      <h3 className="font-black italic uppercase text-neutral-900 tracking-wide">Just Added</h3>
                    </div>
                    <div className="bg-white p-2 shadow-xl border-4 border-red-600 transform -rotate-1">
                      <OptimizedImage
                        src={currentUpload}
                        alt="Your photo"
                        width={400}
                        height={600}
                        className="w-full aspect-[9/16] object-cover cursor-pointer"
                        style={{ width: '100%', height: 'auto' }}
                        // Create a partial PhotoWithId for the click handler
                        onClick={() => handlePhotoClick({
                          id: 'current-upload',
                          url: currentUpload,
                          aspectRatio: 9 / 16,
                          likes: 0,
                          likedBy: [],
                          fileId: 'current-upload',
                          thumbnailUrl: currentUpload,
                          filePath: '',
                          folder: '',
                          width: 1080,
                          height: 1920,
                          size: 0,
                          tags: [],
                          views: 0,
                          shares: 0,
                          createdAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                          updatedAt: { seconds: Date.now() / 1000, nanoseconds: 0 } as any,
                          featured: false,
                          status: 'active'
                        })}
                      />
                      <div className="flex items-center justify-between p-2 bg-red-600 text-white mt-2">
                        <span className="font-black italic text-sm uppercase">That's You!</span>
                        <Star className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* All Photos Grid */}
                <div className="pb-24">
                  {loading ? (
                    <div className="h-full flex items-center justify-center text-white/50 gap-2">
                      <RefreshCw className="w-5 h-5 animate-spin" />
                      <span className="text-sm uppercase tracking-wider font-bold">Loading Wall...</span>
                    </div>
                  ) : (
                    <MasonryGrid photos={photos} onPhotoClick={handlePhotoClick} />
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </div>


      {/* Footer CTA */}

      <div className="bg-white border-t-4 border-red-600 z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.15)] flex-none">
        <div className="p-4">
          {/* Social Proof */}
          <div className="mb-3 text-center">
            <p className="text-neutral-600 text-xs font-bold uppercase tracking-wider mb-1">

            </p>
            <div className="flex justify-center items-center gap-1">

            </div>
          </div>


          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBack}
              className="bg-red-700 text-white font-sans font-black italic py-4 px-4 shadow-lg hover:bg-red-800 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider transform -skew-x-3"
            >
              <div className="transform skew-x-3 flex items-center gap-3">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Add Another Photo</span>
              </div>
            </button>

            <button
              onClick={() => handleShare()}
              className="bg-neutral-900 text-white font-sans font-black italic py-4 px-4 shadow-lg hover:bg-black transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider transform -skew-x-3"
            >
              <div className="transform skew-x-3 flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                <span className="text-sm">Share Wall</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}


