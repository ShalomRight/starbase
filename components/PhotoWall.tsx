"use client"

import type React from "react"
import { useEffect, useState } from "react"
import {
  ArrowLeft,
  Camera,
  Star,
  Loader2,
  Share2,
  Trophy,
  TrendingUp,
  Users,
  Sparkles,
  Check,
  LinkIcon,
} from "lucide-react"
import { getWallImages } from "../lib/actions"

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

const PhotoWall: React.FC<PhotoWallProps> = ({ currentUpload, onBack, userName = "Star" }) => {
  const [images, setImages] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [metrics, setMetrics] = useState<PhotoMetrics>({ totalPhotos: 0, yourContribution: 0, trending: [] })
  const [showSuccessModal, setShowSuccessModal] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [copiedLink, setCopiedLink] = useState(false)
  const [modalCopiedLink, setModalCopiedLink] = useState(false)

  useEffect(() => {
    // Show success modal if we have a fresh upload
    if (currentUpload) {
      setShowSuccessModal(true)
      // Extended timeout to allow user to interact with share buttons
      setTimeout(() => setShowSuccessModal(false), 3000)
    }

    const fetchImages = async () => {
      setIsLoading(true)
      try {
        // 1. Try to fetch real images from Cloudinary
        const wallImages = await getWallImages()

        // 2. Mock data as fallback/filler so the wall looks good immediately
        const mockImages = [
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/588363042_25802814315978061_7224626267314817289_n.jpg?_nc_cat=111&ccb=1-7&_nc_sid=833d8c&_nc_ohc=iQXVAravhGkQ7kNvwEaB8ws&_nc_oc=AdkeF6yAp0gsxVevTZVpriU4eyywGZ0sSJNGY1V4BoWacC528uXxDXa48ePRYiIuds8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=ymxLzUPgGN-DSej9xYSu_w&oh=00_AfgO01jiGDeoyNYL7JsFcDlaskKboYjQi3pDjXaImENmww&oe=6927DA1D", // Campaign vibe
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/546162704_1332115925200750_4753958421008208380_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=BFqHpt7tVeYQ7kNvwGGuJ0r&_nc_oc=AdlJRt73gduzLHkUrZFSnsG4UdX5Ap5LVdG5N8Ivp3qyiXXrjZ4ylxHShXaEYuOWVuw&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=2uMm4j5mlzHaY01P8NNang&oh=00_AfjOyoG9jwgv31VZIQk_41jaKYwtkG-Jlx4hmNIuec6EqQ&oe=6927AF39",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/545306024_1332115951867414_7099443326228007837_n.jpg?_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=2kY8_24BlscQ7kNvwHY2-9E&_nc_oc=Adni8Ewnidqm9bYqVdpd180Qo4fP65hJThOXwxEF6utciVsqQqMxdC3wNGOQ4mtSPyc&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=4CUmXn3axozAw8fIm4MWqg&oh=00_Afgysflt7i_b00h_Gras-lIK6OFyMa9A7Y3IKiL22ZpZ7A&oe=6927BEF0",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/587055389_25778525731740253_7091730232399758850_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=833d8c&_nc_ohc=FnoOVmaeFxMQ7kNvwGJC7c7&_nc_oc=Adn6iyyq2rLQT7lb6MkZQ9umpowJambmvpjHMQGsSPGA6Z_oouj6qQOV9TBYmcTla4g&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=eXL1h9c2DU99smeu3RVEIA&oh=00_AfjhAE85j5p__v-VhFfWzQRDc584raBXWVDn3pDlhMyupA&oe=6927A92B",
          "https://scontent.fsvd1-1.fna.fbcdn.net/v/t39.30808-6/578152552_1380528110359531_8871945834446734851_n.jpg?_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Szbz5J_2C-QQ7kNvwFmSWU1&_nc_oc=AdlZiVw4xbLyQ3E4VifGe0WqRphqdqsTclQxW9m-5OzXnlzmQg7WlbPt8-zBZibvXs8&_nc_zt=23&_nc_ht=scontent.fsvd1-1.fna&_nc_gid=rjoplnzs3arqstUIQHw78g&oh=00_Afi8uig-xZfwIYyK1L4Rx0IsFzvwwua2O-0t6daKNnnKYQ&oe=6927C582",
        ]

        // Combine real images with mocks (Real images first)
        // Deduplicate based on URL
        const uniqueImages = Array.from(new Set([...wallImages, ...mockImages]))

        let allImages = uniqueImages

        // Ensure current upload is at the very top
        if (currentUpload) {
          allImages = [currentUpload, ...allImages.filter((img) => img !== currentUpload)]
        }

        setImages(allImages)
        setMetrics({
          totalPhotos: allImages.length + 120, // Add base count for social proof
          yourContribution: currentUpload ? 1 : 0,
          trending: allImages.slice(0, 3),
        })
      } catch (error) {
        console.error("Failed to load wall", error)
        if (currentUpload) setImages([currentUpload])
      } finally {
        setIsLoading(false)
      }
    }

    fetchImages()
  }, [currentUpload])

  const handleShare = async (specificUrl?: string) => {
    const urlToShare = specificUrl || window.location.href
    const shareData = {
      title: "Join the ULP Movement!",
      text: `I just joined ${metrics.totalPhotos}+ supporters on the ULP Star Wall! Check out my photo.`,
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

  const handleImageClick = (url: string) => {
    setSelectedImage(url)
  }

  const closeModal = () => {
    setSelectedImage(null)
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
              <div className="absolute inset-0 bg-yellow-400/20 blur-3xl rounded-full"></div>
              <Star className="w-24 h-24 mx-auto text-yellow-400 fill-yellow-400 animate-pulse relative z-10 drop-shadow-[0_0_15px_rgba(250,204,21,0.5)]" />
              <Sparkles className="w-10 h-10 absolute top-0 right-8 text-yellow-200 animate-bounce" />
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
                You are Supporter #{metrics.totalPhotos}
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
      {selectedImage && (
        <div className="absolute inset-0 bg-black/95 z-50 flex items-center justify-center p-4" onClick={closeModal}>
          <button
            onClick={closeModal}
            className="absolute top-4 right-4 bg-white/10 p-2 rounded-full hover:bg-white/20 z-50"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <img
            src={selectedImage || "/placeholder.svg"}
            alt="Selected"
            className="max-w-full max-h-full object-contain shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-4 pointer-events-none">
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleShare(selectedImage)
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
              Star Wall
            </h1>
            <p className="text-[10px] font-bold uppercase tracking-widest text-red-200">
              {metrics.totalPhotos} Proud Supporters
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

        {/* Stats Bar */}
        <div className="bg-red-900/50 border-t border-red-600/30 px-4 py-3">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-white/10 rounded p-2">
              <Users className="w-5 h-5 mx-auto mb-1 text-red-200" />
              <p className="text-xl font-black">{metrics.totalPhotos}</p>
              <p className="text-[9px] uppercase tracking-wider text-red-200">Stars</p>
            </div>
            <div className="bg-white/10 rounded p-2">
              <TrendingUp className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <p className="text-xl font-black">+{Math.floor(metrics.totalPhotos * 0.15)}</p>
              <p className="text-[9px] uppercase tracking-wider text-red-200">Today</p>
            </div>
            <div className="bg-white/10 rounded p-2">
              <Trophy className="w-5 h-5 mx-auto mb-1 text-yellow-400" />
              <p className="text-xl font-black">#{Math.floor(Math.random() * 3) + 1}</p>
              <p className="text-[9px] uppercase tracking-wider text-red-200">Trending</p>
            </div>
          </div>
        </div>

        {/* Your Contribution Badge */}
        {currentUpload && (
          <div className="bg-yellow-400 text-neutral-900 px-4 py-2 flex items-center justify-center gap-2">
            <Star className="w-4 h-4 fill-current" />
            <p className="font-black italic text-sm uppercase">You're part of the movement, {userName}!</p>
          </div>
        )}
      </header>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-neutral-100 scroll-smooth">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-red-600" />
            <p className="font-sans font-black italic uppercase text-neutral-600">Loading Stars...</p>
          </div>
        ) : (
          <>
            {images.length === 0 ? (
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
                      <img
                        src={currentUpload || "/placeholder.svg"}
                        alt="Your photo"
                        className="w-full aspect-[9/16] object-cover cursor-pointer"
                        onClick={() => handleImageClick(currentUpload)}
                      />
                      <div className="flex items-center justify-between p-2 bg-red-600 text-white mt-2">
                        <span className="font-black italic text-sm uppercase">That's You!</span>
                        <Star className="w-5 h-5 fill-white" />
                      </div>
                    </div>
                  </div>
                )}

                {/* All Photos Grid */}
                <div className="mb-3">
                  <h3 className="font-black italic uppercase text-neutral-900 mb-3 tracking-wide flex items-center gap-2">
                    <Users className="w-5 h-5 text-red-600" />
                    All Supporters
                  </h3>
                </div>
                <div className="grid grid-cols-2 gap-3 pb-24">
                  {images.map((url, idx) => (
                    <div
                      key={idx}
                      className="aspect-[9/16] bg-white p-1.5 shadow-md hover:shadow-xl transform transition-all hover:scale-105 cursor-pointer group relative"
                      onClick={() => handleImageClick(url)}
                    >
                      <img
                        src={url || "/placeholder.svg"}
                        alt={`Star ${idx + 1}`}
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <span className="text-white text-xs font-bold">Supporter #{idx + 1}</span>
                      </div>
                    </div>
                  ))}
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
              Join {metrics.totalPhotos}+ Supporters
            </p>
            <div className="flex justify-center items-center gap-1">
              {images.slice(0, 5).map((url, i) => (
                <img
                  key={i}
                  src={url || "/placeholder.svg"}
                  className="w-8 h-8 rounded-full border-2 border-white -ml-2 first:ml-0 shadow-sm object-cover"
                  alt=""
                />
              ))}
              {images.length > 5 && (
                <div className="w-8 h-8 rounded-full bg-red-600 text-white text-xs font-bold flex items-center justify-center -ml-2 border-2 border-white">
                  +{images.length - 5}
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={onBack}
              className="bg-red-700 text-white font-sans font-black italic py-4 px-4 shadow-lg hover:bg-red-800 transition-all active:scale-95 flex items-center justify-center gap-2 uppercase tracking-wider transform -skew-x-3"
            >
              <div className="transform skew-x-3 flex items-center gap-2">
                <Camera className="w-5 h-5" />
                <span className="text-sm">Add Photo</span>
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

export default PhotoWall
