import type { Frame } from "@/types"

export const CATEGORIES = ["All Frames", "Classic", "Modern", "Bold"]

export const FRAMES: Frame[] = [
  {
    id: "1",
    name: "Unity Frame",
    category: "classic",
    url: "https://ik.imagekit.io/bcmzxhknk3/PhotoApp/socials_reel__9-16__1080x1920_1.png",
  },
  {
    id: "2",
    name: "Labour Pride",
    category: "modern",
    url: "https://ik.imagekit.io/bcmzxhknk3/PhotoApp/socials_reel__9-16__1080x1920_2.png",
  },
  {
    id: "3",
    name: "Star Power",
    category: "bold",
    url: "https://ik.imagekit.io/bcmzxhknk3/PhotoApp/Labour%20youth%20rally.png",
  },
]

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "",
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "",
  wallTag: process.env.NEXT_PUBLIC_CLOUDINARY_WALL_TAG || "ulp_wall",
  ApiSecret: process.env.CLOUDINARY_API_SECRET || "",
  ApiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || "",
}
