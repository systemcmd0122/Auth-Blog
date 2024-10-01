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
