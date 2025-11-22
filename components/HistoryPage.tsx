import { useState } from "react"
import { Clock, ImagePlus } from "lucide-react"

export default function HistoryPage() {
    const [history] = useState<string[]>([
        "https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=400&q=80",
        "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400",
        "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400",
    ])

    return (
        <div className="h-full w-full bg-white flex flex-col pb-20">
            <header className="bg-red-700 shadow-xl p-6 flex-none">
                <div className="flex justify-center mb-3">
                    <div className="w-14 h-14 bg-white flex items-center justify-center rounded-full shadow-md border-4 border-neutral-900">
                        <Clock className="w-7 h-7 text-red-700" />
                    </div>
                </div>
                <h1 className="text-3xl font-sans font-black italic text-center text-white uppercase tracking-tighter transform -skew-x-6">
                    Your Stars
                </h1>
                <p className="text-red-100 text-center mt-2 font-sans font-bold uppercase tracking-wide text-xs">
                    All Your Contributions
                </p>
            </header>

            <div className="flex-1 overflow-y-auto p-6">
                {history.length > 0 ? (
                    <div className="grid grid-cols-2 gap-4">
                        {history.map((url, index) => (
                            <div
                                key={index}
                                className="aspect-[9/16] bg-white border-4 border-red-600 shadow-lg overflow-hidden transform -rotate-1 hover:rotate-0 transition-transform"
                            >
                                <img
                                    src={url}
                                    alt={`History ${index}`}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-0 left-0 right-0 bg-red-600 p-2">
                                    <p className="text-white font-black italic text-xs uppercase text-center">
                                        Star #{index + 1}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center">
                        <div className="bg-red-50 p-8 rounded-xl border-4 border-red-200">
                            <ImagePlus className="w-16 h-16 text-red-300 mx-auto mb-4" />
                            <p className="font-black italic uppercase text-neutral-600 text-lg mb-2">No Stars Yet</p>
                            <p className="text-xs text-neutral-500 font-bold uppercase tracking-wide">
                                Create your first design to see it here
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
