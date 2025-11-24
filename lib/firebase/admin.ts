// lib/firebase/admin.ts
import { initializeApp, getApps, cert, App } from "firebase-admin/app"
import { getFirestore, Firestore } from "firebase-admin/firestore"
import serviceAccountJSON from "./starapp-7c080-firebase-adminsdk-fbsvc-d27476aea7.json"


let app: App | undefined
let db: Firestore | undefined

/**
 * Initialize Firebase Admin SDK (server-side only)
 * Uses service account credentials from environment variables or imported JSON file
 */
export function initAdmin() {
    if (getApps().length === 0) {
        // Parse the service account from environment variable
        const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT || serviceAccountJSON

        if (!serviceAccount) {
            throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is not set")
        }

        try {
            // Parse the service account if it's a string (from env var), otherwise use it directly
            const credentials = typeof serviceAccount === 'string'
                ? JSON.parse(serviceAccount)
                : serviceAccount

            app = initializeApp({
                credential: cert(credentials),
                projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "starapp-7c080",
            })

            console.log("✅ Firebase Admin initialized")
        } catch (error) {
            console.error("❌ Failed to initialize Firebase Admin:", error)
            throw error
        }
    } else {
        app = getApps()[0]
    }

    if (!db) {
        db = getFirestore(app)
        console.log("✅ Firestore Admin initialized")
    }

    return { app, db }
}

/**
 * Get Firestore Admin instance
 */
export function getAdminDb(): Firestore {
    if (!db) {
        const { db: firestore } = initAdmin()
        return firestore
    }
    return db
}

// Export Firestore types for convenience
export { FieldValue, Timestamp } from "firebase-admin/firestore"