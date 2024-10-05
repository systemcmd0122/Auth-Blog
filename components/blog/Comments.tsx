'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Send, Trash2, ChevronDown, ChevronUp, MessageCircle, ExternalLink, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
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
  replyToContent?: string;
  replyToAuthor?: string;
  level: number;
}

interface CommentsProps {
  blogId: string;
  currentUser: User | null;
}

const REPLY_PREFIX = '@reply:';
const REPLIES_THRESHOLD = 3;
const MAX_NESTING_LEVEL = 4;

const Comments: React.FC<CommentsProps> = ({ blogId, currentUser }) => {
  const [comments, setComments] = useState<ProcessedCommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [collapsedComments, setCollapsedComments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
  const [replyChain, setReplyChain] = useState<Array<{ id: string; content: string; author: string }>>([]);
  const supabase = createClient();

  useEffect(() => {
    fetchComments();
    const channel = supabase
      .channel('comments')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'comments' }, () => {
        fetchComments();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [blogId]);

  const processComments = (rawComments: CommentType[]): ProcessedCommentType[] => {
    const commentMap = new Map<string, ProcessedCommentType>();
    const rootComments: ProcessedCommentType[] = [];

    rawComments.forEach(comment => {
      const processedComment: ProcessedCommentType = { 
        ...comment, 
        level: 0, 
        replies: [] 
      };
      
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
        comment.replyToContent = parentComment.content;
        comment.replyToAuthor = parentComment.profiles.name;
        
        if (parentComment.level < MAX_NESTING_LEVEL) {
          comment.level = parentComment.level + 1;
          parentComment.replies!.push(comment);
        } else {
          comment.level = MAX_NESTING_LEVEL;
          const topLevelParent = findTopLevelParent(parentComment, commentMap);
          if (topLevelParent && topLevelParent.replies) {
            topLevelParent.replies.push(comment);
          }
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  };

  const findTopLevelParent = (
    comment: ProcessedCommentType, 
    commentMap: Map<string, ProcessedCommentType>
  ): ProcessedCommentType | null => {
    let current = comment;
    while (current.replyTo && commentMap.has(current.replyTo)) {
      const parent = commentMap.get(current.replyTo)!;
      if (parent.level === 0) return parent;
      current = parent;
    }
    return null;
  };

  const fetchComments = async () => {
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
  };

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('コメントを投稿するにはログインしてください。');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    try {
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

      if (error) throw error;

      setNewComment('');
      setReplyingTo(null);
      setReplyChain([]);
      toast.success('コメントを投稿しました。');
      await fetchComments();
    } catch (error) {
      console.error('Error submitting comment:', error);
      toast.error('コメントの投稿に失敗しました。');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm('本当にこのコメントを削除しますか？')) return;

    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast.success('コメントを削除しました。');
      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast.error('コメントの削除に失敗しました。');
    }
  };

  const toggleReply = (comment: ProcessedCommentType) => {
    if (replyingTo === comment.id) {
      setReplyingTo(null);
      setReplyChain([]);
    } else {
      setReplyingTo(comment.id);
      const newReplyChain = buildReplyChain(comment);
      setReplyChain(newReplyChain);
    }
  };

  const buildReplyChain = (comment: ProcessedCommentType): Array<{ id: string; content: string; author: string }> => {
    const chain = [];
    let current: ProcessedCommentType | undefined = comment;
    
    while (current && chain.length < MAX_NESTING_LEVEL) {
      chain.unshift({
        id: current.id,
        content: current.content,
        author: current.profiles.name
      });
      if (!current.replyTo) break;
      current = findCommentById(current.replyTo);
    }
    
    return chain;
  };

  const findCommentById = (id: string): ProcessedCommentType | undefined => {
    const searchInComments = (comments: ProcessedCommentType[]): ProcessedCommentType | undefined => {
      for (const comment of comments) {
        if (comment.id === id) return comment;
        if (comment.replies) {
          const found = searchInComments(comment.replies);
          if (found) return found;
        }
      }
      return undefined;
    };
    
    return searchInComments(comments);
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

  const processContent = (content: string) => {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = content.split(urlRegex);
    
    return parts.map((part, index) => {
      if (part.match(urlRegex)) {
        const isImage = part.match(/\.(jpg|jpeg|png|gif|webp)$/i);
        if (isImage) {
          return (
            <div key={index} className="my-2 max-w-md relative h-96">
              <Image 
                src={part} 
                alt="Shared content" 
                className="rounded-lg object-contain"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              />
            </div>
          );
        } else {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-500 hover:text-blue-700 inline-flex items-center gap-1 break-all"
            >
              {part.length > 50 ? `${part.substring(0, 50)}...` : part}
              <ExternalLink className="w-4 h-4 flex-shrink-0" />
            </a>
          );
        }
      }
      return <span key={index} className="break-words">{part}</span>;
    });
  };

  const ReplyChainView = () => (
    <div className="mb-4 space-y-2">
      {replyChain.map((reply, index) => (
        <div
          key={reply.id}
          className="flex items-center space-x-2 text-sm bg-gray-50 p-2 rounded"
          style={{ marginLeft: `${index * 1}rem` }}
        >
          <div className="flex-1">
            <span className="font-medium text-gray-700">{reply.author}</span>
            <p className="text-gray-600 truncate">{reply.content}</p>
          </div>
          {index === replyChain.length - 1 && (
            <button
              onClick={() => {
                setReplyingTo(null);
                setReplyChain([]);
              }}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      ))}
    </div>
  );

  const renderComment = (comment: ProcessedCommentType) => {
    const isCollapsed = collapsedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;
    const showToggle = hasReplies && comment.replies!.length > REPLIES_THRESHOLD;

    return (
      <motion.div
        key={comment.id}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className={`relative ${comment.level > 0 ? 'ml-4 md:ml-8' : ''}`}
      >
        {comment.level > 0 && (
          <div 
            className="absolute left-0 top-0 bottom-0 w-0.5 bg-gray-200"
            style={{ left: '-0.75rem' }}
          />
        )}
        
        <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100">
          <div className="flex items-start space-x-3">
            <div className="relative w-10 h-10 flex-shrink-0">
              <Image
                src={comment.profiles.avatar_url || '/noImage.png'}
                alt={`${comment.profiles.name}'s avatar`}
                className="rounded-full border-2 border-blue-500 object-cover"
                fill
                sizes="40px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-baseline space-x-2">
                <span className="font-semibold text-gray-900">{comment.profiles.name}</span>
                <span className="text-xs text-gray-500">
                  {format(new Date(comment.created_at), 'yyyy/MM/dd HH:mm')}
                </span>
              </div>
              
              {comment.replyTo && (
                <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-2 rounded border-l-4 border-blue-200">
                  <div className="font-medium text-gray-700">{comment.replyToAuthor}への返信:</div>
                  <div className="truncate text-gray-600">{comment.replyToContent}</div>
                </div>
              )}

              <div className="mt-2 text-gray-800 leading-relaxed">
                {processContent(comment.content)}
              </div>

              <div className="mt-3 flex items-center space-x-4 text-sm">
                <button
                  onClick={() => toggleReply(comment)}
                  className="text-blue-600 hover:text-blue-800 transition-colors duration-200 flex items-center space-x-1 group"
                >
                  <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                  <span>返信</span>
                </button>
                {currentUser && currentUser.id === comment.user_id && (
                  <button
                    onClick={() => handleDeleteComment(comment.id)}
                    className="text-red-500 hover:text-red-700 transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                    <span>削除</span>
                  </button>
                )}
                {showToggle && (
                  <button
                    onClick={() => toggleCollapsed(comment.id)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-200 flex items-center space-x-1 group"
                  >
                    {isCollapsed ? (
                      <>
                        <ChevronDown className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>返信を表示 ({comment.replies!.length})</span>
                      </>
                    ) : (
                      <>
                        <ChevronUp className="w-4 h-4 group-hover:scale-110 transition-transform duration-200" />
                        <span>返信を隠す</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        <AnimatePresence>
          {replyingTo === comment.id && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 ml-4"
            >
              <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
                {replyChain.length > 0 && <ReplyChainView />}
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="返信を入力..."
                  className="w-full p-3 border border-gray-300 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[100px] transition-all duration-200"
                  maxLength={1000}
                />
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-sm text-gray-500">
                    {newComment.length}/1000文字
                  </span>
                  <div className="flex space-x-2">
                    <button
                      onClick={() => {
                        setReplyingTo(null);
                        setNewComment('');
                        setReplyChain([]);
                      }}
                      className="px-4 py-2 rounded-full text-gray-600 hover:bg-gray-100 transition duration-200 flex items-center space-x-1"
                    >
                      <X className="w-4 h-4" />
                      <span>キャンセル</span>
                    </button>
                    <button
                      onClick={handleSubmitComment}
                      disabled={isLoading || !newComment.trim()}
                      className="bg-blue-500 text-white px-6 py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 active:scale-95"
                    >
                      <Send className="w-4 h-4" />
                      <span>{isLoading ? '送信中...' : '返信を投稿'}</span>
                    </button>
                  </div>
                </div>
              </div>
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
              className="mt-4"
            >
              {comment.replies.map(reply => renderComment(reply))}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    );
  };

  return (
    <div className="mt-8 bg-gray-50 rounded-xl shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-6 text-gray-800 flex items-center space-x-2">
        <MessageCircle className="w-6 h-6" />
        <span>コメント</span>
      </h3>
      
      <form onSubmit={handleSubmitComment} className="mb-8">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            placeholder={currentUser ? "コメントを入力してください..." : "コメントを投稿するにはログインしてください"}
            className="w-full p-3 border border-gray-300 rounded-lg resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent min-h-[120px] transition-all duration-200"
            maxLength={1000}
            disabled={!currentUser}
          />
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm text-gray-500">
              {newComment.length}/1000文字
            </span>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              disabled={isLoading || !newComment.trim() || !currentUser}
              className="bg-blue-500 text-white px-6 py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              <span>{isLoading ? '送信中...' : 'コメントを投稿'}</span>
            </motion.button>
          </div>
        </div>
      </form>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-6"
      >
        {comments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            まだコメントはありません。最初のコメントを投稿してみましょう！
          </div>
        ) : (
          comments.map(comment => renderComment(comment))
        )}
      </motion.div>
    </div>
  );
};

export default Comments;