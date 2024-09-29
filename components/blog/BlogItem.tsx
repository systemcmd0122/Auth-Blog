'use client'

import React from 'react';
import { BlogType } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User } from "lucide-react";

interface BlogItemProps {
  blog: BlogType;
  searchQuery?: string;
}

const BlogItem: React.FC<BlogItemProps> = ({ blog, searchQuery }) => {
  const highlightTitle = (title: string, query: string) => {
    if (!query) return title;
    const parts = title.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === query.toLowerCase() ? 
        <span key={index} className="bg-yellow-200">{part}</span> : part
    );
  };

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden transition-transform duration-200 ease-out hover:scale-105 hover:shadow-xl">
      <Link href={`blog/${blog.id}`} className="block">
        <div className="relative aspect-video">
          <Image
            src={blog.image_url || "/noImage.png"}
            alt="Blog cover"
            layout="fill"
            objectFit="cover"
            className="transition-transform duration-300 ease-in-out hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h2 className="text-xl font-bold mb-2 line-clamp-2">
              {highlightTitle(blog.title, searchQuery || '')}
            </h2>
            <div className="flex items-center space-x-4 text-sm">
              <div className="flex items-center space-x-1">
                <CalendarDays className="w-4 h-4" />
                <span>{format(new Date(blog.updated_at), "yyyy/MM/dd")}</span>
              </div>
              <div className="flex items-center space-x-1">
                <User className="w-4 h-4" />
                <span>{blog.profiles.name}</span>
              </div>
            </div>
          </div>
        </div>
      </Link>
    </div>
  );
};

export default BlogItem;
