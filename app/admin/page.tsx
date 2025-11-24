"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { createAdminUser } from "@/lib/actions"
import { getClientAuth } from "@/lib/firebase/client"
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth"
import { Star, Lock, Loader2, Mail, UserPlus, LogIn } from "lucide-react"
import { ADMIN_WHITELIST } from "@/lib/whitelist"

export default function AdminLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isSignup, setIsSignup] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setError("")

        const auth = getClientAuth()

        try {
            if (isSignup) {
                if (!ADMIN_WHITELIST.includes(email)) {
                    setError("This email is not authorized to create an admin account.")
                    setIsLoading(false)
                    return
                }

                const userCredential = await createUserWithEmailAndPassword(auth, email, password)
                const user = userCredential.user
                // Create admin user record in Firestore
                await createAdminUser(user.uid, user.email!)
                router.push("/admin/dashboard")
            } else {
                await signInWithEmailAndPassword(auth, email, password)
                router.push("/admin/dashboard")
            }
        } catch (err: any) {
            console.error("Auth error:", err)
            if (err.code === 'auth/invalid-credential' || err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
                setError("Invalid email or password.")
            } else if (err.code === 'auth/email-already-in-use') {
                setError("Email is already in use.")
            } else if (err.code === 'auth/weak-password') {
                setError("Password should be at least 6 characters.")
            } else {
                setError(err.message || "An authentication error occurred.")
            }
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
                                htmlFor="email"
                                className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2"
                            >
                                Email Address
                            </label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    id="email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-neutral-700"
                                    placeholder="admin@example.com"
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label
                                htmlFor="password"
                                className="block text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2"
                            >
                                Password
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-500" />
                                <input
                                    id="password"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-neutral-950 border border-neutral-800 text-white pl-10 pr-4 py-3 rounded focus:outline-none focus:border-red-600 focus:ring-1 focus:ring-red-600 transition-all placeholder:text-neutral-700"
                                    placeholder="••••••••"
                                    required
                                    minLength={6}
                                />
                            </div>
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
                                    {isSignup ? "Creating Account..." : "Verifying..."}
                                </>
                            ) : (
                                <>
                                    {isSignup ? <UserPlus className="w-4 h-4" /> : <LogIn className="w-4 h-4" />}
                                    {isSignup ? "Create Admin Account" : "Login to Dashboard"}
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-6 text-center relative z-10">
                        <button
                            type="button"
                            onClick={() => {
                                setIsSignup(!isSignup)
                                setError("")
                            }}
                            className="text-neutral-400 text-xs hover:text-white transition-colors underline decoration-neutral-700 hover:decoration-white underline-offset-4"
                        >
                            {isSignup ? "Already have an account? Login" : "Need an account? Sign Up"}
                        </button>
                    </div>
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
