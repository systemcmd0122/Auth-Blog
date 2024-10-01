'use client'

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, Mail, ArrowRight } from "lucide-react";

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
import { EmailSchema } from "@/schemas";
import { updateEmail } from "@/actions/user";

interface EmailProps {
  email: string;
}

const Email = ({ email }: EmailProps) => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const form = useForm<z.infer<typeof EmailSchema>>({
    resolver: zodResolver(EmailSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (values: z.infer<typeof EmailSchema>) => {
    setError("");

    startTransition(async () => {
      try {
        const res = await updateEmail({
          ...values,
        });

        if (res?.error) {
          setError(res.error);
          return;
        }

        toast.success(
          "メールアドレス変更に必要なURLを記載したメールを送信しました",
          {
            icon: "✉️",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );
        router.push("/email/success");
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
      className="min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8"
    >
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-2xl">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.5 }}
        >
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            メールアドレス変更
          </h2>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="mb-6 p-4 bg-gray-100 rounded-lg"
        >
          <h3 className="text-sm font-semibold mb-2">現在のメールアドレス</h3>
          <div className="flex items-center space-x-2">
            <Mail className="w-5 h-5 text-indigo-500" />
            <span>{email}</span>
          </div>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <Mail className="mr-2 text-indigo-600" size={20} />
                    新しいメールアドレス
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="example@example.com"
                      {...field}
                      disabled={isPending}
                      className="border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 rounded-lg"
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <AnimatePresence>
              {error && (
                <motion.p
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="text-red-500 text-center"
                >
                  {error}
                </motion.p>
              )}
            </AnimatePresence>

            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-lg font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
                disabled={isPending}
              >
                {isPending ? (
                  <Loader2 className="w-6 h-6 animate-spin" />
                ) : (
                  <div className="flex items-center justify-center space-x-2">
                    <span>変更リクエストを送信</span>
                    <ArrowRight className="w-5 h-5" />
                  </div>
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default Email;
