'use client'

import React, { useState, useEffect } from 'react';
import { createClient } from '@/utils/supabase/client';
import { User } from '@supabase/supabase-js';
import { format } from 'date-fns';
import { Send, Trash2, ChevronDown, ChevronUp, CornerDownRight } from 'lucide-react';
import toast from 'react-hot-toast';

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

const REPLY_PREFIX = '@reply:';

const Comments: React.FC<CommentsProps> = ({ blogId, currentUser }) => {
  const [comments, setComments] = useState<ProcessedCommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
  const [isLoading, setIsLoading] = useState(false);
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
      supabase.removeChannel(channel);
    };
  }, [blogId]);

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
        comment.level = parentComment.level + 1;
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

  const toggleExpanded = (commentId: string) => {
    setExpandedComments(prev => {
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
    const isExpanded = expandedComments.has(comment.id);
    const hasReplies = comment.replies && comment.replies.length > 0;

    return (
      <div key={comment.id} className={`ml-${comment.level * 4} mt-4`}>
        <div className="bg-gray-50 p-4 rounded-lg">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <img
                src={comment.profiles.avatar_url || '/noImage.png'}
                alt={`${comment.profiles.name}'s avatar`}
                className="w-8 h-8 rounded-full"
              />
              <span className="font-semibold">{comment.profiles.name}</span>
            </div>
            <span className="text-sm text-gray-500">
              {format(new Date(comment.created_at), 'yyyy/MM/dd HH:mm')}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            {comment.replyTo && <CornerDownRight className="w-4 h-4 text-gray-400" />}
            <p className="text-gray-700 whitespace-pre-wrap">{comment.content}</p>
          </div>
          <div className="mt-2 flex items-center space-x-4">
            <button
              onClick={() => toggleReply(comment.id)}
              className="text-blue-500 text-sm hover:underline"
            >
              返信
            </button>
            {currentUser && currentUser.id === comment.user_id && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 flex items-center space-x-1 hover:text-red-700 transition duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            )}
            {hasReplies && (
              <button
                onClick={() => toggleExpanded(comment.id)}
                className="text-gray-500 flex items-center space-x-1"
              >
                {isExpanded ? (
                  <>
                    <ChevronUp className="w-4 h-4" />
                    <span>返信を隠す</span>
                  </>
                ) : (
                  <>
                    <ChevronDown className="w-4 h-4" />
                    <span>返信を表示 ({comment.replies?.length})</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        {replyingTo === comment.id && (
          <div className="mt-2 ml-4">
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
          </div>
        )}
        {isExpanded && comment.replies && (
          <div className="ml-4">
            {comment.replies.map(reply => renderComment(reply))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4">コメント</h3>
      <form onSubmit={handleSubmitComment} className="mb-6">
        <textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="コメントを入力してください..."
          className="w-full p-2 border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows={3}
        />
        <button
          type="submit"
          disabled={isLoading || !newComment.trim()}
          className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <Send className="w-4 h-4" />
          <span>{isLoading ? '送信中...' : 'コメントを投稿'}</span>
        </button>
      </form>
      <div className="space-y-4">
        {comments.map(comment => renderComment(comment))}
      </div>
    </div>
  );
};

export default Comments;
