"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { verifyAdminPassword } from "@/lib/actions"
import { Star, Lock, Loader2 } from "lucide-react"

export default function AdminLogin() {
    const [password, setPassword] = useState("")
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        try {
            const isValid = await verifyAdminPassword(password)
            if (isValid) {
                router.push("/admin/dashboard")
            } else {
                setError("Invalid password. Access denied.")
            }
        } catch (err) {
            setError("An error occurred. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen w-full bg-neutral-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Elements */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-red-900/20 via-neutral-950 to-neutral-950"></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-600 via-red-500 to-red-600"></div>

            <div className="w-full max-w-md relative z-10">
                {/* Header */}
                <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-red-700 rounded-full mb-4 shadow-[0_0_20px_rgba(185,28,28,0.5)] border-4 border-neutral-900">
                        <Star className="w-8 h-8 text-white fill-current" />
                    </div>
                    <h1 className="text-3xl font-sans font-black italic text-white uppercase tracking-tighter transform -skew-x-6">
                        Admin Access
                    </h1>
                    <p className="text-neutral-400 text-xs font-bold uppercase tracking-widest mt-2">
                        Authorized Personnel Only
                    </p>
                </div>

                {/* Login Card */}
                <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Lock className="w-24 h-24 text-white" />
                    </div>

                    <form onSubmit={handleSubmit} className="relative z-10 space-y-6">
                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2"
                            >
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-neutral-950 border border-neutral-800 text-white px-4 py-3 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-neutral-700"
                                placeholder="Enter admin password"
                                autoFocus
                            />
                        </div>

                        {error && (
                            <div className="bg-red-900/20 border border-red-900/50 text-red-400 px-4 py-3 rounded text-sm font-medium flex items-center gap-2">
                                <div className="w-1.5 h-1.5 rounded-full bg-red-500"></div>
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-white text-red-700 font-black italic uppercase py-4 rounded hover:bg-neutral-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Verifying...
                                </>
                            ) : (
                                "Login to Dashboard"
                            )}
                        </button>
                    </form>
                </div>

                <div className="mt-8 text-center">
                    <a href="/" className="text-neutral-500 text-xs hover:text-white transition-colors uppercase tracking-wider font-bold">
                        ← Return to App
                    </a>
                </div>
            </div>
        </div>
    )
}
