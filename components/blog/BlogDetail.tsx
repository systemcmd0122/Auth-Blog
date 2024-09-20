"use client"

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BlogType } from "@/types";
import { format } from "date-fns";
import { FilePenLine, Loader2, Trash2, Calendar, User, Bookmark, BookmarkCheck, Info } from "lucide-react"; // Info icon imported here
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

  const renderFormattedContent = (content: string) => {
    const parts = content.split(/(\`\`\`.*?\`\`\`|\*\*.*?\*\*|__.*?__|==.*?==|\[.*?\]\(.*?\))/);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        return (
          <div key={index} className="relative bg-gray-100 p-4 rounded-md my-2 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words">{code}</pre>
          </div>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="break-words">{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('__') && part.endsWith('__')) {
        return <u key={index} className="break-words">{part.slice(2, -2)}</u>;
      } else if (part.startsWith('==') && part.endsWith('==')) {
        return <mark key={index} className="break-words">{part.slice(2, -2)}</mark>;
      } else if (part.match(/\[.*?\]\(.*?\)/)) {
        const [text, url] = part.slice(1, -1).split("](");
        return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline break-words">{text}</a>;
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
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative aspect-video">
          <Image
            src={blog.image_url || "/noImage.png"}
            alt="Blog cover"
            layout="fill"
            objectFit="cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h1 className="text-3xl font-bold mb-2">{blog.title}</h1>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{format(new Date(blog.updated_at), "yyyy/MM/dd HH:mm")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{blog.profiles.name}</span>
              </div>
            </div>
          </div>
        </div>
        <div className="p-6">
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap break-words">{renderFormattedContent(blog.content)}</div>
          </div>

          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center space-x-3">
              {isMyBlog && (
                <>
                  <Link href={`/blog/${blog.id}/edit`}>
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className="bg-blue-500 text-white px-4 py-2 rounded-full flex items-center space-x-2"
                    >
                      <FilePenLine className="w-4 h-4" />
                      <span>編集</span>
                    </motion.button>
                  </Link>
                  <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    className="bg-red-500 text-white px-4 py-2 rounded-full flex items-center space-x-2"
                    onClick={handleDelete}
                    disabled={isPending}
                  >
                    {isPending ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Trash2 className="w-4 h-4" />
                    )}
                    <span>削除</span>
                  </motion.button>
                </>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className={`${isBookmarked ? 'bg-yellow-500' : 'bg-gray-500'} text-white px-4 py-2 rounded-full flex items-center space-x-2`}
              onClick={toggleBookmark}
            >
              {isBookmarked ? (
                <BookmarkCheck className="w-4 h-4" />
              ) : (
                <Bookmark className="w-4 h-4" />
              )}
              <span>{isBookmarked ? 'ブックマーク済み' : 'ブックマーク'}</span>
            </motion.button>
          </div>

          <FormError message={error} />
        </div>
      </div>

      <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
        <div className="flex items-center space-x-4">
          <Image
            src={blog.profiles.avatar_url || "/noImage.png"}
            alt="Author avatar"
            width={64}
            height={64}
            className="rounded-full"
          />
          <div>
            <h2 className="text-xl font-bold">{blog.profiles.name}</h2>
            <p className="text-gray-600">{blog.profiles.introduce || "自己紹介はありません"}</p>
          </div>
        </div>
      </div>

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
        </ul>
      </div>
    </motion.div>
  );
};

export default BlogDetail;
