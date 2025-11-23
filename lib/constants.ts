import type { Frame } from "@/types"

export const CATEGORIES = ["People", "Slogan"]

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

export const IMAGEKIT_CONFIG = {
  urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT || "",
  publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY || "",
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY || "",
  folder: process.env.IMAGEKIT_FOLDER || "ulp-stars",
}

export const TAGS = {
  STAR_PIC: "star-pic",
  FEATURED: "featured",
  FRAME: "frames",
}
