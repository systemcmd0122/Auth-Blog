import { createClient } from "@/utils/supabase/server"
import { redirect } from "next/navigation"
import { ProfileType } from "@/types"
import { Suspense } from "react"
import Profile from "@/components/settings/Profile"
import Loading from "@/app/loading"

const ProfilePage = async () => {
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
    <div className="pt-16 min-h-screen bg-gray-100"> {/* Added padding-top and min-height */}
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<Loading />}>
          <Profile profile={profile} />
        </Suspense>
      </div>
    </div>
  )
}

export default ProfilePage
