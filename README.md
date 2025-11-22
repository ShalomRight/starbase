# ULP Star Photo - Progressive Web App

A Next.js 15 Progressive Web App for the Unity Labour Party campaign, allowing supporters to create and share branded campaign photos.

## Features

### 📸 Enhanced Camera
- **3-second countdown timer** for selfies
- **Composition grid** (rule of thirds)
- **Flash/torch support** for better lighting
- **High resolution** (1920x1080)
- Front and back camera switching

### 🎉 Engagement Features
- **Success celebration modal** after upload
- **Supporter numbering system**
- **Community metrics dashboard**
- **Photo wall with social proof**
- **Share entire wall functionality**
- **Interactive gallery viewer**

### 📱 PWA Capabilities
- **Installable** on mobile and desktop
- **Offline support** with service worker
- **App-like experience** in standalone mode
- **Optimized for mobile** with touch gestures

## Tech Stack

- **Next.js 15** with App Router
- **React 19** for UI components
- **Tailwind CSS v4** for styling
- **Server Actions** for Cloudinary uploads
- **Service Worker** for offline support
- **TypeScript** for type safety

## Environment Variables

Create a `.env.local` file:

\`\`\`env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_UPLOAD_PRESET=your_upload_preset
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
\`\`\`

## Getting Started

\`\`\`bash
npm install
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000)

## Deployment

Deploy to Vercel with one click. The PWA will automatically be configured.

## Brand Colors

- **ULP Red**: `#b91c1c`
- **ULP Red Dark**: `#7f1d1d`
- **ULP Black**: `#0a0a0a`
- **ULP Gray**: `#171717`

## License

© Unity Labour Party
# starsapp
