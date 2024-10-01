'use client'

import React, { useState, useTransition, useCallback } from "react"
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
import { Camera, User, FileText, CheckCircle } from "lucide-react"
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
    <div className="min-h-screen pt-6">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-600">
          プロフィール編集
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
                {imageList.length == 0 ? (
                  <button
                    className="w-40 h-40 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 flex items-center justify-center text-white overflow-hidden relative group transition-transform duration-200 ease-in-out hover:scale-105 active:scale-95"
                    onClick={(e) => {
                      e.preventDefault()
                      onImageUpload()
                    }}
                    {...dragProps}
                  >
                    <Camera size={40} className="z-10" />
                    <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-200" />
                  </button>
                ) : (
                  <div
                    className="w-40 h-40 relative rounded-full overflow-hidden border-4 border-indigo-500 group transition-transform duration-200 ease-in-out hover:scale-105"
                  >
                    <Image
                      fill
                      src={imageList[0].dataURL || "/default.png"}
                      alt="avatar"
                      className="object-cover"
                      priority
                      sizes="(max-width: 768px) 160px, 200px"
                    />
                    <div
                      className="absolute inset-0 bg-black opacity-0 flex items-center justify-center transition-opacity duration-200 group-hover:opacity-70"
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
                    </div>
                  </div>
                )}
              </div>
            )}
          </ImageUploading>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
                      className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                      rows={8}
                      {...field}
                      disabled={isPending}
                      className="border-2 border-indigo-200 focus:border-indigo-500 focus:ring-indigo-500 text-lg py-3"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="space-y-4 w-full">
              {error && <FormError message={error} />}

              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isPending}
              >
                {isPending ? (
                  <span className="animate-spin">&#8987;</span>
                ) : isSuccess ? (
                  <CheckCircle className="text-green-400" size={24} />
                ) : (
                  <span>変更を保存</span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}

export default Profile
