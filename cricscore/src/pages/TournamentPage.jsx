import { motion } from 'framer-motion';
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import api from '../services/api';

/**
 * Tournament Page
 * Shows tournament details and list of matches
 */
const TournamentPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetchInProgressRef = useRef(false);

  useEffect(() => {
    if (tournamentId) {
      fetchTournamentData();
    }
  }, [tournamentId]);

  const fetchTournamentData = async () => {
    // Prevent multiple simultaneous requests
    if (fetchInProgressRef.current) {
      console.log('⏭️  Skipping duplicate tournament fetch');
      return;
    }

    fetchInProgressRef.current = true;
    setLoading(true);

    try {
      const [tournamentRes, matchesRes] = await Promise.all([
        api.getTournament(tournamentId),
        api.getTournamentMatches(tournamentId)
      ]);

      setTournament(tournamentRes.data.tournament);
      setMatches(matchesRes.data.matches || []);
    } catch (err) {
      console.error('Failed to fetch tournament:', err);
      setError(err.message);
    } finally {
      setLoading(false);
      fetchInProgressRef.current = false;
    }
  };

  const getMatchStatusBadge = (status) => {
    const badges = {
      not_started: { text: 'Upcoming', color: 'bg-gray-100 text-gray-700' },
      live: { text: 'LIVE', color: 'bg-red-500/100 text-white animate-pulse' },
      innings_break: { text: 'Innings Break', color: 'bg-blue-500/100 text-white' },
      completed: { text: 'Completed', color: 'bg-green-500/100 text-white' }
    };

    const badge = badges[status] || badges.not_started;

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-bold ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2C2D3F]">
        <div className="text-center">
          <div className="animate-spin w-12 h-12 border-4 border-brand-blue border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-white/70">Loading tournament...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#2C2D3F] px-4">
        <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-8 max-w-md">
          <div className="text-center">
            <svg className="w-16 h-16 text-red-500 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <h2 className="text-xl font-bold text-white mb-2">Error Loading Tournament</h2>
            <p className="text-white/70 mb-6">{error}</p>
            <Button variant="primary" onClick={() => navigate('/')}>
              Go Back Home
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#2C2D3F] py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/70 hover:text-white mb-4 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span>Back to Home</span>
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">{tournament?.name}</h1>
              <p className="text-white/70 mt-2">Organized by {tournament?.organizerName}</p>
              {tournament?.customRules?.declareOneEnabled && (
                <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Declare 1 Run Enabled
                </div>
              )}
            </div>

            <Button
              variant="primary"
              onClick={() => navigate(`/tournament/${tournamentId}/match/new`)}
            >
              + Add Match
            </Button>
          </div>
        </div>

        {/* Matches List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          {matches.length === 0 ? (
            <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-12 text-center">
              <svg className="w-16 h-16 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">No Matches Yet</h3>
              <p className="text-white/70 mb-6">Get started by creating your first match</p>
              <div className="flex justify-center">
                <Button
                  variant="primary"
                  onClick={() => navigate(`/tournament/${tournamentId}/match/new`)}
                >
                  Create First Match
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {matches.map((match) => (
                <div
                  key={match.matchId}
                  className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg hover:shadow-card-hover transition-shadow cursor-pointer overflow-hidden"
                  onClick={() => navigate(`/match/${match.matchId}`)}
                >
                  <div className="p-5">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-bold text-white">
                          {match.team1?.name} vs {match.team2?.name}
                        </h3>
                        <p className="text-sm text-white/70 mt-1">
                          {match.matchType} • {match.overs} overs per side
                        </p>
                      </div>
                      {getMatchStatusBadge(match.status)}
                    </div>

                    {match.status === 'live' && match.liveInnings && (
                      <div className="border-t border-[#4A4B5E] pt-4 mt-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-white/70">Current Score</p>
                            <p className="text-2xl font-bold text-white">
                              {match.liveInnings.totalRuns}/{match.liveInnings.totalWickets}
                            </p>
                            <p className="text-sm text-white/70">
                              ({match.liveInnings.totalOvers}/{match.overs} ov)
                            </p>
                          </div>
                          <Button variant="primary" size="sm">
                            Watch Live
                          </Button>
                        </div>
                      </div>
                    )}

                    {match.status === 'completed' && match.result && (
                      <div className="border-t border-gray-100 pt-4 mt-4">
                        <p className="text-sm font-semibold text-green-600">
                          {match.result
                            .replace(/\bteam1\b/g, match.team1?.name || 'team1')
                            .replace(/\bteam2\b/g, match.team2?.name || 'team2')}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default TournamentPage;
