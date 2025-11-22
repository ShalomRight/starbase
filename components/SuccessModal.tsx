"use client"

import { Star, Sparkles } from "lucide-react"

interface SuccessModalProps {
  supporterNumber: number
  onViewWall: () => void
}

export default function SuccessModal({ supporterNumber, onViewWall }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-lg p-8 max-w-sm mx-4 text-center animate-in zoom-in duration-300">
        {/* Animated Star */}
        <div className="relative mb-6">
          <Star className="w-24 h-24 text-yellow-400 fill-yellow-400 mx-auto animate-pulse" />
          <Sparkles className="w-8 h-8 text-yellow-300 absolute top-0 right-1/4 animate-bounce" />
          <Sparkles className="w-6 h-6 text-yellow-300 absolute bottom-2 left-1/4 animate-bounce delay-150" />
        </div>

        {/* Success Message */}
        <h2 className="text-3xl font-black italic text-ulp-red uppercase mb-2 skew-brand">You're a Star!</h2>
        <p className="text-ulp-gray font-bold mb-6">
          You're Supporter <span className="text-ulp-red text-xl font-black">#{supporterNumber}</span>
        </p>

        {/* CTA */}
        <button
          onClick={onViewWall}
          className="w-full bg-ulp-red text-white font-black italic py-3 px-6 uppercase tracking-wider hover:bg-ulp-red-dark transition-all active:scale-95 skew-brand"
        >
          <span className="unskew-brand">View Wall →</span>
        </button>

        <p className="text-xs text-gray-400 mt-4 font-bold uppercase">Auto-redirecting in 5 seconds...</p>
      </div>
    </div>
  )
}
