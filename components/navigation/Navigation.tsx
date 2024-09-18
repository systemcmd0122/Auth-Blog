"use client"

import { User } from "@supabase/supabase-js"
import { createClient } from "@/utils/supabase/client"
import { useRouter } from "next/navigation"
import { LogOut, Menu, X } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { useState } from "react"

interface NavigationProps {
  user: User | null
}

const Navigation = ({ user }: NavigationProps) => {
  const router = useRouter()
  const supabase = createClient()
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const handleLogout = async () => {
    if (!window.confirm("ログアウトしますが、よろしいですか？")) {
      return
    }

    await supabase.auth.signOut()
    router.push("/login")
    router.refresh()
  }

  // Slide menu animation variants
  const slideMenuVariants = {
    open: { x: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 30 } },
    closed: { x: "100%", opacity: 0, transition: { type: "spring", stiffness: 300, damping: 30 } },
  }

  return (
    <header className="border-b bg-white shadow-md">
      <div className="container mx-auto max-w-screen-lg px-4 py-4 flex items-center justify-between">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Link href="/" className="text-2xl font-extrabold text-indigo-600 hover:text-indigo-500 transition duration-300">
            TechNova
          </Link>
        </motion.div>

        <nav className="hidden md:flex items-center space-x-8 text-sm font-medium">
          {user ? (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-8"
            >
              <Link href="/blog/new" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                投稿
              </Link>
              <Link href="/settings/profile" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                設定
              </Link>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={handleLogout}
              >
                <LogOut className="h-5 w-5" />
              </motion.div>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="flex items-center space-x-8"
            >
              <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                ログイン
              </Link>
              <Link href="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-full hover:bg-indigo-500 transition duration-300">
                サインアップ
              </Link>
            </motion.div>
          )}
        </nav>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="text-gray-600 hover:text-indigo-600 transition duration-300"
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </motion.button>
        </div>
      </div>

      {/* Slide-in Mobile Menu */}
      <motion.nav
        className="md:hidden fixed top-0 right-0 bottom-0 w-64 bg-white shadow-lg z-50"
        initial="closed"
        animate={isMenuOpen ? "open" : "closed"}
        variants={slideMenuVariants}
      >
        <div className="flex flex-col p-6 space-y-6">
          {user ? (
            <>
              <Link href="/blog/new" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                投稿
              </Link>
              <Link href="/settings/profile" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                設定
              </Link>
              <motion.div
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="cursor-pointer text-gray-600 hover:text-indigo-600 transition duration-300"
                onClick={handleLogout}
              >
                ログアウト
              </motion.div>
            </>
          ) : (
            <>
              <Link href="/login" className="text-gray-600 hover:text-indigo-600 transition duration-300">
                ログイン
              </Link>
              <Link href="/signup" className="bg-indigo-600 text-white px-5 py-2 rounded-full text-center hover:bg-indigo-500 transition duration-300">
                サインアップ
              </Link>
            </>
          )}
        </div>
      </motion.nav>

      {/* Overlay behind slide menu when open */}
      {isMenuOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-50 z-40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setIsMenuOpen(false)}  // Close menu when clicking outside
        />
      )}
    </header>
  )
}

export default Navigation
