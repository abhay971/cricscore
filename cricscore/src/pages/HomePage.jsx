import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * HomePage - Mobile-First Design
 * Optimized for small screens (320px+) with large touch targets
 */
const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#2C2D3F] flex flex-col">
      {/* Header - Compact for mobile */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-black text-white mb-1">CricScore</h1>
        <p className="text-white/60 text-base">Live Cricket Scoring</p>
      </div>

      {/* Main Content - Scrollable */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="space-y-4 py-4">
          {/* Create Tournament - WHITE card with LARGE touch target */}
          <motion.button
            onClick={() => navigate('/tournament/create')}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-white rounded-[24px] p-5 flex items-center gap-4 shadow-xl active:shadow-lg transition-shadow min-h-[88px]"
          >
            <div className="w-16 h-16 bg-[#FFF5E6] rounded-[18px] flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">🏆</span>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-[#2C2D3F] mb-0.5">Create Tournament</h3>
              <p className="text-[#2C2D3F]/60 text-sm">
                Start new tournament
              </p>
            </div>
            <svg className="w-7 h-7 text-[#2C2D3F]/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Tournaments - Dark card */}
          <motion.button
            onClick={() => navigate('/tournaments')}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#353647] border border-[#4A4B5E] rounded-[24px] p-5 flex items-center gap-4 active:bg-[#3D3E52] transition-colors min-h-[88px]"
          >
            <div className="w-16 h-16 bg-[#3D3E52] rounded-[18px] flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">📋</span>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-white mb-0.5">Tournaments</h3>
              <p className="text-white/50 text-sm">
                View all tournaments
              </p>
            </div>
            <svg className="w-7 h-7 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Live Matches - Dark card with badge */}
          <motion.button
            onClick={() => navigate('/matches/live')}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#353647] border border-[#4A4B5E] rounded-[24px] p-5 flex items-center gap-4 relative active:bg-[#3D3E52] transition-colors min-h-[88px]"
          >
            {/* Live Badge - Top right */}
            <div className="absolute top-4 right-4">
              <span className="bg-[#FF4B4B] text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-lg">
                <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                LIVE
              </span>
            </div>

            <div className="w-16 h-16 bg-[#3D3E52] rounded-[18px] flex items-center justify-center flex-shrink-0">
              <span className="text-4xl">🔴</span>
            </div>
            <div className="flex-1 text-left pr-12">
              <h3 className="text-xl font-bold text-white mb-0.5">Live Matches</h3>
              <p className="text-white/50 text-sm">
                Watch live scoring
              </p>
            </div>
          </motion.button>

          {/* Scorer Login - Dark card */}
          <motion.button
            onClick={() => navigate('/scorer/login')}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-[#353647] border border-[#4A4B5E] rounded-[24px] p-5 flex items-center gap-4 active:bg-[#3D3E52] transition-colors min-h-[88px]"
          >
            <div className="w-16 h-16 bg-[#3D3E52] rounded-[18px] flex items-center justify-center flex-shrink-0">
              <svg className="w-8 h-8 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-white mb-0.5">Scorer Login</h3>
              <p className="text-white/50 text-sm">
                Login with tournament PIN
              </p>
            </div>
            <svg className="w-7 h-7 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Quick Stats - 2 column grid */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="bg-[#353647]/60 border border-[#4A4B5E] rounded-[20px] p-4 text-center">
              <div className="text-3xl mb-2">⚡</div>
              <p className="text-sm font-semibold text-white">Real-time</p>
            </div>
            <div className="bg-[#353647]/60 border border-[#4A4B5E] rounded-[20px] p-4 text-center">
              <div className="text-3xl mb-2">🎯</div>
              <p className="text-sm font-semibold text-white">Custom Rules</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Fixed, Large Touch Targets */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#353647] border-t border-[#4A4B5E] safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          {/* Home - Active */}
          <button className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 bg-[#8BC9E8] rounded-[16px] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#2C2D3F]" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#8BC9E8]">Home</span>
          </button>

          {/* Stats */}
          <button
            onClick={() => navigate('/tournaments')}
            className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]"
          >
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Stats</span>
          </button>

          {/* Live */}
          <button
            onClick={() => navigate('/matches/live')}
            className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px] relative"
          >
            {/* Live indicator dot */}
            <div className="absolute top-1 right-1 w-2 h-2 bg-[#FF4B4B] rounded-full animate-pulse"></div>
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Live</span>
          </button>

          {/* Profile */}
          <button className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default HomePage;
