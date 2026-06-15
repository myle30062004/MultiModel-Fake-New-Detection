import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Flame, Image as ImageIcon, Newspaper, Search, Smile, Sparkles, Video } from 'lucide-react';
import NewsCard from '../components/feed/NewsCard';
import Button from '../components/ui/Button';
import Card from '../components/ui/Card';
import { FeedCardSkeleton } from '../components/ui/Skeleton';
import { useInfinitePosts } from '../hooks/useInfinitePosts';

const tabs = [
  { id: 'latest', label: 'Latest', icon: Newspaper },
  { id: 'trending', label: 'Trending', icon: Flame },
  { id: 'all', label: 'All Posts', icon: Filter },
];

const HomeFeed = () => {
  const [tab, setTab] = useState('latest');
  const [query, setQuery] = useState('');
  const [activeQuery, setActiveQuery] = useState('');
  const sentinelRef = useRef(null);
  const { posts, loading, loadingMore, hasMore, error, loadMore } = useInfinitePosts({
    tab,
    query: activeQuery,
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || !hasMore) return undefined;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) loadMore();
      },
      { rootMargin: '600px 0px' },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [hasMore, loadMore]);

  const onSearch = (event) => {
    event.preventDefault();
    setActiveQuery(query.trim());
  };

  return (
    <div className="mx-auto w-full max-w-[680px] space-y-4">
      <Card className="p-3">
        <div className="flex items-center gap-3 border-b border-zinc-200 pb-3 dark:border-white/10">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-cyan-500 text-xs font-black text-white">
            VP
          </div>
          <button
            type="button"
            className="flex h-10 flex-1 items-center rounded-full bg-zinc-100 px-4 text-left text-[15px] font-medium text-zinc-500 transition hover:bg-zinc-200 dark:bg-[#3a3b3c] dark:text-zinc-300 dark:hover:bg-white/15"
          >
            What's on your mind, VINH PHU?
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1 pt-2">
          <Button variant="ghost" size="sm" icon={Video} className="text-zinc-600 dark:text-zinc-300">
            Live video
          </Button>
          <Button variant="ghost" size="sm" icon={ImageIcon} className="text-zinc-600 dark:text-zinc-300">
            Photo/video
          </Button>
          <Button variant="ghost" size="sm" icon={Smile} className="text-zinc-600 dark:text-zinc-300">
            Feeling
          </Button>
        </div>
      </Card>

      <section className="grid grid-cols-4 gap-2 overflow-hidden">
        {['Research Lab', 'Fact Check', 'Dataset', 'Local News'].map((story, index) => (
          <button
            key={story}
            type="button"
            className="relative h-48 overflow-hidden rounded-lg bg-zinc-200 text-left shadow-soft dark:bg-[#242526]"
          >
            <div
              className={`absolute inset-0 ${
                index % 2 === 0
                  ? 'bg-gradient-to-br from-brand/70 via-blue-300 to-zinc-100 dark:from-brand/60 dark:via-blue-950 dark:to-zinc-900'
                  : 'bg-gradient-to-br from-zinc-300 via-white to-green-200 dark:from-zinc-700 dark:via-zinc-900 dark:to-emerald-950'
              }`}
            />
            <span className="absolute left-2 top-2 grid h-9 w-9 place-items-center rounded-full border-4 border-brand bg-white text-xs font-black text-brand">
              {story[0]}
            </span>
            <span className="absolute bottom-2 left-2 right-2 text-sm font-black text-white drop-shadow">
              {story}
            </span>
          </button>
        ))}
      </section>

      <Card className="p-4">
        <form onSubmit={onSearch} className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400"
            />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search posts in imported database"
              className="h-11 w-full rounded-full border-0 bg-zinc-100 pl-10 pr-3 text-sm text-zinc-950 placeholder:text-zinc-500 dark:bg-[#3a3b3c] dark:text-white"
            />
          </label>
          <Button type="submit" icon={Search} className="rounded-full">
            Search
          </Button>
        </form>

        <div className="mt-4 grid grid-cols-3 gap-2">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={`flex h-10 items-center justify-center gap-2 rounded-md text-sm font-bold transition ${
                tab === item.id
                  ? 'bg-brand text-white'
                  : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-200 dark:bg-[#3a3b3c] dark:text-zinc-300 dark:hover:bg-white/15'
              }`}
            >
              <item.icon size={17} aria-hidden="true" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>
      </Card>

      {error ? (
        <div className="rounded-md border border-warning/30 bg-warning/10 px-4 py-3 text-sm font-semibold text-amber-700 dark:text-amber-300">
          {error}
        </div>
      ) : null}

      <motion.div layout className="space-y-4">
        {loading ? (
          <>
            <FeedCardSkeleton />
            <FeedCardSkeleton />
          </>
        ) : posts.length > 0 ? (
          posts.map((post, index) => <NewsCard key={post.id} post={post} index={index} />)
        ) : (
          <Card className="p-8 text-center">
            <Sparkles className="mx-auto text-brand" size={32} aria-hidden="true" />
            <p className="mt-3 text-lg font-bold text-zinc-950 dark:text-white">No matching posts found</p>
            <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
              Try a broader keyword from the imported database.
            </p>
          </Card>
        )}
      </motion.div>

      <div ref={sentinelRef} className="h-10">
        {loadingMore ? <FeedCardSkeleton /> : null}
        {!hasMore && !loading && posts.length > 0 ? (
          <p className="py-4 text-center text-sm font-semibold text-zinc-500 dark:text-zinc-400">
            No more posts.
          </p>
        ) : null}
      </div>
    </div>
  );
};

export default HomeFeed;
