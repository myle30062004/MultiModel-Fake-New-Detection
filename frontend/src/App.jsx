import { lazy, Suspense } from 'react';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import AppLayout from './layouts/AppLayout';
import { ThemeProvider } from './contexts/ThemeContext';

const HomeFeed = lazy(() => import('./pages/HomeFeed'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));

const PageFallback = () => (
  <div className="mx-auto max-w-3xl rounded-lg border border-zinc-200 bg-white p-8 text-center shadow-soft dark:border-white/10 dark:bg-zinc-900">
    <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-brand/20 border-t-brand" />
    <p className="mt-4 text-sm font-bold text-zinc-600 dark:text-zinc-300">Loading interface...</p>
  </div>
);

const App = () => (
  <ThemeProvider>
    <BrowserRouter>
      <Suspense fallback={<PageFallback />}>
        <Routes>
          <Route element={<AppLayout />}>
            <Route index element={<HomeFeed />} />
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  </ThemeProvider>
);

export default App;
