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
              <span className="text-5xl">🏆</span>
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
                        <span className="text-xl">🏏</span>
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
                        <span className="text-lg">🎯</span>
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
