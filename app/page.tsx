"use client"

import { useState } from "react"
import CoverPage from "@/components/CoverPage"
import LandingPage from "@/components/LandingPage"
import FrameSelection from "@/components/FrameSelection"
import CapturePage from "@/components/CapturePage"
import CameraPage from "@/components/CameraPage"
import PhotoWall from "@/components/PhotoWall"
import PhotoFeed from "@/components/PhotoFeed"
import HistoryPage from "@/components/HistoryPage"
import BottomNav from "@/components/BottomNav"
import { Frame } from "@/types"

type Page = "cover" | "landing" | "capture" | "frames" | "camera" | "wall" | "feed"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("cover")
  const [currentTab, setCurrentTab] = useState("photo")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [hasNewUpload, setHasNewUpload] = useState(false)

  const handleStart = () => {
    setCurrentPage("landing")
    setCurrentTab("photo")
  }

  const handleImageSelect = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl)
    setCurrentPage("frames")
  }

  const handleTakePicture = () => {
    setCurrentPage("capture")
  }

  const handlePhotoTaken = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl)
    setCurrentPage("frames")
  }

  const handleFrameSelect = (frame: Frame | null) => {
    setSelectedFrame(frame)
    setCurrentPage("camera") // Navigate to preview/editor (CameraPage)
  }

  const handleBack = () => {
    if (currentPage === "capture") {
      setCurrentPage("landing")
    } else if (currentPage === "frames") {
      // If we have a captured image, maybe go back to capture? 
      // Or if it was uploaded, go back to landing.
      // For now, let's go back to landing to keep it simple, or capture if we want to retake.
      // But if we uploaded a file, we can't "retake" easily without re-uploading.
      // Let's go to Landing.
      setCurrentPage("landing")
      setCapturedImage(null)
    } else if (currentPage === "camera") {
      setCurrentPage("frames")
    } else if (currentPage === "wall") {
      setCurrentPage("landing")
      setCurrentTab("photo")
    }
  }

  const handleGoToWall = (url: string) => {
    setUploadedUrl(url)
    setHasNewUpload(true)
    setCurrentPage("wall") // Show PhotoWall with success modal
    // Note: We don't switch tab to "stars" yet, we show the PhotoWall component first
  }

  const handleStartOver = () => {
    setCapturedImage(null)
    setSelectedFrame(null)
    setUploadedUrl(null)
    setCurrentPage("landing")
    setCurrentTab("photo")
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    if (tab === "stars") {
      setHasNewUpload(false)
    }
    // Reset to landing page view when switching tabs if we were in a sub-view
    if (currentPage !== "landing" && currentPage !== "cover") {
      if (tab !== "photo") {
        setCurrentPage("landing")
      }
    }
  }

  const renderMainContent = () => {
    if (currentTab === "photo") {
      return (
        <LandingPage
          onImageSelect={handleImageSelect}
          onTakePicture={handleTakePicture}
        />
      )
    }

    if (currentTab === "stars") {
      return <PhotoFeed />
    }

    if (currentTab === "history") {
      return <HistoryPage />
    }

    return null
  }

  return (
    <main className="h-screen w-screen overflow-hidden bg-neutral-950">
      {currentPage === "cover" ? (
        <CoverPage onStart={handleStart} />
      ) : (
        <>
          {/* Full-screen creation flow overlays */}
          {currentPage === "capture" ? (
            <CapturePage
              onPhotoTaken={handlePhotoTaken}
              onBack={handleBack}
            />
          ) : currentPage === "frames" ? (
            <FrameSelection
              onSelectFrame={handleFrameSelect}
              onBack={handleBack}
            />
          ) : currentPage === "camera" && capturedImage ? (
            <CameraPage
              imageSrc={capturedImage}
              frame={selectedFrame}
              onBack={handleBack}
              onStartOver={handleStartOver}
              onGoToWall={handleGoToWall}
            />
          ) : currentPage === "wall" ? (
            <PhotoWall
              currentUpload={uploadedUrl}
              onBack={() => {
                setCurrentPage("landing")
                setCurrentTab("photo")
              }}
            />
          ) : (
            renderMainContent()
          )}

          {/* Hide BottomNav when in full-screen creation flow */}
          {currentPage !== "capture" && currentPage !== "frames" && currentPage !== "camera" && currentPage !== "wall" && (
            <BottomNav
              currentTab={currentTab}
              onTabChange={handleTabChange}
              hasNewNotification={hasNewUpload}
            />
          )}
        </>
      )}
    </main>
  )
}
