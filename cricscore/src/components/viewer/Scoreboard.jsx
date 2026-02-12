import { memo } from 'react';
import { motion } from 'framer-motion';

/**
 * Scoreboard Component - Cricbuzz-Style
 * Full batting & bowling tables with all players
 */
const Scoreboard = memo(({ match, innings }) => {
  // Score data
  const score = innings?.totalRuns || 0;
  const wickets = innings?.totalWickets || 0;
  const overs = innings?.totalOvers || 0.0;
  const maxOvers = innings?.isSuperOver ? 1 : (match?.overs || 20);
  const currentRunRate = innings?.runRate || 0.00;
  const requiredRunRate = innings?.requiredRunRate || 0.00;

  // Team name resolution (handles corrupted old data + trimming)
  const resolveName = (name) => {
    const trimmed = name?.trim();
    if (trimmed === 'team1') return match?.team1?.name || name;
    if (trimmed === 'team2') return match?.team2?.name || name;
    return trimmed;
  };
  // Use innings data directly for team names (handles SO innings correctly)
  const battingTeam = resolveName(innings?.battingTeam) || match?.team1?.name;
  const bowlingTeam = resolveName(innings?.bowlingTeam) || match?.team2?.name;

  // Extras
  const extras = innings?.extras || {};
  const totalExtras = (extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0);

  // All batsmen and bowlers
  const allBatsmen = innings?.currentBatsmen || [];
  const allBowlers = innings?.bowlers || [];
  const currentBowler = innings?.currentBowler;

  // Build deduplicated bowler list (bowlers array + current bowler with latest stats)
  const getBowlersList = () => {
    const bowlerMap = new Map();
    allBowlers.forEach(b => {
      if (b.name) bowlerMap.set(b.name.trim().toLowerCase(), b);
    });
    // Override with current bowler (has latest stats)
    if (currentBowler?.name) {
      bowlerMap.set(currentBowler.name.trim().toLowerCase(), currentBowler);
    }
    return Array.from(bowlerMap.values());
  };

  const bowlersList = getBowlersList();

  return (
    <div className="space-y-3">
      {/* Live Badge + Super Over Badge */}
      {match?.status === 'live' && (
        <div className="flex items-center justify-center gap-2">
          <span className="bg-accent-red text-white text-xs font-bold px-4 py-1.5 rounded-full flex items-center gap-2 shadow-lg">
            <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
            LIVE
          </span>
          {match?.isSuperOver && (
            <span className="bg-amber-500 text-[#2C2D3F] text-xs font-bold px-4 py-1.5 rounded-full shadow-lg">
              SUPER OVER
            </span>
          )}
        </div>
      )}

      {/* Main Score Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-light-blue rounded-3xl p-5 shadow-card-elevated"
      >
        {/* Team Name & Innings */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white/20 rounded-2xl flex items-center justify-center">
              <span className="text-white font-bold text-sm">
                {battingTeam?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <div>
              <h3 className="text-white font-bold text-lg">{battingTeam || 'Team A'}</h3>
              <p className="text-white/60 text-xs">
                {innings?.isSuperOver
                  ? `Super Over - ${innings?.inningsNumber === 3 ? '1st' : '2nd'}`
                  : `${innings?.inningsNumber === 1 ? '1st' : '2nd'} Innings`}
              </p>
            </div>
          </div>
        </div>

        {/* Score Display */}
        <div className="flex items-end justify-between">
          <div className="flex items-baseline gap-2">
            <span className="text-white text-5xl font-black">{score}</span>
            <span className="text-white/70 text-3xl font-bold">-{wickets}</span>
            <span className="text-white/50 text-sm font-medium pb-1.5">({overs}/{maxOvers})</span>
          </div>

          {/* Run Rates */}
          <div className="text-right space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-white/60 text-xs">CRR</span>
              <span className="text-white font-bold text-lg">{currentRunRate.toFixed(2)}</span>
            </div>
            {requiredRunRate > 0 && (
              <div className="flex items-center gap-2">
                <span className="text-white/60 text-xs">REQ</span>
                <span className="text-white font-bold text-lg">{requiredRunRate.toFixed(2)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Target Info (chasing innings: 2nd or SO 2nd) */}
        {(innings?.inningsNumber === 2 || innings?.inningsNumber === 4) && innings?.target > 0 && innings.target > score && (
          <div className="mt-3 pt-3 border-t border-white/20">
            <p className="text-white/80 text-sm">
              Need <span className="font-bold text-white">{innings.target - score}</span> runs from{' '}
              <span className="font-bold text-white">{(maxOvers * 6) - (innings.balls || 0)}</span> balls
            </p>
          </div>
        )}
      </motion.div>

      {/* ── Batting Table ── Cricbuzz Style ── */}
      {allBatsmen.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-[#353647] border border-[#4A4B5E] rounded-3xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="flex items-center px-4 py-2.5 bg-[#2C2D3F] border-b border-[#4A4B5E]/50">
            <span className="text-white/50 text-[11px] font-bold tracking-wider flex-1">BATTER</span>
            <div className="flex items-center">
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">R</span>
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">B</span>
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">4s</span>
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">6s</span>
              <span className="text-white/50 text-[11px] font-bold w-14 text-right">SR</span>
            </div>
          </div>

          {/* Batsmen Rows */}
          <div className="divide-y divide-[#4A4B5E]/30">
            {allBatsmen.map((b, i) => {
              const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
              const isActive = !b.isOut;
              return (
                <div
                  key={i}
                  className={`flex items-center px-4 py-3 ${isActive ? 'bg-[#3d3e52]' : ''}`}
                >
                  <div className="flex-1 min-w-0 pr-2">
                    <div className="flex items-center gap-1.5">
                      <span className={`text-sm font-semibold truncate ${isActive ? 'text-white' : 'text-white/70'}`}>
                        {b.name}
                      </span>
                      {b.onStrike && isActive && (
                        <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0 animate-pulse"></span>
                      )}
                    </div>
                    <p className={`text-[10px] mt-0.5 ${b.isOut ? 'text-red-400/60' : 'text-green-400/60'}`}>
                      {b.isOut ? (b.dismissalType || 'out') : 'batting'}
                    </p>
                  </div>
                  <div className="flex items-center shrink-0">
                    <span className={`text-sm w-9 text-right font-bold ${isActive ? 'text-white' : 'text-white/70'}`}>
                      {b.runs || 0}
                    </span>
                    <span className="text-white/40 text-xs w-9 text-right">{b.balls || 0}</span>
                    <span className="text-white/40 text-xs w-9 text-right">{b.fours || 0}</span>
                    <span className="text-white/40 text-xs w-9 text-right">{b.sixes || 0}</span>
                    <span className="text-white/30 text-[11px] w-14 text-right">{sr}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extras Row */}
          {totalExtras > 0 && (
            <div className="flex items-center justify-between px-4 py-2.5 bg-[#2C2D3F] border-t border-[#4A4B5E]/50">
              <span className="text-white/50 text-xs font-medium">Extras</span>
              <div className="flex items-center gap-3">
                <span className="text-white/30 text-[10px]">
                  (w {extras.wides || 0}, nb {extras.noBalls || 0}, b {extras.byes || 0}, lb {extras.legByes || 0})
                </span>
                <span className="text-white font-bold text-sm">{totalExtras}</span>
              </div>
            </div>
          )}

          {/* Total Row */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#2C2D3F] border-t border-[#4A4B5E]/50">
            <span className="text-white/70 text-xs font-bold">Total</span>
            <div className="flex items-center gap-2">
              <span className="text-white font-bold text-sm">
                {score}/{wickets}
              </span>
              <span className="text-white/40 text-[10px]">({overs} ov)</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* ── Bowling Table ── Cricbuzz Style ── */}
      {bowlersList.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-[#353647] border border-[#4A4B5E] rounded-3xl overflow-hidden"
        >
          {/* Table Header */}
          <div className="flex items-center px-4 py-2.5 bg-[#2C2D3F] border-b border-[#4A4B5E]/50">
            <span className="text-white/50 text-[11px] font-bold tracking-wider flex-1">BOWLER</span>
            <div className="flex items-center">
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">O</span>
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">M</span>
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">R</span>
              <span className="text-white/50 text-[11px] font-bold w-9 text-right">W</span>
              <span className="text-white/50 text-[11px] font-bold w-14 text-right">ECON</span>
            </div>
          </div>

          {/* Bowler Rows */}
          <div className="divide-y divide-[#4A4B5E]/30">
            {bowlersList.map((b, i) => {
              const isCurrent = currentBowler?.name?.trim().toLowerCase() === b.name?.trim().toLowerCase();
              return (
                <div
                  key={i}
                  className={`flex items-center px-4 py-3 ${isCurrent ? 'bg-[#3d3e52]' : ''}`}
                >
                  <div className="flex items-center gap-1.5 flex-1 min-w-0 pr-2">
                    <span className={`text-sm font-semibold truncate ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                      {b.name}
                    </span>
                    {isCurrent && (
                      <span className="w-1.5 h-1.5 bg-green-400 rounded-full shrink-0 animate-pulse"></span>
                    )}
                  </div>
                  <div className="flex items-center shrink-0">
                    <span className="text-white/40 text-xs w-9 text-right">{b.overs || 0}</span>
                    <span className="text-white/40 text-xs w-9 text-right">{b.maidens || 0}</span>
                    <span className={`text-sm w-9 text-right font-bold ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                      {b.runs || 0}
                    </span>
                    <span className={`text-sm w-9 text-right font-bold ${isCurrent ? 'text-white' : 'text-white/70'}`}>
                      {b.wickets || 0}
                    </span>
                    <span className="text-white/30 text-[11px] w-14 text-right">
                      {typeof b.economy === 'number' ? b.economy.toFixed(1) : '0.0'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
});

Scoreboard.displayName = 'Scoreboard';

export default Scoreboard;
