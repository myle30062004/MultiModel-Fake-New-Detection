import { useCallback, useEffect, useRef, useState } from 'react';
import { fallbackPosts, newsApi } from '../services/apiClient';

const PAGE_SIZE = 10;

const uniqueById = (rows) => Array.from(new Map(rows.map((row) => [String(row.id), row])).values());

export const useInfinitePosts = ({ tab = 'latest', query = '' } = {}) => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState('');
  const requestId = useRef(0);

  const fetchPage = useCallback(
    async (pageToLoad) => {
      if (query.trim()) {
        const rows = await newsApi.searchPosts(query.trim(), pageToLoad * PAGE_SIZE);
        return rows.slice((pageToLoad - 1) * PAGE_SIZE, pageToLoad * PAGE_SIZE);
      }

      if (tab === 'trending') {
        const rows = await newsApi.getTrendingPosts(pageToLoad * PAGE_SIZE);
        return rows.slice((pageToLoad - 1) * PAGE_SIZE, pageToLoad * PAGE_SIZE);
      }

      if (tab === 'all') {
        return newsApi.getPosts(pageToLoad, PAGE_SIZE);
      }

      const rows = await newsApi.getLatestPosts(pageToLoad * PAGE_SIZE);
      return rows.slice((pageToLoad - 1) * PAGE_SIZE, pageToLoad * PAGE_SIZE);
    },
    [query, tab],
  );

  useEffect(() => {
    let cancelled = false;
    const currentRequest = requestId.current + 1;
    requestId.current = currentRequest;

    const loadInitial = async () => {
      setLoading(true);
      setError('');
      setPage(1);
      setHasMore(true);

      try {
        const rows = await fetchPage(1);
        if (cancelled || requestId.current !== currentRequest) return;
        setPosts(rows);
        setHasMore(rows.length >= PAGE_SIZE);
      } catch (err) {
        if (cancelled) return;
        setPosts(fallbackPosts);
        setHasMore(false);
        setError(err?.message || 'Unable to load live posts. Showing local sample data.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    loadInitial();
    return () => {
      cancelled = true;
    };
  }, [fetchPage]);

  const loadMore = useCallback(async () => {
    if (loading || loadingMore || !hasMore) return;

    setLoadingMore(true);
    setError('');
    const nextPage = page + 1;

    try {
      const rows = await fetchPage(nextPage);
      setPosts((current) => uniqueById([...current, ...rows]));
      setPage(nextPage);
      setHasMore(rows.length >= PAGE_SIZE);
    } catch (err) {
      setHasMore(false);
      setError(err?.message || 'Unable to load more posts.');
    } finally {
      setLoadingMore(false);
    }
  }, [fetchPage, hasMore, loading, loadingMore, page]);

  return { posts, loading, loadingMore, hasMore, error, loadMore };
};
