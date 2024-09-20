"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogType } from "@/types";
import BlogItem from './BlogItem';
import { Search, User, Filter } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";

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
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0 md:space-x-4">
          <div className="w-full md:w-1/2">
            <Label htmlFor="user-filter" className="mb-2 block">ユーザーでフィルター</Label>
            <Select onValueChange={(value) => setSelectedUser(value || null)}>
              <SelectTrigger id="user-filter">
                <SelectValue placeholder="すべてのユーザー" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">すべてのユーザー</SelectItem>
                {users.map(user => (
                  <SelectItem key={user} value={user}>{user}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-full md:w-1/2">
            <Label htmlFor="sort-order" className="mb-2 block">並び替え</Label>
            <Select onValueChange={(value) => setSortOrder(value as 'latest' | 'oldest')}>
              <SelectTrigger id="sort-order">
                <SelectValue placeholder="並び替え" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">最新順</SelectItem>
                <SelectItem value="oldest">古い順</SelectItem>
              </SelectContent>
            </Select>
          </div>
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
