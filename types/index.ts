export interface ProfileType {
  id: string
  name: string
  introduce: string | null
  avatar_url: string | null
}

export interface BlogType {
  view_count: ReactNode
  profiles: any
  id: string
  title: string
  content: string
  user_id: string
  image_url: string | null
  updated_at: string
  created_at: string
}
