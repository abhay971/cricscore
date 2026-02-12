import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store';
import api from '../services/api';

/**
 * Scorer Login Page - Premium Dark Theme
 */
const ScorerLoginPage = () => {
  const navigate = useNavigate();
  const { loginAsScorer } = useAuthStore();

  const [tournamentId, setTournamentId] = useState('');
  const [pin, setPin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.scorerLogin(tournamentId.trim(), pin);
      loginAsScorer(response.data.token, response.data.tournamentId);
      navigate(`/scorer/tournament/${response.data.tournamentId}`);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] flex items-center justify-center">
      <div className="px-6 w-full max-w-md">
        {/* Back button */}
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/60 hover:text-white mb-8 transition-colors group"
        >
          <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
          </svg>
          <span className="font-medium">Back</span>
        </button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8"
        >
          <h1 className="text-2xl font-bold text-white tracking-tight">Scorer Login</h1>
          <p className="text-white/60 text-sm mt-2">Enter your tournament ID and PIN to start scoring</p>
        </motion.div>

        {/* Login Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Tournament ID */}
            <div>
              <label htmlFor="tournamentId" className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">
                Tournament ID
              </label>
              <input
                type="text"
                id="tournamentId"
                value={tournamentId}
                onChange={(e) => setTournamentId(e.target.value)}
                placeholder="T-2026-001"
                required
                className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
              />
            </div>

            {/* PIN */}
            <div>
              <label htmlFor="pin" className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">
                Scorer PIN
              </label>
              <input
                type="password"
                id="pin"
                inputMode="numeric"
                pattern="\d{4,6}"
                maxLength={6}
                value={pin}
                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 4-6 digit PIN"
                required
                className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20 tracking-[0.3em] text-center"
              />
            </div>

            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl"
              >
                <div className="flex items-center gap-3">
                  <svg className="w-5 h-5 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-sm text-red-400 font-medium">{error}</p>
                </div>
              </motion.div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || !tournamentId || !pin}
              className="w-full py-3.5 bg-white text-[#0B0D14] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-3">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Logging in...
                </span>
              ) : (
                'Login as Scorer'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default ScorerLoginPage;
