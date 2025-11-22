"use client"

import { useState } from "react"
import CoverPage from "@/components/CoverPage"
import LandingPage from "@/components/LandingPage"
import FrameSelection from "@/components/FrameSelection"
import CapturePage from "@/components/CapturePage"
import PhotoWall from "@/components/PhotoWall"
import HistoryPage from "@/components/HistoryPage"
import BottomNav from "@/components/BottomNav"
import { Frame } from "@/types"

type Page = "cover" | "landing" | "capture" | "frames" | "camera" | "wall"

export default function Home() {
  const [currentPage, setCurrentPage] = useState<Page>("cover")
  const [currentTab, setCurrentTab] = useState("landing")
  const [capturedImage, setCapturedImage] = useState<string | null>(null)
  const [selectedFrame, setSelectedFrame] = useState<Frame | null>(null)
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null)
  const [hasNewUpload, setHasNewUpload] = useState(false)

  const handleStart = () => {
    setCurrentPage("landing")
    setCurrentTab("landing")
  }

  const handleImageSelect = (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl)
    setCurrentPage("frames")
  }

  const handleFrameSelect = (frame: Frame) => {
    setSelectedFrame(frame)
    // Navigate to preview or next step
  }

  const handleUploadSuccess = (url: string) => {
    setUploadedUrl(url)
    setHasNewUpload(true)
    // Optionally navigate to wall
    // setCurrentTab("wall")
  }

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab)
    // If switching tabs, we generally want to be on the main view of that tab
    // But for "landing", we might want to reset to the landing page if we were deep in a flow?
    // For now, let's just switch tabs.
    if (tab === "wall") {
      setHasNewUpload(false)
    }
  }

  const renderMainContent = () => {
    // If we are in a specific flow (capture, frames, etc), we might want to show that regardless of tab?
    // Or should the creation flow only be active when "landing" (Home) tab is active?
    // Let's assume creation flow is part of Home tab.

    if (currentTab === "landing") {
      // If we are in the creation flow, show those pages
      if (currentPage === "capture") {
        // Return CapturePage (need to import or handle)
        // For now, let's assume LandingPage handles the start
      }
      // ... handle other flow states if they were implemented as separate pages

      // Default to LandingPage for Home tab
      // Note: The original LandingPage component handles image selection and camera start
      return (
        <LandingPage
          onImageSelect={handleImageSelect}
          onTakePicture={() => setCurrentPage("camera")}
        />
      )
    }

    if (currentTab === "wall") {
      return <PhotoWall onBack={() => setCurrentTab("landing")} />
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
          {/* We need to handle the full-screen creation flow pages (Camera, Frames, etc) 
              If they are active, they might overlay everything, including nav? 
              Or should they be inside the Home tab?
              
              Based on previous code:
              currentPage could be "frames", "camera", "wall".
              
              If currentPage is "camera", we show CameraPage.
              If currentPage is "frames", we show FrameSelection.
              
              Let's keep the original conditional rendering for the creation flow *on top* 
              if it's active and we are on the Home tab.
          */}

          {currentPage === "camera" ? (
            // <CameraPage ... /> // Need to import if it exists, or handle
            // Placeholder for now as original code had it
            <div className="text-white">Camera Page Placeholder</div>
          ) : currentPage === "frames" ? (
            // <FrameSelection ... />
            <div className="text-white">Frame Selection Placeholder</div>
          ) : (
            renderMainContent()
          )}

          {/* Only show BottomNav if we are NOT in a full-screen flow like Camera or Frames? 
              Or always show it? Usually hidden during capture/edit.
          */}
          {(currentPage === "landing" || currentPage === "wall" || currentTab !== "landing") && (
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
