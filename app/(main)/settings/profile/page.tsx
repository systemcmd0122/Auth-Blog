import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileType } from "@/types"
import { Suspense } from "react"
import Profile from "@/components/settings/Profile"
import Email from "@/components/settings/Email"
import Password from "@/components/settings/Password"
import Loading from "@/app/loading"
import SettingsLayout from "@/components/settings/SettingsLayout"

const SettingsPage = async () => {
  const supabase = createClient()
  const { data: userData } = await supabase.auth.getUser()
  const user = userData?.user

  let profile: ProfileType | null = null

  if (user) {
    const { data: profileData, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()

    if (error) {
      console.error("プロフィールの取得中にエラーが発生しました:", error)
    }

    profile = profileData
  }

  if (!user || !profile) {
    redirect("/")
  }

  return (
    <Suspense fallback={<Loading />}>
      <SettingsLayout>
        <Profile profile={profile} />
        <Email email={user.email} />
        <Password />
      </SettingsLayout>
    </Suspense>
  )
}

export default SettingsPage

// components/settings/SettingsLayout.tsx
import React, { useState, ReactNode } from 'react'
import { motion } from 'framer-motion'

interface SettingsLayoutProps {
  children: ReactNode
}

const SettingsLayout: React.FC<SettingsLayoutProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState('profile')

  const tabs = [
    { id: 'profile', label: 'プロフィール' },
    { id: 'email', label: 'メールアドレス変更' },
    { id: 'password', label: 'パスワード変更' },
  ]

  const childrenArray = React.Children.toArray(children)

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <h1 className="text-3xl font-bold text-center mb-8">設定</h1>
      <div className="flex flex-col md:flex-row gap-8">
        <motion.div
          className="w-full md:w-1/4 bg-white rounded-lg shadow-md p-4"
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="text-xl font-semibold mb-4">メニュー</h2>
          <ul className="space-y-2">
            {tabs.map((tab) => (
              <li key={tab.id}>
                <button
                  className={`w-full text-left py-2 px-4 rounded-md transition-colors ${
                    activeTab === tab.id ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  {tab.label}
                </button>
              </li>
            ))}
          </ul>
        </motion.div>
        <motion.div
          className="w-full md:w-3/4"
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {childrenArray.find((child: any) => child.type.name.toLowerCase() === activeTab)}
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsLayout
