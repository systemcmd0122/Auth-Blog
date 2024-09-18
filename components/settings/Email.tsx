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
import { Loader2 } from "lucide-react"
import { EmailSchema } from "@/schemas"
import { updateEmail } from "@/actions/user"
import { useRouter } from "next/navigation"
import toast from "react-hot-toast"
import FormError from "@/components/auth/FormError"

interface EmailProps {
  email: string
}

const Email = ({ email }: EmailProps) => {
  const router = useRouter()
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = (values: z.infer<typeof EmailSchema>) => {
    setError("")
    startTransition(async () => {
      try {
        const res = await updateEmail(values)
        if (res?.error) {
          setError(res.error)
          return
        }
        toast.success("メールアドレス変更に必要なURLを送信しました")
        router.push("/email/success")
        router.refresh()
      } catch (error) {
        console.error(error)
        setError("エラーが発生しました")
      }
    })
  }

  return (
    <div className="max-w-lg mx-auto p-8 bg-white rounded-lg shadow-md">
      <h2 className="font-bold text-2xl text-center mb-8">メールアドレス変更</h2>
      <div className="mb-6">
        <p className="text-sm font-semibold mb-2">現在のメールアドレス</p>
        <p className="text-gray-600">{email}</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="font-semibold">新しいメールアドレス</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="example@domain.com"
                    {...field}
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
              変更
            </Button>
          </div>
        </form>
      </Form>
    </div>
  )
}

export default Email
