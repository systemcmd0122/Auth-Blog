'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import BlogItem from "@/components/blog/BlogItem"
import SearchBar from "@/components/blog/SearchBar"
import { BlogType } from "@/types"

const MainPage = () => {
  const [blogs, setBlogs] = useState<BlogType[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [backgroundMedia, setBackgroundMedia] = useState<string | null>(null)
  const [isVideo, setIsVideo] = useState(false)
  const [isYouTube, setIsYouTube] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
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

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }, [])

  const extractYouTubeID = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
    const match = url.match(regExp)
    return (match && match[2].length === 11) ? match[2] : null
  }

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    const text = e.dataTransfer.getData('text')

    if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
      const reader = new FileReader()
      reader.onload = (event) => {
        if (event.target) {
          setBackgroundMedia(event.target.result as string)
          setIsVideo(file.type.startsWith('video/'))
          setIsYouTube(false)
        }
      }
      reader.readAsDataURL(file)
    } else if (text) {
      const youtubeID = extractYouTubeID(text)
      if (youtubeID) {
        setBackgroundMedia(`https://www.youtube.com/embed/${youtubeID}?autoplay=1&mute=1&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeID}`)
        setIsVideo(true)
        setIsYouTube(true)
      }
    }
  }, [])

  const toggleMute = useCallback(() => {
    setIsMuted((prev) => !prev)
    if (isYouTube && backgroundMedia) {
      const youtubeID = extractYouTubeID(backgroundMedia)
      setBackgroundMedia(`https://www.youtube.com/embed/${youtubeID}?autoplay=1&mute=${isMuted ? '0' : '1'}&controls=0&showinfo=0&rel=0&loop=1&playlist=${youtubeID}`)
    }
  }, [isMuted, isYouTube, backgroundMedia])

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    blog.profiles.name.toLowerCase().includes(searchQuery.toLowerCase())
  )

  if (loading) {
    return <div className="text-center">読み込み中...</div>
  }

  return (
    <div 
      className="min-h-screen relative"
      onDragOver={handleDragOver}
      onDrop={handleDrop}
    >
      {backgroundMedia && (
        <div className="fixed inset-0 z-[-1]">
          {isYouTube ? (
            <iframe
              src={backgroundMedia}
              className="w-full h-full"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            ></iframe>
          ) : isVideo ? (
            <video
              src={backgroundMedia}
              autoPlay
              loop
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={backgroundMedia}
              alt="Background"
              className="w-full h-full object-cover"
            />
          )}
        </div>
      )}
      {isVideo && (
        <button
          className="fixed bottom-4 right-4 bg-black bg-opacity-50 text-white p-2 rounded"
          onClick={toggleMute}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      )}
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
    </div>
  )
}

export default MainPage