import { motion } from 'framer-motion';

/**
 * Super Over Break Component - Mobile-First Design
 * Displayed when the main match is tied and a Super Over is required
 */
const SuperOverBreak = ({ match, innings1, innings2, onStartSuperOver }) => {
  const team1Name = innings1?.battingTeam || match?.team1?.name;
  const team2Name = innings2?.battingTeam || match?.team2?.name;

  // Per cricket rules: team that batted 2nd bats first in SO
  const soBattingFirst = team2Name;

  return (
    <div className="fixed inset-0 z-50 bg-[#0B0D14] flex items-center justify-center p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md my-auto"
      >
        {/* Super Over Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500/20 border-2 border-amber-500 rounded-full">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span className="text-amber-400 font-bold text-lg">SUPER OVER</span>
          </div>
        </motion.div>

        {/* Match Tied Title */}
        <motion.div
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="text-center mb-6"
        >
          <h1 className="text-3xl font-bold text-white mb-1">Match Tied!</h1>
          <p className="text-white/50 text-sm">A Super Over will decide the winner</p>
        </motion.div>

        {/* Both Innings Scores Side-by-Side */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden mb-5"
        >
          <div className="grid grid-cols-2 divide-x divide-[#1E2030]/30">
            {/* Team 1 */}
            <div className="p-5 text-center">
              <p className="text-white/50 text-xs font-semibold tracking-wider mb-2">{team1Name?.toUpperCase()}</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-bold text-white">{innings1?.totalRuns ?? 0}</span>
                <span className="text-2xl font-bold text-white/50">/{innings1?.totalWickets ?? 0}</span>
              </div>
              <p className="text-white/40 text-xs mt-1">({innings1?.totalOvers ?? 0} ov)</p>
            </div>

            {/* Team 2 */}
            <div className="p-5 text-center">
              <p className="text-white/50 text-xs font-semibold tracking-wider mb-2">{team2Name?.toUpperCase()}</p>
              <div className="flex items-end justify-center gap-1">
                <span className="text-4xl font-bold text-white">{innings2?.totalRuns ?? 0}</span>
                <span className="text-2xl font-bold text-white/50">/{innings2?.totalWickets ?? 0}</span>
              </div>
              <p className="text-white/40 text-xs mt-1">({innings2?.totalOvers ?? 0} ov)</p>
            </div>
          </div>
        </motion.div>

        {/* Rules Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl p-5 mb-5"
        >
          <h3 className="text-white font-bold text-sm mb-3">Super Over Rules</h3>
          <div className="space-y-2 text-sm text-white/60">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div>
              <span>1 over each side</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div>
              <span>2 batsmen per side (max 2 wickets)</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-amber-400 rounded-full shrink-0"></div>
              <span><span className="text-white font-semibold">{soBattingFirst}</span> bats first</span>
            </div>
          </div>
        </motion.div>

        {/* Start Button */}
        {onStartSuperOver && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-center"
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={onStartSuperOver}
              className="bg-amber-500 text-[#0B0D14] rounded-full py-4 px-12 font-bold text-lg active:scale-[0.98] transition-all"
            >
              Start Super Over
            </motion.button>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default SuperOverBreak;
