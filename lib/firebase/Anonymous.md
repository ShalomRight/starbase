# Anonymous User Authentication Guide

## 🎯 Overview

Your app now uses **Firebase Anonymous Authentication** for tracking users without requiring sign-in. This provides:

✅ **Persistent user identity** across sessions
✅ **Privacy-friendly** (no personal data required)
✅ **Works across devices** (if you link accounts later)
✅ **Firestore security** (authenticated users only)
✅ **Free and unlimited** (no API costs)

## 🏗️ Architecture

```
User visits app
    ↓
Firebase Auto-Signs In Anonymously
    ↓
Generate Unique Firebase UID (e.g., "ABC123xyz")
    ↓
Create User Document in Firestore
    ↓
User can now:
    - Upload photos (tracked to their UID)
    - Like photos (tracked to their UID)
    - All actions attributed to them
```

### Fallback System

```
Primary: Firebase Anonymous Auth (UID)
    ↓ (if fails)
Fallback: Local Storage Device ID
    ↓ (if fails)
Last Resort: Session ID (current session only)
```

## 🔧 Step 1: Enable Anonymous Auth in Firebase

1. Go to [Firebase Console](https://console.firebase.google.com/project/starapp-7c080)
2. Click "Authentication" in the left sidebar
3. Click "Get started" (if not enabled yet)
4. Go to "Sign-in method" tab
5. Click "Anonymous"
6. Toggle "Enable"
7. Click "Save"

That's it! Anonymous auth is now enabled.

## 📊 Step 2: How It Works

### On First Visit:
```javascript
User opens app
  → useAnonymousUser() hook activates
  → Firebase creates anonymous user
  → UID generated: "BxC3yZ9mNoPqR5sT"
  → User document created in Firestore:
    {
      uid: "BxC3yZ9mNoPqR5sT",
      deviceId: "device_1234567_abc",
      createdAt: timestamp,
      isAnonymous: true,
      uploadCount: 0,
      likeCount: 0
    }
```

### On Return Visit:
```javascript
User returns
  → Firebase recognizes stored credentials
  → Same UID: "BxC3yZ9mNoPqR5sT"
  → Updates lastSeen timestamp
  → User keeps all their likes and uploads!
```

### User Identity Hierarchy:

1. **Firebase UID** (primary) - `"BxC3yZ9mNoPqR5sT"`
2. **Device ID** (fallback) - `"device_1234567_abc"` (localStorage)
3. **Session ID** (temporary) - `"session_7654321_xyz"` (sessionStorage)

## 🎨 Step 3: Using in Components

### Get User ID:

```typescript
import { useAnonymousUser } from "@/lib/hooks/useAnonymousUser"

function MyComponent() {
  const { uid, isLoading, isAuthenticated } = useAnonymousUser()
  
  // uid is the Firebase Anonymous UID
  // Or device ID if Firebase fails
  
  return <div>User ID: {uid}</div>
}
```

### Simple Version (just get ID):

```typescript
import { useUserId } from "@/lib/hooks/useAnonymousUser"

function MyComponent() {
  const userId = useUserId() // Just returns the ID
  
  return <button onClick={() => likePhoto(userId)}>Like</button>
}
```

## 📝 Step 4: Update Upload Function

When uploading photos, pass the user ID:

```typescript
import { useAnonymousUser } from "@/lib/hooks/useAnonymousUser"
import { uploadPhotoToWall } from "@/lib/actions"

function CameraPage() {
  const { uid } = useAnonymousUser()
  
  const handleUpload = async () => {
    await uploadPhotoToWall(imageData, {
      tags: ["star-pic"],
      folder: "/ulp-stars",
      userId: uid,
      userName: "Anonymous User", // Optional: let them set a display name
    })
  }
}
```

## 🔒 Step 5: Security Rules (Already Updated)

Your Firestore rules now:
- ✅ Allow anonymous users to create photos
- ✅ Allow anonymous users to update their own photos
- ✅ Allow anonymous users to create/update their user profile
- ✅ Anyone can read active photos (no auth needed)
- ✅ Only admins can delete

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

## 📱 Step 6: Data Stored Per User

### In Firestore `users/{uid}`:
```json
{
  "uid": "BxC3yZ9mNoPqR5sT",
  "deviceId": "device_1234567_abc",
  "createdAt": "2024-01-15T10:30:00Z",
  "lastSeen": "2024-01-20T15:45:00Z",
  "isAnonymous": true,
  "uploadCount": 5,
  "likeCount": 23
}
```

### In Firestore `photos/{photoId}`:
```json
{
  "fileId": "img_abc123",
  "url": "https://ik.imagekit.io/...",
  "userId": "BxC3yZ9mNoPqR5sT",
  "userName": "Anonymous User",
  "likes": 15,
  "likedBy": ["BxC3yZ9mNoPqR5sT", "XyZ789..."],
  ...
}
```

## 🔄 Step 7: Upgrading Anonymous to Real Account (Future)

You can later link anonymous accounts to real accounts:

```typescript
import { getAuth, linkWithCredential, EmailAuthProvider } from "firebase/auth"

async function linkAnonymousToEmail(email: string, password: string) {
  const auth = getAuth()
  const credential = EmailAuthProvider.credential(email, password)
  
  try {
    await linkWithCredential(auth.currentUser!, credential)
    console.log("✅ Anonymous account linked to email!")
  } catch (error) {
    console.error("Failed to link account:", error)
  }
}
```

This preserves all their uploads and likes!


## 🧪 Step 8: Testing

1. **Test First Visit:**
   ```bash
   # Clear browser data
   # Open app
   # Check console: "✅ Anonymous user authenticated: ABC123..."
   # Check Firestore: New user document created
   ```

2. **Test Return Visit:**
   ```bash
   # Close and reopen app
   # Check console: Same UID logged
   # Check Firestore: lastSeen updated
   ```

3. **Test Likes:**
   ```bash
   # Like a photo
   # Check Firestore photos/{id}/likedBy array
   # Should contain your UID
   # Refresh page - like should persist
   ```

4. **Test Uploads:**
   ```bash
   # Upload a photo
   # Check Firestore photos/{id}/userId
   # Should match your UID
   ```

## 🔍 Debugging

### Check User Status:
```typescript
import { useAnonymousUser } from "@/lib/hooks/useAnonymousUser"

function DebugPanel() {
  const user = useAnonymousUser()
  
  return (
    <pre>
      {JSON.stringify(user, null, 2)}
    </pre>
  )
}
```

### Common Issues:

**"User stays loading forever"**
- Check Firebase config in .env.local
- Check anonymous auth is enabled
- Check browser console for errors

**"Different UID on each visit"**
- Browser might be in incognito mode
- User clearing cookies/storage
- This is expected behavior in incognito

**"Cannot like photos"**
- Check uid is not empty
- Check Firestore rules are deployed
- Check console for permission errors

## 📊 Analytics & Tracking

You now have rich user analytics:

```typescript
// Count total anonymous users
db.collection("users").where("isAnonymous", "==", true).count()

// Count active users (last 7 days)
db.collection("users")
  .where("lastSeen", ">", sevenDaysAgo)
  .count()

// Get user's upload history
db.collection("photos")
  .where("userId", "==", uid)
  .orderBy("createdAt", "desc")
  .get()

// Get user's liked photos
db.collection("photos")
  .where("likedBy", "array-contains", uid)
  .get()
```

## 🎉 Summary

You now have a production-ready anonymous user system that:

✅ Automatically authenticates users
✅ Tracks likes and uploads per user
✅ Persists across sessions
✅ Works without sign-in
✅ Can be upgraded to real accounts later
✅ Privacy-friendly and free

