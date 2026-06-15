import clsx from 'clsx';

export const SkeletonLine = ({ className }) => (
  <div className={clsx('animate-pulse rounded bg-zinc-200 dark:bg-white/10', className)} />
);

export const FeedCardSkeleton = () => (
  <div className="surface p-4">
    <div className="mb-4 flex items-center gap-3">
      <SkeletonLine className="h-11 w-11 rounded-full" />
      <div className="flex-1 space-y-2">
        <SkeletonLine className="h-4 w-36" />
        <SkeletonLine className="h-3 w-24" />
      </div>
    </div>
    <SkeletonLine className="mb-2 h-4 w-full" />
    <SkeletonLine className="mb-4 h-4 w-5/6" />
    <SkeletonLine className="h-56 w-full rounded-md" />
    <div className="mt-4 flex gap-3">
      <SkeletonLine className="h-9 flex-1 rounded-md" />
      <SkeletonLine className="h-9 flex-1 rounded-md" />
      <SkeletonLine className="h-9 flex-1 rounded-md" />
    </div>
  </div>
);

export default SkeletonLine;
