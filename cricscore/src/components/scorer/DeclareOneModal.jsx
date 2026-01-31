import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { Button } from '../common';

/**
 * Declare One Modal Component
 * Modal for recording Declare 1 Run with optional Wide/No Ball
 */
const DeclareOneModal = ({ isOpen, onClose, onSubmit }) => {
  const [declareData, setDeclareData] = useState({
    extraType: 'none',  // none, wide, noball
    additionalRuns: 0
  });

  const extraTypes = [
    { value: 'none', label: 'Just Declare 1' },
    { value: 'wide', label: 'Wide + Declare 1' },
    { value: 'noball', label: 'No Ball + Declare 1' }
  ];

  const handleTypeChange = (type) => {
    setDeclareData({
      extraType: type,
      additionalRuns: 0
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(declareData);
    setDeclareData({ extraType: 'none', additionalRuns: 0 });
    onClose();
  };

  if (!isOpen) return null;

  // Calculate total runs
  // Base: 1 run (declare 1)
  // + 1 if wide or no ball
  // + additional runs
  const baseRuns = 1; // Declare 1 always gives 1 run
  const extraRuns = (declareData.extraType === 'wide' || declareData.extraType === 'noball') ? 1 : 0;
  const totalRuns = baseRuns + extraRuns + declareData.additionalRuns;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ duration: 0.2 }}
          className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg-elevated w-full max-w-md"
        >
          <div className="p-5 border-b border-[#4A4B5E]/30">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Declare 1 Run</h2>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-lg hover:bg-[#353647] flex items-center justify-center transition-colors text-white"
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
                Type *
              </label>
              <div className="space-y-2">
                {extraTypes.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleTypeChange(type.value)}
                    className={`w-full px-4 py-3 rounded-lg border-2 font-semibold transition-all ${
                      declareData.extraType === type.value
                        ? 'border-[#8BC9E8] bg-[#8BC9E8] text-white'
                        : 'border-[#4A4B5E] bg-[#2C2D3F] text-white hover:border-[#8BC9E8]'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="bg-[#2C2D3F] rounded-lg p-4">
              <div className="text-sm text-white/70">
                {declareData.extraType === 'none' && '1 run scored, strike stays same'}
                {declareData.extraType === 'wide' && '1 (declare) + 1 (wide) + additional runs, extra ball'}
                {declareData.extraType === 'noball' && '1 (declare) + 1 (no ball) + additional runs, extra ball'}
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
                value={declareData.additionalRuns}
                onChange={(e) => setDeclareData({ ...declareData, additionalRuns: parseInt(e.target.value) || 0 })}
                placeholder="0"
                className="w-full px-4 py-3 bg-[#2C2D3F] border border-[#4A4B5E] text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8BC9E8] text-lg font-bold text-center"
              />
              <p className="text-xs text-white/70 mt-1 text-center">
                Runs scored by batsman (if any)
              </p>
            </div>

            <div className="bg-[#8BC9E8]/10 border border-[#8BC9E8]/30 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-white">Total Runs:</span>
                <span className="text-2xl font-bold text-[#8BC9E8]">{totalRuns}</span>
              </div>
              <div className="text-xs text-white/70 mt-2">
                <span className="inline-flex items-center gap-1">
                  <svg className="w-3 h-3 text-[#F59E0B] inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
                  </svg>
                  Strike won't change (Declare 1 Rule)
                </span>
              </div>
              {(declareData.extraType === 'wide' || declareData.extraType === 'noball') && (
                <div className="text-xs text-white/70 mt-1">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3 text-white/70 inline" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                    </svg>
                    Extra ball will be bowled
                  </span>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" variant="primary" size="lg" fullWidth>
                Record Declare 1
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

export default DeclareOneModal;
