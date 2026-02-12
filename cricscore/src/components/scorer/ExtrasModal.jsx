import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { Button } from '../common';

/**
 * Extras Modal Component
 * Modal for recording detailed extras (Wide, No Ball, Byes, Leg Byes)
 */
const ExtrasModal = ({ isOpen, onClose, onSubmit, extraType = 'wide' }) => {
  const [extrasData, setExtrasData] = useState({
    type: extraType,
    runs: 1,
    additionalRuns: 0
  });

  // Sync when extraType prop changes (e.g., user clicks Wide then No Ball)
  useEffect(() => {
    if (isOpen) {
      const defaultRuns = (extraType === 'wide' || extraType === 'noball') ? 1 : 0;
      setExtrasData({ type: extraType, runs: defaultRuns, additionalRuns: 0 });
    }
  }, [extraType, isOpen]);

  const extraTypes = [
    { value: 'wide', label: 'Wide', defaultRuns: 1 },
    { value: 'noball', label: 'No Ball', defaultRuns: 1 },
    { value: 'bye', label: 'Bye', defaultRuns: 0 },
    { value: 'legbye', label: 'Leg Bye', defaultRuns: 0 }
  ];

  const handleTypeChange = (type) => {
    const extraInfo = extraTypes.find(e => e.value === type);
    setExtrasData({
      type,
      runs: extraInfo?.defaultRuns || 0,
      additionalRuns: 0
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(extrasData);
    setExtrasData({ type: 'wide', runs: 1, additionalRuns: 0 });
    onClose();
  };

  if (!isOpen) return null;

  const totalRuns = extrasData.runs + extrasData.additionalRuns;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl  w-full max-w-md"
        >
          <div className="p-5 border-b border-[#1E2030]/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Record Extra</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-[#141620] flex items-center justify-center transition-colors"
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
                Extra Type *
              </label>
              <div className="grid grid-cols-2 gap-2">
                {extraTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      extrasData.type === type.value
                        ? 'border-white bg-white text-[#0B0D14]'
                        : 'border-[#1E2030] bg-[#0F1118] text-white hover:border-white/30'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#0F1118] rounded-lg p-4">
              <div className="text-sm text-white/50 mb-2">
                {extrasData.type === 'wide' && 'Wide + runs scored (if any)'}
                {extrasData.type === 'noball' && 'No Ball + runs scored (if any)'}
                {extrasData.type === 'bye' && 'Byes run by batsmen'}
                {extrasData.type === 'legbye' && 'Leg Byes run by batsmen'}
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-white mb-2">
                Additional Runs
              </label>
              <input
                type="number"
                min="0"
                max="6"
                value={extrasData.additionalRuns}
                onChange={(e) => setExtrasData({ ...extrasData, additionalRuns: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-3 border border-[#1E2030] rounded-lg focus:outline-none focus:ring-2 focus:ring-white/20 text-lg font-bold text-center"
              />
              <p className="text-xs text-white/50 mt-1 text-center">
                Runs scored after the extra
              </p>
            </div>

            <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total Runs:</span>
                <span className="text-2xl font-bold text-emerald-400">{totalRuns}</span>
              </div>
              <div className="text-xs text-white/50 mt-1">
                {extrasData.type === 'wide' || extrasData.type === 'noball' 
                  ? 'Extra ball will be bowled' 
                  : 'Ball counts in over'
                }
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Record Extra
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

export default ExtrasModal;
