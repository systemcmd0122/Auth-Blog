"use client"

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BlogType } from "@/types";
import BlogItem from './BlogItem';
import { Search, User, Filter, ChevronDown } from 'lucide-react';
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
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSortDropdownOpen, setIsSortDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const sortDropdownRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setIsUserDropdownOpen(false);
      }
      if (sortDropdownRef.current && !sortDropdownRef.current.contains(event.target as Node)) {
        setIsSortDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

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
          <div className="relative" ref={userDropdownRef}>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
            >
              <User className="w-4 h-4" />
              <span>{selectedUser || 'ユーザーで絞り込み'}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {isUserDropdownOpen && (
              <div className="absolute z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    onClick={() => {
                      setSelectedUser(null);
                      setIsUserDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                  >
                    すべてのユーザー
                  </button>
                  {users.map(user => (
                    <button
                      key={user}
                      onClick={() => {
                        setSelectedUser(user);
                        setIsUserDropdownOpen(false);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                      role="menuitem"
                    >
                      {user}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="relative" ref={sortDropdownRef}>
            <Button
              variant="outline"
              className="flex items-center space-x-2"
              onClick={() => setIsSortDropdownOpen(!isSortDropdownOpen)}
            >
              <Filter className="w-4 h-4" />
              <span>{sortOrder === 'latest' ? '最新順' : '古い順'}</span>
              <ChevronDown className="w-4 h-4" />
            </Button>
            {isSortDropdownOpen && (
              <div className="absolute right-0 z-10 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5">
                <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
                  <button
                    onClick={() => {
                      setSortOrder('latest');
                      setIsSortDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                  >
                    最新順
                  </button>
                  <button
                    onClick={() => {
                      setSortOrder('oldest');
                      setIsSortDropdownOpen(false);
                    }}
                    className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 w-full text-left"
                    role="menuitem"
                  >
                    古い順
                  </button>
                </div>
              </div>
            )}
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
