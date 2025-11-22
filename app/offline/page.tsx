"use client"

export default function OfflinePage() {
  return (
    <div className="h-screen w-screen flex flex-col items-center justify-center bg-ulp-red text-white p-6">
      <h1 className="text-4xl font-black italic uppercase mb-4">You're Offline</h1>
      <p className="text-center text-red-100 mb-6">Please check your internet connection and try again.</p>
      <button
        onClick={() => window.location.reload()}
        className="bg-white text-ulp-red font-black italic py-3 px-6 uppercase tracking-wider hover:bg-gray-100 transition-all"
      >
        Retry
      </button>
    </div>
  )
}
