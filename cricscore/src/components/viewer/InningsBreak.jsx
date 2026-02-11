import { motion } from 'framer-motion';

/**
 * Innings Break Component - Mobile-First Design
 * Displayed between innings with 1st innings summary
 */
const InningsBreak = ({ match, innings, onStartNextInnings }) => {
  const battingTeam = innings?.battingTeam || match?.team1?.name;
  const bowlingTeam = innings?.bowlingTeam || match?.team2?.name;
  const target = (innings?.totalRuns || 0) + 1;
  const extras = innings?.extras || {};
  const totalExtras = (extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0);

  return (
    <div className="fixed inset-0 z-50 bg-[#1A1B2E] flex items-center justify-center p-5 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md my-auto"
      >
        {/* Innings Break Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-6"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-[#8BC9E8]/20 border-2 border-[#8BC9E8] rounded-full">
            <svg className="w-5 h-5 text-[#8BC9E8]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-[#8BC9E8] font-bold text-lg">INNINGS BREAK</span>
          </div>
        </motion.div>

        {/* 1st Innings Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#353647] border border-[#4A4B5E] rounded-[28px] overflow-hidden mb-5"
        >
          {/* Header */}
          <div className="bg-gradient-to-r from-[#8BC9E8] to-[#6BA8C8] px-6 py-4">
            <h2 className="text-white font-bold text-xl">1st Innings Summary</h2>
            <p className="text-white/80 text-sm mt-1">{battingTeam}</p>
          </div>

          {/* Score */}
          <div className="p-8 text-center border-b border-[#4A4B5E]/30">
            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-7xl font-black text-white">{innings?.totalRuns ?? 0}</span>
              <span className="text-5xl font-bold text-white/70">/</span>
              <span className="text-5xl font-bold text-white">{innings?.totalWickets ?? 0}</span>
            </div>
            <p className="text-white/70 text-lg">
              ({innings?.totalOvers ?? 0}/{match?.overs} overs)
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-[#4A4B5E]/30">
            <div className="p-5 text-center">
              <p className="text-sm text-white/50 mb-1">Run Rate</p>
              <p className="text-2xl font-bold text-[#8BC9E8]">{innings?.runRate?.toFixed(2) || '0.00'}</p>
            </div>
            <div className="p-5 text-center">
              <p className="text-sm text-white/50 mb-1">Extras</p>
              <p className="text-2xl font-bold text-white">{totalExtras}</p>
            </div>
          </div>
        </motion.div>

        {/* Target Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-[#8BC9E8] to-[#6BA8C8] rounded-[28px] p-8 text-center mb-6"
        >
          <p className="text-white/80 text-sm font-semibold mb-2">TARGET FOR {bowlingTeam?.toUpperCase()}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-6xl font-black text-white">{target}</span>
            <div className="text-left">
              <p className="text-white text-sm">runs</p>
              <p className="text-white/80 text-xs">in {match?.overs} overs</p>
            </div>
          </div>
          <p className="text-white/90 text-sm mt-4">Required Run Rate: {match?.overs ? (target / match.overs).toFixed(2) : '0.00'}</p>
        </motion.div>

        {/* Start Button - Pill shaped */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={onStartNextInnings}
            className="bg-[#8BC9E8] text-[#2C2D3F] rounded-full py-4 px-12 font-bold text-lg shadow-xl active:shadow-lg transition-all"
          >
            Start 2nd Innings
          </motion.button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InningsBreak;
