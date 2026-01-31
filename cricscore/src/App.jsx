import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { lazy, Suspense, useEffect } from 'react';
import { ErrorBoundary } from './components/common';
import { initMobileOptimizations } from './utils/mobileOptimizations';
import { initPerformanceMonitoring } from './utils/performanceMonitor';

// Lazy load pages for better performance
const HomePage = lazy(() => import('./pages/HomePage'));
const ViewerPage = lazy(() => import('./pages/ViewerPage'));
const ScorerPage = lazy(() => import('./pages/ScorerPage'));
const TournamentSetupPage = lazy(() => import('./pages/TournamentSetupPage'));
const TournamentPage = lazy(() => import('./pages/TournamentPage'));
const MatchSetupPage = lazy(() => import('./pages/MatchSetupPage'));
const AllTournamentsPage = lazy(() => import('./pages/AllTournamentsPage'));
const LiveMatchesPage = lazy(() => import('./pages/LiveMatchesPage'));
const ScorerLoginPage = lazy(() => import('./pages/ScorerLoginPage'));
const ScorerMatchListPage = lazy(() => import('./pages/ScorerMatchListPage'));

// Loading component
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-brand-navy">
    <div className="text-center">
      <div className="animate-spin w-12 h-12 border-4 border-brand-cyan border-t-transparent rounded-full mx-auto mb-4"></div>
      <p className="text-text-onDark">Loading...</p>
    </div>
  </div>
);

/**
 * Animated Routes Component
 */
function AnimatedRoutes() {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Suspense fallback={<PageLoader />}>
        <Routes location={location} key={location.pathname}>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

        {/* Tournament Routes */}
        <Route path="/tournament/create" element={<TournamentSetupPage />} />
        <Route path="/tournament/:tournamentId" element={<TournamentPage />} />
        <Route path="/tournament/:tournamentId/match/new" element={<MatchSetupPage />} />
        <Route path="/tournaments" element={<AllTournamentsPage />} />

        {/* Match Routes */}
        <Route path="/match/create" element={<MatchSetupPage />} />
        <Route path="/match/:matchId" element={<ViewerPage />} />
        <Route path="/match/:matchId/score" element={<ScorerPage />} />
        <Route path="/matches/live" element={<LiveMatchesPage />} />

        {/* Scorer Routes */}
        <Route path="/scorer/login" element={<ScorerLoginPage />} />
        <Route path="/scorer/tournament/:tournamentId" element={<ScorerMatchListPage />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
    </AnimatePresence>
  );
}

/**
 * 404 Not Found Page
 */
function NotFound() {
  return (
    <div className="min-h-screen bg-primary-black flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-9xl font-display font-bold text-accent-red mb-4">404</h1>
        <p className="text-2xl text-neutral-white mb-8">Page Not Found</p>
        <a
          href="/"
          className="text-accent-lightRed hover:text-accent-red transition-colors"
        >
          Go Back Home
        </a>
      </div>
    </div>
  );
}

/**
 * Main App Component
 */
function App() {
  // Initialize mobile optimizations and performance monitoring on mount
  useEffect(() => {
    initMobileOptimizations();

    // Only enable performance monitoring in development
    if (import.meta.env.DEV) {
      initPerformanceMonitoring();
    }
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
        <div className="app">
          <AnimatedRoutes />
        </div>
      </BrowserRouter>
    </ErrorBoundary>
  );
}

export default App;
