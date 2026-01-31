import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

/**
 * All Tournaments Page - Mobile-First Design
 * Fully optimized for mobile with rounded, pill-shaped buttons
 */
const AllTournamentsPage = () => {
  const navigate = useNavigate();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInProgressRef = useRef(false);
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    // Prevent duplicate fetches (React StrictMode causes double mount in dev)
    if (hasFetchedRef.current || fetchInProgressRef.current) {
      return;
    }

    fetchTournaments();
  }, []);

  const fetchTournaments = async () => {
    // Prevent multiple simultaneous requests
    if (fetchInProgressRef.current) {
      console.log('⏭️  Skipping duplicate tournaments fetch');
      return;
    }

    fetchInProgressRef.current = true;

    try {
      console.log('🔄 Fetching tournaments...');
      const response = await api.getAllTournaments();
      setTournaments(response.data.tournaments || []);
      hasFetchedRef.current = true;
    } catch (err) {
      console.error('Failed to fetch tournaments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      upcoming: { text: 'Upcoming', color: 'bg-blue-500/20 text-blue-400' },
      ongoing: { text: 'Live', color: 'bg-green-500/20 text-green-400' },
      completed: { text: 'Completed', color: 'bg-white/10 text-white/60' }
    };
    const badge = badges[status] || badges.upcoming;
    return (
      <span className={`px-4 py-1.5 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2C2D3F]">
        <div className="text-center">
          <div className="animate-spin w-14 h-14 border-4 border-[#8BC9E8] border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70 text-lg">Loading tournaments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2C2D3F] pb-24">
      {/* Header - Mobile Optimized */}
      <div className="px-5 pt-6 pb-6 sticky top-0 bg-[#2C2D3F] z-10">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-5 transition-colors py-2"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium text-base">Back</span>
        </button>

        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-black text-white mb-1">Tournaments</h1>
            <p className="text-white/60">All your cricket tournaments</p>
          </div>
        </div>

        {/* Create Tournament Button - Pill shaped */}
        <motion.button
          onClick={() => navigate('/tournament/create')}
          whileTap={{ scale: 0.97 }}
          className="w-full bg-[#8BC9E8] text-[#2C2D3F] rounded-full py-4 px-6 flex items-center justify-center gap-3 font-bold text-lg shadow-xl active:shadow-lg transition-shadow"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          <span>Create Tournament</span>
        </motion.button>
      </div>

      {/* Error State */}
      {error && (
        <div className="mx-5 mb-4 bg-red-500/10 border border-red-500/30 rounded-[24px] p-4">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Tournaments List - Single Column for Mobile */}
      <div className="px-5">
        {tournaments.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#353647] border border-[#4A4B5E] rounded-[28px] p-10 text-center"
          >
            <div className="w-20 h-20 bg-[#8BC9E8]/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-10 h-10 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M16.27 9.728a7.454 7.454 0 01-3.522 2.503m3.522-2.503a6.003 6.003 0 00-2.48-5.228m-3.522 7.731a7.454 7.454 0 003.522-2.503" />
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">No Tournaments Yet</h3>
            <p className="text-white/60 mb-6 text-base">Get started by creating your first tournament</p>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {tournaments.map((tournament, index) => (
              <motion.button
                key={tournament.tournamentId}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                whileTap={{ scale: 0.98 }}
                className="w-full bg-[#353647] border border-[#4A4B5E] rounded-[28px] overflow-hidden shadow-lg active:shadow-xl transition-all text-left"
              >
                {/* Header */}
                <div className="bg-gradient-to-br from-[#8BC9E8]/20 to-transparent px-6 py-5 border-b border-[#4A4B5E]/30">
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <h3 className="text-xl font-bold text-white flex-1">
                      {tournament.name}
                    </h3>
                    {getStatusBadge(tournament.status)}
                  </div>
                  <p className="text-white/60 text-sm">
                    by {tournament.organizerName}
                  </p>
                </div>

                {/* Content */}
                <div className="px-6 py-5">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-10 h-10 bg-[#8BC9E8]/10 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-[#8BC9E8]" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z" />
                        </svg>
                      </div>
                      <div>
                        <p className="text-xs text-white/50">Total Matches</p>
                        <p className="text-2xl font-black text-white">
                          {tournament.matches?.length || 0}
                        </p>
                      </div>
                    </div>

                    {tournament.customRules?.declareOneEnabled && (
                      <div className="flex items-center gap-2 px-3 py-2 bg-[#8BC9E8]/10 rounded-full border border-[#8BC9E8]/20">
                        <svg className="w-4 h-4 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                        </svg>
                        <span className="text-xs font-bold text-[#8BC9E8]">Declare 1</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-[#4A4B5E]/30">
                    <p className="text-xs text-white/40">
                      {new Date(tournament.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                    <svg className="w-6 h-6 text-white/30" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllTournamentsPage;
