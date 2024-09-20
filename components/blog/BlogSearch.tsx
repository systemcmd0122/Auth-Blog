"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogType } from "@/types";
import BlogItem from './BlogItem';
import { Search, User, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface BlogSearchProps {
  blogs: (BlogType & {
    profiles: {
      name: string;
      avatar_url: string;
    };
  })[];
}

const BlogSearch: React.FC<BlogSearchProps> = ({ blogs }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredBlogs, setFilteredBlogs] = useState(blogs);
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'latest' | 'oldest'>('latest');

  // Extract unique users from blogs
  const users = Array.from(new Set(blogs.map(blog => blog.profiles.name)));

  useEffect(() => {
    let results = blogs;

    // Filter by search term
    if (searchTerm) {
      results = results.filter(blog =>
        blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        blog.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by selected user
    if (selectedUser) {
      results = results.filter(blog => blog.profiles.name === selectedUser);
    }

    // Sort blogs
    results.sort((a, b) => {
      const dateA = new Date(a.updated_at).getTime();
      const dateB = new Date(b.updated_at).getTime();
      return sortOrder === 'latest' ? dateB - dateA : dateA - dateB;
    });

    setFilteredBlogs(results);
  }, [searchTerm, selectedUser, sortOrder, blogs]);

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
        <div className="flex justify-between items-center">
          <select
            value={selectedUser || ''}
            onChange={(e) => setSelectedUser(e.target.value || null)}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="">すべてのユーザー</option>
            {users.map(user => (
              <option key={user} value={user}>{user}</option>
            ))}
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'latest' | 'oldest')}
            className="border border-gray-300 rounded-md px-3 py-2 bg-white"
          >
            <option value="latest">最新順</option>
            <option value="oldest">古い順</option>
          </select>
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
            className="mb-6"
          >
            <BlogItem blog={blog} />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default BlogSearch;
