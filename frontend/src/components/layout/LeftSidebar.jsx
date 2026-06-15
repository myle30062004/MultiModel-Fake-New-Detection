import {
  Bookmark,
  CalendarDays,
  ChevronDown,
  Clock,
  Home,
  PlaySquare,
  Store,
  Users,
  UsersRound,
} from 'lucide-react';

const shortcuts = [
  { label: 'VINH PHU', avatar: true },
  { label: 'Friends', icon: Users },
  { label: 'Groups', icon: UsersRound },
  { label: 'Marketplace', icon: Store },
  { label: 'Watch', icon: PlaySquare },
  { label: 'Memories', icon: Clock },
  { label: 'Saved', icon: Bookmark },
  { label: 'Events', icon: CalendarDays },
  { label: 'See more', icon: ChevronDown, muted: true },
];

const LeftSidebar = () => (
  <aside className="sticky top-[68px] hidden h-[calc(100vh-4.25rem)] w-[320px] shrink-0 overflow-y-auto px-2 pb-6 lg:block">
    <nav className="space-y-1">
      {shortcuts.map((item) => (
        <button
          key={item.label}
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[15px] font-semibold text-zinc-800 transition hover:bg-zinc-200/70 dark:text-zinc-100 dark:hover:bg-white/10"
        >
          {item.avatar ? (
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-brand to-cyan-500 text-xs font-black text-white">
              VP
            </span>
          ) : (
            <span
              className={`grid h-9 w-9 shrink-0 place-items-center rounded-full ${
                item.muted
                  ? 'bg-zinc-200 text-zinc-700 dark:bg-[#3a3b3c] dark:text-zinc-200'
                  : 'text-brand'
              }`}
            >
              <item.icon size={24} aria-hidden="true" />
            </span>
          )}
          <span>{item.label}</span>
        </button>
      ))}
    </nav>

    <section className="mt-3 border-t border-zinc-300/70 pt-3 dark:border-white/10">
      <h2 className="px-2 text-[17px] font-bold text-zinc-500 dark:text-zinc-400">Your shortcuts</h2>
      {['Fact Check Community', 'News Dataset Demo', 'Research Group'].map((name, index) => (
        <button
          key={name}
          type="button"
          className="mt-1 flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[15px] font-semibold text-zinc-800 transition hover:bg-zinc-200/70 dark:text-zinc-100 dark:hover:bg-white/10"
        >
          <span className="grid h-9 w-9 place-items-center rounded-md bg-zinc-300 text-xs font-black text-zinc-700 dark:bg-[#3a3b3c] dark:text-zinc-200">
            {index + 1}
          </span>
          <span>{name}</span>
        </button>
      ))}
    </section>
  </aside>
);

export default LeftSidebar;
