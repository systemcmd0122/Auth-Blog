"use client"

import React, { useState, useTransition } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react"; // Info icon imported here

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload } from "lucide-react";
import { BlogSchema } from "@/schemas";
import { newBlog } from "@/actions/blog";
import { useRouter } from "next/navigation";
import ImageUploading, { ImageListType } from "react-images-uploading";
import toast from "react-hot-toast";
import Image from "next/image";
import FormError from "@/components/auth/FormError";
import { motion } from "framer-motion";

interface BlogNewProps {
  userId: string;
}

const BlogNew: React.FC<BlogNewProps> = ({ userId }) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();
  const [imageUpload, setImageUpload] = useState<ImageListType>([]);

  const form = useForm<z.infer<typeof BlogSchema>>({
    resolver: zodResolver(BlogSchema),
    defaultValues: {
      title: "",
      content: "",
    },
  });

  const onSubmit = (values: z.infer<typeof BlogSchema>) => {
    setError("");

    let base64Image: string | undefined;

    startTransition(async () => {
      try {
        if (imageUpload.length) {
          base64Image = imageUpload[0].dataURL;
        }

        const res = await newBlog({
          ...values,
          base64Image,
          userId,
        });

        if (res?.error) {
          setError(res.error);
          return;
        }

        toast.success("ブログを投稿しました");
        router.push("/");
        router.refresh();
      } catch (error) {
        console.error(error);
        setError("エラーが発生しました");
      }
    });
  };

  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file;
    const maxFileSize = 2 * 1024 * 1024;

    if (file && file.size > maxFileSize) {
      setError("ファイルサイズは2MBを超えることはできません");
      return;
    }

    setImageUpload(imageList);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold text-center mb-8">新規ブログ投稿</h1>

      <div className="bg-white rounded-lg shadow-lg p-6">
        <div className="mb-6">
          <ImageUploading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={["jpg", "png", "jpeg"]}
          >
            {({ imageList, onImageUpload, onImageUpdate, dragProps }) => (
              <div className="space-y-4">
                {imageList.length === 0 ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onImageUpload}
                    className="w-full aspect-video border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors duration-200"
                    {...dragProps}
                  >
                    <Upload className="w-12 h-12 text-gray-400 mb-2" />
                    <p className="text-sm text-gray-500">
                      クリックまたはドラッグ＆ドロップで画像をアップロード
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      JPG, PNG, JPEG (最大2MB)
                    </p>
                  </motion.button>
                ) : (
                  <div className="relative">
                    <Image
                      src={imageList[0].dataURL || "/noImage.png"}
                      alt="Blog cover"
                      width={768}
                      height={432}
                      layout="responsive"
                      className="rounded-lg"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => onImageUpdate(0)}
                      className="absolute bottom-4 right-4 bg-white text-gray-800 px-4 py-2 rounded-full shadow-md hover:bg-gray-100 transition-colors duration-200"
                    >
                      画像を変更
                    </motion.button>
                  </div>
                )}
              </div>
            )}
          </ImageUploading>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">タイトル</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="ブログのタイトルを入力"
                      {...field}
                      disabled={isPending}
                      className="w-full p-2 border rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">内容</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="ブログの内容を入力"
                      rows={10}
                      {...field}
                      disabled={isPending}
                      className="w-full p-2 border rounded-md"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 w-full">
              <FormError message={error} />

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors duration-200"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-5 h-5 animate-spin mr-2" />
                ) : null}
                <span>投稿する</span>
              </Button>
            <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
              <h3 className="text-xl font-bold mb-4 flex items-center text-gray-800">
                <Info className="mr-2 text-blue-500" />
                テキスト装飾ガイド
              </h3>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">```code```</code> コードブロック（コピー可能）</li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">**text**</code> <strong className="font-bold">太字</strong></li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">__text__</code> <span className="border-b-2 border-gray-500">下線</span></li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">==text==</code> <mark className="bg-yellow-200 px-1 rounded">ハイライト</mark></li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">[リンク](URL)</code> <a href="#" className="text-blue-600 hover:text-blue-800 underline">ハイパーリンク</a></li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">&lt;color:#FF0000&gt;text&lt;/color&gt;</code> <span style={{ color: '#FF0000' }}>色付きテキスト</span></li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">&lt;size:20px&gt;text&lt;/size&gt;</code> <span style={{ fontSize: '20px' }}>サイズ変更</span></li>
                <li className="flex items-center"><code className="bg-gray-100 px-2 py-1 rounded mr-2">~~text~~</code> <del className="line-through">取り消し線</del></li>
              </ul>
              <div className="mt-4">
                <h4 className="font-semibold mb-2">カラーコード例：</h4>
                <div className="flex flex-wrap gap-2">
                  {['#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'].map((color) => (
                    <div key={color} className="flex items-center">
                      <div className="w-6 h-6 rounded mr-1" style={{ backgroundColor: color }}></div>
                      <code className="text-sm">{color}</code>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default BlogNew;
