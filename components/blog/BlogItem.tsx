'use client'

import React from 'react';
import { BlogType } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User, ArrowRight } from "lucide-react";
import { motion } from 'framer-motion';

interface BlogItemProps {
  blog: BlogType & {
    profiles: {
      name: string;
      avatar_url: string;
    };
  };
}

const BlogItem: React.FC<BlogItemProps> = ({ blog }) => {
  return (
    <motion.div
      className="bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
    >
      <Link href={`blog/${blog.id}`} className="block">
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={blog.image_url || "/noImage.png"}
            className="object-cover transition-transform duration-300 ease-in-out hover:scale-105"
            alt="image"
            layout="fill"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl font-bold mb-2 line-clamp-2">{blog.title}</h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CalendarDays className="w-4 h-4" />
                <span>{format(new Date(blog.updated_at), "MMM d, yyyy")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{blog.profiles.name}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>

      <div className="p-4">
        <p className="text-gray-600 mb-4 line-clamp-3">{blog.content}</p>
        <Link
          href={`blog/${blog.id}`}
          className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
        >
          Read more
          <ArrowRight className="w-4 h-4 ml-1" />
        </Link>
      </div>
    </motion.div>
  );
};

export default BlogItem;
