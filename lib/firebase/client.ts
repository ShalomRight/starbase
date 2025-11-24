// lib/firebase/client.ts
"use client"

import { initializeApp, getApps, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore } from "firebase/firestore"
import { getAuth, Auth } from "firebase/auth"

// const firebaseConfig = {
//     apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//     authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
// }

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
export const firebaseConfig = {
    apiKey: "AIzaSyBjeaczhMRhDJ4lJSu-DXqnZtLt15DSXDU",
    authDomain: "starapp-7c080.firebaseapp.com",
    projectId: "starapp-7c080",
    storageBucket: "starapp-7c080. firebasestorage.app",
    messagingsenderId: "424174566034",
    appId: "1:424174566034:web: 21da42a90115a62db8c44b",
    measurementId: "G-W465YW4R70"
}




console.log("🔥 Firebase Config Check:", {
    apiKey: firebaseConfig.apiKey ? "Present" : "Missing",
    projectId: firebaseConfig.projectId,
    authDomain: firebaseConfig.authDomain
})

let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined


/**
 * Initialize Firebase Client SDK
 */
export function initFirebase() {
    if (getApps().length === 0) {
        app = initializeApp(firebaseConfig)
        console.log("✅ Firebase Client initialized")
    } else {
        app = getApps()[0]
    }

    if (!db) {
        db = getFirestore(app)
        console.log("✅ Firestore Client initialized")
    }

    if (!auth) {
        auth = getAuth(app)
        console.log("✅ Firebase Auth initialized")
    }

    return { app, db, auth }
}

/**
 * Get Firestore client instance
 */
export function getClientDb(): Firestore {
    if (!db) {
        const { db: firestore } = initFirebase()
        return firestore
    }
    return db
}

/**
 * Get Auth client instance
 */
export function getClientAuth(): Auth {
    if (!auth) {
        const { auth: authentication } = initFirebase()
        return authentication
    }
    return auth
}

export { app, db, auth }