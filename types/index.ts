export interface Frame {
  id: string
  name: string
  category: string
  url: string
}

export interface ImageKitFile {
  fileId: string
  name: string
  filePath: string
  url: string
  tags?: string[]
  width?: number
  height?: number
  size: number
  createdAt: string
}

export interface WallImage {
  url: string
  supporterNumber: number
  timestamp: number
}
