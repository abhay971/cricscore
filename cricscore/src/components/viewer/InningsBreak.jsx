import { motion } from 'framer-motion';
import { Button } from '../common';

/**
 * Innings Break Component
 * Displayed between innings with 1st innings summary
 */
const InningsBreak = ({ match, innings, onStartNextInnings }) => {
  const battingTeam = innings?.battingTeam || match?.team1?.name;
  const bowlingTeam = innings?.bowlingTeam || match?.team2?.name;
  const target = innings?.totalRuns + 1;

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-brand-navy via-brand-navyDark to-black flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-2xl"
      >
        {/* Innings Break Badge */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="inline-flex items-center gap-2 px-6 py-3 bg-brand-cyan/20 border-2 border-brand-cyan rounded-full">
            <svg className="w-5 h-5 text-brand-cyan" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span className="text-brand-cyan font-bold text-lg">INNINGS BREAK</span>
          </div>
        </motion.div>

        {/* 1st Innings Summary Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg-elevated overflow-hidden mb-6"
        >
          {/* Header */}
          <div className="bg-gradient-cyan px-6 py-4">
            <h2 className="text-white font-bold text-xl">1st Innings Summary</h2>
            <p className="text-white/80 text-sm mt-1">{battingTeam}</p>
          </div>

          {/* Score */}
          <div className="p-8 text-center border-b border-[#4A4B5E]/30">
            <div className="flex items-end justify-center gap-2 mb-2">
              <span className="text-7xl font-black text-white">{innings?.totalRuns}</span>
              <span className="text-5xl font-bold text-white/70">/</span>
              <span className="text-5xl font-bold text-white">{innings?.totalWickets}</span>
            </div>
            <p className="text-white/70 text-lg">
              ({innings?.totalOvers}/{match?.overs} overs)
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 divide-x divide-gray-100">
            <div className="p-6 text-center">
              <p className="text-sm text-white/70 mb-1">Run Rate</p>
              <p className="text-2xl font-bold text-brand-blue">{innings?.runRate?.toFixed(2)}</p>
            </div>
            <div className="p-6 text-center">
              <p className="text-sm text-white/70 mb-1">Extras</p>
              <p className="text-2xl font-bold text-white">
                {(innings?.extras?.wides || 0) + (innings?.extras?.noBalls || 0) + (innings?.extras?.byes || 0) + (innings?.extras?.legByes || 0)}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Target Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-r from-brand-cyan to-brand-blue rounded-card shadow-card-elevated p-8 text-center mb-8"
        >
          <p className="text-white/80 text-sm font-semibold mb-2">TARGET FOR {bowlingTeam?.toUpperCase()}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-6xl font-black text-white">{target}</span>
            <div className="text-left">
              <p className="text-white text-sm">runs</p>
              <p className="text-white/80 text-xs">in {match?.overs} overs</p>
            </div>
          </div>
          <p className="text-white/90 text-sm mt-4">Required Run Rate: {(target / match?.overs).toFixed(2)}</p>
        </motion.div>

        {/* Start Button */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center"
        >
          <Button
            variant="primary"
            size="lg"
            onClick={onStartNextInnings}
            className="px-12"
          >
            Start 2nd Innings
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default InningsBreak;
