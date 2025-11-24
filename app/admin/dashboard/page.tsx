"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    getAdminPhotos,
    getFrames,
    deletePhoto,
    deleteImage,
    uploadToImageKit,
    verifyAdminPassword,
    logoutAdmin,
    toggleFeatured,
    updatePhotoStatus,
    getAdminUsers,
    getUserPhotos,
    updateUserStatus,
} from "@/lib/actions"
import { getClientAuth } from "@/lib/firebase/client"
import { onAuthStateChanged, User as FirebaseUser } from "firebase/auth"
import type { Photo } from "@/lib/firebase/types"
import OptimizedImage from "@/components/OptimizedImage"
import AdminModal from "@/components/AdminModal"
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
    Tag,
    Menu,
    User,
    MessageSquare,
    MapPin,
    PartyPopper,
    Heart,
    Eye,
    Globe,
    ChevronDown,
    Users,
} from "lucide-react"

interface ImageKitFile {
    fileId: string
    name: string
    url: string
    tags: string[]
    width: number
    height: number
    size: number
    createdAt: string
}

function FrameManager({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) {
    const [frames, setFrames] = useState<ImageKitFile[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedFrame, setSelectedFrame] = useState<ImageKitFile | null>(null)
    const [showUploadModal, setShowUploadModal] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const [modalState, setModalState] = useState<{ isOpen: boolean, type: "success" | "error", title: string, message: string }>({
        isOpen: false,
        type: "success",
        title: "",
        message: ""
    })

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
            setModalState({
                isOpen: true,
                type: "error",
                title: "Missing Info",
                message: "Please select an image and enter a category"
            })
            return
        }
        setShowConfirmModal(true)
    }

    const confirmUpload = async () => {
        setUploading(true)
        try {
            const finalCategory = category === "Custom" ? customCategory : category
            if (!finalCategory) {
                setModalState({
                    isOpen: true,
                    type: "error",
                    title: "Missing Category",
                    message: "Please enter a category"
                })
                setUploading(false)
                setShowConfirmModal(false)
                return
            }
            const url = await uploadToImageKit(preview!, ["frames", finalCategory], "/frames")
            setModalState({
                isOpen: true,
                type: "success",
                title: "Frame Added!",
                message: "Frame uploaded successfully to the collection."
            })
            setPreview(null)
            setCategory("People")
            setCustomCategory("")
            setShowUploadModal(false)
            setShowConfirmModal(false)
            fetchFrames()
        } catch (error) {
            console.error("Frame upload failed", error)
            setModalState({
                isOpen: true,
                type: "error",
                title: "Upload Failed",
                message: "Failed to upload frame. Please try again."
            })
        } finally {
            setUploading(false)
        }
    }

    const handleDeleteFrame = async () => {
        if (!selectedFrame) return
        if (!confirm("Are you sure you want to delete this frame?")) return

        setIsDeleting(true)
        try {
            const success = await deleteImage(selectedFrame.fileId)
            if (success) {
                const newFrames = frames.filter(f => f.fileId !== selectedFrame.fileId)
                setFrames(newFrames)
                setSelectedFrame(null)
                setModalState({
                    isOpen: true,
                    type: "success",
                    title: "Frame Deleted",
                    message: "The frame has been removed successfully."
                })
            } else {
                setModalState({
                    isOpen: true,
                    type: "error",
                    title: "Delete Failed",
                    message: "Failed to delete frame. Please try again."
                })
            }
        } catch (error) {
            console.error("Delete error", error)
            setModalState({
                isOpen: true,
                type: "error",
                title: "Error",
                message: "An error occurred while deleting."
            })
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
                <button
                    onClick={() => setSidebarOpen(true)}
                    className="md:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white border border-neutral-800 mr-auto"
                    title="Toggle Menu"
                >
                    <Menu className="w-5 h-5" />
                </button>
                <div className="flex items-center gap-2 mr-auto md:mr-auto text-sm text-neutral-400">
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
                                        key={frame.fileId}
                                        onClick={() => setSelectedFrame(frame)}
                                        className={`
                                            aspect-[9/16] relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                                            flex-none w-40 snap-center lg:w-auto lg:flex-auto bg-neutral-900
                                            ${selectedFrame?.fileId === frame.fileId
                                                ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-[1.02] z-10'
                                                : 'border-transparent hover:border-neutral-700 hover:scale-[1.01]'
                                            }
                                        `}
                                    >
                                        <OptimizedImage
                                            src={frame.url}
                                            alt="Frame"
                                            width={200}
                                            height={350}
                                            className="w-full h-full object-contain p-2"
                                            loading="lazy"
                                            showPlaceholder={true}
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
                                                {formatDate(frame.createdAt)}
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
                                <p className="text-xs text-neutral-500 font-mono break-all">{selectedFrame.fileId}</p>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                <div className="aspect-[9/16] rounded-lg overflow-hidden border border-neutral-700 shadow-lg bg-neutral-950 max-h-64 lg:max-h-none mx-auto lg:mx-0 p-4">
                                    <OptimizedImage
                                        src={selectedFrame.url}
                                        alt="Preview"
                                        width={300}
                                        height={500}
                                        className="w-full h-full object-contain"
                                        showPlaceholder={false}
                                    />
                                </div>

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
                                            <p>{formatDate(selectedFrame.createdAt)}</p>
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
            <AdminModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
            />
        </div>
    )
}

export default function AdminDashboard() {
    const [activeTab, setActiveTab] = useState<"gallery" | "frames" | "users">("gallery")
    const [images, setImages] = useState<(Photo & { id: string })[]>([])
    const [filteredImages, setFilteredImages] = useState<(Photo & { id: string })[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<(Photo & { id: string }) | null>(null)
    const [isDeleting, setIsDeleting] = useState(false)
    const [isUploading, setIsUploading] = useState(false)
    const [sortOrder, setSortOrder] = useState<"desc" | "asc">("desc")
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [showFilterDropdown, setShowFilterDropdown] = useState(false)
    const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null)
    const router = useRouter()

    useEffect(() => {
        const auth = getClientAuth()
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (!user) {
                router.push("/admin")
            } else {
                setCurrentUser(user)
            }
        })
        return () => unsubscribe()
    }, [router])

    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [showGalleryUploadModal, setShowGalleryUploadModal] = useState(false)
    const [galleryPreview, setGalleryPreview] = useState<string | null>(null)
    const [galleryCategory, setGalleryCategory] = useState("featured")
    const [statusFilter, setStatusFilter] = useState<"all" | "active" | "removed">("active")

    // User Manager state
    const [users, setUsers] = useState<any[]>([])
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const [userPhotos, setUserPhotos] = useState<(Photo & { id: string })[]>([])
    const [selectedPhoto, setSelectedPhoto] = useState<(Photo & { id: string }) | null>(null)
    const [showPhotoModal, setShowPhotoModal] = useState(false)
    const [viewMode, setViewMode] = useState<"table" | "photos">("table")

    const [modalState, setModalState] = useState<{ isOpen: boolean, type: "success" | "error", title: string, message: string }>({
        isOpen: false,
        type: "success",
        title: "",
        message: ""
    })

    const fetchImages = async () => {
        setIsLoading(true)
        try {
            const data = await getAdminPhotos(statusFilter)
            setImages(data)
            setFilteredImages(data)
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
    }, [activeTab, statusFilter])

    useEffect(() => {
        const sorted = [...images].sort((a, b) => {
            const dateA = new Date(a.createdAt as any).getTime()
            const dateB = new Date(b.createdAt as any).getTime()
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
            // Block the photo by setting status to "removed" instead of deleting
            const success = await updatePhotoStatus(selectedImage.id, "removed")
            if (success) {
                const newImages = images.filter(img => img.id !== selectedImage.id)
                setImages(newImages)
                setSelectedImage(null)
                setShowDeleteModal(false)
                setModalState({
                    isOpen: true,
                    type: "success",
                    title: "Photo Blocked",
                    message: "The image has been blocked and will no longer appear in the feed."
                })
            } else {
                setModalState({
                    isOpen: true,
                    type: "error",
                    title: "Block Failed",
                    message: "Failed to block image. Please try again."
                })
            }
        } catch (error) {
            console.error("Block error", error)
            setModalState({
                isOpen: true,
                type: "error",
                title: "Error",
                message: "An error occurred while blocking the image."
            })
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
            const userOptions = currentUser ? {
                userId: currentUser.uid,
                userName: "Admin",
                userEmail: currentUser.email || undefined
            } : undefined

            const url = await uploadToImageKit(galleryPreview, [galleryCategory], "/featured", userOptions)
            await fetchImages()
            setShowGalleryUploadModal(false)
            setGalleryPreview(null)
            setGalleryCategory("featured")
            setModalState({
                isOpen: true,
                type: "success",
                title: "Upload Success",
                message: "Image added to the gallery successfully!"
            })
        } catch (error) {
            console.error("Upload failed", error)
            setModalState({
                isOpen: true,
                type: "error",
                title: "Upload Failed",
                message: "Failed to upload image. Please try again."
            })
        } finally {
            setIsUploading(false)
        }
    }

    const handleLogout = async () => {
        const auth = getClientAuth()
        await auth.signOut()
        router.push("/admin")
    }

    // User Manager functions
    const fetchUsers = async () => {
        setIsLoading(true)
        try {
            const data = await getAdminUsers()
            setUsers(data)
        } catch (error) {
            console.error("Failed to fetch users", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleUserClick = async (user: any) => {
        setSelectedUser(user)
        setViewMode("photos")
        setIsLoading(true)
        try {
            const photos = await getUserPhotos(user.userId)
            setUserPhotos(photos)
        } catch (error) {
            console.error("Failed to fetch user photos", error)
        } finally {
            setIsLoading(false)
        }
    }

    const handleBlockUser = async (userId: string, currentlyBlocked: boolean) => {
        try {
            const success = await updateUserStatus(userId, !currentlyBlocked)
            if (success) {
                await fetchUsers()
                setModalState({
                    isOpen: true,
                    type: "success",
                    title: currentlyBlocked ? "User Unblocked" : "User Blocked",
                    message: `User has been ${currentlyBlocked ? 'unblocked' : 'blocked'} successfully.`
                })
            }
        } catch (error) {
            console.error("Error updating user status", error)
            setModalState({
                isOpen: true,
                type: "error",
                title: "Error",
                message: "Failed to update user status."
            })
        }
    }

    const handlePhotoClick = (photo: Photo & { id: string }) => {
        setSelectedPhoto(photo)
        setShowPhotoModal(true)
    }

    const handleDeactivatePhoto = async () => {
        if (!selectedPhoto) return

        try {
            const success = await updatePhotoStatus(selectedPhoto.id, "removed")
            if (success) {
                setShowPhotoModal(false)
                setSelectedPhoto(null)
                // Refresh user photos
                if (selectedUser) {
                    const photos = await getUserPhotos(selectedUser.userId)
                    setUserPhotos(photos)
                }
                setModalState({
                    isOpen: true,
                    type: "success",
                    title: "Photo Deactivated",
                    message: "The photo has been deactivated successfully."
                })
            }
        } catch (error) {
            console.error("Error deactivating photo", error)
            setModalState({
                isOpen: true,
                type: "error",
                title: "Error",
                message: "Failed to deactivate photo."
            })
        }
    }

    useEffect(() => {
        if (activeTab === "users") {
            fetchUsers()
        }
    }, [activeTab])

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
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-20 md:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`w-64 bg-neutral-900 border-r border-neutral-800 flex flex-col flex-none z-30 md:flex ${sidebarOpen ? 'absolute inset-y-0 left-0 shadow-2xl' : 'hidden'} md:relative md:shadow-none`}>
                <div className="h-16 flex items-center px-6 border-b border-neutral-800 gap-3">
                    <div className="w-8 h-8 bg-red-700 rounded flex items-center justify-center font-black italic">
                        ULP
                    </div>
                    <h1 className="font-sans font-bold text-lg tracking-tight">Admin</h1>
                    <button
                        onClick={() => setSidebarOpen(false)}
                        className="ml-auto md:hidden p-1 hover:bg-neutral-800 rounded transition-colors text-neutral-400 hover:text-white"
                        title="Close Menu"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <nav className="flex-1 p-4 space-y-2">
                    <button
                        onClick={() => {
                            setActiveTab("gallery")
                            setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold uppercase text-xs tracking-wider ${activeTab === "gallery"
                            ? "bg-red-600 text-white shadow-lg"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            }`}
                    >
                        <LayoutGrid className="w-4 h-4" />
                        Gallery Manager
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("frames")
                            setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold uppercase text-xs tracking-wider ${activeTab === "frames"
                            ? "bg-red-600 text-white shadow-lg"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            }`}
                    >
                        <FrameIcon className="w-4 h-4" />
                        Frame Manager
                    </button>
                    <button
                        onClick={() => {
                            setActiveTab("users")
                            setSidebarOpen(false)
                        }}
                        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors font-bold uppercase text-xs tracking-wider ${activeTab === "users"
                            ? "bg-red-600 text-white shadow-lg"
                            : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                            }`}
                    >
                        <Users className="w-4 h-4" />
                        User Manager
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
                        {/* Block Confirmation Modal */}
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
                                        Block Photo?
                                    </h3>
                                    <p className="text-neutral-400 mb-8 text-sm font-medium">
                                        This photo will be hidden from public view. It will remain in the database for admin review.
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
                                            {isDeleting ? "Blocking..." : "Yes, Block"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Action Bar */}
                        <div className="h-16 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between px-4 gap-4 flex-none z-10 backdrop-blur-sm">
                            <button
                                onClick={() => setSidebarOpen(!sidebarOpen)}
                                className="md:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                                title="Toggle Menu"
                            >
                                <Menu className="w-5 h-5" />
                            </button>

                            <div className="flex items-center gap-2 text-sm text-neutral-400">
                                <LayoutGrid className="w-4 h-4" />
                                <span className="font-medium">{filteredImages.length} Images</span>
                            </div>

                            {/* Desktop Action Bar - visible on lg and up */}
                            <div className="hidden lg:flex items-center gap-3">
                                {/* Status Filter */}
                                <div className="flex items-center gap-1 bg-neutral-900 rounded-lg p-1 border border-neutral-800">
                                    <button
                                        onClick={() => setStatusFilter("all")}
                                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === "all"
                                            ? "bg-red-600 text-white shadow-sm"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            }`}
                                    >
                                        All
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter("active")}
                                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === "active"
                                            ? "bg-red-600 text-white shadow-sm"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            }`}
                                    >
                                        Active
                                    </button>
                                    <button
                                        onClick={() => setStatusFilter("removed")}
                                        className={`px-3 py-1.5 rounded text-xs font-bold uppercase tracking-wider transition-all ${statusFilter === "removed"
                                            ? "bg-red-600 text-white shadow-sm"
                                            : "text-neutral-400 hover:text-white hover:bg-neutral-800"
                                            }`}
                                    >
                                        Blocked
                                    </button>
                                </div>

                                {/* Sort Button */}
                                <button
                                    onClick={() => setSortOrder(prev => prev === "desc" ? "asc" : "desc")}
                                    className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-neutral-400 hover:text-white px-3 py-2 rounded hover:bg-neutral-800 transition-colors border border-transparent hover:border-neutral-700"
                                >
                                    <ArrowUpDown className="w-3 h-3" />
                                    {sortOrder === "desc" ? "Newest First" : "Oldest First"}
                                </button>

                                {/* Upload Button */}
                                <button
                                    onClick={() => setShowGalleryUploadModal(true)}
                                    className="bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded font-black italic uppercase text-xs flex items-center gap-2 transition-colors shadow-lg transform -skew-x-6"
                                >
                                    <div className="transform skew-x-6 flex items-center gap-2">
                                        {isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UploadCloud className="w-4 h-4" />}
                                        <span>{isUploading ? "Uploading..." : "Upload"}</span>
                                    </div>
                                </button>

                                {/* Refresh Button */}
                                <button
                                    onClick={fetchImages}
                                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Mobile/Tablet Dropdown Menu - visible below lg */}
                            <div className="relative lg:hidden">
                                <button
                                    onClick={() => setShowFilterDropdown(!showFilterDropdown)}
                                    className="p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                                    title="Options"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                {showFilterDropdown && (
                                    <>
                                        <div
                                            className="fixed inset-0 z-10"
                                            onClick={() => setShowFilterDropdown(false)}
                                        />
                                        <div className="absolute right-0 mt-2 w-56 bg-neutral-900 border border-neutral-800 rounded-lg shadow-xl z-20 overflow-hidden">
                                            {/* Status Filter Section */}
                                            <div className="p-2 border-b border-neutral-800">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-2">Filter</div>
                                                <button
                                                    onClick={() => {
                                                        setStatusFilter("all")
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-colors rounded ${statusFilter === "all"
                                                        ? "bg-red-600 text-white"
                                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                        }`}
                                                >
                                                    All Photos
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setStatusFilter("active")
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-colors rounded ${statusFilter === "active"
                                                        ? "bg-red-600 text-white"
                                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                        }`}
                                                >
                                                    Active Only
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setStatusFilter("removed")
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-colors rounded ${statusFilter === "removed"
                                                        ? "bg-red-600 text-white"
                                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                        }`}
                                                >
                                                    Blocked Only
                                                </button>
                                            </div>

                                            {/* Sort Section */}
                                            <div className="p-2 border-b border-neutral-800">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-2">Sort</div>
                                                <button
                                                    onClick={() => {
                                                        setSortOrder("desc")
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-colors rounded ${sortOrder === "desc"
                                                        ? "bg-red-600 text-white"
                                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                        }`}
                                                >
                                                    Newest First
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setSortOrder("asc")
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className={`w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider transition-colors rounded ${sortOrder === "asc"
                                                        ? "bg-red-600 text-white"
                                                        : "text-neutral-400 hover:bg-neutral-800 hover:text-white"
                                                        }`}
                                                >
                                                    Oldest First
                                                </button>
                                            </div>

                                            {/* Actions Section */}
                                            <div className="p-2">
                                                <div className="text-[10px] font-bold uppercase tracking-wider text-neutral-500 px-3 py-2">Actions</div>
                                                <button
                                                    onClick={() => {
                                                        setShowGalleryUploadModal(true)
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors rounded flex items-center gap-2"
                                                >
                                                    <UploadCloud className="w-4 h-4" />
                                                    Upload Photo
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        fetchImages()
                                                        setShowFilterDropdown(false)
                                                    }}
                                                    className="w-full px-3 py-2 text-left text-xs font-bold uppercase tracking-wider text-neutral-400 hover:bg-neutral-800 hover:text-white transition-colors rounded flex items-center gap-2"
                                                >
                                                    <RefreshCw className="w-4 h-4" />
                                                    Refresh
                                                </button>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>
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
                                                    key={img.id}
                                                    onClick={() => setSelectedImage(img)}
                                                    className={`
                                  aspect-[9/16] relative group cursor-pointer rounded-lg overflow-hidden border-2 transition-all
                                  flex-none w-40 snap-center lg:w-auto lg:flex-auto
                                  ${selectedImage?.id === img.id
                                                            ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.3)] scale-[1.02] z-10'
                                                            : 'border-transparent hover:border-neutral-700 hover:scale-[1.01]'
                                                        }
                                `}
                                                >
                                                    <OptimizedImage
                                                        src={img.url}
                                                        alt="User upload"
                                                        width={200}
                                                        height={350}
                                                        className="w-full h-full object-cover bg-neutral-900"
                                                        loading="lazy"
                                                        showPlaceholder={true}
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                                                        <p className="text-[10px] text-white font-mono truncate">
                                                            {formatDate(img.createdAt as any)}
                                                        </p>
                                                    </div>
                                                    {selectedImage?.id === img.id && (
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
                                            <p className="text-xs text-neutral-500 font-mono break-all">{selectedImage.fileId}</p>
                                        </div>

                                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                                            <div className="aspect-[9/16] rounded-lg overflow-hidden border border-neutral-700 shadow-lg bg-neutral-950 max-h-64 lg:max-h-none mx-auto lg:mx-0">
                                                <OptimizedImage
                                                    src={selectedImage.url}
                                                    alt="Preview"
                                                    width={300}
                                                    height={500}
                                                    className="w-full h-full object-contain"
                                                    showPlaceholder={false}
                                                />
                                            </div>

                                            <div className="space-y-4">
                                                {selectedImage.userName && (
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <User className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Uploaded By</p>
                                                            <p>{selectedImage.userName}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedImage.caption && (
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <MessageSquare className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Caption</p>
                                                            <p className="break-words">{selectedImage.caption}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedImage.location && (
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <MapPin className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Location</p>
                                                            <p>{selectedImage.location}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedImage.event && (
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <PartyPopper className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Event</p>
                                                            <p>{selectedImage.event}</p>
                                                        </div>
                                                    </div>
                                                )}

                                                {selectedImage.ipdata && (
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <Globe className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Location Data</p>
                                                            <p>
                                                                {[
                                                                    selectedImage.ipdata.city,
                                                                    selectedImage.ipdata.region,
                                                                    selectedImage.ipdata.country
                                                                ].filter(Boolean).join(", ") || "Not available"}
                                                            </p>
                                                        </div>
                                                    </div>
                                                )}

                                                <div className="pt-4 border-t border-neutral-800 grid grid-cols-2 gap-4">
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <Heart className="w-4 h-4 mt-0.5 text-red-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Likes</p>
                                                            <p>{selectedImage.likes || 0}</p>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <Eye className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Views</p>
                                                            <p>{selectedImage.views || 0}</p>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="pt-4 border-t border-neutral-800 space-y-4">
                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <Calendar className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Created At</p>
                                                            <p>{formatDate(selectedImage.createdAt as any)}</p>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-start gap-3 text-sm text-neutral-300">
                                                        <HardDrive className="w-4 h-4 mt-0.5 text-neutral-500" />
                                                        <div>
                                                            <p className="text-xs text-neutral-500 uppercase font-bold">Size</p>
                                                            <p>{selectedImage.size ? (selectedImage.size / 1024).toFixed(1) : '0'} KB</p>
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
                                        </div>

                                        <div className="p-6 border-t border-neutral-800 bg-neutral-900/50">
                                            <button
                                                onClick={handleDeleteClick}
                                                disabled={isDeleting}
                                                className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-3 rounded font-bold uppercase text-xs hover:bg-red-900/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                            >
                                                {isDeleting ? (
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                                {isDeleting ? "Blocking..." : "Block Photo"}
                                            </button>
                                        </div>
                                    </>
                                ) : (
                                    <div className="flex-1 flex flex-col items-center justify-center text-neutral-600 p-6 text-center">
                                        <div className="w-16 h-16 bg-neutral-800 rounded-full flex items-center justify-center mb-4">
                                            <ImageIcon className="w-8 h-8 opacity-50" />
                                        </div>
                                        <p className="font-medium text-sm">Select an image to view details</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Upload Modal */}
                        {showGalleryUploadModal && (
                            <div className="absolute inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
                                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden animate-scale-in">
                                    <button
                                        onClick={() => setShowGalleryUploadModal(false)}
                                        className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>

                                    <h2 className="text-2xl font-black italic uppercase text-white mb-6">Upload to Gallery</h2>

                                    <div className="space-y-6">
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

                                        <div className="space-y-2">
                                            <label className="block text-sm font-bold uppercase text-neutral-400">Category</label>
                                            <select
                                                value={galleryCategory}
                                                onChange={(e) => setGalleryCategory(e.target.value)}
                                                className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-red-600 transition-colors appearance-none"
                                            >
                                                <option value="featured">Featured</option>
                                                <option value="star-pic">Star Pic</option>
                                            </select>
                                        </div>

                                        <button
                                            onClick={handleGallerySubmit}
                                            disabled={isUploading || !galleryPreview}
                                            className="w-full bg-red-600 text-white py-4 rounded-lg font-black italic uppercase tracking-wider hover:bg-red-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-lg hover:shadow-red-900/20 transform active:scale-[0.99]"
                                        >
                                            {isUploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <UploadCloud className="w-5 h-5" />}
                                            {isUploading ? "Uploading..." : "Upload to Gallery"}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </>
                )}

                {activeTab === "frames" && (
                    <FrameManager setSidebarOpen={setSidebarOpen} />
                )}

                {activeTab === "users" && (
                    viewMode === "table" ? (
                        // Table View
                        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                            {/* Action Bar */}
                            <div className="h-16 bg-neutral-900/50 border-b border-neutral-800 flex items-center justify-between px-6 gap-4 flex-none z-10 backdrop-blur-sm">
                                <button
                                    onClick={() => setSidebarOpen(true)}
                                    className="md:hidden p-2 hover:bg-neutral-800 rounded-lg transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                                    title="Toggle Menu"
                                >
                                    <Menu className="w-5 h-5" />
                                </button>
                                <div className="flex items-center gap-2 text-sm text-neutral-400">
                                    <Users className="w-4 h-4" />
                                    <span className="font-medium">{users.length} Users</span>
                                </div>

                                <button
                                    onClick={fetchUsers}
                                    className="p-2 hover:bg-neutral-800 rounded-full transition-colors text-neutral-400 hover:text-white border border-neutral-800"
                                    title="Refresh"
                                >
                                    <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                                </button>
                            </div>

                            {/* Users Table */}
                            <div className="flex-1 overflow-auto p-6">
                                <div className="bg-neutral-900 rounded-lg border border-neutral-800 overflow-hidden">
                                    <table className="w-full">
                                        <thead className="bg-neutral-950 border-b border-neutral-800">
                                            <tr>
                                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Name</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">IP Address</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Photos</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Status</th>
                                                <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Joined</th>
                                                <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-wider text-neutral-400">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-neutral-800">
                                            {isLoading ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center">
                                                        <Loader2 className="w-6 h-6 animate-spin mx-auto text-neutral-400" />
                                                    </td>
                                                </tr>
                                            ) : users.length === 0 ? (
                                                <tr>
                                                    <td colSpan={6} className="px-6 py-12 text-center text-neutral-400">
                                                        No users found
                                                    </td>
                                                </tr>
                                            ) : (
                                                users.map((user) => (
                                                    <tr
                                                        key={user.userId}
                                                        className="hover:bg-neutral-800/50 transition-colors cursor-pointer"
                                                        onClick={() => handleUserClick(user)}
                                                    >
                                                        <td className="px-6 py-4 text-sm text-white font-medium">{user.userName}</td>
                                                        <td className="px-6 py-4 text-sm text-neutral-400 font-mono">{user.userIp}</td>
                                                        <td className="px-6 py-4">
                                                            <div className="flex items-center gap-2 text-sm">
                                                                <span className="text-white font-medium">{user.activePhotos}</span>
                                                                <span className="text-neutral-500">/</span>
                                                                <span className="text-neutral-400">{user.totalPhotos}</span>
                                                            </div>
                                                        </td>
                                                        <td className="px-6 py-4">
                                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase ${user.blocked
                                                                ? "bg-red-900/30 text-red-400 border border-red-900/50"
                                                                : "bg-green-900/30 text-green-400 border border-green-900/50"
                                                                }`}>
                                                                {user.blocked ? "Blocked" : "Active"}
                                                            </span>
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-neutral-400">
                                                            {new Date(user.firstUpload).toLocaleDateString()}
                                                        </td>
                                                        <td className="px-6 py-4 text-right" onClick={(e) => e.stopPropagation()}>
                                                            <button
                                                                onClick={() => handleBlockUser(user.userId, user.blocked)}
                                                                className={`px-3 py-1.5 rounded text-xs font-bold uppercase transition-colors ${user.blocked
                                                                    ? "bg-green-900/20 text-green-400 hover:bg-green-900/40 border border-green-900/50"
                                                                    : "bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50"
                                                                    }`}
                                                            >
                                                                {user.blocked ? "Unblock" : "Block"}
                                                            </button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    ) : (
                        // Photo Grid View (94% photos, 6% header)
                        <div className="flex-1 flex flex-col h-full relative overflow-hidden">
                            {/* User Header - 6% of height */}
                            <div className="flex-none bg-neutral-900/50 border-b border-neutral-800 px-6 py-4" style={{ height: '6%' }}>
                                <div className="flex items-center justify-between h-full">
                                    <button
                                        onClick={() => {
                                            setViewMode("table")
                                            setSelectedUser(null)
                                            setUserPhotos([])
                                        }}
                                        className="flex items-center gap-2 text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <ArrowUpDown className="w-4 h-4 rotate-90" />
                                        <span className="text-sm font-bold uppercase">Back</span>
                                    </button>
                                    <div className="flex items-center gap-4">
                                        <div className="text-right">
                                            <div className="text-sm font-bold text-white">{selectedUser?.userName}</div>
                                            <div className="text-xs text-neutral-400 font-mono">{selectedUser?.userIp}</div>
                                        </div>
                                        <div className="text-sm text-neutral-400">
                                            <span className="font-medium text-white">{userPhotos.length}</span> photos
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Photo Grid - 94% of height */}
                            <div className="flex-1 overflow-auto p-6" style={{ height: '94%' }}>
                                {isLoading ? (
                                    <div className="flex items-center justify-center h-full">
                                        <Loader2 className="w-8 h-8 animate-spin text-neutral-400" />
                                    </div>
                                ) : userPhotos.length === 0 ? (
                                    <div className="flex items-center justify-center h-full text-neutral-400">
                                        No photos found for this user
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
                                        {userPhotos.map((photo) => (
                                            <div
                                                key={photo.id}
                                                className="relative aspect-square bg-neutral-900 rounded-lg overflow-hidden cursor-pointer group border-2 border-transparent hover:border-red-600 transition-all"
                                                onClick={() => handlePhotoClick(photo)}
                                            >
                                                <OptimizedImage
                                                    src={photo.thumbnailUrl || photo.url}
                                                    alt={photo.caption || "User photo"}
                                                    width={300}
                                                    height={300}
                                                    className="w-full h-full object-cover"
                                                />
                                                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center">
                                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Eye className="w-8 h-8 text-white" />
                                                    </div>
                                                </div>
                                                {photo.status === 'removed' && (
                                                    <div className="absolute top-2 right-2 bg-red-600 px-2 py-1 rounded text-[10px] font-bold uppercase">
                                                        Blocked
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                )}

                {/* Photo Details Modal */}
                {showPhotoModal && selectedPhoto && (
                    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-sm flex items-center justify-center p-4">
                        <div className="bg-neutral-900 rounded-xl overflow-hidden max-w-6xl w-full max-h-[90vh] flex">
                            {/* Image Side - Left */}
                            <div className="w-1/2 bg-neutral-950 flex items-center justify-center p-8">
                                <OptimizedImage
                                    src={selectedPhoto.url}
                                    alt={selectedPhoto.caption || "Photo"}
                                    width={800}
                                    height={800}
                                    className="max-w-full max-h-full object-contain rounded-lg"
                                />
                            </div>

                            {/* Details Side - Right */}
                            <div className="w-1/2 flex flex-col">
                                {/* Header */}
                                <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
                                    <h2 className="text-xl font-bold text-white">Photo Details</h2>
                                    <button
                                        onClick={() => setShowPhotoModal(false)}
                                        className="text-neutral-400 hover:text-white transition-colors"
                                    >
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Details Content */}
                                <div className="flex-1 overflow-auto p-6 space-y-4">
                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">User</div>
                                        <div className="text-sm text-white">{selectedPhoto.userName || 'Anonymous'}</div>
                                    </div>

                                    {selectedPhoto.caption && (
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Caption</div>
                                            <div className="text-sm text-white">{selectedPhoto.caption}</div>
                                        </div>
                                    )}

                                    {selectedPhoto.location && (
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Location</div>
                                            <div className="text-sm text-white">{selectedPhoto.location}</div>
                                        </div>
                                    )}

                                    {selectedPhoto.event && (
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Event</div>
                                            <div className="text-sm text-white">{selectedPhoto.event}</div>
                                        </div>
                                    )}

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Status</div>
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded text-xs font-bold uppercase ${selectedPhoto.status === 'active'
                                            ? "bg-green-900/30 text-green-400 border border-green-900/50"
                                            : "bg-red-900/30 text-red-400 border border-red-900/50"
                                            }`}>
                                            {selectedPhoto.status}
                                        </span>
                                    </div>

                                    <div>
                                        <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Uploaded</div>
                                        <div className="text-sm text-white">{formatDate(selectedPhoto.createdAt as any)}</div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Likes</div>
                                            <div className="text-sm text-white">{selectedPhoto.likes || 0}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Views</div>
                                            <div className="text-sm text-white">{selectedPhoto.views || 0}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="p-6 border-t border-neutral-800 bg-neutral-900/50">
                                    <button
                                        onClick={handleDeactivatePhoto}
                                        disabled={selectedPhoto.status === 'removed'}
                                        className="w-full bg-red-900/20 text-red-500 border border-red-900/50 py-3 rounded font-bold uppercase text-xs hover:bg-red-900/40 hover:text-red-400 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                        {selectedPhoto.status === 'removed' ? 'Already Deactivated' : 'Deactivate Photo'}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <AdminModal
                isOpen={modalState.isOpen}
                onClose={() => setModalState(prev => ({ ...prev, isOpen: false }))}
                type={modalState.type}
                title={modalState.title}
                message={modalState.message}
            />
        </div>
    )
}
