import { Link } from 'react-router-dom';
import {
  Bell,
  Gamepad2,
  Home,
  Menu,
  MessageCircle,
  Moon,
  Search,
  Store,
  Sun,
  Tv,
  Users,
} from 'lucide-react';
import Button from '../ui/Button';
import { useTheme } from '../../contexts/ThemeContext';

const centerTabs = [
  { label: 'Home', icon: Home, active: true },
  { label: 'Friends', icon: Users },
  { label: 'Watch', icon: Tv },
  { label: 'Marketplace', icon: Store },
  { label: 'Gaming', icon: Gamepad2 },
];

const TopNav = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-40 border-b border-zinc-200 bg-white shadow-soft dark:border-white/10 dark:bg-[#242526]">
      <div className="grid h-14 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 px-3 lg:grid-cols-[320px_minmax(0,1fr)_320px]">
        <div className="flex min-w-0 items-center gap-2">
          <Link
            to="/"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-brand text-2xl font-black text-white"
            aria-label="Open home feed"
          >
            f
          </Link>
          <label className="relative hidden min-w-0 flex-1 sm:block">
            <Search
              size={18}
              aria-hidden="true"
              className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 dark:text-zinc-400"
            />
            <input
              placeholder="Search Facebook"
              className="h-10 w-full rounded-full border-0 bg-zinc-100 pl-10 pr-4 text-sm text-zinc-900 placeholder:text-zinc-500 dark:bg-[#3a3b3c] dark:text-zinc-100"
            />
          </label>
        </div>

        <nav className="hidden h-full items-center justify-center gap-1 md:flex">
          {centerTabs.map((item) => (
            <button
              key={item.label}
              type="button"
              title={item.label}
              aria-label={item.label}
              className={`flex h-12 min-w-20 items-center justify-center rounded-md border-b-4 transition ${
                item.active
                  ? 'border-brand text-brand'
                  : 'border-transparent text-zinc-500 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-white/10'
              }`}
            >
              <item.icon size={24} strokeWidth={2.1} aria-hidden="true" />
            </button>
          ))}
        </nav>

        <div className="ml-auto flex items-center justify-end gap-2">
          <Button
            aria-label="Menu"
            title="Menu"
            icon={Menu}
            variant="secondary"
            size="icon"
            className="rounded-full"
          />
          <Button
            aria-label="Messenger"
            title="Messenger"
            icon={MessageCircle}
            variant="secondary"
            size="icon"
            className="hidden rounded-full sm:inline-flex"
          />
          <Button
            aria-label="Notifications"
            title="Notifications"
            icon={Bell}
            variant="secondary"
            size="icon"
            className="hidden rounded-full sm:inline-flex"
          />
          <Button
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
            icon={isDark ? Sun : Moon}
            onClick={toggleTheme}
            variant="secondary"
            size="icon"
            className="rounded-full"
          />
          <div className="hidden h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-brand to-cyan-500 text-sm font-black text-white lg:flex">
            VP
          </div>
        </div>
      </div>

      <nav className="grid grid-cols-5 border-t border-zinc-100 bg-white dark:border-white/10 dark:bg-[#242526] md:hidden">
        {centerTabs.map((item) => (
          <button
            key={item.label}
            type="button"
            aria-label={item.label}
            className={`flex h-11 items-center justify-center ${
              item.active ? 'text-brand' : 'text-zinc-500 dark:text-zinc-300'
            }`}
          >
            <item.icon size={21} aria-hidden="true" />
          </button>
        ))}
      </nav>
    </header>
  );
};

export default TopNav;
