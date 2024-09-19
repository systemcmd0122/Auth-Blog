'use client'

import React, { useState, useTransition } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
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
import { Loader2, Camera, User, FileText, CheckCircle } from "lucide-react"
import { ProfileSchema } from "@/schemas"
import { updateProfile } from "@/actions/user"
import { useRouter } from "next/navigation"
import { ProfileType } from "@/types"
import ImageUploading, { ImageListType } from "react-images-uploading"
import toast, { Toaster } from "react-hot-toast"
import Image from "next/image"
import FormError from "@/components/auth/FormError"
import { motion, AnimatePresence } from "framer-motion"

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

  const onSubmit = async (values: z.infer<typeof ProfileSchema>) => {
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
  }

  const onChangeImage = (imageList: ImageListType) => {
    const file = imageList[0]?.file
    const maxFileSize = 2 * 1024 * 1024

    if (file && file.size > maxFileSize) {
      setError("ファイルサイズは2MBを超えることはできません")
      return
    }

    setImageUpload(imageList)
  }

  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        damping: 20,
        stiffness: 100,
        when: "beforeChildren",
        staggerChildren: 0.2,
      },
    },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    },
  }

  return (
    <motion.div
      className="min-h-screen bg-white flex items-center justify-center p-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster position="top-center" reverseOrder={false} />
      <motion.div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8"
        variants={itemVariants}
      >
        <h1 className="text-4xl font-bold text-center mb-10 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          プロフィール
        </h1>

        <div className="mb-8">
          <ImageUploading
            value={imageUpload}
            onChange={onChangeImage}
            maxNumber={1}
            acceptType={["jpg", "png", "jpeg"]}
          >
            {({ imageList, onImageUpload, onImageUpdate, dragProps }) => (
              <div className="flex flex-col items-center justify-center">
                <AnimatePresence>
                  {imageList.length == 0 ? (
                    <motion.button
                      key="upload-button"
                      className="w-48 h-48 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden relative group"
                      onClick={(e) => {
                        e.preventDefault()
                        onImageUpload()
                      }}
                      {...dragProps}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Camera size={48} className="z-10" />
                      <motion.div
                        className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30"
                        initial={false}
                        animate={{ opacity: 0 }}
                        whileHover={{ opacity: 0.3 }}
                        transition={{ duration: 0.3 }}
                      />
                    </motion.button>
                  ) : (
                    <motion.div
                      key="avatar"
                      className="w-48 h-48 relative rounded-full overflow-hidden border-4 border-indigo-500 group"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 500, damping: 30 }}
                    >
                      <Image
                        fill
                        src={imageList[0].dataURL || "/default.png"}
                        alt="avatar"
                        className="object-cover"
                        priority
                        sizes="192px"
                      />
                      <motion.div
                        className="absolute inset-0 bg-black opacity-0 flex items-center justify-center"
                        initial={false}
                        whileHover={{ opacity: 0.7 }}
                        transition={{ duration: 0.3 }}
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
                </AnimatePresence>
              </div>
            )}
          </ImageUploading>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center text-indigo-600">
                      <User className="mr-2" /> 名前
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder="田中太郎"
                        {...field}
                        disabled={isPending}
                        className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <FormField
                control={form.control}
                name="introduce"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-bold flex items-center text-indigo-600">
                      <FileText className="mr-2" /> 自己紹介
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="よろしくお願いします。"
                        rows={5}
                        {...field}
                        disabled={isPending}
                        className="border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </motion.div>

            <motion.div
              className="space-y-4 w-full"
              variants={itemVariants}
            >
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

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="animate-spin" />
                ) : isSuccess ? (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  >
                    <CheckCircle className="text-green-400" />
                  </motion.div>
                ) : (
                  <motion.span
                    initial={{ scale: 1 }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    変更
                  </motion.span>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </motion.div>
    </motion.div>
  )
}

export default Profile