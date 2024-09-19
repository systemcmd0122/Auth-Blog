import "./globals.css"
import type { Metadata, Viewport } from "next"
import { M_PLUS_1 } from "next/font/google"
import { createClient } from "@/utils/supabase/server"
import Navigation from "@/components/navigation/Navigation"
import ToastProvider from "@/components/providers/ToastProvider"
import Head from "next/head"

const mPlus1 = M_PLUS_1({
  weight: ["400", "700", "900"],
  subsets: ["latin"],
})

export const metadata: Metadata = {
  title: {
    template: "Void Pulse",
    default: "「Void Pulse」 は、日常の中に潜む見えないエネルギーを探求し、無限の可能性を解き放つブログです。技術やアイデア、ライフスタイルから哲学まで、多様なテーマを通じて世界の「空白」に新たな視点を提供します。深く、静かに響くパルスが、あなたの思考を刺激し、新しい発見の旅へと導きます。既成概念に囚われない、自由な視点と革新的なアイデアを共有する場所です。",
  },
}

export const viewport: Viewport = {
  maximumScale: 1,
  userScalable: false,
}

interface RootLayoutProps {
  children: React.ReactNode
}

// ルートレイアウト
const RootLayout = async ({ children }: RootLayoutProps) => {
  const supabase = createClient()
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  return (
    <html lang="ja">
      <Head>
        {/* Favicon の設定 */}
        <link rel="icon" href="/Void Pulse.ico" />

        {/* OGP メタタグの設定 */}
        <meta property="og:title" content="Void Pulse" />
        <meta property="og:description" content="「Void Pulse」は、日常の中に潜む見えないエネルギーを探求し、無限の可能性を解き放つブログです。技術やアイデア、ライフスタイルから哲学まで、多様なテーマを通じて世界の「空白」に新たな視点を提供します。深く、静かに響くパルスが、あなたの思考を刺激し、新しい発見の旅へと導きます。既成概念に囚われない、自由な視点と革新的なアイデアを共有する場所です。" />
        <meta property="og:image" content="/Void-Pulse.png" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://auth-blog-lemon.vercel.app/" />

        {/* Twitter Card メタタグの設定 */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Void Pulse" />
        <meta name="twitter:description" content="「Void Pulse」は、日常の中に潜む見えないエネルギーを探求し、無限の可能性を解き放つブログです。技術やアイデア、ライフスタイルから哲学まで、多様なテーマを通じて世界の「空白」に新たな視点を提供します。深く、静かに響くパルスが、あなたの思考を刺激し、新しい発見の旅へと導きます。既成概念に囚われない、自由な視点と革新的なアイデアを共有する場所です。" />
        <meta name="twitter:image" content="/Void-Pulse.png" />
      </Head>
      <body className={mPlus1.className}>
        <ToastProvider />
        <div className="flex min-h-screen flex-col">
          <Navigation user={user} />

          <main className="flex-1">{children}</main>

          <footer className="border-t py-2">
            <div className="flex flex-col items-center justify-center text-sm space-y-5">
              <div>© All rights reserved. Tisk_01010100</div>
            </div>
          </footer>
        </div>
      </body>
    </html>
  )
}

export default RootLayout
