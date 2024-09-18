'use client'

import { useState, useTransition } from "react"
import { z } from "zod"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { motion } from "framer-motion"
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
        const res = await setPassword({
          ...values,
        })

        if (res?.error) {
          setError(res.error)
          return
        }

        toast.success("パスワードを変更しました")
        router.push("/password/success")
        router.refresh()
      } catch (error) {
        console.error(error)
        setError("エラーが発生しました")
      }
    })
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-[500px] p-8 rounded-xl border bg-white shadow-lg"
    >
      <h2 className="text-primary text-2xl font-bold text-center border-b border-gray-200 pb-5 mb-6">
        パスワード設定
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">新しいパスワード</FormLabel>
                <FormControl>
                  <div className="relative mt-1">
                    <Input
                      type={passwordVisibility1 ? "text" : "password"}
                      placeholder="********"
                      {...field}
                      disabled={isPending}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setPasswordVisibility1(!passwordVisibility1)}
                    >
                      {passwordVisibility1 ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="confirmation"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">確認用パスワード</FormLabel>
                <FormControl>
                  <div className="relative mt-1">
                    <Input
                      type={passwordVisibility2 ? "text" : "password"}
                      placeholder="********"
                      {...field}
                      disabled={isPending}
                      className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                    />
                    <button
                      type="button"
                      className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setPasswordVisibility2(!passwordVisibility2)}
                    >
                      {passwordVisibility2 ? (
                        <EyeOffIcon className="w-5 h-5" />
                      ) : (
                        <EyeIcon className="w-5 h-5" />
                      )}
                    </button>
                  </div>
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <div className="space-y-4 w-full">
            <FormError message={error} />
            <Button
              type="submit"
              className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="animate-spin mr-2 h-4 w-4" />
              ) : null}
              <span>パスワードを変更</span>
            </Button>
          </div>
        </form>
      </Form>
    </motion.div>
  )
}

export default Password