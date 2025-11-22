const STORAGE_KEY = "ulp_photo_history"

export const savePhotoToHistory = (url: string) => {
  try {
    const history = getPhotoHistory()
    // Add to beginning, remove duplicates, limit to 20
    const newHistory = [url, ...history.filter((item) => item !== url)].slice(0, 20)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newHistory))
  } catch (error) {
    console.error("Failed to save photo history:", error)
  }
}

export const getPhotoHistory = (): string[] => {
  if (typeof window === "undefined") return []
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : []
  } catch (error) {
    console.error("Failed to load photo history:", error)
    return []
  }
}
