import { useState, useEffect, useCallback } from 'react';
import { ThumbsUp, User } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Comment {
  id: string;
  lesson_id: string;
  user_name: string;
  content: string;
  likes: number;
  created_at: string;
}

interface Props {
  lessonId: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const ms = now - new Date(dateStr).getTime();
  const mins = Math.floor(ms / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d`;
  const months = Math.floor(days / 30);
  return `${months}mo`;
}

export default function CommentsSection({ lessonId }: Props) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());
  const [sort, setSort] = useState<'newest' | 'oldest'>('newest');

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('comments')
      .select('*')
      .eq('lesson_id', lessonId)
      .order('created_at', { ascending: sort === 'oldest' });
    if (data) setComments(data as Comment[]);
    setLoading(false);
  }, [lessonId, sort]);

  useEffect(() => { load(); }, [load]);

  async function handleSubmit() {
    if (!text.trim()) return;
    setSubmitting(true);
    const { data, error } = await supabase
      .from('comments')
      .insert({ lesson_id: lessonId, user_name: name.trim() || 'Anonymous', content: text.trim() })
      .select()
      .single();
    if (!error && data) {
      setComments(prev => sort === 'newest' ? [data as Comment, ...prev] : [...prev, data as Comment]);
      setText('');
    }
    setSubmitting(false);
  }

  async function handleLike(comment: Comment) {
    if (likedIds.has(comment.id)) return;
    const newLikes = comment.likes + 1;
    const { error } = await supabase
      .from('comments')
      .update({ likes: newLikes })
      .eq('id', comment.id);
    if (!error) {
      setComments(prev => prev.map(c => c.id === comment.id ? { ...c, likes: newLikes } : c));
      setLikedIds(prev => new Set([...prev, comment.id]));
    }
  }

  return (
    <div className="comments-section">
      <div className="comments-sort-row">
        <span className="comments-sort-label">Sort by</span>
        <select
          className="comments-sort-select"
          value={sort}
          onChange={e => setSort(e.target.value as 'newest' | 'oldest')}
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
      </div>

      <div className="comment-input-row">
        <div className="comment-avatar">
          <User size={18} />
        </div>
        <input
          className="comment-input-field"
          placeholder="Your name (optional)"
          value={name}
          onChange={e => setName(e.target.value)}
          style={{ maxWidth: 140, flex: 'none' }}
        />
        <input
          className="comment-input-field"
          placeholder="Write a comment..."
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmit()}
        />
        <button
          className="comment-submit-btn"
          onClick={handleSubmit}
          disabled={submitting || !text.trim()}
        >
          Post
        </button>
      </div>

      {loading ? (
        <div className="comments-loading">Loading comments...</div>
      ) : comments.length === 0 ? (
        <div className="comments-empty">No comments yet. Be the first!</div>
      ) : (
        <div className="comment-list">
          {comments.map(c => (
            <div key={c.id} className="comment-item">
              <div className="comment-avatar">
                <User size={18} />
              </div>
              <div className="comment-body">
                <div className="comment-header">
                  <span className="comment-name">{c.user_name}</span>
                  <span className="comment-time">{timeAgo(c.created_at)}</span>
                </div>
                <p className="comment-text">{c.content}</p>
                <div className="comment-actions">
                  <button
                    className={`comment-like-btn ${likedIds.has(c.id) ? 'liked' : ''}`}
                    onClick={() => handleLike(c)}
                    title="Like"
                  >
                    <ThumbsUp size={13} />
                    {c.likes > 0 && <span>{c.likes}</span>}
                  </button>
                  <button className="comment-reply-btn">Reply</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
