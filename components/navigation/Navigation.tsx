"use client"

import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState, useEffect } from "react"
import { LogOut, Home } from "lucide-react"

interface NavigationProps {
  user: User | null
}

const Navigation = ({ user }: NavigationProps) => {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、よろしいですか？")) {
      return
    }

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  const updateTime = () => {
    const date = new Date()
    const options: Intl.DateTimeFormatOptions = {
      timeZone: "Asia/Tokyo",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }
    setCurrentTime(date.toLocaleTimeString("ja-JP", options))
  }

  useEffect(() => {
    updateTime()
    const intervalId = setInterval(updateTime, 1000)
    return () => clearInterval(intervalId)
  }, [])

  return (
    <header className="bg-white shadow-lg">
      <div className="container mx-auto max-w-screen-lg px-6 py-4 flex items-center justify-between">
        <Link href="/" className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-500 transition duration-300">
          Void Pulse
        </Link>

        {/* Centered Time Display */}
        <motion.div
          className="text-lg font-medium text-gray-700"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {currentTime}
        </motion.div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {user ? (
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center text-gray-600 hover:text-indigo-600 transition duration-300">
                <Home className="h-5 w-5 mr-1" />
                ホーム
              </Link>
              <Link href="/blog/new" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                投稿
              </Link>
              <Link href="/settings/profile" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                設定
              </Link>
              <div className="cursor-pointer text-gray-600 hover:text-indigo-600 transition duration-300" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-8">
              <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                ログイン
              </Link>
              <Link href="/signup" className="bg-indigo-600 text-white px-6 py-2 rounded-full hover:bg-indigo-500 transition duration-300">
                サインアップ
              </Link>
            </div>
          )}
        </nav>

        <div className="md:hidden">
          <button
            className="text-gray-600 hover:text-indigo-600 transition duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? "閉じる" : "メニュー"}
          </button>
        </div>
      </div>

      {isMenuOpen && (
        <motion.nav
          className="md:hidden fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg z-50"
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          transition={{ duration: 0.3 }}
        >
          <div className="flex flex-col p-6 space-y-6">
            {user ? (
              <>
                <Link href="/" className="flex items-center text-gray-600 hover:text-indigo-600 transition duration-300">
                  <Home className="h-5 w-5 mr-1" />
                  ホーム
                </Link>
                <Link href="/blog/new" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                  投稿
                </Link>
                <Link href="/settings/profile" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                  設定
                </Link>
                <div className="cursor-pointer text-gray-600 hover:text-indigo-600 transition duration-300" onClick={handleLogout}>
                  ログアウト
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                  ログイン
                </Link>
                <Link href="/signup" className="bg-indigo-600 text-white px-6 py-2 rounded-full text-center hover:bg-indigo-500 transition duration-300">
                  サインアップ
                </Link>
              </>
            )}
          </div>
        </motion.nav>
      )}
    </header>
  )
}

export default Navigation
