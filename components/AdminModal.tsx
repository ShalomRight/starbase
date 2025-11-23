"use client"

import { Check, AlertCircle, X } from "lucide-react"
import { useEffect, useState } from "react"

interface AdminModalProps {
    isOpen: boolean
    onClose: () => void
    type: "success" | "error"
    title: string
    message: string
}

export default function AdminModal({ isOpen, onClose, type, title, message }: AdminModalProps) {
    const [show, setShow] = useState(false)

    useEffect(() => {
        if (isOpen) {
            setShow(true)
        } else {
            const timer = setTimeout(() => setShow(false), 300)
            return () => clearTimeout(timer)
        }
    }, [isOpen])

    if (!show && !isOpen) return null

    const isSuccess = type === "success"

    return (
        <div className={`fixed inset-0 z-[100] flex items-center justify-center p-4 transition-opacity duration-300 ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
                onClick={onClose}
            />

            {/* Modal */}
            <div className={`
        relative bg-neutral-900 border-2 ${isSuccess ? "border-green-500" : "border-red-500"} 
        rounded-xl p-8 max-w-sm w-full text-center shadow-2xl overflow-hidden 
        transform transition-all duration-300
        ${isOpen ? "scale-100 translate-y-0" : "scale-95 translate-y-4"}
      `}>
                {/* Decorative Top Bar */}
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${isSuccess ? "from-green-600 via-green-400 to-green-600" : "from-red-600 via-red-400 to-red-600"}`}></div>

                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 text-neutral-500 hover:text-white transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="mb-6 flex justify-center">
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center border-2 ${isSuccess ? "bg-green-900/30 border-green-600/50" : "bg-red-900/30 border-red-600/50"}`}>
                        {isSuccess ? (
                            <Check className="w-8 h-8 text-green-500" />
                        ) : (
                            <AlertCircle className="w-8 h-8 text-red-500" />
                        )}
                    </div>
                </div>

                <h3 className="text-2xl font-sans font-black italic uppercase mb-2 text-white tracking-tighter transform -skew-x-6">
                    {title}
                </h3>
                <p className="text-neutral-400 mb-8 text-sm font-medium">
                    {message}
                </p>

                <button
                    onClick={onClose}
                    className={`w-full py-3 rounded font-black italic uppercase text-xs transition-colors shadow-lg ${isSuccess
                            ? "bg-green-600 hover:bg-green-700 text-white"
                            : "bg-red-600 hover:bg-red-700 text-white"
                        }`}
                >
                    {isSuccess ? "Continue" : "Try Again"}
                </button>
            </div>
        </div>
    )
}
