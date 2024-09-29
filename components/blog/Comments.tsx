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
  parent_id: string | null;
  profiles: {
    id: string;
    name: string;
    avatar_url: string | null;
  };
}

interface CommentsProps {
  blogId: string;
  currentUser: User | null;
}

const Comments: React.FC<CommentsProps> = ({ blogId, currentUser }) => {
  const [comments, setComments] = useState<CommentType[]>([]);
  const [newComment, setNewComment] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedComments, setExpandedComments] = useState<Set<string>>(new Set());
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
        profiles:profile_id (
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

    setComments(data as CommentType[]);
  };

  const handleSubmitComment = async (e: React.FormEvent, parentId: string | null = null) => {
    e.preventDefault();
    if (!currentUser) {
      toast.error('コメントを投稿するにはログインしてください。');
      return;
    }
    if (!newComment.trim()) return;

    setIsLoading(true);
    const { error } = await supabase.from('comments').insert({
      blog_id: blogId,
      user_id: currentUser.id,
      profile_id: currentUser.id,
      content: newComment.trim(),
      parent_id: parentId,
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

  const formatComment = (content: string) => {
    return content.split('\n').map((line, index) => (
      <React.Fragment key={index}>
        {line}
        {index !== content.split('\n').length - 1 && <br />}
      </React.Fragment>
    ));
  };

  const toggleExpand = (commentId: string) => {
    setExpandedComments((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(commentId)) {
        newSet.delete(commentId);
      } else {
        newSet.add(commentId);
      }
      return newSet;
    });
  };

  const renderComments = (parentId: string | null = null, depth: number = 0) => {
    const filteredComments = comments.filter(comment => comment.parent_id === parentId);
    
    return filteredComments.map((comment) => {
      const replies = comments.filter(reply => reply.parent_id === comment.id);
      const isExpanded = expandedComments.has(comment.id);
      const shouldCollapse = depth > 2 || replies.length > 3;

      return (
        <div key={comment.id} className={`bg-gray-50 p-4 rounded-lg ${depth > 0 ? 'ml-4 mt-2' : 'mt-4'}`}>
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
          <p className="text-gray-700 whitespace-pre-wrap">{formatComment(comment.content)}</p>
          <div className="mt-2 flex items-center space-x-4">
            {currentUser && (
              <button
                onClick={() => setReplyingTo(comment.id)}
                className="text-blue-500 flex items-center space-x-1 hover:text-blue-700 transition duration-200"
              >
                <CornerDownRight className="w-4 h-4" />
                <span>返信</span>
              </button>
            )}
            {currentUser && currentUser.id === comment.user_id && (
              <button
                onClick={() => handleDeleteComment(comment.id)}
                className="text-red-500 flex items-center space-x-1 hover:text-red-700 transition duration-200"
              >
                <Trash2 className="w-4 h-4" />
                <span>削除</span>
              </button>
            )}
          </div>
          {replyingTo === comment.id && (
            <form onSubmit={(e) => handleSubmitComment(e, comment.id)} className="mt-4">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="返信を入力してください..."
                className="w-full p-2 border rounded-md resize-vertical focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={3}
              />
              <button
                type="submit"
                disabled={isLoading || !newComment.trim()}
                className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-full flex items-center justify-center space-x-2 hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
                <span>{isLoading ? '送信中...' : '返信を投稿'}</span>
              </button>
            </form>
          )}
          {replies.length > 0 && (
            <div className="mt-4">
              {shouldCollapse ? (
                <button
                  onClick={() => toggleExpand(comment.id)}
                  className="text-blue-500 flex items-center space-x-1 hover:text-blue-700 transition duration-200"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="w-4 h-4" />
                      <span>返信を隠す ({replies.length})</span>
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-4 h-4" />
                      <span>返信を表示 ({replies.length})</span>
                    </>
                  )}
                </button>
              ) : null}
              {(!shouldCollapse || isExpanded) && renderComments(comment.id, depth + 1)}
            </div>
          )}
        </div>
      );
    });
  };

  return (
    <div className="mt-8 bg-white rounded-lg shadow-lg p-6">
      <h3 className="text-2xl font-bold mb-4">コメント</h3>
      <form onSubmit={(e) => handleSubmitComment(e)} className="mb-6">
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
        {renderComments()}
      </div>
    </div>
  );
};

export default Comments;
