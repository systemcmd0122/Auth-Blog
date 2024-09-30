import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'プライバシーポリシー | Void Pulse',
  description: 'Void Pulseのプライバシーポリシーについて説明します。',
}

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6 text-center">プライバシーポリシー</h1>
      <div className="max-w-3xl mx-auto space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>1. 収集する情報</CardTitle>
          </CardHeader>
          <CardContent>
            <p>当サイト（Void Pulse）では、アカウント作成時に以下の情報を収集します：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>メールアドレス</li>
              <li>ユーザー名</li>
              <li>パスワード（暗号化して保存）</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>2. 情報の使用目的</CardTitle>
          </CardHeader>
          <CardContent>
            <p>収集した情報は以下の目的で使用されます：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>アカウント認証</li>
              <li>サービス提供</li>
              <li>ユーザーサポート</li>
              <li>サービス改善</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>3. 情報の保護</CardTitle>
          </CardHeader>
          <CardContent>
            <p>当サイトでは、ユーザーの個人情報を保護するために適切なセキュリティ対策を講じています。データは暗号化して保存され、アクセス権限は厳密に管理されています。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>4. 第三者への情報提供</CardTitle>
          </CardHeader>
          <CardContent>
            <p>法律で定められた場合を除き、ユーザーの同意なしに第三者へ個人情報を提供することはありません。ただし、サービス運営に必要な範囲内で、信頼できる第三者のサービスプロバイダーと情報を共有する場合があります。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>5. ユーザーの権利</CardTitle>
          </CardHeader>
          <CardContent>
            <p>ユーザーは以下の権利を有しています：</p>
            <ul className="list-disc pl-6 mt-2">
              <li>個人情報へのアクセス</li>
              <li>個人情報の修正</li>
              <li>個人情報の削除（アカウント削除）</li>
              <li>データポータビリティ（自身のデータの出力）</li>
            </ul>
            <p className="mt-2">これらの権利行使については、設定画面から行うか、サポートにお問い合わせください。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>6. クッキーの使用</CardTitle>
          </CardHeader>
          <CardContent>
            <p>当サイトでは、ユーザーエクスペリエンスの向上とサービスの最適化のためにクッキーを使用しています。クッキーはブラウザの設定で無効にすることができますが、一部の機能が制限される可能性があります。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>7. プライバシーポリシーの変更</CardTitle>
          </CardHeader>
          <CardContent>
            <p>本プライバシーポリシーは予告なく変更される場合があります。変更後のポリシーは当ページで公開され、重要な変更がある場合はユーザーに通知します。定期的に本ページをご確認ください。</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>8. お問い合わせ</CardTitle>
          </CardHeader>
          <CardContent>
            <p>プライバシーポリシーに関するご質問やお問い合わせは、以下の連絡先までお願いいたします：</p>
            <p className="mt-2">メール: privacy@voidpulse.com</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default PrivacyPolicy
