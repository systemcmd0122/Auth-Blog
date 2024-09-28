import { ReactNode } from 'react'

// Represents the user's profile
export interface ProfileType {
  id: string
  name: string
  introduce: string | null
  avatar_url: string | null
}

// Represents a blog post
export interface BlogType {
  view_count: ReactNode
  profiles: ProfileType
  id: string
  title: string
  content: string
  user_id: string
  image_url: string | null
  updated_at: string
  created_at: string
}

// Represents a comment on a blog post
export interface CommentType {
  id: string
  blog_id: string
  user_id: string
  content: string
  created_at: string
  updated_at: string
}
