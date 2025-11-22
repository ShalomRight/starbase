export interface Frame {
  id: string
  name: string
  category: string
  url: string
}

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
}

export interface WallImage {
  url: string
  supporterNumber: number
  timestamp: number
}
