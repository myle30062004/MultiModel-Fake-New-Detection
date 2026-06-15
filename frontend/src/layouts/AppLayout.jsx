import { Outlet } from 'react-router-dom';
import TopNav from '../components/layout/TopNav';
import LeftSidebar from '../components/layout/LeftSidebar';
import FacebookRightRail from '../components/layout/FacebookRightRail';

const AppLayout = () => (
  <div className="min-h-screen bg-[#f0f2f5] text-ink dark:bg-[#18191a] dark:text-zinc-50">
    <TopNav />
    <div className="mx-auto flex max-w-[1920px] justify-between gap-4 px-2 py-4 sm:px-4">
      <LeftSidebar />
      <main className="min-w-0 flex-1">
        <Outlet />
      </main>
      <FacebookRightRail />
    </div>
  </div>
);

export default AppLayout;
