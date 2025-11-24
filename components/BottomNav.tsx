import type React from "react"
import { Camera, Grid, Activity, Star } from "lucide-react"

interface BottomNavProps {
    currentTab: string
    onTabChange: (tab: string) => void
    hasNewNotification?: boolean
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange, hasNewNotification }) => {
    const tabs = [
        { id: "photo", label: "Photo", icon: Camera },
        { id: "stars", label: "Stars", icon: Star },
        { id: "activity", label: "Activity", icon: Activity },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t-4 border-red-600 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)] pb-safe">
            <div className="flex items-center justify-around h-20 px-4 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center justify-center gap-1 min-w-[72px] relative transition-all active:scale-95"
                        >
                            <div className={`relative p-1 rounded-full transition-all ${isActive ? "bg-red-500/10" : ""}`}>
                                <tab.icon className={`w-6 h-6 ${isActive ? "text-red-500 fill-current" : "text-neutral-400"}`} />
                                {tab.id === "stars" && hasNewNotification && (
                                    <span className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full border-2 border-neutral-900 animate-pulse" />
                                )}
                            </div>
                            <span className={`text-[10px] uppercase mt-1 tracking-wide ${isActive ? "text-red-500 font-black italic" : "text-neutral-400 font-bold"}`}>
                                {tab.label}
                            </span>
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}

export default BottomNav
