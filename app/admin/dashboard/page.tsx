"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { getAdminImages, deleteImage } from "@/lib/actions"
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
    Loader2
} from "lucide-react"

export default function AdminDashboard() {
    const [images, setImages] = useState<CloudinaryResource[]>([])
    const [filteredImages, setFilteredImages] = useState<CloudinaryResource[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<CloudinaryResource | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
    const router = useRouter()

    const [showDeleteModal, setShowDeleteModal] = useState(false)

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
        fetchImages()
    }, [])

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

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsUploading(true)
        try {
            const reader = new FileReader()
            reader.onload = async (event) => {
                const base64 = event.target?.result as string
                if (base64) {
                    // We need to import this dynamically or move it to a client-safe spot if it wasn't already
                    // But verifyAdminPassword suggests we are using server actions.
                    // Let's import the upload action.
                    const { uploadToCloudinary } = await import("@/lib/actions")
                    await uploadToCloudinary(base64)
                    await fetchImages()
                }
            }
            reader.readAsDataURL(file)
        } catch (error) {
            console.error("Upload failed", error)
            alert("Failed to upload image")
        } finally {
            setIsUploading(false)
            // Reset input
            e.target.value = ""
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
        <div className="h-screen w-full bg-neutral-950 text-white flex flex-col overflow-hidden relative">
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

            {/* Header */}
            <header className="h-16 bg-neutral-900 border-b border-neutral-800 flex items-center justify-between px-6 flex-none z-20">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center font-black italic">
                        ULP
                    </div>
                    <h1 className="font-sans font-bold text-lg tracking-tight">Admin Dashboard</h1>
                </div>

                <div className="flex items-center gap-4">
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-red-500 transition-colors"
                    >
                        <LogOut className="w-4 h-4" />
                        Logout
                    </button>
                </div>
            </header>

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

                <label className="cursor-pointer bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-black italic uppercase text-xs flex items-center gap-2 transition-colors shadow-lg transform -skew-x-6">
                    <div className="transform skew-x-6 flex items-center gap-2">
                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                        <span>{isUploading ? "Uploading..." : "Upload Photo"}</span>
                    </div>
                    <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={isUploading} />
                </label>

                <button
                    onClick={fetchImages}
                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                    title="Refresh"
                >
                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                </button>
            </div>

            {/* Main Content */}
            <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
                {/* Gallery Panel (Left/Main - 75% on Desktop, Bottom on Mobile) */}
                <div className="w-full lg:w-3/4 flex flex-col min-w-0 bg-neutral-950 relative border-t lg:border-t-0 lg:border-r border-neutral-800 order-2 lg:order-1 flex-1">
                    {/* Toolbar */}
                    <div className="h-12 border-b border-neutral-800 flex items-center justify-between px-4 bg-neutral-900/50 backdrop-blur-sm sticky top-0 z-10">
                        <div className="flex items-center gap-2 text-sm text-neutral-400">
                            <LayoutGrid className="w-4 h-4" />
                            <span className="font-medium">{filteredImages.length} Images</span>
                        </div>

                        <button
                            onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                            className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-3 py-1.5 rounded hover:bg-neutral-800 transition-colors"
                        >
                            <ArrowUpDown className="w-3 h-3" />
                            {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                        </button>
                    </div>

                    {/* Grid/Slider */}
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

                {/* Details Panel (Right/Sidebar - 25% on Desktop, Top on Mobile) */}
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
                                {/* Preview */}
                                <div className="aspect-[9/16] rounded-lg overflow-hidden border border-neutral-700 shadow-lg bg-neutral-950 max-h-64 lg:max-h-none mx-auto lg:mx-0">
                                    <img
                                        src={selectedImage.secure_url}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                    />
                                </div>

                                {/* Metadata */}
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

                            {/* Actions */}
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
        </div>
    )
}
