'use client'

import React, { useState, useEffect } from 'react';
import { BlogType } from "@/types";
import { format } from "date-fns";
import Image from "next/image";
import Link from "next/link";
import { CalendarDays, User, ArrowRight, Search } from "lucide-react";
import { motion, AnimatePresence } from 'framer-motion';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogItemProps {
  blogs: (BlogType & {
    profiles: {
      name: string;
      avatar_url: string;
    };
  })[];
}

const BlogItem: React.FC<BlogItemProps> = ({ blogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  useEffect(() => {
    let results = blogs;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Sort blogs
    results.sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredBlogs(results);
  }, [searchTerm, sortOrder, blogs]);

  const toggleSortOrder = () => {
    setSortOrder(prevOrder => prevOrder === 'latest' ? 'oldest' : 'latest');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6 space-y-4">
        <div className="flex items-center space-x-2">
          <Search className="text-gray-400" />
          <Input
            type="text"
            placeholder="記事を検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
        </div>
        <div className="flex justify-end">
          <Button onClick={toggleSortOrder} variant="outline">
            {sortOrder === 'latest' ? '最新順' : '古い順'}
          </Button>
        </div>
      </div>
      <AnimatePresence>
        {filteredBlogs.map((blog) => (
          <motion.div
            key={blog.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="mb-6 bg-white rounded-lg shadow-lg overflow-hidden transition-all duration-300 hover:shadow-xl"
          >
            <Link href={`/blog/${blog.id}`} className="block">
              <div className="relative aspect-video">
                <Image
                  src={blog.image_url || "/noImage.png"}
                  alt={blog.title}
                  layout="fill"
                  objectFit="cover"
                  className="transition-transform duration-300 ease-in-out group-hover:scale-105"
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
                href={`/blog/${blog.id}`}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-200"
              >
                Read more
                <ArrowRight className="w-4 h-4 ml-1" />
              </Link>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BlogItem;
