"use client"

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, EyeOffIcon, EyeIcon, CheckCircle, Lock } from "lucide-react";

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
import { PasswordSchema } from "@/schemas";
import { setPassword } from "@/actions/auth";

const Password = () => {
  const router = useRouter();
  const [error, setError] = useState("");
  const [passwordVisibility1, setPasswordVisibility1] = useState(false);
  const [passwordVisibility2, setPasswordVisibility2] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    resolver: zodResolver(PasswordSchema),
    defaultValues: {
      password: "",
      confirmation: "",
    },
  });

  const onSubmit = (values: { password: string; confirmation: string; }) => {
    setError("");
    setIsSuccess(false);

    startTransition(async () => {
      try {
        const res = await setPassword({ ...values });

        if (res?.error) {
          setError(res.error);
          return;
        }

        setIsSuccess(true);
        toast.success("パスワードを変更しました", {
          icon: "🎉",
          style: {
            borderRadius: "10px",
            background: "#333",
            color: "#fff",
          },
        });
        form.reset();
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
            パスワード変更
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            新しいパスワードを入力してください
          </p>
        </motion.div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="mt-8 space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <Lock className="mr-2 text-indigo-600" size={20} />
                    新しいパスワード
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisibility1 ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        disabled={isPending}
                        className="pr-10 border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
                  <FormLabel className="text-lg font-semibold flex items-center">
                    <Lock className="mr-2 text-indigo-600" size={20} />
                    パスワードの確認
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisibility2 ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        disabled={isPending}
                        className="pr-10 border-2 border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 transition-all duration-300 rounded-lg"
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700 transition-colors duration-200"
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
                ) : isSuccess ? (
                  <CheckCircle className="w-6 h-6" />
                ) : (
                  "パスワードを変更"
                )}
              </Button>
            </motion.div>
          </form>
        </Form>
      </div>
    </motion.div>
  );
};

export default Password;
