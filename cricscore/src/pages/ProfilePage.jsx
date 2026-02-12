import { motion } from 'framer-motion';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../store/authStore';

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { token, tournamentId, logout } = useAuthStore();
  const isLoggedIn = !!token;

  return (
    <div className="min-h-screen bg-[#2C2D3F] flex flex-col">
      {/* Header */}
      <div className="px-5 pt-6 pb-4 flex-shrink-0">
        <h1 className="text-3xl font-black text-white mb-1">Profile</h1>
        <p className="text-white/60 text-base">Scorer & management</p>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto px-5 pb-24">
        <div className="space-y-4 py-4">

          {/* Scorer Status Card (if logged in) */}
          {isLoggedIn && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gradient-to-r from-[#8BC9E8]/20 to-[#8BC9E8]/5 border border-[#8BC9E8]/30 rounded-[24px] p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-[#8BC9E8]/20 rounded-[16px] flex items-center justify-center flex-shrink-0">
                  <svg className="w-7 h-7 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white">Logged in as Scorer</h3>
                  <p className="text-white/50 text-sm">Tournament: {tournamentId}</p>
                </div>
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={() => navigate(`/scorer/tournament/${tournamentId}`)}
                  className="flex-1 bg-[#8BC9E8] text-[#2C2D3F] font-bold text-sm py-3 rounded-xl"
                >
                  Go to Matches
                </button>
                <button
                  onClick={logout}
                  className="px-5 bg-[#FF4B4B]/20 text-[#FF4B4B] font-bold text-sm py-3 rounded-xl border border-[#FF4B4B]/30"
                >
                  Logout
                </button>
              </div>
            </motion.div>
          )}

          {/* Create Tournament */}
          <motion.button
            onClick={() => navigate('/tournament/create')}
            whileTap={{ scale: 0.97 }}
            className="w-full bg-white rounded-[24px] p-5 flex items-center gap-4 shadow-xl active:shadow-lg transition-shadow min-h-[88px]"
          >
            <div className="w-16 h-16 bg-[#FFF5E6] rounded-[18px] flex items-center justify-center flex-shrink-0">
              <svg className="w-9 h-9 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M16.27 9.728a7.454 7.454 0 01-3.522 2.503m3.522-2.503a6.003 6.003 0 00-2.48-5.228m-3.522 7.731a7.454 7.454 0 003.522-2.503" />
              </svg>
            </div>
            <div className="flex-1 text-left">
              <h3 className="text-xl font-bold text-[#2C2D3F] mb-0.5">Create Tournament</h3>
              <p className="text-[#2C2D3F]/60 text-sm">Start new tournament</p>
            </div>
            <svg className="w-7 h-7 text-[#2C2D3F]/40 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </motion.button>

          {/* Scorer Login */}
          {!isLoggedIn && (
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
                <p className="text-white/50 text-sm">Login with tournament PIN</p>
              </div>
              <svg className="w-7 h-7 text-white/30 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          )}

        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#353647] border-t border-[#4A4B5E] safe-area-inset-bottom">
        <div className="flex items-center justify-around py-2 px-4">
          <button onClick={() => navigate('/')} className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Home</span>
          </button>

          <button onClick={() => navigate('/tournaments')} className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Stats</span>
          </button>

          <button onClick={() => navigate('/matches/completed')} className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 flex items-center justify-center">
              <svg className="w-7 h-7 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-white/40">Completed</span>
          </button>

          <button className="flex flex-col items-center gap-1 py-2 px-3 min-w-[72px]">
            <div className="w-14 h-14 bg-[#8BC9E8] rounded-[16px] flex items-center justify-center shadow-lg">
              <svg className="w-7 h-7 text-[#2C2D3F]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <span className="text-xs font-bold text-[#8BC9E8]">Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
