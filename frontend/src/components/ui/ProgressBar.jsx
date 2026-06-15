import clsx from 'clsx';

const tones = {
  brand: 'bg-brand',
  success: 'bg-success',
  danger: 'bg-danger',
  warning: 'bg-warning',
};

const ProgressBar = ({ value = 0, tone = 'brand', label, className }) => {
  const clamped = Math.min(Math.max(Number(value) || 0, 0), 100);

  return (
    <div className={className}>
      {label ? (
        <div className="mb-2 flex items-center justify-between text-xs font-semibold text-zinc-500 dark:text-zinc-400">
          <span>{label}</span>
          <span>{Math.round(clamped)}%</span>
        </div>
      ) : null}
      <div className="h-2.5 overflow-hidden rounded-full bg-zinc-100 dark:bg-white/10">
        <div
          className={clsx('h-full rounded-full transition-all duration-500 ease-out', tones[tone])}
          style={{ width: `${clamped}%` }}
          role="progressbar"
          aria-valuenow={clamped}
          aria-valuemin="0"
          aria-valuemax="100"
        />
      </div>
    </div>
  );
};

export default ProgressBar;
