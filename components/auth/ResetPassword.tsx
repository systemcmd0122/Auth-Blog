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
import { Loader2 } from "lucide-react"
import { ResetPasswordSchema } from "@/schemas"
import { resetPassword } from "@/actions/auth"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import FormError from "@/components/auth/FormError"

const ResetPassword = () => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof ResetPasswordSchema>>({
    resolver: zodResolver(ResetPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (values: z.infer<typeof ResetPasswordSchema>) => {
    setError("")

    startTransition(async () => {
      try {
        const res = await resetPassword({
          ...values,
        })

        if (res?.error) {
          setError(res.error)
          return
        }

        toast.success("パスワード再設定用のメールを送信しました")
        router.push("/reset-password/success")
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
        パスワード再設定
      </h2>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold text-gray-700">メールアドレス</FormLabel>
                <FormControl>
                  <Input
                    placeholder="example@fullstackchannel.com"
                    {...field}
                    disabled={isPending}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
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
              <span>パスワード再設定メールを送信</span>
            </Button>
          </div>
        </form>
      </Form>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5, duration: 0.5 }}
        className="mt-6 text-center text-sm text-gray-600"
      >
        パスワード再設定用のメールをお送りします。メールに記載されたリンクからパスワードの再設定を行ってください。
      </motion.p>
    </motion.div>
  )
}

export default ResetPassword