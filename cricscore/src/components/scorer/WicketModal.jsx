import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../common';

/**
 * Wicket Modal Component
 * Modal for recording wicket details
 */
const WicketModal = ({ isOpen, onClose, onSubmit, batsmen = [] }) => {
  const [wicketData, setWicketData] = useState({
    batsmanOut: '',
    howOut: 'caught',
    fielder: '',
    bowler: '',
    runs: 0
  });

  const howOutOptions = [
    { value: 'caught', label: 'Caught' },
    { value: 'bowled', label: 'Bowled' },
    { value: 'lbw', label: 'LBW' },
    { value: 'run_out', label: 'Run Out' },
    { value: 'stumped', label: 'Stumped' },
    { value: 'hit_wicket', label: 'Hit Wicket' },
    { value: 'caught_and_bowled', label: 'Caught & Bowled' },
    { value: 'retired_hurt', label: 'Retired Hurt' }
  ];

  const needsFielder = ['caught', 'run_out', 'stumped'].includes(wicketData.howOut);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(wicketData);
    setWicketData({ batsmanOut: '', howOut: 'caught', fielder: '', bowler: '', runs: 0 });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl  w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="p-5 border-b border-[#1E2030]/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Record Wicket</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4">
            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Batsman Out *
              </label>
              <select
                required
                value={wicketData.batsmanOut}
                onChange={(e) => setWicketData({ ...wicketData, batsmanOut: e.target.value })}
                className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                <option value="">Select batsman</option>
                {batsmen.map((bat) => (
                  <option key={bat.playerId} value={bat.name}>
                    {bat.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                How Out *
              </label>
              <select
                required
                value={wicketData.howOut}
                onChange={(e) => setWicketData({ ...wicketData, howOut: e.target.value })}
                className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20"
              >
                {howOutOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {needsFielder && (
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  Fielder {wicketData.howOut === 'caught' ? '*' : ''}
                </label>
                <input
                  type="text"
                  required={wicketData.howOut === 'caught'}
                  value={wicketData.fielder}
                  onChange={(e) => setWicketData({ ...wicketData, fielder: e.target.value })}
                  placeholder="Enter fielder name"
                  className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Runs off this ball
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={wicketData.runs}
                onChange={(e) => setWicketData({ ...wicketData, runs: parseInt(e.target.value) || 0 })}
                className="w-full px-4 py-3 bg-[#0F1118] border border-[#1E2030] text-white rounded-xl focus:outline-none focus:ring-1 focus:ring-white/20"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Record Wicket
              </Button>
              <Button type="button" variant="secondary" size="lg" onClick={onClose}>
                Cancel
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WicketModal;
