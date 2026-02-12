import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from '../utils/toast.jsx';

/**
 * Tournament Setup Page - Premium Dark Theme
 */
const TournamentSetupPage = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    organizerName: '',
    scorerPin: '',
    customRules: {
      declareOneEnabled: false
    }
  });
  const [adminSecret, setAdminSecret] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleCustomRuleChange = (rule, value) => {
    setFormData(prev => ({
      ...prev,
      customRules: {
        ...prev.customRules,
        [rule]: value
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await api.createTournament(formData, adminSecret);
      console.log('Tournament created:', response);
      toast.success('Tournament created successfully!');

      // Navigate to tournament page
      navigate(`/tournament/${response.data.tournament.tournamentId}`);
    } catch (err) {
      console.error('Failed to create tournament:', err);
      setError(err.message || 'Failed to create tournament');
      toast.error(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14]">
      <div className="px-6 py-8 max-w-2xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-10"
        >
          <button
            onClick={() => navigate('/')}
            className="flex items-center gap-2 text-white/60 hover:text-white mb-6 transition-colors group"
          >
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Back</span>
          </button>

          <h1 className="text-2xl font-bold text-white tracking-tight mb-2">Create Tournament</h1>
          <p className="text-white/60 text-sm">Set up your cricket tournament with custom rules and settings</p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl p-8"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Admin Authentication */}
            <div className="space-y-4">
              <h2 className="text-base font-semibold text-white/90">Admin Access</h2>
              <div>
                <label htmlFor="adminSecret" className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminSecret"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                />
              </div>
            </div>

            {/* Tournament Details Section */}
            <div className="space-y-6">
              <h2 className="text-base font-semibold text-white/90">Tournament Details</h2>

              {/* Tournament Name */}
              <div>
                <label htmlFor="name" className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">
                  Tournament Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Summer Cricket League 2026"
                  className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                />
              </div>

              {/* Organizer Name */}
              <div>
                <label htmlFor="organizerName" className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">
                  Organizer Name
                </label>
                <input
                  type="text"
                  id="organizerName"
                  name="organizerName"
                  required
                  value={formData.organizerName}
                  onChange={handleInputChange}
                  placeholder="Your Cricket Club"
                  className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                />
              </div>

              {/* Scorer PIN */}
              <div>
                <label htmlFor="scorerPin" className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">
                  Scorer PIN <span className="text-white/30 normal-case font-normal">(optional, 4-6 digits)</span>
                </label>
                <input
                  type="password"
                  id="scorerPin"
                  name="scorerPin"
                  inputMode="numeric"
                  pattern="\d{4,6}"
                  maxLength={6}
                  value={formData.scorerPin}
                  onChange={(e) => setFormData(prev => ({ ...prev, scorerPin: e.target.value.replace(/\D/g, '') }))}
                  placeholder="e.g. 1234"
                  className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20 tracking-[0.3em] text-center"
                />
                <p className="mt-2 text-xs text-white/30">Scorers will use this PIN to login and score all matches in this tournament</p>
              </div>
            </div>

            {/* Custom Rules Section */}
            <div className="border-t border-[#1E2030] pt-8">
              <h2 className="text-base font-semibold text-white/90 mb-6">Custom Rules</h2>

              {/* Declare 1 Run Feature Card */}
              <div className="bg-[#0F1118] border border-[#1E2030] rounded-xl p-5">
                {/* Header with title and toggle on same row */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <h3 className="font-semibold text-white text-sm">Declare 1 Run</h3>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.customRules.declareOneEnabled}
                      onChange={(e) => handleCustomRuleChange('declareOneEnabled', e.target.checked)}
                    />
                    <div className="w-12 h-7 bg-[#1E2030] peer-focus:outline-none peer-focus:ring-1 peer-focus:ring-white/20 rounded-full peer peer-checked:after:translate-x-5 after:content-[''] after:absolute after:top-[3px] after:left-[3px] after:bg-white after:rounded-full after:h-[22px] after:w-[22px] after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                {/* Description */}
                <p className="text-white/60 text-xs leading-relaxed">
                  Enable the custom "Declare 1 Run" scoring rule. When active during a ball, strike won't change until the over ends - perfect for local tournament variations.
                </p>
              </div>
            </div>

            {/* Error Message */}
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

            {/* Action Buttons */}
            <div className="pt-4 space-y-3">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-[#0B0D14] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-3">
                    <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Tournament...
                  </span>
                ) : (
                  'Create Tournament'
                )}
              </button>

              <button
                type="button"
                onClick={() => navigate('/')}
                disabled={loading}
                className="w-full py-3.5 bg-white/10 text-white border border-white/10 font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                Cancel
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default TournamentSetupPage;
