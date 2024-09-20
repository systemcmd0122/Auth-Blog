"use client"

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BlogType } from "@/types";
import { format } from "date-fns";
import { FilePenLine, Loader2, Trash2, Calendar, User, Bookmark, BookmarkCheck, Info, Copy, Check } from "lucide-react";
import { deleteBlog } from "@/actions/blog";
import FormError from "@/components/auth/FormError";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";

interface BlogDetailProps {
  blog: BlogType & {
    profiles: {
      name: string;
      avatar_url: string | null;
      introduce: string | null;
    };
  };
  isMyBlog: boolean;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blog, isMyBlog }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const handleDelete = async () => {
    if (!window.confirm("本当に削除しますか？")) {
      return;
    }

    setError("");

    startTransition(async () => {
      try {
        const res = await deleteBlog({
          blogId: blog.id,
          imageUrl: blog.image_url,
          userId: blog.user_id,
        });

        if (res?.error) {
          setError(res.error);
          return;
        }

        toast.success("ブログを削除しました");
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error(error);
        setError("エラーが発生しました");
      }
    });
  };

  const toggleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    if (!isBookmarked) {
      toast.success("ブログをブックマークしました");
    } else {
      toast.success("ブックマークを解除しました");
    }
    // ここで実際のブックマーク処理を実装する（例：APIリクエストなど）
  };

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`|\*\*.*?\*\*|__.*?__|==.*?==|\[.*?\]\(.*?\)|~~.*?~~|\*.*?\*|_.*?_|\^.*?\^|\{\{.*?\}\}|\@\[.*?\]|\{color:.*?\}.*?\{\/color\})/);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        return (
          <div key={index} className="relative bg-gray-100 p-4 rounded-md my-2 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words">{code}</pre>
            <button
              onClick={() => copyToClipboard(code, index)}
              className="absolute top-2 right-2 bg-white p-1 rounded-md shadow-sm"
            >
              {copiedIndex === index ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="break-words">{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={index} className="break-words">{part.slice(2, -2)}</u>;
      } else if (part.startsWith('==') && part.endsWith('==')) {
        return <mark key={index} className="break-words bg-yellow-200">{part.slice(2, -2)}</mark>;
      } else if (part.match(/\[.*?\]\(.*?\)/)) {
        const [text, url] = part.slice(1, -1).split("](");
        return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">{text}</a>;
      } else if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={index} className="break-words">{part.slice(2, -2)}</del>;
      } else if (part.startsWith('*') && part.endsWith('*') && !part.startsWith('**')) {
        return <em key={index} className="break-words">{part.slice(1, -1)}</em>;
      } else if (part.startsWith('_') && part.endsWith('_') && !part.startsWith('__')) {
        return <em key={index} className="break-words">{part.slice(1, -1)}</em>;
      } else if (part.startsWith('^') && part.endsWith('^')) {
        return <sup key={index} className="break-words">{part.slice(1, -1)}</sup>;
      } else if (part.startsWith('{{') && part.endsWith('}}')) {
        return <span key={index} className="break-words bg-gray-200 p-1 rounded">{part.slice(2, -2)}</span>;
      } else if (part.startsWith('@[') && part.endsWith(']')) {
        return <span key={index} className="break-words bg-blue-100 text-blue-800 px-2 py-1 rounded-full">{part.slice(2, -1)}</span>;
      } else if (part.startsWith('{color:') && part.endsWith('{/color}')) {
        const [colorPart, textPart] = part.split('}');
        const color = colorPart.split(':')[1];
        const text = textPart.slice(0, -8); // Remove {/color}
        return <span key={index} style={{color: color}} className="break-words">{text}</span>;
      }
      return <span key={index} className="break-words">{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-4xl mx-auto px-4 py-8"
    >
      {/* ... (前半部分は変更なし) ... */}

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <h3 className="text-xl font-bold mb-4 flex items-center">
          <Info className="mr-2" />
          テキスト装飾ガイド
        </h3>
        <ul className="list-disc list-inside space-y-2">
          <li><code>```code```</code> - コードブロック（コピー可能）</li>
          <li><code>**text**</code> - 太字</li>
          <li><code>__text__</code> - 下線</li>
          <li><code>==text==</code> - ハイライト</li>
          <li><code>[リンクテキスト](URL)</code> - ハイパーリンク</li>
          <li><code>~~text~~</code> - 取り消し線</li>
          <li><code>*text*</code> または <code>_text_</code> - イタリック体</li>
          <li><code>^text^</code> - 上付き文字</li>
          <li><code>{{text}}</code> - グレーの背景</li>
          <li><code>@[text]</code> - タグスタイル</li>
          <li><code>{'{color:カラーコード}テキスト{/color}'}</code> - カスタム色のテキスト（例: {'{color:#ff0000}赤いテキスト{/color}'}）</li>
        </ul>
      </div>
    </motion.div>
  );
};

export default BlogDetail;
