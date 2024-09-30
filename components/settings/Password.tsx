"use client"

import React, { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, EyeOffIcon, EyeIcon, CheckCircle } from "lucide-react";

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
    <div className="min-h-screen bg-gray-100 pt-20 pb-10 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 sm:p-8"
      >
        <h2 className="text-3xl font-bold text-center mb-8 text-gradient">
          パスワード変更
        </h2>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-lg font-semibold">
                    新しいパスワード
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisibility1 ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        disabled={isPending}
                        className="pr-10 border-2 border-gray-300 focus:border-blue-500 transition-all duration-300"
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
                  <FormLabel className="text-lg font-semibold">
                    パスワードの確認
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type={passwordVisibility2 ? "text" : "password"}
                        placeholder="********"
                        {...field}
                        disabled={isPending}
                        className="pr-10 border-2 border-gray-300 focus:border-blue-500 transition-all duration-300"
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

          {error && (
            <motion.p
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-red-500 text-center"
            >
              {error}
            </motion.p>
          )}

          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white font-bold rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
              disabled={isPending}
            >
              {isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isSuccess ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                "パスワードを変更"
              )}
            </Button>
          </motion.div>
        </form>
      </Form>
    </motion.div>
  );
};

export default Password;
