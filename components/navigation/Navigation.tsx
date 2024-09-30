'use client'

import React, { useState, useEffect } from "react"
import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { LogOut, Home, Users, Menu, X, PenTool, Settings, Shield, ChevronDown } from "lucide-react"

interface NavigationProps {
  user: User | null
}

const Navigation: React.FC<NavigationProps> = ({ user }) => {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [userCount, setUserCount] = useState<number>(0)

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますか？")) {
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
  }, [supabase])

  return (
    <>
      <header className="fixed top-0 left-0 right-0 bg-white bg-opacity-90 backdrop-blur-md shadow-sm z-50">
        <div className="container mx-auto max-w-screen-xl px-4 py-3">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-extrabold text-indigo-600 hover:text-indigo-700 transition duration-300">
              Void Pulse
            </Link>

            <button
              className="text-gray-600 hover:text-indigo-600 p-2 rounded-full transition duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label={isMenuOpen ? "メニューを閉じる" : "メニューを開く"}
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isMenuOpen && (
          <motion.nav
            className="fixed inset-0 bg-white z-40 pt-16 pb-6 px-4 overflow-y-auto"
            initial={{ opacity: 0, y: "-100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "-100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          >
            <div className="container mx-auto max-w-screen-xl space-y-6">
              <motion.div
                className="flex items-center justify-center text-lg font-medium text-gray-600 bg-indigo-50 px-4 py-3 rounded-2xl"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
              >
                <Users className="h-5 w-5 mr-2 text-indigo-600" />
                <span className="font-bold text-indigo-600">{userCount}</span>
                <span className="ml-1">ユーザー</span>
              </motion.div>

              {user ? (
                <div className="space-y-4">
                  <NavLink href="/" icon={<Home />} label="ホーム" onClick={() => setIsMenuOpen(false)} delay={0.2} />
                  <NavLink href="/blog/new" icon={<PenTool />} label="投稿" onClick={() => setIsMenuOpen(false)} delay={0.3} />
                  <NavLink href="/settings/profile" icon={<Settings />} label="設定" onClick={() => setIsMenuOpen(false)} delay={0.4} />
                  <NavLink href="/privacy-policy" icon={<Shield />} label="プライバシーポリシー" onClick={() => setIsMenuOpen(false)} delay={0.5} />
                  <motion.button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-between text-red-600 hover:bg-red-50 px-4 py-3 rounded-xl transition duration-300"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                  >
                    <span className="flex items-center">
                      <LogOut className="h-5 w-5 mr-3" />
                      ログアウト
                    </span>
                    <ChevronDown className="h-5 w-5" />
                  </motion.button>
                </div>
              ) : (
                <div className="space-y-4">
                  <NavLink href="/privacy-policy" icon={<Shield />} label="プライバシーポリシー" onClick={() => setIsMenuOpen(false)} delay={0.2} />
                  <motion.div
                    className="grid grid-cols-2 gap-4"
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                  >
                    <Link
                      href="/login"
                      className="text-center text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ログイン
                    </Link>
                    <Link
                      href="/signup"
                      className="text-center bg-indigo-600 text-white hover:bg-indigo-700 px-4 py-3 rounded-xl transition duration-300"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      サインアップ
                    </Link>
                  </motion.div>
                </div>
              )}
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  )
}

interface NavLinkProps {
  href: string;
  icon: React.ReactElement;
  label: string;
  onClick: () => void;
  delay: number;
}

const NavLink: React.FC<NavLinkProps> = ({ href, icon, label, onClick, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: -20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
  >
    <Link
      href={href}
      className="flex items-center justify-between text-gray-600 hover:text-indigo-600 hover:bg-indigo-50 px-4 py-3 rounded-xl transition duration-300"
      onClick={onClick}
    >
      <span className="flex items-center">
        {React.cloneElement(icon, { className: "h-5 w-5 mr-3" })}
        {label}
      </span>
      <ChevronDown className="h-5 w-5" />
    </Link>
  </motion.div>
)

export default Navigation
