import { motion } from 'framer-motion';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/common';
import api from '../services/api';
import toast from '../utils/toast.jsx';

/**
 * Tournament Setup Page - Premium Design
 * Visually engaging form for creating tournaments
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
      console.log('✅ Tournament created:', response);
      toast.success('Tournament created successfully!');

      // Navigate to tournament page
      navigate(`/tournament/${response.data.tournament.tournamentId}`);
    } catch (err) {
      console.error('❌ Failed to create tournament:', err);
      setError(err.message || 'Failed to create tournament');
      toast.error(err.message || 'Failed to create tournament');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#2C2D3F] relative overflow-hidden">
      {/* Gradient Background Effects */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#8BC9E8]/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-[#8BC9E8]/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 px-6 py-8 max-w-2xl mx-auto">
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

          {/* Hero Section */}
          <div className="flex items-center gap-4 mb-3">
            <div className="w-16 h-16 bg-gradient-to-br from-[#8BC9E8] to-[#6BA8C8] rounded-[18px] flex items-center justify-center shadow-xl">
              <svg className="w-9 h-9 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 013 3h-15a3 3 0 013-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 01-.982-3.172M9.497 14.25a7.454 7.454 0 00.981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 007.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52A6.003 6.003 0 0016.27 9.728M18.75 4.236V4.5c0 2.108-.966 3.99-2.48 5.228M18.75 4.236V2.721M16.27 9.728a7.454 7.454 0 01-3.522 2.503m3.522-2.503a6.003 6.003 0 00-2.48-5.228m-3.522 7.731a7.454 7.454 0 003.522-2.503" />
              </svg>
            </div>
            <div>
              <h1 className="text-4xl font-black text-white tracking-tight">Create Tournament</h1>
            </div>
          </div>
          <p className="text-white/60 text-lg ml-20">Set up your cricket tournament with custom rules and settings</p>
        </motion.div>

        {/* Main Form Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="bg-gradient-to-br from-[#353647] to-[#2C2D3F] border border-[#4A4B5E]/50 rounded-[28px] p-8 shadow-2xl backdrop-blur-sm"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Admin Authentication */}
            <div className="space-y-4">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-red-500/10 rounded-[12px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Admin Access</h2>
              </div>
              <div>
                <label htmlFor="adminSecret" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase opacity-70">
                  Admin Password
                </label>
                <input
                  type="password"
                  id="adminSecret"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-6 py-4 bg-[#2C2D3F] border-2 border-[#4A4B5E] text-white text-lg placeholder-white/30 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-red-400 focus:border-red-400 transition-all"
                />
              </div>
            </div>

            {/* Tournament Details Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#8BC9E8]/10 rounded-[12px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Tournament Details</h2>
              </div>

              {/* Tournament Name */}
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase opacity-70">
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
                  className="w-full px-6 py-4 bg-[#2C2D3F] border-2 border-[#4A4B5E] text-white text-lg placeholder-white/30 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#8BC9E8] focus:border-[#8BC9E8] transition-all"
                />
              </div>

              {/* Organizer Name */}
              <div>
                <label htmlFor="organizerName" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase opacity-70">
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
                  className="w-full px-6 py-4 bg-[#2C2D3F] border-2 border-[#4A4B5E] text-white text-lg placeholder-white/30 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#8BC9E8] focus:border-[#8BC9E8] transition-all"
                />
              </div>

              {/* Scorer PIN */}
              <div>
                <label htmlFor="scorerPin" className="block text-sm font-bold text-white mb-3 tracking-wide uppercase opacity-70">
                  Scorer PIN <span className="text-white/40 normal-case font-normal">(optional, 4-6 digits)</span>
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
                  className="w-full px-6 py-4 bg-[#2C2D3F] border-2 border-[#4A4B5E] text-white text-lg placeholder-white/30 rounded-[20px] focus:outline-none focus:ring-2 focus:ring-[#8BC9E8] focus:border-[#8BC9E8] transition-all tracking-[0.3em] text-center"
                />
                <p className="mt-2 text-xs text-white/40">Scorers will use this PIN to login and score all matches in this tournament</p>
              </div>
            </div>

            {/* Custom Rules Section */}
            <div className="border-t border-[#4A4B5E]/50 pt-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#8BC9E8]/10 rounded-[12px] flex items-center justify-center">
                  <svg className="w-5 h-5 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <h2 className="text-xl font-bold text-white">Custom Rules</h2>
              </div>

              {/* Declare 1 Run Feature Card */}
              <motion.div
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.2 }}
                className="bg-gradient-to-br from-[#8BC9E8]/10 to-transparent border border-[#8BC9E8]/20 rounded-[24px] p-6 backdrop-blur-sm"
              >
                {/* Header with icon, title, and toggle on same row */}
                <div className="flex items-center justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3">
                    <svg className="w-7 h-7 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                    </svg>
                    <h3 className="font-bold text-white text-lg">Declare 1 Run</h3>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={formData.customRules.declareOneEnabled}
                      onChange={(e) => handleCustomRuleChange('declareOneEnabled', e.target.checked)}
                    />
                    <div className="w-16 h-9 bg-[#4A4B5E] peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-[#8BC9E8] rounded-full peer peer-checked:after:translate-x-7 after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:rounded-full after:h-7 after:w-7 after:transition-all after:shadow-lg peer-checked:bg-[#8BC9E8]"></div>
                  </label>
                </div>

                {/* Description spans full width */}
                <p className="text-white/60 text-sm leading-relaxed">
                  Enable the custom "Declare 1 Run" scoring rule. When active during a ball, strike won't change until the over ends - perfect for local tournament variations.
                </p>
              </motion.div>
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 bg-red-500/100/10 border border-red-500/30 rounded-[20px] backdrop-blur-sm"
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
            <div className="pt-4 space-y-4">
              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                disabled={loading}
                className="text-xl font-bold rounded-[20px] py-5"
              >
                {loading ? (
                  <span className="flex items-center gap-3">
                    <svg className="animate-spin h-6 w-6" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Creating Tournament...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-3">
                    <span>Create Tournament</span>
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                )}
              </Button>

              <Button
                type="button"
                variant="ghost"
                size="lg"
                fullWidth
                onClick={() => navigate('/')}
                disabled={loading}
                className="text-base rounded-[20px]"
              >
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 grid grid-cols-3 gap-4"
        >
          <div className="bg-[#353647]/50 border border-[#4A4B5E]/30 rounded-[20px] p-4 text-center backdrop-blur-sm">
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-[#F59E0B]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
              </svg>
            </div>
            <div className="text-xs text-white/60 font-medium">Live Scoring</div>
          </div>
          <div className="bg-[#353647]/50 border border-[#4A4B5E]/30 rounded-[20px] p-4 text-center backdrop-blur-sm">
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <div className="text-xs text-white/60 font-medium">Real-time Stats</div>
          </div>
          <div className="bg-[#353647]/50 border border-[#4A4B5E]/30 rounded-[20px] p-4 text-center backdrop-blur-sm">
            <div className="flex justify-center mb-2">
              <svg className="w-8 h-8 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
              </svg>
            </div>
            <div className="text-xs text-white/60 font-medium">Custom Rules</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default TournamentSetupPage;
