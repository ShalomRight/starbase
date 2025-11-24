
// lib/hooks/useAnonymousUser.ts
"use client"

import { useEffect, useState } from "react"
import { signInAnonymously, onAuthStateChanged, User } from "firebase/auth"
import { getClientDb, getClientAuth } from "@/lib/firebase/client"
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore"

interface AnonymousUser {
    uid: string // Firebase Anonymous UID
    sessionId: string // Current session ID
    deviceId: string // Local storage backup ID
    isAuthenticated: boolean
    isLoading: boolean
}

/**
 * Generate a simple device ID for fallback
 */
function generateDeviceId(): string {
    const stored = localStorage.getItem("device_id")
    if (stored) return stored

    const deviceId = `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)} `
    localStorage.setItem("device_id", deviceId)
    return deviceId
}

/**
 * Generate a session ID for tracking
 */
function generateSessionId(): string {
    const stored = sessionStorage.getItem("session_id")
    if (stored) return stored

    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)} `
    sessionStorage.setItem("session_id", sessionId)
    return sessionId
}

/**
 * Hook to manage anonymous users
 * Automatically signs in users anonymously and tracks them
 */
export function useAnonymousUser() {
    const [user, setUser] = useState<AnonymousUser>({
        uid: "",
        sessionId: "",
        deviceId: "",
        isAuthenticated: false,
        isLoading: true,
    })

    useEffect(() => {
        const auth = getClientAuth()
        const db = getClientDb()

        // Generate IDs
        const deviceId = generateDeviceId()
        const sessionId = generateSessionId()

        // Listen for auth state changes
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // User is signed in (anonymously)
                console.log("✅ Anonymous user authenticated:", firebaseUser.uid)

                // Update or create user document in Firestore
                const userRef = doc(db, "users", firebaseUser.uid)
                const userDoc = await getDoc(userRef)

                if (!userDoc.exists()) {
                    // First time user - create document
                    await setDoc(userRef, {
                        uid: firebaseUser.uid,
                        deviceId,
                        createdAt: serverTimestamp(),
                        lastSeen: serverTimestamp(),
                        isAnonymous: true,
                        uploadCount: 0,
                        likeCount: 0,
                    })
                    console.log("📝 Created new user document")
                } else {
                    // Existing user - update last seen
                    await setDoc(
                        userRef,
                        {
                            lastSeen: serverTimestamp(),
                            deviceId, // Update device ID if changed
                        },
                        { merge: true }
                    )
                }

                setUser({
                    uid: firebaseUser.uid,
                    sessionId,
                    deviceId,
                    isAuthenticated: true,
                    isLoading: false,
                })
            } else {
                // No user signed in - sign in anonymously
                console.log("🔐 Signing in anonymously...")
                try {
                    await signInAnonymously(auth)
                    // onAuthStateChanged will be called again with the new user
                } catch (error) {
                    console.error("Failed to sign in anonymously:", error)

                    // Fallback to device ID only
                    setUser({
                        uid: deviceId,
                        sessionId,
                        deviceId,
                        isAuthenticated: false,
                        isLoading: false,
                    })
                }
            }
        })

        return () => unsubscribe()
    }, [])

    return user
}

/**
 * Simple hook that just returns user ID
 * Use this for most components that just need the user ID
 */
export function useUserId(): string {
    const user = useAnonymousUser()
    return user.uid || user.deviceId
}