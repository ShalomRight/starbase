"use client"

import type React from "react"
import { Star, ChevronRight } from "lucide-react"

interface CoverPageProps {
  onStart: () => void
}

const CoverPage: React.FC<CoverPageProps> = ({ onStart }) => {
  return (
    <div className="h-full w-full bg-red-700 flex flex-col relative overflow-hidden">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-red-600 via-red-700 to-red-900 z-0"></div>

      {/* Decorative Elements (Stars) */}
      <div className="absolute top-10 right-[-20px] text-red-800 opacity-30 z-0">
        <Star className="w-40 h-40 fill-current" />
      </div>
      <div className="absolute bottom-20 left-[-20px] text-red-800 opacity-30 z-0">
        <Star className="w-32 h-32 fill-current" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 z-10">
        {/* Header Text */}
        <div className="text-center mb-8 relative">
          <div className="inline-block bg-white px-2 py-1 mb-4 transform -skew-x-12">
            <h2 className="text-red-700 font-sans font-black tracking-tighter text-sm uppercase transform skew-x-12">
              Vote ULP
            </h2>
          </div>
          <h1 className="text-5xl md:text-6xl font-sans font-black italic text-white leading-none uppercase tracking-tight drop-shadow-lg">
            OWN THE
            <br />
            FUTURE
          </h1>
          <div className="w-24 h-2 bg-white mx-auto mt-4 transform -skew-x-12"></div>
        </div>

        {/* Main Image Placeholder */}
        <div className="w-full aspect-[4/5] max-h-[45vh] bg-black rounded-sm shadow-2xl border-4 border-white overflow-hidden relative mb-8 transform -rotate-1">
          {/* Using a placeholder image that matches the aspect ratio */}
          <img
            src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?q=80&w=1080&auto=format&fit=crop"
            alt="Campaign"
            className="w-full h-full object-cover opacity-90 mix-blend-normal"
          />
          <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/60 to-transparent p-4">
            <p className="text-white font-sans font-black italic text-xl uppercase leading-none">
              Labour is <br />
              <span className="text-red-500">Working</span>
            </p>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onStart}
          className="w-full bg-neutral-900 text-white font-sans font-black italic text-2xl py-5 px-8 shadow-[0_10px_20px_rgba(0,0,0,0.3)] border-2 border-white/20 hover:bg-black active:scale-95 transition-all duration-200 flex items-center justify-center gap-3 uppercase tracking-wider transform skew-x-[-5deg]"
        >
          <div className="transform skew-x-[5deg] flex items-center gap-2">
            <Star className="w-6 h-6 fill-white" />
            Get Started
            <ChevronRight className="w-6 h-6" />
          </div>
        </button>

        <p className="text-red-200 text-[10px] mt-6 font-sans font-bold uppercase tracking-widest opacity-80">
          Unity Labour Party
        </p>
      </div>
    </div>
  )
}

export default CoverPage
