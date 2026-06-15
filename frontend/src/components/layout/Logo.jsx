import { ShieldCheck } from 'lucide-react';

const Logo = ({ compact = false }) => (
  <div className="flex items-center gap-2">
    <div className="flex h-10 w-10 items-center justify-center rounded-md bg-brand text-white shadow-soft">
      <ShieldCheck size={22} strokeWidth={2.4} aria-hidden="true" />
    </div>
    {!compact ? (
      <div className="leading-tight">
        <p className="text-base font-extrabold text-zinc-950 dark:text-white">NewsGuard</p>
        <p className="text-xs font-medium text-zinc-500 dark:text-zinc-400">Multimodal AI</p>
      </div>
    ) : null}
  </div>
);

export default Logo;
