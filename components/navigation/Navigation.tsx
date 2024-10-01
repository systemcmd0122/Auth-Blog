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

  const menuItems = [
    { href: "/", icon: Home, text: "ホーム" },
    { href: "/blog/new", icon: PenTool, text: "投稿" },
    { href: "/settings/profile", icon: Settings, text: "設定" },
  ]

  return (
    <header className="bg-white shadow-md">
      <div className="container mx-auto max-w-screen-xl px-4 py-4">
        <div className="flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Link href="/" className="text-3xl font-extrabold text-indigo-600 hover:text-indigo-700 transition duration-300">
              Void Pulse
            </Link>
          </motion.div>

          <motion.div
            className="flex items-center text-lg font-medium text-gray-700 bg-gray-100 px-3 py-2 rounded-lg"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Users className="h-5 w-5 mr-2 text-indigo-600" />
            <motion.span
              className="font-bold"
              initial={{ scale: 1 }}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 0.5, repeat: Infinity, repeatDelay: 5 }}
            >
              {userCount}
            </motion.span> ユーザー
          </motion.div>

          <motion.button
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition duration-300"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={isMenuOpen ? "close" : "open"}
                initial={{ rotate: -180, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                exit={{ rotate: 180, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </motion.div>
            </AnimatePresence>
          </motion.button>
        </div>
      </div>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="fixed inset-0 bg-white z-50 flex flex-col"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            transition={{ duration: 0.3 }}
          >
            <div className="flex justify-between items-center p-4 border-b">
              <Link href="/" className="text-2xl font-extrabold text-indigo-600" onClick={() => setIsMenuOpen(false)}>
                Void Pulse
              </Link>
              <motion.button 
                onClick={() => setIsMenuOpen(false)} 
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 p-2 rounded-lg transition duration-300"
                aria-label="メニューを閉じる"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-6 w-6" />
              </motion.button>
            </div>
            <div className="flex flex-col p-4 space-y-4 overflow-y-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Link href="/privacy-policy" className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300" onClick={() => setIsMenuOpen(false)}>
                  <Shield className="h-5 w-5 mr-2 text-indigo-600" />
                  プライバシーポリシー
                </Link>
              </motion.div>
              {user ? (
                <>
                  {menuItems.map((item, index) => (
                    <motion.div
                      key={item.href}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1 * (index + 2) }}
                    >
                      <Link href={item.href} className="flex items-center justify-center bg-gray-100 text-gray-700 hover:bg-gray-200 px-4 py-2 rounded-lg transition duration-300" onClick={() => setIsMenuOpen(false)}>
                        <item.icon className="h-5 w-5 mr-2 text-indigo-600" />
                        {item.text}
                      </Link>
                    </motion.div>
                  ))}
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 * (menuItems.length + 2) }}
                  >
                    <button onClick={handleLogout} className="w-full flex items-center justify-center bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2 rounded-lg transition duration-300">
                      <LogOut className="h-5 w-5 mr-2" />
                      ログアウト
                    </button>
                  </motion.div>
                </>
              ) : (
                <>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    <Link href="/login" className="bg-gray-100 text-gray-700 hover:bg-gray-200 px-6 py-2 rounded-lg text-center transition duration-300 block" onClick={() => setIsMenuOpen(false)}>
                      ログイン
                    </Link>
                  </motion.div>
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link href="/signup" className="bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2 rounded-lg text-center transition duration-300 block" onClick={() => setIsMenuOpen(false)}>
                      サインアップ
                    </Link>
                  </motion.div>
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
