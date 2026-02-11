import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMemo } from 'react';

/**
 * Match Complete Component
 * Cricbuzz-style scorecards with full batting & bowling tables
 */
const MatchComplete = ({ match, allInnings }) => {
  const innings1 = allInnings?.[0];
  const innings2 = allInnings?.[1];
  const innings3 = allInnings?.[2]; // SO innings 1
  const innings4 = allInnings?.[3]; // SO innings 2
  const navigate = useNavigate();

  // Resolve team names using toss data (handles corrupted old data)
  const resolveName = (name) => {
    if (name === 'team1') return match?.team1?.name || name;
    if (name === 'team2') return match?.team2?.name || name;
    return name;
  };
  const tossWinnerName = resolveName(match?.tossWinner);
  const battedFirst = match?.tossDecision === 'bat'
    ? tossWinnerName
    : (tossWinnerName === match?.team1?.name ? match?.team2?.name : match?.team1?.name);
  const battedSecond = battedFirst === match?.team1?.name ? match?.team2?.name : match?.team1?.name;

  const team1Name = battedFirst || match?.team1?.name || 'Team 1';
  const team2Name = battedSecond || match?.team2?.name || 'Team 2';

  // Auto-calculate Player of the Match
  const playerOfMatch = useMemo(() => {
    const candidates = [];
    const allInn = [innings1, innings2, innings3, innings4].filter(Boolean);

    allInn.forEach((inn) => {
      if (!inn?.currentBatsmen) return;
      const battingTeamName = inn.battingTeam === match?.team1?.name ? team1Name : team2Name;
      inn.currentBatsmen.forEach((b) => {
        const existing = candidates.find(c => c.name?.trim().toLowerCase() === b.name?.trim().toLowerCase());
        const batScore = (b.runs || 0) + (b.fours || 0) * 2 + (b.sixes || 0) * 4;
        if (existing) {
          existing.runs += (b.runs || 0);
          existing.balls += (b.balls || 0);
          existing.fours += (b.fours || 0);
          existing.sixes += (b.sixes || 0);
          existing.score += batScore;
        } else {
          candidates.push({
            name: b.name,
            team: battingTeamName,
            runs: b.runs || 0,
            balls: b.balls || 0,
            fours: b.fours || 0,
            sixes: b.sixes || 0,
            strikeRate: b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0',
            score: batScore
          });
        }
      });
    });

    // Also consider bowling performances
    allInn.forEach((inn) => {
      if (!inn?.bowlers) return;
      const bowlingTeamName = inn.bowlingTeam === match?.team1?.name ? team1Name : team2Name;
      inn.bowlers.forEach((b) => {
        const existing = candidates.find(c => c.name?.trim().toLowerCase() === b.name?.trim().toLowerCase());
        const bowlScore = (b.wickets || 0) * 25 - (b.economy || 0) * 2;
        if (existing) {
          existing.score += bowlScore;
          existing.wickets = (existing.wickets || 0) + (b.wickets || 0);
          existing.bowlingFigures = `${existing.wickets}/${(existing.bowlingRuns || 0) + (b.runs || 0)}`;
          existing.bowlingRuns = (existing.bowlingRuns || 0) + (b.runs || 0);
        } else {
          candidates.push({
            name: b.name,
            team: bowlingTeamName,
            runs: 0,
            balls: 0,
            fours: 0,
            sixes: 0,
            strikeRate: '0.0',
            wickets: b.wickets || 0,
            bowlingFigures: `${b.wickets || 0}/${b.runs || 0}`,
            bowlingRuns: b.runs || 0,
            score: bowlScore
          });
        }
      });
    });

    if (candidates.length === 0) return null;
    candidates.sort((a, b) => b.score - a.score);
    return candidates[0];
  }, [innings1, innings2, innings3, innings4, team1Name, team2Name, match]);

  const getWinnerInfo = () => {
    if (!match?.winner || match.winner === 'Tie') {
      return { text: 'Match Tied!', subtitle: match?.result || 'What a contest!' };
    }
    const winnerName = resolveName(match.winner);
    let resultText = match.result || `${winnerName} won!`;
    resultText = resultText.replace(/\bteam1\b/g, match?.team1?.name || 'team1');
    resultText = resultText.replace(/\bteam2\b/g, match?.team2?.name || 'team2');
    return { text: winnerName, subtitle: resultText };
  };

  const winnerInfo = getWinnerInfo();

  // Reusable Cricbuzz-style batting scorecard
  const BattingCard = ({ innings, teamName, inningsLabel, delay }) => {
    if (!innings?.currentBatsmen?.length) return null;
    const extras = innings?.extras || {};
    const totalExtras = (extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0);

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#353647] border border-[#4A4B5E] rounded-3xl overflow-hidden"
      >
        {/* Section Title */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2C2D3F]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-[#8BC9E8]/20 flex items-center justify-center">
              <span className="text-[#8BC9E8] font-bold text-[10px]">
                {teamName?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <span className="text-white font-bold text-sm">{teamName}</span>
          </div>
          <span className="text-white/40 text-[10px] font-medium tracking-wider">{inningsLabel}</span>
        </div>

        {/* Table Header */}
        <div className="flex items-center px-4 py-2 border-b border-[#4A4B5E]/50 bg-[#2e2f42]">
          <span className="text-white/40 text-[11px] font-bold tracking-wider flex-1">BATTER</span>
          <div className="flex items-center">
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">R</span>
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">B</span>
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">4s</span>
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">6s</span>
            <span className="text-white/40 text-[11px] font-bold w-14 text-right">SR</span>
          </div>
        </div>

        {/* Batsmen Rows */}
        <div className="divide-y divide-[#4A4B5E]/30">
          {innings.currentBatsmen.map((b, i) => {
            const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
            return (
              <div key={i} className={`flex items-center px-4 py-3 ${!b.isOut ? 'bg-[#3d3e52]' : ''}`}>
                <div className="flex-1 min-w-0 pr-2">
                  <span className={`text-sm font-semibold truncate block ${!b.isOut ? 'text-white' : 'text-white/70'}`}>
                    {b.name}
                  </span>
                  <p className={`text-[10px] mt-0.5 ${b.isOut ? 'text-red-400/60' : 'text-green-400/60'}`}>
                    {b.isOut ? (b.dismissalType || 'out') : 'not out'}
                  </p>
                </div>
                <div className="flex items-center shrink-0">
                  <span className={`text-sm w-9 text-right font-bold ${!b.isOut ? 'text-white' : 'text-white/70'}`}>
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

        {/* Extras */}
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

        {/* Total */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#2C2D3F] border-t border-[#4A4B5E]/50">
          <span className="text-white/70 text-xs font-bold">Total</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold text-sm">
              {innings.totalRuns ?? 0}/{innings.totalWickets ?? 0}
            </span>
            <span className="text-white/40 text-[10px]">({innings.totalOvers ?? 0} ov)</span>
          </div>
        </div>
      </motion.div>
    );
  };

  // Reusable Cricbuzz-style bowling scorecard
  const BowlingCard = ({ innings, teamName, delay }) => {
    const bowlers = innings?.bowlers || [];
    if (bowlers.length === 0) return null;

    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay }}
        className="bg-[#353647] border border-[#4A4B5E] rounded-3xl overflow-hidden"
      >
        {/* Section Title */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#2C2D3F]">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-amber-500/20 flex items-center justify-center">
              <span className="text-amber-400 font-bold text-[10px]">
                {teamName?.charAt(0)?.toUpperCase() || 'T'}
              </span>
            </div>
            <span className="text-white font-bold text-sm">{teamName}</span>
          </div>
          <span className="text-white/40 text-[10px] font-medium tracking-wider">BOWLING</span>
        </div>

        {/* Table Header */}
        <div className="flex items-center px-4 py-2 border-b border-[#4A4B5E]/50 bg-[#2e2f42]">
          <span className="text-white/40 text-[11px] font-bold tracking-wider flex-1">BOWLER</span>
          <div className="flex items-center">
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">O</span>
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">M</span>
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">R</span>
            <span className="text-white/40 text-[11px] font-bold w-9 text-right">W</span>
            <span className="text-white/40 text-[11px] font-bold w-14 text-right">ECON</span>
          </div>
        </div>

        {/* Bowler Rows */}
        <div className="divide-y divide-[#4A4B5E]/30">
          {bowlers.map((b, i) => (
            <div key={i} className="flex items-center px-4 py-3">
              <span className="text-white/70 text-sm font-semibold truncate flex-1 min-w-0 pr-2">
                {b.name}
              </span>
              <div className="flex items-center shrink-0">
                <span className="text-white/40 text-xs w-9 text-right">{b.overs || 0}</span>
                <span className="text-white/40 text-xs w-9 text-right">{b.maidens || 0}</span>
                <span className="text-white/70 text-sm w-9 text-right font-bold">{b.runs || 0}</span>
                <span className="text-white/70 text-sm w-9 text-right font-bold">{b.wickets || 0}</span>
                <span className="text-white/30 text-[11px] w-14 text-right">
                  {typeof b.economy === 'number' ? b.economy.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen bg-[#1A1B2E] pb-8 overflow-y-auto">
      {/* Confetti particles */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-2 h-2 rounded-full"
            style={{
              background: ['#FFD700', '#FF6B6B', '#8BC9E8', '#4ADE80', '#F472B6'][i % 5]
            }}
            initial={{
              x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400),
              y: -10,
              opacity: 0.8
            }}
            animate={{
              y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20,
              opacity: 0,
              rotate: 360 * (Math.random() > 0.5 ? 1 : -1)
            }}
            transition={{
              duration: 4 + Math.random() * 3,
              delay: Math.random() * 3,
              repeat: Infinity,
              ease: 'linear'
            }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-8 space-y-4">
        {/* Trophy */}
        <motion.div
          initial={{ scale: 0, rotate: -20 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 200, delay: 0.2 }}
          className="text-center mb-2"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full shadow-lg shadow-yellow-500/30">
            <svg className="w-10 h-10 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3h14c.6 0 1 .4 1 1v2c0 3.3-2.7 6-6 6h-.8c-.5 1.5-1.5 2.7-2.8 3.5.2.3.4.6.6 1 .3-.1.7-.2 1-.2 1.7 0 3 1.3 3 3v1H8v-1c0-1.7 1.3-3 3-3 .3 0 .7.1 1 .2.2-.4.4-.7.6-1C11.2 14.7 10.2 13.5 9.8 12H9c-3.3 0-6-2.7-6-6V4c0-.6.4-1 1-1zm1 2v1c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V5H6z"/>
            </svg>
          </div>
        </motion.div>

        {/* Match Complete Title */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-center"
        >
          <h1 className="text-3xl font-black text-white tracking-tight mb-2">MATCH COMPLETE</h1>
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-white/10 backdrop-blur rounded-full">
            <span className="text-white/70 text-sm font-medium">{match?.matchType || 'Custom'}</span>
            <span className="w-1 h-1 bg-white/40 rounded-full" />
            <span className="text-white/70 text-sm font-medium">{match?.overs} Overs</span>
          </div>
        </motion.div>

        {/* Winner Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30 rounded-3xl p-6"
        >
          <p className="text-amber-400 text-xs font-bold tracking-widest text-center mb-3">WINNER</p>
          <h2 className="text-2xl font-black text-white text-center mb-1">
            {winnerInfo.text}
          </h2>
          <p className="text-amber-300/80 text-sm font-medium text-center">
            {winnerInfo.subtitle}
          </p>
        </motion.div>

        {/* Score Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-[#353647] border border-[#4A4B5E] rounded-3xl p-5"
        >
          {/* Team 1 Score */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#8BC9E8]/20 flex items-center justify-center">
                <span className="text-[#8BC9E8] font-bold text-sm">
                  {team1Name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{team1Name}</p>
                <p className="text-white/50 text-xs">1st Innings</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">
                {innings1?.totalRuns ?? '-'}/{innings1?.totalWickets ?? '-'}
              </p>
              <p className="text-white/50 text-xs">
                ({innings1?.totalOvers ?? 0}/{match?.overs} ov)
              </p>
            </div>
          </div>

          <div className="h-px bg-[#4A4B5E] mb-4" />

          {/* Team 2 Score */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/20 flex items-center justify-center">
                <span className="text-amber-400 font-bold text-sm">
                  {team2Name?.charAt(0)?.toUpperCase() || 'T'}
                </span>
              </div>
              <div>
                <p className="text-white font-semibold text-sm">{team2Name}</p>
                <p className="text-white/50 text-xs">2nd Innings</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-white font-bold text-xl">
                {innings2?.totalRuns ?? '-'}/{innings2?.totalWickets ?? '-'}
              </p>
              <p className="text-white/50 text-xs">
                ({innings2?.totalOvers ?? 0}/{match?.overs} ov)
              </p>
            </div>
          </div>
        </motion.div>

        {/* ── 1st Innings Batting Scorecard ── */}
        <BattingCard innings={innings1} teamName={team1Name} inningsLabel="1ST BATTING" delay={0.8} />

        {/* ── 1st Innings Bowling Scorecard ── */}
        <BowlingCard innings={innings1} teamName={team2Name} delay={0.85} />

        {/* ── 2nd Innings Batting Scorecard ── */}
        <BattingCard innings={innings2} teamName={team2Name} inningsLabel="2ND BATTING" delay={0.9} />

        {/* ── 2nd Innings Bowling Scorecard ── */}
        <BowlingCard innings={innings2} teamName={team1Name} delay={0.95} />

        {/* ── Super Over Scorecards ── */}
        {match?.isSuperOver && innings3 && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.0 }}
              className="flex items-center gap-3 py-2"
            >
              <div className="flex-1 h-px bg-amber-500/30" />
              <span className="bg-amber-500 text-[#2C2D3F] text-xs font-bold px-4 py-1.5 rounded-full">SUPER OVER</span>
              <div className="flex-1 h-px bg-amber-500/30" />
            </motion.div>

            <BattingCard innings={innings3} teamName={innings3?.battingTeam || team2Name} inningsLabel="SO 1ST BATTING" delay={1.05} />
            <BowlingCard innings={innings3} teamName={innings3?.bowlingTeam || team1Name} delay={1.1} />

            {innings4 && (
              <>
                <BattingCard innings={innings4} teamName={innings4?.battingTeam || team1Name} inningsLabel="SO 2ND BATTING" delay={1.15} />
                <BowlingCard innings={innings4} teamName={innings4?.bowlingTeam || team2Name} delay={1.2} />
              </>
            )}
          </>
        )}

        {/* Player of the Match */}
        {playerOfMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 1.0 }}
            className="bg-gradient-to-br from-[#8BC9E8]/10 to-[#8BC9E8]/5 border border-[#8BC9E8]/20 rounded-3xl p-5"
          >
            <p className="text-[#8BC9E8]/60 text-xs font-bold tracking-widest text-center mb-3">
              PLAYER OF THE MATCH
            </p>
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-14 h-14 bg-[#8BC9E8]/20 rounded-full mb-3">
                <span className="text-[#8BC9E8] font-bold text-lg">
                  {playerOfMatch.name?.charAt(0)?.toUpperCase() || '?'}
                </span>
              </div>
              <h3 className="text-white font-bold text-lg mb-1">{playerOfMatch.name}</h3>
              <p className="text-white/50 text-xs mb-2">{playerOfMatch.team}</p>
              <div className="flex items-center justify-center gap-4 flex-wrap">
                {playerOfMatch.runs > 0 && (
                  <div>
                    <span className="text-white font-bold text-sm">{playerOfMatch.runs}</span>
                    <span className="text-white/40 text-xs ml-1">({playerOfMatch.balls})</span>
                  </div>
                )}
                {(playerOfMatch.fours > 0 || playerOfMatch.sixes > 0) && (
                  <div className="text-white/40 text-xs">
                    {playerOfMatch.fours > 0 && <span>{playerOfMatch.fours}x4 </span>}
                    {playerOfMatch.sixes > 0 && <span>{playerOfMatch.sixes}x6</span>}
                  </div>
                )}
                {playerOfMatch.bowlingFigures && (
                  <div className="text-white/40 text-xs">
                    Bowling: {playerOfMatch.bowlingFigures}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Action Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.05 }}
          className="pt-2 pb-4"
        >
          <button
            onClick={() => navigate(`/tournament/${match?.tournamentId}`)}
            className="w-full py-4 bg-[#8BC9E8] hover:bg-[#7AB8D7] active:scale-[0.98] text-[#1A1B2E] font-bold text-base rounded-2xl transition-all"
          >
            Back to Tournament
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default MatchComplete;
