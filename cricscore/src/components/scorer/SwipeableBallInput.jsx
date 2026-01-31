import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipe, useHapticFeedback } from '../../hooks/useGesture';

/**
 * Swipeable Ball Input - Mobile Optimized
 * Swipe right for runs (0-6), swipe left for extras/wicket
 */
const SwipeableBallInput = ({ onBallClick, onExtrasClick, onWicketClick }) => {
  const [currentPanel, setCurrentPanel] = useState('runs'); // 'runs' | 'extras'
  const haptic = useHapticFeedback();

  const swipeHandlers = useSwipe(
    () => {
      // Swipe left - show extras panel
      if (currentPanel === 'runs') {
        setCurrentPanel('extras');
        haptic.light();
      }
    },
    () => {
      // Swipe right - show runs panel
      if (currentPanel === 'extras') {
        setCurrentPanel('runs');
        haptic.light();
      }
    }
  );

  const handleBallClick = (runs) => {
    haptic.medium();
    onBallClick(runs);
  };

  const handleExtrasClick = (type) => {
    haptic.medium();
    onExtrasClick(type);
  };

  const handleWicketClick = () => {
    haptic.heavy();
    onWicketClick();
  };

  return (
    <div className="relative overflow-hidden">
      {/* Panel Indicator */}
      <div className="flex justify-center gap-2 mb-4">
        <button
          onClick={() => {
            setCurrentPanel('runs');
            haptic.light();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentPanel === 'runs'
              ? 'bg-brand-blue text-white'
              : 'bg-[#353647] text-text-secondary'
          }`}
        >
          Runs
        </button>
        <button
          onClick={() => {
            setCurrentPanel('extras');
            haptic.light();
          }}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
            currentPanel === 'extras'
              ? 'bg-brand-blue text-white'
              : 'bg-[#353647] text-text-secondary'
          }`}
        >
          Extras & Wicket
        </button>
      </div>

      {/* Swipeable Content */}
      <div {...swipeHandlers} className="touch-pan-y">
        <AnimatePresence mode="wait">
          {currentPanel === 'runs' && (
            <motion.div
              key="runs"
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Runs Grid */}
              <div className="grid grid-cols-3 gap-3">
                {[0, 1, 2, 3, 4, 6].map((runs) => (
                  <button
                    key={runs}
                    onClick={() => handleBallClick(runs)}
                    className={`
                      h-16 rounded-lg font-bold text-2xl
                      transition-all transform active:scale-95
                      ${runs === 0 ? 'bg-[#4A4B5E] text-white/80 hover:bg-gray-300' : ''}
                      ${runs === 1 || runs === 2 || runs === 3 ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' : ''}
                      ${runs === 4 ? 'bg-green-500/100 text-white hover:bg-green-600' : ''}
                      ${runs === 6 ? 'bg-brand-blue text-white hover:bg-brand-cyan' : ''}
                      shadow-md active:shadow-sm
                    `}
                  >
                    {runs}
                  </button>
                ))}
              </div>

              {/* Swipe hint */}
              <div className="mt-4 text-center">
                <p className="text-xs text-text-muted flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                  </svg>
                  Swipe for extras & wicket
                </p>
              </div>
            </motion.div>
          )}

          {currentPanel === 'extras' && (
            <motion.div
              key="extras"
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -20, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {/* Extras & Wicket Grid */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleExtrasClick('wide')}
                  className="h-16 bg-yellow-100 text-yellow-700 hover:bg-yellow-200 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-md active:shadow-sm"
                >
                  Wide
                </button>
                <button
                  onClick={() => handleExtrasClick('noBall')}
                  className="h-16 bg-orange-100 text-orange-700 hover:bg-orange-200 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-md active:shadow-sm"
                >
                  No Ball
                </button>
                <button
                  onClick={() => handleExtrasClick('bye')}
                  className="h-16 bg-purple-100 text-purple-700 hover:bg-purple-200 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-md active:shadow-sm"
                >
                  Bye
                </button>
                <button
                  onClick={() => handleExtrasClick('legBye')}
                  className="h-16 bg-indigo-100 text-indigo-700 hover:bg-indigo-200 rounded-lg font-bold text-lg transition-all transform active:scale-95 shadow-md active:shadow-sm"
                >
                  Leg Bye
                </button>
                <button
                  onClick={handleWicketClick}
                  className="col-span-2 h-16 bg-red-600 text-white hover:bg-red-700 rounded-lg font-bold text-xl transition-all transform active:scale-95 shadow-lg active:shadow-md"
                >
                  Wicket
                </button>
              </div>

              {/* Swipe hint */}
              <div className="mt-4 text-center">
                <p className="text-xs text-text-muted flex items-center justify-center gap-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                  Swipe for runs
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default SwipeableBallInput;
