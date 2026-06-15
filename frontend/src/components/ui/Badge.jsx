import clsx from 'clsx';

const tones = {
  neutral: 'bg-zinc-100 text-zinc-700 dark:bg-white/10 dark:text-zinc-200',
  brand: 'bg-brand-soft text-brand dark:bg-brand/15 dark:text-blue-300',
  success: 'bg-green-50 text-success dark:bg-success/15 dark:text-green-300',
  danger: 'bg-rose-50 text-danger dark:bg-danger/15 dark:text-rose-300',
  warning: 'bg-amber-50 text-amber-700 dark:bg-warning/15 dark:text-amber-300',
};

const Badge = ({ tone = 'neutral', children, className }) => (
  <span
    className={clsx(
      'inline-flex min-h-7 items-center rounded-full px-3 py-1 text-xs font-bold',
      tones[tone],
      className,
    )}
  >
    {children}
  </span>
);

export default Badge;
