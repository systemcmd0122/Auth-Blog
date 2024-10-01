'use client'

import React, { useState, useTransition, useCallback } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion, AnimatePresence } from "framer-motion"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Camera, User, FileText, CheckCircle, Loader2 } from "lucide-react"
import { ProfileSchema } from "@/schemas"
import { updateProfile } from "@/actions/user"
import { useRouter } from "next/navigation"
import { ProfileType } from "@/types"
import ImageUploading, { ImageListType } from "react-images-uploading"
import toast from "react-hot-toast"
import Image from "next/image"
import FormError from "@/components/auth/FormError"

interface ProfileProps {
  profile: ProfileType
}

const Profile: React.FC<ProfileProps> = ({ profile }) => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    {
      dataURL: profile.avatar_url || "/default.png",
    },
  ])
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: profile.name || "",
      introduce: profile.introduce || "",
    },
  })

  const onSubmit = useCallback(async (values: z.infer<typeof ProfileSchema>) => {
    setError("")
    setIsSuccess(false)

    let base64Image: string | undefined

    startTransition(async () => {
      try {
        if (
          imageUpload[0].dataURL &&
          imageUpload[0].dataURL.startsWith("data:image")
        ) {
          base64Image = imageUpload[0].dataURL
        }

        const res = await updateProfile({
          ...values,
          profile,
          base64Image,
        })

        if (res?.error) {
          setError(res.error)
          return
        }

        setIsSuccess(true)
        toast.success("プロフィールを更新しました！", {
          icon: '🎉',
          style: {
            borderRadius: '10px',
            background: '#333',
            color: '#fff',
          },
        })
        router.refresh()
      } catch (error) {
        console.error(error)
        setError("エラーが発生しました")
      }
    })
  }, [imageUpload, profile, router])

  const onChangeImage = useCallback((imageList: ImageListType) => {
    const file = imageList[0]?.file
    const maxFileSize = 2 * 1024 * 1024

    if (file && file.size > maxFileSize) {
      setError("ファイルサイズは2MBを超えることはできません")
      return
    }

    setImageUpload(imageList)
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen pt-6 px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          プロフィール編集
        </h1>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.3 }}
          className="mb-8"
        >
          <ImageUploading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={["jpg", "png", "jpeg"]}
          >
            {({ imageList, onImageUpload, onImageUpdate, dragProps }) => (
              <div className="flex flex-col items-center justify-center">
                {imageList.length === 0 ? (
                  <motion.button
                    className="w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden relative group transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
                    onClick={(e) => {
                      e.preventDefault()
                      onImageUpload()
                    }}
                    {...dragProps}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Camera size={32} className="z-10" />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                  </motion.button>
                ) : (
                  <motion.div
                    className="w-32 h-32 sm:w-40 sm:h-40 relative rounded-full overflow-hidden border-4 border-indigo-500 group transition-transform duration-200 ease-in-out hover:scale-105"
                    whileHover={{ scale: 1.05 }}
                  >
                    <Image
                      fill
                      src={imageList[0].dataURL || "/default.png"}
                      alt="avatar"
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 128px, 160px"
                    />
                    <motion.div
                      className="absolute inset-0 bg-black opacity-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-70"
                      initial={{ opacity: 0 }}
                      whileHover={{ opacity: 0.7 }}
                    >
                      <Button
                        variant="ghost"
                        onClick={(e) => {
                          e.preventDefault()
                          onImageUpdate(0)
                        }}
                        className="text-white hover:text-indigo-200"
                      >
                        画像を変更
                      </Button>
                    </motion.div>
                  </motion.div>
                )}
              </div>
            )}
          </ImageUploading>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.3 }}
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold flex items-center text-indigo-600">
                      <User className="mr-2" size={24} /> 名前
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="田中太郎"
                        {...field}
                        disabled={isPending}
                        className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4, duration: 0.3 }}
            >
              <FormField
                control={form.control}
                name="introduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-bold flex items-center text-indigo-600">
                      <FileText className="mr-2" size={24} /> 自己紹介
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="よろしくお願いします。"
                        rows={6}
                        {...field}
                        disabled={isPending}
                        className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3 rounded-lg"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <div className="space-y-4 w-full">
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.3 }}
                  >
                    <FormError message={error} />
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button
                  type="submit"
                  className="w-full py-4 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                  disabled={isPending}
                >
                  {isPending ? (
                    <Loader2 className="w-6 h-6 animate-spin" />
                  ) : isSuccess ? (
                    <CheckCircle className="text-green-400" size={24} />
                  ) : (
                    <span>変更を保存</span>
                  )}
                </Button>
              </motion.div>
            </div>
          </form>
        </Form>
      </div>
    </motion.div>
  )
}

export default Profile
