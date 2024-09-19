"use client"

import React, { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { BlogType } from "@/types";
import { format } from "date-fns";
import { FilePenLine, Loader2, Trash2, Calendar, User } from "lucide-react";
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
            <div className="whitespace-pre-wrap">{blog.content}</div>
          </div>

          {isMyBlog && (
            <div className="flex items-center justify-end space-x-3 mt-6">
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
            </div>
          )}

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
    </motion.div>
  );
};

export default BlogDetail;