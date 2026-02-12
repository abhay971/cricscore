import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { token, tournamentId, logout } = useAuthStore();
  const isLoggedIn = !!token;

  return (
    <div className="min-h-screen bg-[#0B0D14] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-8 pb-5 flex-shrink-0">
        <h1 className="text-2xl font-bold text-white tracking-tight">Profile</h1>
        <p className="text-white/40 text-sm mt-0.5">Manage & score</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="space-y-3 py-2">

          {/* Scorer Status (if logged in) */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-emerald-500/5 border border-emerald-500/15 rounded-2xl p-4"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white">Scorer Active</p>
                  <p className="text-xs text-white/30 truncate">{tournamentId}</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => navigate(`/scorer/tournament/${tournamentId}`)}
                  className="flex-1 bg-emerald-500/15 text-emerald-400 font-semibold text-xs py-2.5 rounded-xl border border-emerald-500/20"
                >
                  Go to Matches
                </button>
                <button
                  onClick={logout}
                  className="px-4 bg-red-500/10 text-red-400 font-semibold text-xs py-2.5 rounded-xl border border-red-500/15"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}

          {/* Menu Items */}
          <div className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden divide-y divide-[#1E2030]">

            {/* Tournaments */}
            <button
              onClick={() => navigate('/tournaments')}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-white/[0.02] transition-colors text-left"
            >
              <div className="w-9 h-9 bg-[#1E2030] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-[18px] h-[18px] text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Tournaments</p>
                <p className="text-xs text-white/25">View all tournaments</p>
              </div>
              <svg className="w-4 h-4 text-white/15 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Create Tournament */}
            <button
              onClick={() => navigate('/tournament/create')}
              className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-white/[0.02] transition-colors text-left"
            >
              <div className="w-9 h-9 bg-[#1E2030] rounded-xl flex items-center justify-center flex-shrink-0">
                <svg className="w-[18px] h-[18px] text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-white">Create Tournament</p>
                <p className="text-xs text-white/25">Start a new tournament</p>
              </div>
              <svg className="w-4 h-4 text-white/15 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Scorer Login */}
            {!isLoggedIn && (
              <button
                onClick={() => navigate('/scorer/login')}
                className="w-full flex items-center gap-3.5 px-4 py-3.5 active:bg-white/[0.02] transition-colors text-left"
              >
                <div className="w-9 h-9 bg-[#1E2030] rounded-xl flex items-center justify-center flex-shrink-0">
                  <svg className="w-[18px] h-[18px] text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 5.25a3 3 0 013 3m3 0a6 6 0 01-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 1121.75 8.25z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">Scorer Login</p>
                  <p className="text-xs text-white/25">Login with tournament PIN</p>
                </div>
                <svg className="w-4 h-4 text-white/15 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            )}
          </div>

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#0B0D14]/95 backdrop-blur-xl border-t border-white/5 safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-6">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
            </svg>
            <span className="text-[10px] font-medium text-white/30">Home</span>
          </button>

          <button onClick={() => navigate('/tournaments')} className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721" />
            </svg>
            <span className="text-[10px] font-medium text-white/30">Tournaments</span>
          </button>

          <button onClick={() => navigate('/matches/completed')} className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.8}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[10px] font-medium text-white/30">Results</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-4">
            <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
            <span className="text-[10px] font-semibold text-white">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
