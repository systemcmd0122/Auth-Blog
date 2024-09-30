import React from 'react';
import { Shield, Lock, Eye, Database, Trash2 } from 'lucide-react';

const PrivacyPolicy = () => {
  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center text-indigo-600">プライバシーポリシー</h1>
      
      <div className="space-y-8">
        <Section
          icon={<Shield className="w-8 h-8 text-indigo-600" />}
          title="1. 収集する情報"
          content="当サイトでは、ユーザー登録時にメールアドレスと名前を収集します。また、サイトの利用状況や投稿内容などの情報も収集することがあります。"
        />
        
        <Section
          icon={<Lock className="w-8 h-8 text-indigo-600" />}
          title="2. 情報の利用目的"
          content="収集した情報は、サービスの提供・改善、ユーザーサポート、および法令遵守のために使用されます。ユーザーの同意なしに、第三者に個人情報を提供することはありません。"
        />
        
        <Section
          icon={<Eye className="w-8 h-8 text-indigo-600" />}
          title="3. 情報の保護"
          content="ユーザーの個人情報は、適切な技術的・組織的措置を講じて保護されます。ただし、インターネット上での完全な安全性を保証することはできません。"
        />
        
        <Section
          icon={<Database className="w-8 h-8 text-indigo-600" />}
          title="4. クッキーとトラッキング"
          content="当サイトでは、ユーザーエクスペリエンスの向上のためにクッキーを使用することがあります。ブラウザの設定でクッキーを無効にすることも可能です。"
        />
        
        <Section
          icon={<Trash2 className="w-8 h-8 text-indigo-600" />}
          title="5. 情報の削除"
          content="ユーザーは自身の個人情報の削除を要求する権利を有します。アカウント削除の要請があった場合、関連する個人情報は適切に削除されます。"
        />
      </div>
      
      <p className="mt-8 text-sm text-gray-600 text-center">
        最終更新日: 2024年9月30日
      </p>
    </div>
  );
};

const Section = ({ icon, title, content }) => (
  <div className="bg-white shadow-md rounded-lg p-6">
    <div className="flex items-center mb-4">
      {icon}
      <h2 className="text-xl font-semibold ml-4">{title}</h2>
    </div>
    <p className="text-gray-700">{content}</p>
  </div>
);

export default PrivacyPolicy;
