'use client'

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BlogType } from "@/types";
import { User } from "@supabase/auth-helpers-nextjs";
import { format } from "date-fns";
import { FilePenLine, Loader2, Trash2, Calendar, UserIcon, Bookmark, BookmarkCheck, Copy, Check } from "lucide-react";
import { deleteBlog } from "@/actions/blog";
import FormError from "@/components/auth/FormError";
import Image from "next/image";
import Link from "next/link";
import toast from "react-hot-toast";
import { motion } from "framer-motion";
import Comments from "@/components/blog/Comments";

interface BlogDetailProps {
  blog: BlogType & {
    profiles: {
      name: string;
      avatar_url: string | null;
      introduce: string | null;
    };
  };
  isMyBlog: boolean;
  currentUser: User | null;
}

const BlogDetail: React.FC<BlogDetailProps> = ({ blog, isMyBlog, currentUser }) => {
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
    const parts = content.split(/(\`\`\`[\s\S]*?\`\`\`|\*\*[\s\S]*?\*\*|__[\s\S]*?__|==[\s\S]*?==|\[[\s\S]*?\]\([\s\S]*?\)|<color:#[0-9A-Fa-f]{6}>[\s\S]*?<\/color>|<size:[\s\S]*?>[\s\S]*?<\/size>|~~[\s\S]*?~~)/);
    return parts.map((part, index) => {
      if (part.startsWith('```') && part.endsWith('```')) {
        const code = part.slice(3, -3);
        return (
          <div key={index} className="relative bg-gray-800 text-white p-4 rounded-md my-4 overflow-x-auto">
            <pre className="whitespace-pre-wrap break-words text-sm">{code}</pre>
            <button
              onClick={() => copyToClipboard(code, index)}
              className="absolute top-2 right-2 p-2 bg-gray-700 rounded-md hover:bg-gray-600 transition-colors"
            >
              {copiedIndex === index ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>
        );
      } else if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      } else if (part.startsWith('__') && part.endsWith('__')) {
        return <span key={index} className="border-b-2 border-gray-500">{part.slice(2, -2)}</span>;
      } else if (part.startsWith('==') && part.endsWith('==')) {
        return <mark key={index} className="bg-yellow-200 px-1 rounded">{part.slice(2, -2)}</mark>;
      } else if (part.match(/\[[\s\S]*?\]\([\s\S]*?\)/)) {
        const [text, url] = part.slice(1, -1).split("](");
        return <a key={index} href={url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline">{text}</a>;
      } else if (part.startsWith('<color:#') && part.endsWith('</color>')) {
        const [color, text] = part.slice(7, -8).split('>');
        return <span key={index} style={{ color }}>{text}</span>;
      } else if (part.startsWith('<size:') && part.endsWith('</size>')) {
        const [size, text] = part.slice(6, -7).split('>');
        return <span key={index} style={{ fontSize: size }}>{text}</span>;
      } else if (part.startsWith('~~') && part.endsWith('~~')) {
        return <del key={index} className="line-through">{part.slice(2, -2)}</del>;
      }
      return <span key={index}>{part}</span>;
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
                <UserIcon className="w-4 h-4" />
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

      <Comments blogId={blog.id} currentUser={currentUser} />
    </motion.div>
  );
};

export default BlogDetail;
