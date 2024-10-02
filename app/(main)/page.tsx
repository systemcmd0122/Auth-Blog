'use client'

import React, { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import BlogItem from "@/components/blog/BlogItem"
import SearchBar from "@/components/blog/SearchBar"
import { BlogType } from "@/types"

// メインページ
const MainPage = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    const fetchBlogs = async () => {
      setLoading(true)
      const { data, error } = await supabase
        .from("blogs")
        .select(`
          *,
          profiles (
            name,
            avatar_url
          )
        `)
        .order("updated_at", { ascending: false })

      if (error) {
        console.error("Error fetching blogs:", error)
      } else {
        setBlogs(data as BlogType[] || [])
      }
      setLoading(false)
    }

    fetchBlogs()
  }, [])

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.profiles.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center">読み込み中...</div>
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <SearchBar searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
      {filteredBlogs.length === 0 ? (
        <div className="text-center">ブログが見つかりません</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBlogs.map((blog) => (
            <BlogItem key={blog.id} blog={blog} searchQuery={searchQuery} />
          ))}
        </div>
      )}
    </div>
  )
}

export default MainPage
