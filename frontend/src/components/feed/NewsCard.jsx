import { motion } from 'framer-motion';
import {
  MessageCircle,
  MoreHorizontal,
  Share2,
  ThumbsUp,
} from 'lucide-react';
import Button from '../ui/Button';
import { resolveImageUrl } from '../../services/apiClient';
import { compactNumber, formatDate, truncate } from '../../utils/formatters';

const getInitials = (name = '') =>
  name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'NG';

const NewsCard = ({ post, index = 0 }) => {
  const imageUrl = resolveImageUrl(post.image_path);

  return (
    <motion.article
      data-newsguard-post="true"
      data-post-id={post.id}
      data-post-user={post.user_name}
      data-post-content={post.post_message}
      data-post-image={imageUrl || ''}
      data-post-timestamp={post.timestamp_post || ''}
      data-post-likes={post.num_like_post || 0}
      data-post-comments={post.num_comment_post || 0}
      data-post-shares={post.num_share_post || 0}
      data-post-engagement={post.engagement_score || 0}
      data-post-text-length={post.text_length || post.post_message.length || 0}
      data-post-image-count={post.image_count || (imageUrl ? 1 : 0)}
      layout
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.035, 0.2), duration: 0.28 }}
      className="surface overflow-hidden rounded-lg border-0 shadow-soft dark:bg-[#242526]"
    >
      <div className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-brand to-cyan-500 text-sm font-extrabold text-white">
            {getInitials(post.user_name)}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <span className="post-user block truncate text-[15px] font-bold text-zinc-950 hover:underline dark:text-white">
                {post.user_name}
              </span>
              <span className="newsguard-extension-slot" aria-live="polite" />
            </div>
            <div className="mt-0.5 flex flex-wrap items-center gap-2 text-xs font-medium text-zinc-500 dark:text-zinc-400">
              <span className="post-time" data-raw-timestamp={post.timestamp_post}>{formatDate(post.timestamp_post)}</span>
              <span aria-hidden="true">.</span>
              <span>Public</span>
            </div>
          </div>
          <button
            type="button"
            className="rounded-full p-2 text-zinc-500 transition hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10"
            aria-label="Post options"
          >
            <MoreHorizontal size={20} aria-hidden="true" />
          </button>
        </div>

        <p className="post-message mt-4 whitespace-pre-line text-[15px] leading-6 text-zinc-900 dark:text-zinc-100">
          {truncate(post.post_message, 520)}
        </p>
      </div>

      {imageUrl ? (
        <div className="block w-full overflow-hidden bg-zinc-100 text-left dark:bg-[#18191a]">
          <img
            src={imageUrl}
            alt="Post attachment"
            loading="lazy"
            className="post-image h-auto max-h-[520px] w-full object-cover"
          />
        </div>
      ) : null}

      <div className="px-4 py-3">
        <div className="flex items-center justify-between border-b border-zinc-100 pb-3 text-sm text-zinc-500 dark:border-white/10 dark:text-zinc-400">
          <span className="post-likes flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand text-white">
              <ThumbsUp size={13} fill="currentColor" aria-hidden="true" />
            </span>
            {compactNumber(post.num_like_post)}
          </span>
          <span>
            <span className="post-comments">{compactNumber(post.num_comment_post)} comments</span>
            <span> / </span>
            <span className="post-shares">{compactNumber(post.num_share_post)} shares</span>
          </span>
        </div>

        <div className="grid grid-cols-3 gap-1 pt-2">
          <Button variant="ghost" size="sm" icon={ThumbsUp} className="px-2">
            Like
          </Button>
          <Button variant="ghost" size="sm" icon={MessageCircle} className="px-2">
            Comment
          </Button>
          <Button variant="ghost" size="sm" icon={Share2} className="px-2">
            Share
          </Button>
        </div>
      </div>
    </motion.article>
  );
};

export default NewsCard;
