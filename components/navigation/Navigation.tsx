'use client'

import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { useState, useEffect } from "react"
import { LogOut, Home, Users, Menu, X, PenTool, Settings, Shield } from "lucide-react"

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
    <header className="bg-white shadow-md">
      <div className="container mx-auto max-w-screen-xl px-4 py-4">
        <div className="flex items-center justify-between">
          <Link href="/" className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-700 transition duration-300">
            Void Pulse
          </Link>

          <nav className="hidden md:flex items-center space-x-6">
            <motion.div
              className="flex items-center text-lg font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Users className="h-5 w-5 mr-2 text-indigo-600" />
              <span className="font-bold">{userCount}</span> ユーザー
            </motion.div>

            {user ? (
              <div className="flex items-center space-x-4">
                <Link href="/" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300">
                  <Home className="h-5 w-5 mr-2 text-indigo-600" />
                  ホーム
                </Link>
                <Link href="/blog/new" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300">
                  <PenTool className="h-5 w-5 mr-2 text-indigo-600" />
                  投稿
                </Link>
                <Link href="/settings/profile" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300">
                  <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                  設定
                </Link>
                <button 
                  onClick={handleLogout} 
                  className="flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition duration-300"
                  aria-label="ログアウト"
                >
                  <LogOut className="h-5 w-5" />
                  <span className="sr-only">ログアウト</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link href="/login" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2 rounded-lg transition duration-300">
                  ログイン
                </Link>
                <Link href="/signup" className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg transition duration-300">
                  サインアップ
                </Link>
              </div>
            )}

            <Link href="@/app/privacy-policy" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300">
              <Shield className="h-5 w-5 mr-2 text-indigo-600" />
              プライバシー
            </Link>
          </nav>

          <button
            className="md:hidden bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
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
            <div className="flex justify-between items-center p-4 border-b">
              <Link href="/" className="text-2xl font-extrabold text-indigo-600" onClick={() => setIsMenuOpen(false)}>
                Void Pulse
              </Link>
              <button 
                onClick={() => setIsMenuOpen(false)} 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition duration-300"
                aria-label="メニューを閉じる"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex flex-col p-4 space-y-4">
              <div className="text-lg font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg flex items-center justify-center">
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                <span className="font-bold">{userCount}</span> ユーザー
              </div>
              {user ? (
                <>
                  <Link href="/" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    <Home className="h-5 w-5 mr-2 text-indigo-600" />
                    ホーム
                  </Link>
                  <Link href="/blog/new" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    <PenTool className="h-5 w-5 mr-2 text-indigo-600" />
                    投稿
                  </Link>
                  <Link href="/settings/profile" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    <Settings className="h-5 w-5 mr-2 text-indigo-600" />
                    設定
                  </Link>
                  <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition duration-300">
                    <LogOut className="h-5 w-5 mr-2" />
                    ログアウト
                  </button>
                </>
              ) : (
                <>
                  <Link href="/login" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2 rounded-lg text-center transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    ログイン
                  </Link>
                  <Link href="/signup" className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg text-center transition duration-300" onClick={() => setIsMenuOpen(false)}>
                    サインアップ
                  </Link>
                </>
              )}
              <Link href="@/app/privacy-policy" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300" onClick={() => setIsMenuOpen(false)}>
                <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                プライバシーポリシー
              </Link>
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  )
}

export default Navigation
