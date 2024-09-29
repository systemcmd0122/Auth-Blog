'use client'

import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { LogOut, Home, Users, Menu, X } from "lucide-react"

interface NavigationProps {
  user: User | null
}

const Navigation = ({ user }: NavigationProps) => {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userCount, setUserCount] = useState<number>(0)

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

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  return (
    <header className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg">
      <div className="container mx-auto max-w-screen-xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold text-white hover:text-indigo-200 transition duration-300">
            Void Pulse
          </Link>

          <nav className="hidden md:flex items-center space-x-8">
            <motion.div
              className="flex items-center text-lg font-medium"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Users className="h-5 w-5 mr-2" />
              <span className="bg-white text-indigo-600 px-2 py-1 rounded-full">{userCount}</span> ユーザー
            </motion.div>

            {user ? (
              <div className="flex items-center space-x-6">
                <Link href="/" className="flex items-center text-white hover:text-indigo-200 transition duration-300">
                  <Home className="h-5 w-5 mr-1" />
                  ホーム
                </Link>
                <Link href="/blog/new" className="text-white hover:text-indigo-200 transition duration-300">
                  投稿
                </Link>
                <Link href="/settings/profile" className="text-white hover:text-indigo-200 transition duration-300">
                  設定
                </Link>
                <button onClick={handleLogout} className="text-white hover:text-indigo-200 transition duration-300">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-6">
                <Link href="/login" className="text-white hover:text-indigo-200 transition duration-300">
                  ログイン
                </Link>
                <Link href="/signup" className="bg-white text-indigo-600 px-6 py-2 rounded-full hover:bg-indigo-100 transition duration-300">
                  サインアップ
                </Link>
              </div>
            )}
          </nav>

          <button
            className="md:hidden text-white hover:text-indigo-200 transition duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="md:hidden fixed inset-0 bg-indigo-600 z-50 flex flex-col"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center p-4 border-b border-indigo-500">
              <Link href="/" className="text-2xl font-extrabold text-white" onClick={() => setIsMenuOpen(false)}>
                Void Pulse
              </Link>
              <button onClick={() => setIsMenuOpen(false)} className="text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col p-4 space-y-4">
              <div className="text-lg font-medium text-white flex items-center justify-center">
                <Users className="h-5 w-5 mr-2" />
                <span className="bg-white text-indigo-600 px-2 py-1 rounded-full">{userCount}</span> ユーザー
              </div>
              {user ? (
                <>
                  <Link href="/" className="flex items-center justify-center text-white hover:text-indigo-200 transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    <Home className="h-5 w-5 mr-2" />
                    ホーム
                  </Link>
                  <Link href="/blog/new" className="text-center text-white hover:text-indigo-200 transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    投稿
                  </Link>
                  <Link href="/settings/profile" className="text-center text-white hover:text-indigo-200 transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    設定
                  </Link>
                  <button onClick={handleLogout} className="w-full text-center text-white hover:text-indigo-200 transition duration-300">
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="text-center text-white hover:text-indigo-200 transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    ログイン
                  </Link>
                  <Link href="/signup" className="bg-white text-indigo-600 px-6 py-2 rounded-full text-center hover:bg-indigo-100 transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    サインアップ
                  </Link>
                </>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navigation
