import { Gift, MoreHorizontal, Search, Video } from 'lucide-react';

const contacts = ['Nguyen Minh', 'Tran Anh', 'Le Bao', 'Pham Chi', 'Hoang Nam', 'Do Linh'];

const FacebookRightRail = () => (
  <aside className="sticky top-[68px] hidden h-[calc(100vh-4.25rem)] w-[320px] shrink-0 overflow-y-auto px-2 pb-6 xl:block">
    <section className="space-y-3 border-b border-zinc-300/70 pb-4 dark:border-white/10">
      <h2 className="px-2 text-[17px] font-bold text-zinc-500 dark:text-zinc-400">Sponsored</h2>
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-md p-2 text-left transition hover:bg-zinc-200/70 dark:hover:bg-white/10"
      >
        <div className="h-20 w-28 shrink-0 rounded-md bg-gradient-to-br from-blue-200 via-white to-green-200 dark:from-blue-950 dark:via-zinc-800 dark:to-emerald-950" />
        <div className="min-w-0">
          <p className="text-sm font-bold text-zinc-900 dark:text-zinc-100">News verification toolkit</p>
          <p className="mt-1 text-xs font-medium text-zinc-500 dark:text-zinc-400">localhost demo</p>
        </div>
      </button>
    </section>

    <section className="border-b border-zinc-300/70 py-4 dark:border-white/10">
      <button
        type="button"
        className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left transition hover:bg-zinc-200/70 dark:hover:bg-white/10"
      >
        <span className="grid h-9 w-9 place-items-center rounded-full bg-brand/10 text-brand">
          <Gift size={22} aria-hidden="true" />
        </span>
        <p className="text-sm leading-5 text-zinc-700 dark:text-zinc-300">
          <strong className="text-zinc-900 dark:text-zinc-100">Research Lab</strong> has a dataset import today.
        </p>
      </button>
    </section>

    <section className="pt-4">
      <div className="mb-2 flex items-center justify-between px-2">
        <h2 className="text-[17px] font-bold text-zinc-500 dark:text-zinc-400">Contacts</h2>
        <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400">
          <button type="button" className="rounded-full p-2 hover:bg-zinc-200/70 dark:hover:bg-white/10" aria-label="Create room">
            <Video size={17} aria-hidden="true" />
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-zinc-200/70 dark:hover:bg-white/10" aria-label="Search contacts">
            <Search size={17} aria-hidden="true" />
          </button>
          <button type="button" className="rounded-full p-2 hover:bg-zinc-200/70 dark:hover:bg-white/10" aria-label="More contacts">
            <MoreHorizontal size={17} aria-hidden="true" />
          </button>
        </div>
      </div>

      {contacts.map((name) => (
        <button
          key={name}
          type="button"
          className="flex w-full items-center gap-3 rounded-md px-2 py-2 text-left text-[15px] font-semibold text-zinc-800 transition hover:bg-zinc-200/70 dark:text-zinc-100 dark:hover:bg-white/10"
        >
          <span className="relative grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-zinc-300 to-zinc-100 text-xs font-black text-zinc-700 dark:from-zinc-600 dark:to-zinc-800 dark:text-zinc-100">
            {name
              .split(' ')
              .map((part) => part[0])
              .join('')
              .slice(0, 2)}
            <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-success dark:border-[#18191a]" />
          </span>
          <span>{name}</span>
        </button>
      ))}
    </section>
  </aside>
);

export default FacebookRightRail;
