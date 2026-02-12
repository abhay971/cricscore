import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from '../utils/toast.jsx';

const MatchSetupPage = () => {
  const { tournamentId } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const [formData, setFormData] = useState({
    team1: { name: '', players: [] },
    team2: { name: '', players: [] },
    overs: 20,
    matchType: 'T20',
    tossWinner: '',
    tossDecision: 'bat'
  });

  const [adminSecret, setAdminSecret] = useState('');
  const [team1Players, setTeam1Players] = useState(['', '', '']);
  const [team2Players, setTeam2Players] = useState(['', '', '']);

  useEffect(() => {
    if (tournamentId) {
      fetchTournament();
    }
  }, [tournamentId]);

  const fetchTournament = async () => {
    try {
      const response = await api.getTournament(tournamentId);
      setTournament(response.data.tournament);
    } catch (err) {
      setError('Failed to load tournament');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTeamNameChange = (team, value) => {
    setFormData(prev => ({
      ...prev,
      [team]: { ...prev[team], name: value }
    }));
  };

  const handlePlayerChange = (team, index, value) => {
    if (team === 'team1') {
      const newPlayers = [...team1Players];
      newPlayers[index] = value;
      setTeam1Players(newPlayers);
    } else {
      const newPlayers = [...team2Players];
      newPlayers[index] = value;
      setTeam2Players(newPlayers);
    }
  };

  const addPlayer = (team) => {
    if (team === 'team1') {
      setTeam1Players([...team1Players, '']);
    } else {
      setTeam2Players([...team2Players, '']);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const team1PlayersList = team1Players.filter(p => p.trim()).map((name, idx) => ({ playerId: `t1-p${idx + 1}`, name }));
      const team2PlayersList = team2Players.filter(p => p.trim()).map((name, idx) => ({ playerId: `t2-p${idx + 1}`, name }));

      if (team1PlayersList.length < 2 || team2PlayersList.length < 2) {
        setError('Each team must have at least 2 players');
        toast.warning('Each team must have at least 2 players');
        setLoading(false);
        return;
      }

      const matchData = { ...formData, team1: { ...formData.team1, players: team1PlayersList }, team2: { ...formData.team2, players: team2PlayersList } };
      const response = await api.createMatch(tournamentId, matchData, adminSecret);
      toast.success('Match created! Starting scorer interface...');
      navigate(`/match/${response.data.match.matchId}/score?token=${response.data.scorerToken}`);
    } catch (err) {
      setError(err.message || 'Failed to create match');
      toast.error(err.message || 'Failed to create match');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <button onClick={() => navigate(`/tournament/${tournamentId}`)} className="flex items-center gap-2 text-white/60 hover:text-white mb-4 transition-colors group">
            <svg className="w-5 h-5 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            <span className="font-medium">Back to Tournament</span>
          </button>
          <h1 className="text-2xl font-bold text-white">Create Match</h1>
          <p className="text-white/60 text-sm mt-2">{tournament?.name}</p>
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="bg-[#141620] border border-[#1E2030] rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Admin Authentication */}
            <div>
              <h3 className="text-base font-semibold text-white/90 mb-4">Admin Access</h3>
              <div>
                <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Admin Password *</label>
                <input
                  type="password"
                  required
                  value={adminSecret}
                  onChange={(e) => setAdminSecret(e.target.value)}
                  placeholder="Enter admin password"
                  className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                />
              </div>
            </div>

            <div>
              <h3 className="text-base font-semibold text-white/90 mb-4">Match Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Number of Overs *</label>
                  <input type="number" name="overs" required min="1" max="50" value={formData.overs} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Match Type *</label>
                  <select name="matchType" value={formData.matchType} onChange={handleInputChange} className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all">
                    <option value="T20">T20</option>
                    <option value="T10">T10</option>
                    <option value="ODI">ODI</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Team 1 */}
            <div>
              <h3 className="text-base font-semibold text-white/90 mb-4">Team 1</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.team1.name}
                    onChange={(e) => handleTeamNameChange('team1', e.target.value)}
                    placeholder="Enter team 1 name"
                    className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Players (minimum 2) *</label>
                  <div className="space-y-2">
                    {team1Players.map((player, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={player}
                        onChange={(e) => handlePlayerChange('team1', idx, e.target.value)}
                        placeholder={`Player ${idx + 1}`}
                        className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addPlayer('team1')}
                    className="mt-3 text-white/60 text-sm font-medium hover:text-white transition-colors"
                  >
                    + Add Player
                  </button>
                </div>
              </div>
            </div>

            {/* Team 2 */}
            <div>
              <h3 className="text-base font-semibold text-white/90 mb-4">Team 2</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Team Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.team2.name}
                    onChange={(e) => handleTeamNameChange('team2', e.target.value)}
                    placeholder="Enter team 2 name"
                    className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Players (minimum 2) *</label>
                  <div className="space-y-2">
                    {team2Players.map((player, idx) => (
                      <input
                        key={idx}
                        type="text"
                        value={player}
                        onChange={(e) => handlePlayerChange('team2', idx, e.target.value)}
                        placeholder={`Player ${idx + 1}`}
                        className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all placeholder-white/20"
                      />
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => addPlayer('team2')}
                    className="mt-3 text-white/60 text-sm font-medium hover:text-white transition-colors"
                  >
                    + Add Player
                  </button>
                </div>
              </div>
            </div>

            {/* Toss Details */}
            <div>
              <h3 className="text-base font-semibold text-white/90 mb-4">Toss Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Toss Winner *</label>
                  <select
                    name="tossWinner"
                    required
                    value={formData.tossWinner}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all"
                  >
                    <option value="">Select team</option>
                    {formData.team1.name && <option value={formData.team1.name}>{formData.team1.name}</option>}
                    {formData.team2.name && <option value={formData.team2.name}>{formData.team2.name}</option>}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-white/40 mb-2 tracking-wider uppercase">Toss Decision *</label>
                  <select
                    name="tossDecision"
                    value={formData.tossDecision}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white text-sm rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20 focus:border-white/30 transition-all"
                  >
                    <option value="bat">Bat First</option>
                    <option value="bowl">Bowl First</option>
                  </select>
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-400/10 border border-red-400/20 rounded-xl">
                <p className="text-sm text-red-400 font-medium">{error}</p>
              </div>
            )}

            <div className="flex items-center gap-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-white text-[#0B0D14] font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-opacity"
              >
                {loading ? 'Creating Match...' : 'Start Match'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/tournament/${tournamentId}`)}
                disabled={loading}
                className="py-3.5 px-6 bg-white/10 text-white border border-white/10 font-semibold text-sm rounded-xl disabled:opacity-30 disabled:cursor-not-allowed transition-opacity whitespace-nowrap"
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

export default MatchSetupPage;
