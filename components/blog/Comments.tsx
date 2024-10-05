'use client'

import React, { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Send, Trash2, ChevronDown, ChevronUp, CornerDownRight, MessageCircle, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import Linkify from 'react-linkify';
import * as linkify from 'linkifyjs';
import { extract } from 'oembed-parser';
import ReactPlayer from 'react-player';
import Image from 'next/image';

interface CommentType {
  id: string;
  content: string;
  user_id: string;
  profile_id: string;
  created_at: string;
  updated_at: string;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface ProcessedCommentType extends CommentType {
  replies?: ProcessedCommentType[];
  replyTo?: string;
  level: number;
}

interface CommentsProps {
  blogId: string;
  currentUser: User | null;
}

interface LinkPreviewProps {
  url: string;
}

interface PreviewData {
  type?: string;
  url?: string;
  title?: string;
  description?: string;
}

const REPLY_PREFIX = '@reply:';
const REPLIES_THRESHOLD = 3;
const MAX_DEPTH = 5;

const LinkPreview: React.FC<LinkPreviewProps> = ({ url }) => {
  const [preview, setPreview] = useState<PreviewData | null>(null);

  useEffect(() => {
    const fetchPreview = async () => {
      try {
        const data = await extract(url);
        setPreview(data);
      } catch (error) {
        console.error('Error fetching link preview:', error);
      }
    };

    fetchPreview();
  }, [url]);

  if (!preview) return null;

  if (preview.type === 'photo') {
    return (
      <Image
        src={preview.url || ''}
        alt={preview.title || ''}
        width={300}
        height={200}
        className="max-w-full h-auto rounded-lg shadow-md"
      />
    );
  }

  if (preview.type === 'video' && ReactPlayer.canPlay(url)) {
    return <ReactPlayer url={url} width="100%" height="240px" controls />;
  }

  return (
    <div className="bg-gray-100 p-4 rounded-lg shadow-md">
      <h4 className="font-bold">{preview.title}</h4>
      <p className="text-sm text-gray-600">{preview.description}</p>
      <a href={url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
        {url} <ExternalLink className="inline w-4 h-4" />
      </a>
    </div>
  );
};

const Comments: React.FC<CommentsProps> = ({ blogId, currentUser }) => {
  const [comments, setComments] = useState<ProcessedCommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const supabase = createClient();

  const fetchComments = useCallback(async () => {
    const { data, error } = await supabase
      .from('comments')
      .select(`
        *,
        profiles (
          id,
          name,
          avatar_url
        )
      `)
      .eq('blog_id', blogId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching comments:', error);
      toast.error('コメントの取得に失敗しました。');
      return;
    }

    const processedComments = processComments(data as CommentType[]);
    setComments(processedComments);
  }, [blogId, supabase]);

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchComments, supabase]);

  const processComments = (rawComments: CommentType[]): ProcessedCommentType[] => {
    const commentMap = new Map<string, ProcessedCommentType>();
    const rootComments: ProcessedCommentType[] = [];

    rawComments.forEach(comment => {
      const processedComment: ProcessedCommentType = { ...comment, level: 0, replies: [] };
      
      if (comment.content.startsWith(REPLY_PREFIX)) {
        const [replyTo, ...contentParts] = comment.content.slice(REPLY_PREFIX.length).split(' ');
        processedComment.replyTo = replyTo;
        processedComment.content = contentParts.join(' ');
      }

      commentMap.set(comment.id, processedComment);
    });

    commentMap.forEach(comment => {
      if (comment.replyTo && commentMap.has(comment.replyTo)) {
        const parentComment = commentMap.get(comment.replyTo)!;
        parentComment.replies!.push(comment);
        comment.level = Math.min(parentComment.level + 1, MAX_DEPTH);
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('コメントを投稿するにはログインしてください。');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    let content = newComment.trim();
    if (replyingTo) {
      content = `${REPLY_PREFIX}${replyingTo} ${content}`;
    }

    const { error } = await supabase.from('comments').insert({
      blog_id: blogId,
      user_id: currentUser.id,
      profile_id: currentUser.id,
      content: content,
    });

    setIsLoading(false);
    if (error) {
      console.error('Error submitting comment:', error);
      toast.error('コメントの投稿に失敗しました。');
      return;
    }

    setNewComment('');
    setReplyingTo(null);
    toast.success('コメントを投稿しました。');
    await fetchComments();
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('本当にこのコメントを削除しますか？')) return;

    const { error } = await supabase
      .from('comments')
      .delete()
      .eq('id', commentId);

    if (error) {
      console.error('Error deleting comment:', error);
      toast.error('コメントの削除に失敗しました。');
      return;
    }

    toast.success('コメントを削除しました。');
    await fetchComments();
  };

  const toggleReply = (commentId: string | null) => {
    setReplyingTo(replyingTo === commentId ? null : commentId);
  };

  const toggleCollapsed = (commentId: string) => {
    setCollapsedComments(prev => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComment = (comment: ProcessedCommentType) => {
    const isCollapsed = collapsedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showToggle = hasReplies && comment.replies!.length > REPLIES_THRESHOLD;

    const urls = linkify.find(comment.content).filter(link => link.type === 'url').map(link => link.href);

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`ml-${Math.min(comment.level * 4, 16)} mt-4`}
      >
        <div className="bg-white p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Image
                src={comment.profiles.avatar_url || '/noImage.png'}
                alt={`${comment.profiles.name}'s avatar`}
                width={40}
                height={40}
                className="rounded-full border-2 border-blue-500"
              />
              <div>
                <span className="font-semibold text-gray-800">{comment.profiles.name}</span>
                <p className="text-xs text-gray-500">
                  {format(new Date(comment.created_at), 'yyyy/MM/dd HH:mm')}
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-start space-x-2 mb-2">
            {comment.replyTo && (
              <div className="flex items-center space-x-1 text-sm text-gray-500">
                <CornerDownRight className="w-4 h-4" />
                <span>返信先: {comment.replyTo}</span>
              </div>
            )}
          </div>
          <div className="mb-2">
            <Linkify>
              <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
            </Linkify>
          </div>
          {urls.map((url, index) => (
            <LinkPreview key={index} url={url} />
          ))}
          <div className="flex items-center space-x-4 text-sm mt-2">
            <button
              onClick={() => toggleReply(comment.id)}
              className="text-blue-500 hover:text-blue-700 transition-colors duration-200 flex items-center space-x-1"
            >
              <MessageCircle className="w-4 h-4" />
              <span>返信</span>
            </button>
            {currentUser && currentUser.id === comment.user_id && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 hover:text-red-700 transition-colors duration-200 flex items-center space-x-1"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            )}
            {showToggle && (
              <button
                onClick={() => toggleCollapsed(comment.id)}
                className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1"
              >
                {isCollapsed ? (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>返信を表示 ({comment.replies!.length})</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>返信を隠す</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-2 ml-4"
            >
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="返信を入力..."
                className="w-full p-2 border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                onClick={handleSubmitComment}
                disabled={isLoading || !newComment.trim()}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? '送信中...' : '返信を投稿'}</span>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {(!showToggle || !isCollapsed) && comment.replies && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="ml-4"
            >
              {comment.replies.map(reply => renderComment(reply))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="mt-8 bg-gray-100 rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4 text-gray-800">コメント</h3>
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力してください..."
          className="w-full p-3 border border-gray-300 rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          type="submit"
          disabled={isLoading || !newComment.trim()}
          className="mt-2 bg-blue-500 text-white px-6 py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-5 h-5" />
          <span>{isLoading ? '送信中...' : 'コメントを投稿'}</span>
        </motion.button>
      </form>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-4"
      >
        {comments.map(comment => renderComment(comment))}
      </motion.div>
    </div>
  );
};

export default Comments;