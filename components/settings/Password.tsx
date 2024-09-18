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
import { Loader2, EyeOffIcon, EyeIcon } from "lucide-react"
import { PasswordSchema } from "@/schemas"
import { setPassword } from "@/actions/auth"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import FormError from "@/components/auth/FormError"

const Password = () => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [passwordVisibility1, setPasswordVisibility1] = useState(false)
  const [passwordVisibility2, setPasswordVisibility2] = useState(false)
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof PasswordSchema>>({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  })

  const onSubmit = (values: z.infer<typeof PasswordSchema>) => {
    setError("")
    startTransition(async () => {
      try {
        const res = await setPassword(values)
        if (res?.error) {
          setError(res.error)
          return
        }
        toast.success("パスワードを変更しました")
        form.reset()
        router.refresh()
      } catch (error) {
        console.error(error)
        setError("エラーが発生しました")
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl text-center mb-8">パスワード変更</h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">新しいパスワード</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={passwordVisibility1 ? "text" : "password"}
                      placeholder="********"
                      {...field}
                      disabled={isPending}
                      className="border rounded-lg p-3"
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center p-3 cursor-pointer"
                      onClick={() => setPasswordVisibility1(!passwordVisibility1)}
                    >
                      {passwordVisibility1 ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </div>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">確認用パスワード</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type={passwordVisibility2 ? "text" : "password"}
                      placeholder="********"
                      {...field}
                      disabled={isPending}
                      className="border rounded-lg p-3"
                    />
                    <div
                      className="absolute inset-y-0 right-0 flex items-center p-3 cursor-pointer"
                      onClick={() => setPasswordVisibility2(!passwordVisibility2)}
                    >
                      {passwordVisibility2 ? <EyeOffIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                    </div>
                  </div>
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
              変更
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Password
