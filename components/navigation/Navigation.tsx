'use client'

import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { LogOut, Home, Users, Menu, X, Bell, Search } from "lucide-react"

interface NavigationProps {
  user: User | null
}

const Navigation = ({ user }: NavigationProps) => {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userCount, setUserCount] = useState<number>(0)
  const [isScrolled, setIsScrolled] = useState(false)

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、よろしいですか？")) {
      return
    }

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  useEffect(() => {
    const fetchUserCount = async () => {
      const { count } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })
      
      setUserCount(count || 0)
    }

    fetchUserCount()

    const subscription = supabase
      .channel('profiles')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        fetchUserCount()
      })
      .subscribe()

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener('scroll', handleScroll)

    return () => {
      subscription.unsubscribe()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-white shadow-lg' : 'bg-transparent'}`}>
      <div className="container mx-auto max-w-screen-xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text hover:from-indigo-600 hover:to-purple-700 transition duration-300">
            Void Pulse
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <div className="relative group">
              <input
                type="text"
                placeholder="検索..."
                className="py-2 px-4 pr-10 rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition duration-300"
              />
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 group-hover:text-indigo-500 transition duration-300" />
            </div>

            <motion.div
              className="flex items-center text-lg font-medium text-gray-700"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Users className="h-5 w-5 mr-2 text-indigo-500" />
              <span className="bg-gradient-to-r from-indigo-500 to-purple-600 text-transparent bg-clip-text">{userCount}</span> ユーザー
            </motion.div>

            {user ? (
              <div className="flex items-center space-x-6">
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
                <button className="relative text-gray-600 hover:text-indigo-600 transition duration-300">
                  <Bell className="h-5 w-5" />
                  <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">3</span>
                </button>
                <button onClick={handleLogout} className="text-gray-600 hover:text-indigo-600 transition duration-300">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                  ログイン
                </Link>
                <Link href="/signup" className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-2 rounded-full hover:from-indigo-600 hover:to-purple-700 transition duration-300 shadow-md hover:shadow-lg">
                  サインアップ
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-gray-600 hover:text-indigo-600 transition duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="md:hidden fixed inset-0 bg-white z-50 flex flex-col"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* Mobile menu content (unchanged) */}
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navigation
