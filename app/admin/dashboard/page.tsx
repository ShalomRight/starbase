"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminImages, deleteImage, getFrames } from "@/lib/actions"
import type { CloudinaryResource } from "@/types"
import {
    LayoutGrid,
    Trash2,
    RefreshCw,
    LogOut,
    Calendar,
    HardDrive,
    Maximize2,
    ArrowUpDown,
    Search,
    AlertCircle,
    UploadCloud,
    Loader2,
    Image as ImageIcon,
    Frame as FrameIcon,
    X,
    Tag
} from "lucide-react"

function FrameManager() {
    const [frames, setFrames] = useState<CloudinaryResource[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedFrame, setSelectedFrame] = useState<CloudinaryResource | null>(null)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)

    // Upload State
    const [uploading, setUploading] = useState(false)
    const [category, setCategory] = useState("People")
    const [customCategory, setCustomCategory] = useState("")
    const [showConfirmModal, setShowConfirmModal] = useState(false)
    const [preview, setPreview] = useState<string | null>(null)




    const fetchFrames = async () => {
        setIsLoading(true)
        try {
            const data = await getFrames()
            setFrames(data)
            if (data.length > 0 && !selectedFrame) {
                setSelectedFrame(data[0])
            }
        } catch (error) {
            console.error("Failed to fetch frames", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchFrames()
    }, [])



    const handleFrameUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            setPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleSubmit = async () => {
        if (!preview || !category) {
            alert("Please select an image and enter a category")
            return
        }
        setShowConfirmModal(true)
    }

    const confirmUpload = async () => {
        setUploading(true)
        try {
            const { uploadToCloudinary } = await import("@/lib/actions")
            // If custom category, use the custom input value
            const finalCategory = category === "Custom" ? customCategory : category
            if (!finalCategory) {
                alert("Please enter a category")
                setUploading(false)
                setShowConfirmModal(false)
                return
            }
            const url = await uploadToCloudinary(preview!, ["frames", finalCategory])
            alert("Frame uploaded successfully!")
            setPreview(null)
            setCategory("People")
            setCustomCategory("")
            setShowUploadModal(false)
            setShowConfirmModal(false)
            fetchFrames()
        } catch (error) {
            console.error("Frame upload failed", error)
            alert("Failed to upload frame")
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteFrame = async () => {
        if (!selectedFrame) return
        if (!confirm("Are you sure you want to delete this frame?")) return

        setIsDeleting(true)
        try {
            const success = await deleteImage(selectedFrame.public_id)
            if (success) {
                const newFrames = frames.filter(f => f.public_id !== selectedFrame.public_id)
                setFrames(newFrames)
                setSelectedFrame(null)
            } else {
                alert("Failed to delete frame")
            }
        } catch (error) {
            console.error("Delete error", error)
            alert("An error occurred while deleting")
        } finally {
            setIsDeleting(false)
        }
    }



    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        })
    }

    return (
        <div className="flex-1 flex flex-col h-full relative">
            {/* Action Bar */}
            <div className="h-16 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-end px-6 gap-4 flex-none z-10 backdrop-blur-sm">
                <div className="flex items-center gap-2 mr-auto text-sm text-neutral-400">
                    <FrameIcon className="w-4 h-4" />
                    <span className="font-medium">{frames.length} Frames</span>
                </div>

                <button
                    onClick={() => setShowUploadModal(true)}
                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-black italic uppercase text-xs flex items-center gap-2 transition-colors shadow-lg transform -skew-x-6"
                >
                    <div className="transform skew-x-6 flex items-center gap-2">
                        <UploadCloud className="w-4 h-4" />
                        <span>Add Frame</span>
                    </div>
                </button>

                <button
                    onClick={fetchFrames}
                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Gallery Grid */}
                <div className="w-full lg:w-3/4 flex flex-col min-w-0 bg-neutral-950 relative border-t lg:border-t-0 lg:border-r border-neutral-800 order-2 lg:order-1 flex-1">
                    <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                        {isLoading && frames.length === 0 ? (
                            <div className="h-full flex items-center justify-center text-neutral-500 gap-2">
                                <RefreshCw className="w-5 h-5 animate-spin" />
                                Loading frames...
                            </div>
                        ) : frames.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                                <AlertCircle className="w-8 h-8 opacity-50" />
                                <p>No frames found</p>
                            </div>
                        ) : (
                            <div className="flex flex-row gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-4">
                                {frames.map((frame) => (
                                    <div
                                        key={frame.public_id}
                                        onClick={() => setSelectedFrame(frame)}
                                        className={`
                                            aspect-[9/16] relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                                            flex-none w-40 snap-center lg:w-auto lg:flex-auto bg-neutral-900
                                            ${selectedFrame?.public_id === frame.public_id
                                                ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-[1.02] z-10'
                                                : 'border-transparent hover:border-neutral-700 hover:scale-[1.01]'
                                            }
                                        `}
                                    >
                                        <img
                                            src={frame.secure_url}
                                            alt="Frame"
                                            className="w-full h-full object-contain p-2"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                            <div className="flex flex-wrap gap-1 mb-1">
                                                {frame.tags?.filter((t: string) => t !== 'frames').slice(0, 2).map((tag: string) => (
                                                    <span key={tag} className="text-[8px] bg-red-600 text-white px-1.5 py-0.5 rounded uppercase font-bold">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <p className="text-[10px] text-white font-mono truncate">
                                                {formatDate(frame.created_at)}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Details Panel */}
                <div className={`
                    w-full lg:w-1/4 bg-neutral-900 flex flex-col order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-neutral-800
                    ${!selectedFrame ? 'hidden lg:flex' : 'flex'}
                    max-h-[50vh] lg:max-h-full
                `}>
                    {selectedFrame ? (
                        <>
                            <div className="p-6 border-b border-neutral-800">
                                <h2 className="font-sans font-black italic text-xl uppercase text-white mb-1">Frame Details</h2>
                                <p className="text-xs text-neutral-500 font-mono break-all">{selectedFrame.public_id}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="aspect-[9/16] rounded-lg overflow-hidden border border-neutral-700 shadow-lg bg-neutral-950 max-h-64 lg:max-h-none mx-auto lg:mx-0 p-4">
                                    <img
                                        src={selectedFrame.secure_url}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Tags Section */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-sm font-bold uppercase text-neutral-400">
                                            <Tag className="w-4 h-4" />
                                            <span>Tags</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        {selectedFrame.tags?.map((tag: string) => (
                                            <span key={tag} className="bg-neutral-800 text-white px-2 py-1 rounded text-xs font-mono border border-neutral-700">
                                                {tag}
                                            </span>
                                        ))}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-neutral-800">
                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                        <Calendar className="w-4 h-4 mt-0.5 text-neutral-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase font-bold">Created At</p>
                                            <p>{formatDate(selectedFrame.created_at)}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                        <Maximize2 className="w-4 h-4 mt-0.5 text-neutral-500" />
                                        <div>
                                            <p className="text-xs text-neutral-500 uppercase font-bold">Dimensions</p>
                                            <p>{selectedFrame.width} x {selectedFrame.height}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 border-t border-neutral-800 bg-neutral-900/50">
                                <button
                                    onClick={handleDeleteFrame}
                                    disabled={isDeleting}
                                    className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-3 rounded font-bold uppercase text-xs hover:bg-red-900/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isDeleting ? (
                                        <RefreshCw className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <Trash2 className="w-4 h-4" />
                                    )}
                                    {isDeleting ? "Deleting..." : "Delete Frame"}
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 p-6 text-center">
                            <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                <FrameIcon className="w-8 h-8 opacity-50" />
                            </div>
                            <p className="font-medium text-sm">Select a frame to view details</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Upload Modal */}
            {showUploadModal && (
                <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-scale-in">
                        <button
                            onClick={() => setShowUploadModal(false)}
                            className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>

                        <h2 className="text-2xl font-black italic uppercase text-white mb-6">Add New Frame</h2>

                        <div className="space-y-6">
                            {/* Image Upload */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold uppercase text-neutral-400">Frame Image</label>
                                <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors relative group ${preview ? 'border-red-600/50 bg-neutral-950' : 'border-neutral-800 hover:border-red-600 hover:bg-neutral-800/50'}`}>
                                    {preview ? (
                                        <div className="relative w-full aspect-[9/16] max-w-[150px] bg-neutral-950 rounded overflow-hidden shadow-lg border border-neutral-800">
                                            <img src={preview} alt="Preview" className="w-full h-full object-contain" />
                                            <button
                                                onClick={() => setPreview(null)}
                                                className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white hover:bg-red-700 shadow-lg transition-transform hover:scale-110"
                                            >
                                                <Trash2 className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ) : (
                                        <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4">
                                            <UploadCloud className="w-10 h-10 text-neutral-600 mb-3 group-hover:text-red-500 transition-colors" />
                                            <span className="text-neutral-400 font-medium group-hover:text-white text-sm">Click to upload frame</span>
                                            <p className="text-[10px] text-neutral-600 mt-1">Supports PNG, JPG</p>
                                            <input type="file" accept="image/*" className="hidden" onChange={handleFrameUpload} />
                                        </label>
                                    )}
                                </div>
                            </div>

                            {/* Category Input */}
                            <div className="space-y-2">
                                <label className="block text-sm font-bold uppercase text-neutral-400">Category</label>
                                <select
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
                                >
                                    <option value="People">People</option>
                                    <option value="Slogans">Slogans</option>
                                    <option value="Custom">Custom Tag...</option>
                                </select>

                                {category === "Custom" && (
                                    <input
                                        type="text"
                                        value={customCategory}
                                        onChange={(e) => setCustomCategory(e.target.value)}
                                        className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors placeholder:text-neutral-700 mt-2"
                                        placeholder="Enter custom tag..."
                                    />
                                )}
                            </div>

                            {/* Submit Button */}
                            <button
                                onClick={handleSubmit}
                                disabled={uploading || !preview || !category}
                                className="w-full bg-red-600 text-white py-4 rounded-lg font-black italic uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/20 transform active:scale-[0.99]"
                            >
                                {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                {uploading ? "Uploading..." : "Add Frame"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirm Upload Modal */}
            {showConfirmModal && (
                <div className="absolute inset-0 z-[60] bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-neutral-900 border-2 border-red-600 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-scale-in">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>

                        <h3 className="text-2xl font-sans font-black italic uppercase mb-2 text-white tracking-tighter transform -skew-x-6">
                            Confirm Upload?
                        </h3>
                        <p className="text-neutral-400 mb-6 text-sm font-medium">
                            Are you sure you want to upload this frame to the <strong>{category === "Custom" ? customCategory : category}</strong> category?
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setShowConfirmModal(false)}
                                className="bg-neutral-800 text-white py-3 rounded font-bold uppercase text-xs hover:bg-neutral-700 transition-colors"
                                disabled={uploading}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmUpload}
                                className="bg-red-600 text-white py-3 rounded font-black italic uppercase text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                disabled={uploading}
                            >
                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                {uploading ? "Uploading..." : "Yes, Upload"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"gallery" | "frames">("gallery")
    const [images, setImages] = useState<CloudinaryResource[]>([])
    const [filteredImages, setFilteredImages] = useState<CloudinaryResource[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<CloudinaryResource | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
    const router = useRouter()

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showGalleryUploadModal, setShowGalleryUploadModal] = useState(false)
    const [galleryPreview, setGalleryPreview] = useState<string | null>(null)
    const [galleryCategory, setGalleryCategory] = useState("featured")

    const fetchImages = async () => {
        setIsLoading(true)
        try {
            const data = await getAdminImages()
            setImages(data)
            setFilteredImages(data)
            // Select first image by default if available
            if (data.length > 0 && !selectedImage) {
                setSelectedImage(data[0])
            }
        } catch (error) {
            console.error("Failed to fetch images", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        if (activeTab === "gallery") {
            fetchImages()
        }
    }, [activeTab])

    useEffect(() => {
        // Sort images whenever sortOrder or images change
        const sorted = [...images].sort((a, b) => {
            const dateA = new Date(a.created_at).getTime()
            const dateB = new Date(b.created_at).getTime()
            return sortOrder === "desc" ? dateB - dateA : dateA - dateB
        })
        setFilteredImages(sorted)
    }, [images, sortOrder])

    const handleDeleteClick = () => {
        if (!selectedImage) return
        setShowDeleteModal(true)
    }

    const confirmDelete = async () => {
        if (!selectedImage) return

        setIsDeleting(true)
        try {
            const success = await deleteImage(selectedImage.public_id)
            if (success) {
                // Remove from local state
                const newImages = images.filter(img => img.public_id !== selectedImage.public_id)
                setImages(newImages)
                setSelectedImage(null)
                setShowDeleteModal(false)
            } else {
                alert("Failed to delete image")
            }
        } catch (error) {
            console.error("Delete error", error)
            alert("An error occurred while deleting")
        } finally {
            setIsDeleting(false)
        }
    }

    const handleGalleryFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const reader = new FileReader()
        reader.onload = (event) => {
            setGalleryPreview(event.target?.result as string)
        }
        reader.readAsDataURL(file)
    }

    const handleGallerySubmit = async () => {
        if (!galleryPreview) return

        setIsUploading(true)
        try {
            const { uploadToCloudinary } = await import("@/lib/actions")
            const url = await uploadToCloudinary(galleryPreview, [galleryCategory])
            await fetchImages()
            setShowGalleryUploadModal(false)
            setGalleryPreview(null)
            setGalleryCategory("featured")
        } catch (error) {
            console.error("Upload failed", error)
            alert("Failed to upload image")
        } finally {
            setIsUploading(false)
        }
    }

    const handleLogout = () => {
        router.push("/admin")
    }

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: 'numeric'
        })
    }

    return (
        <div className="h-screen w-full bg-neutral-950 text-white flex overflow-hidden relative">
            {/* Sidebar */}
            <div className="w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-none z-30">
                <div className="h-16 flex items-center px-6 border-b border-neutral-800 gap-3">
                    <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center font-black italic">
                        ULP
                    </div>
                    <h1 className="font-sans font-bold text-lg tracking-tight">Admin</h1>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => setActiveTab("gallery")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold uppercase text-xs tracking-wider ${activeTab === "gallery"
                            ? "bg-red-600 text-white shadow-lg"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Gallery Manager
                    </button>
                    <button
                        onClick={() => setActiveTab("frames")}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold uppercase text-xs tracking-wider ${activeTab === "frames"
                            ? "bg-red-600 text-white shadow-lg"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            }`}
                    >
                        <FrameIcon className="w-4 h-4" />
                        Frame Manager
                    </button>
                </nav>

                <div className="p-4 border-t border-neutral-800">
                    <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-neutral-400 hover:bg-neutral-800 hover:text-red-500 transition-colors font-bold uppercase text-xs tracking-wider"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-w-0 bg-neutral-950 relative">

                {activeTab === "gallery" && (
                    <>
                        {/* Delete Confirmation Modal */}
                        {showDeleteModal && (
                            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                                <div className="bg-neutral-900 border-2 border-red-600 rounded-xl p-8 max-w-sm w-full text-center shadow-2xl relative overflow-hidden animate-scale-in">
                                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-400 to-red-600"></div>

                                    <div className="mb-6 flex justify-center">
                                        <div className="w-16 h-16 bg-red-900/30 rounded-full flex items-center justify-center border-2 border-red-600/50">
                                            <Trash2 className="w-8 h-8 text-red-500" />
                                        </div>
                                    </div>

                                    <h3 className="text-2xl font-sans font-black italic uppercase mb-2 text-white tracking-tighter transform -skew-x-6">
                                        Delete Star?
                                    </h3>
                                    <p className="text-neutral-400 mb-8 text-sm font-medium">
                                        This action cannot be undone. The image will be permanently removed from the wall.
                                    </p>

                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => setShowDeleteModal(false)}
                                            className="bg-neutral-800 text-white py-3 rounded font-bold uppercase text-xs hover:bg-neutral-700 transition-colors"
                                            disabled={isDeleting}
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={confirmDelete}
                                            className="bg-red-600 text-white py-3 rounded font-black italic uppercase text-xs hover:bg-red-700 transition-colors flex items-center justify-center gap-2 shadow-lg"
                                            disabled={isDeleting}
                                        >
                                            {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                                            {isDeleting ? "Deleting..." : "Yes, Delete"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="h-16 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-end px-6 gap-4 flex-none z-10 backdrop-blur-sm">
                            <div className="flex items-center gap-2 mr-auto text-sm text-neutral-400">
                                <LayoutGrid className="w-4 h-4" />
                                <span className="font-medium">{filteredImages.length} Images</span>
                            </div>

                            <button
                                onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                                className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-3 py-2 rounded hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700"
                            >
                                <ArrowUpDown className="w-3 h-3" />
                                {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                            </button>

                            <button
                                onClick={() => setShowGalleryUploadModal(true)}
                                className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-black italic uppercase text-xs flex items-center gap-2 transition-colors shadow-lg transform -skew-x-6"
                            >
                                <div className="transform skew-x-6 flex items-center gap-2">
                                    {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                    <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                                </div>
                            </button>

                            <button
                                onClick={fetchImages}
                                className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                                title="Refresh"
                            >
                                <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                            </button>
                        </div>

                        {/* Gallery Content */}
                        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                            {/* Gallery Panel */}
                            <div className="w-full lg:w-3/4 flex flex-col min-w-0 bg-neutral-950 relative border-t lg:border-t-0 lg:border-r border-neutral-800 order-2 lg:order-1 flex-1">
                                <div className="flex-1 overflow-x-auto lg:overflow-y-auto p-4 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                                    {isLoading && images.length === 0 ? (
                                        <div className="h-full flex items-center justify-center text-neutral-500 gap-2">
                                            <RefreshCw className="w-5 h-5 animate-spin" />
                                            Loading gallery...
                                        </div>
                                    ) : images.length === 0 ? (
                                        <div className="h-full flex flex-col items-center justify-center text-neutral-500 gap-2">
                                            <AlertCircle className="w-8 h-8 opacity-50" />
                                            <p>No images found</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-row gap-4 lg:grid lg:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-5 lg:gap-4">
                                            {filteredImages.map((img) => (
                                                <div
                                                    key={img.public_id}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`
                                  aspect-[9/16] relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                                  flex-none w-40 snap-center lg:w-auto lg:flex-auto
                                  ${selectedImage?.public_id === img.public_id
                                                            ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-[1.02] z-10'
                                                            : 'border-transparent hover:border-neutral-700 hover:scale-[1.01]'
                                                        }
                                `}
                                                >
                                                    <img
                                                        src={img.secure_url}
                                                        alt="User upload"
                                                        className="w-full h-full object-cover bg-neutral-900"
                                                        loading="lazy"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                                        <p className="text-[10px] text-white font-mono truncate">
                                                            {formatDate(img.created_at)}
                                                        </p>
                                                    </div>
                                                    {selectedImage?.public_id === img.public_id && (
                                                        <div className="absolute top-2 right-2 w-2 h-2 bg-red-600 rounded-full shadow-lg animate-pulse"></div>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Details Panel */}
                            <div className={`
                      w-full lg:w-1/4 bg-neutral-900 flex flex-col order-1 lg:order-2 border-b lg:border-b-0 lg:border-l border-neutral-800
                      ${!selectedImage ? 'hidden lg:flex' : 'flex'}
                      max-h-[50vh] lg:max-h-full
                    `}>
                                {selectedImage ? (
                                    <>
                                        <div className="p-6 border-b border-neutral-800">
                                            <h2 className="font-sans font-black italic text-xl uppercase text-white mb-1">Details</h2>
                                            <p className="text-xs text-neutral-500 font-mono break-all">{selectedImage.public_id}</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                            <div className="aspect-[9/16] rounded-lg overflow-hidden border border-neutral-700 shadow-lg bg-neutral-950 max-h-64 lg:max-h-none mx-auto lg:mx-0">
                                                <img
                                                    src={selectedImage.secure_url}
                                                    alt="Preview"
                                                    className="w-full h-full object-contain"
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                    <Calendar className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-500 uppercase font-bold">Created At</p>
                                                        <p>{formatDate(selectedImage.created_at)}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                    <HardDrive className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-500 uppercase font-bold">Size</p>
                                                        <p>{(selectedImage.bytes / 1024).toFixed(1)} KB</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                    <Maximize2 className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                    <div>
                                                        <p className="text-xs text-neutral-500 uppercase font-bold">Dimensions</p>
                                                        <p>{selectedImage.width} x {selectedImage.height}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50">
                                            <button
                                                onClick={handleDeleteClick}
                                                disabled={isDeleting}
                                                className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-3 rounded font-bold uppercase text-xs hover:bg-red-900/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                {isDeleting ? "Deleting..." : "Delete Image"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 p-6 text-center">
                                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                            <LayoutGrid className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium text-sm">Select an image to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Gallery Upload Modal */}
                        {showGalleryUploadModal && (
                            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-scale-in">
                                    <button
                                        onClick={() => setShowGalleryUploadModal(false)}
                                        className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <h2 className="text-2xl font-black italic uppercase text-white mb-6">Add New Photo</h2>

                                    <div className="space-y-6">
                                        {/* Image Upload */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold uppercase text-neutral-400">Photo</label>
                                            <div className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors relative group ${galleryPreview ? 'border-red-600/50 bg-neutral-950' : 'border-neutral-800 hover:border-red-600 hover:bg-neutral-800/50'}`}>
                                                {galleryPreview ? (
                                                    <div className="relative w-full aspect-[9/16] max-w-[150px] bg-neutral-950 rounded overflow-hidden shadow-lg border border-neutral-800">
                                                        <img src={galleryPreview} alt="Preview" className="w-full h-full object-contain" />
                                                        <button
                                                            onClick={() => setGalleryPreview(null)}
                                                            className="absolute top-2 right-2 bg-red-600 p-2 rounded-full text-white hover:bg-red-700 shadow-lg transition-transform hover:scale-110"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <label className="cursor-pointer w-full h-full flex flex-col items-center justify-center py-4">
                                                        <UploadCloud className="w-10 h-10 text-neutral-600 mb-3 group-hover:text-red-500 transition-colors" />
                                                        <span className="text-neutral-400 font-medium group-hover:text-white text-sm">Click to upload photo</span>
                                                        <p className="text-[10px] text-neutral-600 mt-1">Supports PNG, JPG</p>
                                                        <input type="file" accept="image/*" className="hidden" onChange={handleGalleryFileUpload} />
                                                    </label>
                                                )}
                                            </div>
                                        </div>

                                        {/* Category Input */}
                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold uppercase text-neutral-400">Tag</label>
                                            <select
                                                value={galleryCategory}
                                                onChange={(e) => setGalleryCategory(e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
                                            >
                                                <option value="featured">Featured</option>
                                                <option value="star-pic">Star Pic</option>
                                            </select>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            onClick={handleGallerySubmit}
                                            disabled={isUploading || !galleryPreview}
                                            className="w-full bg-red-600 text-white py-4 rounded-lg font-black italic uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/20 transform active:scale-[0.99]"
                                        >
                                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                            {isUploading ? "Uploading..." : "Add Photo"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "frames" && <FrameManager />}
            </div>
        </div>
    )
}
