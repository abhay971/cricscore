import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useRef } from 'react';

/**
 * Commentary Component
 * Displays ball-by-ball commentary with smooth animations
 */
const Commentary = ({ commentary = [] }) => {
  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current && commentary.length > 0) {
      containerRef.current.scrollTop = 0;
    }
  }, [commentary]);

  const getBallTypeStyle = (text) => {
    const lowerText = text.toLowerCase();

    if (lowerText.includes('wicket') || lowerText.includes('out')) {
      return 'border-l-4 border-red-500 bg-red-500/100/10';
    }
    if (lowerText.includes('six') || lowerText.includes('6')) {
      return 'border-l-4 border-green-500 bg-green-500/100/10';
    }
    if (lowerText.includes('four') || lowerText.includes('4')) {
      return 'border-l-4 border-emerald-400 bg-emerald-400/10';
    }
    if (lowerText.includes('wide') || lowerText.includes('no ball')) {
      return 'border-l-4 border-orange-500 bg-orange-500/100/10';
    }
    return 'border-l-4 border-[#1E2030] bg-[#141620]';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (!commentary || commentary.length === 0) {
    return (
      <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  p-8 text-center">
        <svg className="w-12 h-12 text-white/40 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <p className="text-white/70 text-sm">No commentary yet</p>
        <p className="text-white/30 text-xs mt-1">Ball-by-ball updates will appear here</p>
      </div>
    );
  }

  return (
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl  overflow-hidden">
      <div className="px-4 py-3 bg-[#0F1118] border-b border-[#1E2030]/30 flex items-center justify-between">
        <h3 className="font-bold text-white text-sm">Live Commentary</h3>
        <span className="text-xs text-white/70">{commentary.length} updates</span>
      </div>

      <div ref={containerRef} className="max-h-96 overflow-y-auto divide-y divide-[#1E2030]/30">
        <AnimatePresence mode="popLayout">
          {commentary.map((item, index) => (
            <motion.div
              key={item.id || index}
              initial={{ opacity: 0, height: 0, x: -20 }}
              animate={{ opacity: 1, height: 'auto', x: 0 }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05, ease: 'easeOut' }}
              className={`p-4 ${getBallTypeStyle(item.text || item.commentary)}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  {item.over !== undefined && (
                    <div className="text-xs font-bold text-white/70 mb-1">
                      {item.over}.{item.ball} ov
                    </div>
                  )}
                  <p className="text-sm text-white leading-relaxed">
                    {item.text || item.commentary}
                  </p>
                  {item.runs !== undefined && (
                    <div className="flex items-center gap-2 mt-2">
                      <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[#1E2030] text-xs font-bold text-white">
                        {item.runs}
                      </span>
                      {item.extras && <span className="text-xs text-white/70">({item.extras})</span>}
                    </div>
                  )}
                </div>
                <div className="text-xs text-white/30 whitespace-nowrap">
                  {formatTime(item.timestamp)}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Commentary;
