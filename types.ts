export interface Frame {
  id: string
  name: string
  category: string
  url: string
}

export interface CloudinaryUploadResponse {
  secure_url: string
  public_id: string
  asset_id: string
  version: number
  width: number
  height: number
  format: string
  resource_type: string
  created_at: string
  tags: string[]
  bytes: number
  type: string
  etag: string
  placeholder: boolean
  url: string
  signature: string
}

export interface CloudinaryResource {
  public_id: string
  format: string
  version: number
  resource_type: string
  type: string
  created_at: string
  bytes: number
  width: number
  height: number
  url: string
  secure_url: string
}
