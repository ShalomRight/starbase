export interface Frame {
  id: string
  name: string
  category: string
  url: string
}

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  tags?: string[]
  context?: {
    custom?: {
      [key: string]: string
    }
  }
  width?: number
  height?: number
  created_at?: string
}

export interface CloudinaryResource {
  public_id: string
  secure_url: string
  tags?: string[]
  context?: {
    custom?: {
      [key: string]: string
    }
  }
  width?: number
  height?: number
  created_at?: string
}

export interface WallImage {
  url: string
  supporterNumber: number
  timestamp: number
}
