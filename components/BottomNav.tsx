import { Home, Users, Clock } from "lucide-react"

interface BottomNavProps {
    currentTab: string
    onTabChange: (tab: string) => void
    hasNewNotification?: boolean
}

export default function BottomNav({ currentTab, onTabChange, hasNewNotification = false }: BottomNavProps) {
    const tabs = [
        { id: "landing", label: "Home", icon: Home },
        { id: "wall", label: "Wall", icon: Users },
        { id: "history", label: "History", icon: Clock },
    ]

    return (
        <nav className="fixed bottom-0 left-0 right-0 bg-neutral-900 border-t-4 border-red-600 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.3)]">
            <div className="flex items-center justify-around h-20 px-4 max-w-md mx-auto">
                {tabs.map((tab) => {
                    const isActive = currentTab === tab.id
                    const Icon = tab.icon

                    return (
                        <button
                            key={tab.id}
                            onClick={() => onTabChange(tab.id)}
                            className="flex flex-col items-center justify-center gap-1 min-w-[72px] relative transition-all active:scale-95"
                            aria-label={tab.label}
                        >
                            {/* Notification Badge */}
                            {tab.id === "wall" && hasNewNotification && (
                                <div className="absolute top-0 right-[20px] w-2.5 h-2.5 bg-yellow-400 rounded-full border-2 border-neutral-900 animate-pulse" />
                            )}

                            {/* Icon with dual active state: color + scale */}
                            <div className={`transition-all ${isActive ? "scale-110" : "scale-100"}`}>
                                <Icon
                                    className={`w-6 h-6 transition-colors ${isActive
                                            ? "text-red-500 stroke-[2.5]"
                                            : "text-white/70"
                                        }`}
                                    fill={isActive ? "currentColor" : "none"}
                                />
                            </div>

                            {/* Label with dual active state: color + weight */}
                            <span
                                className={`text-[11px] uppercase tracking-wider transition-all font-sans ${isActive
                                        ? "text-red-500 font-black italic"
                                        : "text-white/70 font-bold"
                                    }`}
                            >
                                {tab.label}
                            </span>

                            {/* Active indicator bar */}
                            {isActive && (
                                <div className="absolute -bottom-[20px] left-0 right-0 h-1 bg-red-500 transform skew-x-[-12deg]" />
                            )}
                        </button>
                    )
                })}
            </div>
        </nav>
    )
}
