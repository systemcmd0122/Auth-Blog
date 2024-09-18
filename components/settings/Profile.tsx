"use client"

import { useState, useTransition } from "react"
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
import { Loader2 } from "lucide-react"
import { ProfileSchema } from "@/schemas"
import { updateProfile } from "@/actions/user"
import { useRouter } from "next/navigation"
import ImageUploading, { ImageListType } from "react-images-uploading"
import toast from "react-hot-toast"
import Image from "next/image"
import FormError from "@/components/auth/FormError"

interface ProfileProps {
  profile: { name: string; introduce: string; avatar_url: string }
}

const Profile = ({ profile }: ProfileProps) => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()
  const [imageUpload, setImageUpload] = useState<ImageListType>([
    { dataURL: profile.avatar_url || "/default.png" },
  ])

  const form = useForm<z.infer<typeof ProfileSchema>>({
    resolver: zodResolver(ProfileSchema),
    defaultValues: {
      name: profile.name || "",
      introduce: profile.introduce || "",
    },
  })

  const onSubmit = (values: z.infer<typeof ProfileSchema>) => {
    setError("")
    let base64Image: string | undefined
    startTransition(async () => {
      try {
        if (imageUpload[0].dataURL?.startsWith("data:image")) {
          base64Image = imageUpload[0].dataURL
        }

        const res = await updateProfile({
          ...values,
          base64Image,
        })

        if (res?.error) {
          setError(res.error)
          return
        }

        toast.success("プロフィールを更新しました")
        router.refresh()
      } catch (error) {
        console.error(error)
        setError("エラーが発生しました")
      }
    })
  }

  const onChangeImage = (imageList: ImageListType) => {
    setImageUpload(imageList)
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl text-center mb-8">プロフィール編集</h2>

      <div className="mb-6">
        <ImageUploading
          value={imageUpload}
          onChange={onChangeImage}
          maxNumber={1}
          acceptType={["jpg", "png", "jpeg"]}
        >
          {({ imageList, onImageUpload }) => (
            <div className="text-center">
              {imageList.length > 0 ? (
                <div className="w-32 h-32 mx-auto relative mb-4">
                  <Image
                    fill
                    src={imageList[0].dataURL}
                    alt="プロフィール画像"
                    className="object-cover rounded-full"
                  />
                </div>
              ) : (
                <div className="w-32 h-32 mx-auto bg-gray-200 rounded-full"></div>
              )}
              <Button
                variant="outline"
                onClick={(e) => {
                  e.preventDefault()
                  onImageUpload()
                }}
                className="mt-4"
              >
                画像をアップロード
              </Button>
            </div>
          )}
        </ImageUploading>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">名前</FormLabel>
                <FormControl>
                  <Input {...field} disabled={isPending} className="border rounded-lg p-3" />
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
                <FormLabel className="font-semibold">自己紹介</FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={4}
                    disabled={isPending}
                    className="border rounded-lg p-3"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="space-y-4">
            <FormError message={error} />

            <Button
              type="submit"
              className="w-full py-3 rounded-lg font-bold bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-300"
              disabled={isPending}
            >
              {isPending && <Loader2 className="animate-spin mr-2" />}
              更新
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Profile
