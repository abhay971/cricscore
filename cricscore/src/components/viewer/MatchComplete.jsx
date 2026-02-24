import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { useMemo, useState } from 'react';

/**
 * Match Complete Component — Redesigned
 * Clean hero, side-by-side score summary, tabbed innings scorecards, polished POTM
 */
const MatchComplete = ({ match, allInnings }) => {
  const innings1 = allInnings?.[0];
  const innings2 = allInnings?.[1];
  const innings3 = allInnings?.[2];
  const innings4 = allInnings?.[3];
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);

  // Resolve team names
  const resolveName = (name) => {
    const trimmed = name?.trim();
    if (trimmed === 'team1') return match?.team1?.name || name;
    if (trimmed === 'team2') return match?.team2?.name || name;
    return trimmed;
  };
  const tossWinnerName = resolveName(match?.tossWinner);
  const t1 = match?.team1?.name?.trim();
  const t2 = match?.team2?.name?.trim();
  const battedFirst = match?.tossDecision === 'bat'
    ? tossWinnerName
    : (tossWinnerName === t1 ? t2 : t1);
  const battedSecond = battedFirst === t1 ? t2 : t1;
  const team1Name = battedFirst || match?.team1?.name || 'Team 1';
  const team2Name = battedSecond || match?.team2?.name || 'Team 2';

  const winnerName = resolveName(match?.winner);
  const isTie = !match?.winner || match.winner === 'Tie';
  let resultText = match?.result || '';
  resultText = resultText.replace(/\bteam1\b/g, match?.team1?.name || 'team1');
  resultText = resultText.replace(/\bteam2\b/g, match?.team2?.name || 'team2');

  // Auto-calculate Player of the Match
  const playerOfMatch = useMemo(() => {
    const candidates = [];
    const allInn = [innings1, innings2, innings3, innings4].filter(Boolean);

    allInn.forEach((inn) => {
      if (!inn?.currentBatsmen) return;
      const battingTeamName = inn.battingTeam?.trim() === match?.team1?.name?.trim() ? team1Name : team2Name;
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
            name: b.name, team: battingTeamName,
            runs: b.runs || 0, balls: b.balls || 0,
            fours: b.fours || 0, sixes: b.sixes || 0,
            score: batScore
          });
        }
      });
    });

    allInn.forEach((inn) => {
      if (!inn?.bowlers) return;
      const bowlingTeamName = inn.bowlingTeam?.trim() === match?.team1?.name?.trim() ? team1Name : team2Name;
      inn.bowlers.forEach((b) => {
        const existing = candidates.find(c => c.name?.trim().toLowerCase() === b.name?.trim().toLowerCase());
        const bowlScore = (b.wickets || 0) * 25 - (b.economy || 0) * 2;
        if (existing) {
          existing.score += bowlScore;
          existing.wickets = (existing.wickets || 0) + (b.wickets || 0);
          existing.bowlingRuns = (existing.bowlingRuns || 0) + (b.runs || 0);
          existing.bowlingFigures = `${existing.wickets}/${existing.bowlingRuns}`;
        } else {
          candidates.push({
            name: b.name, team: bowlingTeamName,
            runs: 0, balls: 0, fours: 0, sixes: 0,
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

  // Build tabs: 1st Innings, 2nd Innings (+ Super Over if applicable)
  const tabs = [
    { label: '1st Innings', batting: innings1, bowlingTeam: team2Name },
    { label: '2nd Innings', batting: innings2, bowlingTeam: team1Name },
    ...(match?.isSuperOver && innings3 ? [
      { label: 'Super Over 1', batting: innings3, bowlingTeam: innings3?.bowlingTeam },
      ...(innings4 ? [{ label: 'Super Over 2', batting: innings4, bowlingTeam: innings4?.bowlingTeam }] : [])
    ] : [])
  ].filter(t => t.batting);

  const getInitials = (name) => {
    if (!name) return '?';
    const parts = name.trim().split(' ');
    return parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#0B0D14] pb-10 overflow-y-auto">
      {/* Confetti */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1.5 h-1.5 rounded-full"
            style={{ background: ['#FFD700', '#FF6B6B', '#34D399', '#60A5FA', '#F472B6'][i % 5] }}
            initial={{ x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 400), y: -10, opacity: 0.9 }}
            animate={{ y: (typeof window !== 'undefined' ? window.innerHeight : 800) + 20, opacity: 0, rotate: 360 * (Math.random() > 0.5 ? 1 : -1) }}
            transition={{ duration: 4 + Math.random() * 3, delay: Math.random() * 3, repeat: Infinity, ease: 'linear' }}
          />
        ))}
      </div>

      <div className="relative z-10 max-w-lg mx-auto px-4 pt-10 space-y-4">

        {/* ── Hero ── */}
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: 'spring', stiffness: 220, delay: 0.1 }}
          className="flex flex-col items-center gap-3"
        >
          <div className="w-20 h-20 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
            <svg className="w-10 h-10 text-amber-900" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3h14c.6 0 1 .4 1 1v2c0 3.3-2.7 6-6 6h-.8c-.5 1.5-1.5 2.7-2.8 3.5.2.3.4.6.6 1 .3-.1.7-.2 1-.2 1.7 0 3 1.3 3 3v1H8v-1c0-1.7 1.3-3 3-3 .3 0 .7.1 1 .2.2-.4.4-.7.6-1C11.2 14.7 10.2 13.5 9.8 12H9c-3.3 0-6-2.7-6-6V4c0-.6.4-1 1-1zm1 2v1c0 2.2 1.8 4 4 4h4c2.2 0 4-1.8 4-4V5H6z"/>
            </svg>
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-extrabold text-white tracking-widest">MATCH COMPLETE</h1>
            <div className="inline-flex items-center gap-2 mt-1.5 px-3 py-1 bg-white/8 rounded-full">
              <span className="text-white/50 text-xs font-medium">{match?.matchType || 'Custom'}</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
              <span className="text-white/50 text-xs font-medium">{match?.overs} Overs</span>
            </div>
          </div>
        </motion.div>

        {/* ── Winner Banner ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className={`rounded-2xl p-5 text-center ${isTie
            ? 'bg-gradient-to-br from-blue-500/20 to-blue-600/10 border border-blue-500/30'
            : 'bg-gradient-to-br from-amber-500/20 to-yellow-600/10 border border-amber-500/30'}`}
        >
          <p className={`text-[10px] font-bold tracking-[0.2em] mb-2 ${isTie ? 'text-blue-400' : 'text-amber-400'}`}>
            {isTie ? 'MATCH TIED' : 'WINNER'}
          </p>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            {isTie ? 'What a game!' : winnerName}
          </h2>
          <p className={`text-sm font-medium ${isTie ? 'text-blue-300/80' : 'text-amber-300/80'}`}>
            {resultText}
          </p>
        </motion.div>

        {/* ── Score Summary: Side by Side ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden"
        >
          <div className="grid grid-cols-2 divide-x divide-[#1E2030]">
            {/* Team 1 (batted first) */}
            {[
              { name: team1Name, innings: innings1, label: '1st Innings', isWinner: !isTie && winnerName === team1Name },
              { name: team2Name, innings: innings2, label: '2nd Innings', isWinner: !isTie && winnerName === team2Name }
            ].map((side, idx) => (
              <div key={idx} className={`p-4 flex flex-col items-center gap-1 relative ${side.isWinner ? 'bg-amber-500/5' : ''}`}>
                {side.isWinner && (
                  <div className="absolute top-2 right-2">
                    <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                  </div>
                )}
                {/* Avatar */}
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm mb-0.5 ${idx === 0 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-blue-500/20 text-blue-400'}`}>
                  {getInitials(side.name)}
                </div>
                <p className={`text-xs font-semibold text-center leading-tight truncate w-full text-center ${side.isWinner ? 'text-white' : 'text-white/70'}`}>
                  {side.name}
                </p>
                <p className={`text-2xl font-extrabold mt-0.5 ${side.isWinner ? 'text-white' : 'text-white/60'}`}>
                  {side.innings?.totalRuns ?? '-'}<span className="text-lg">/{side.innings?.totalWickets ?? '-'}</span>
                </p>
                <p className="text-white/35 text-[11px]">
                  {side.innings?.totalOvers ?? 0}/{match?.overs} ov
                </p>
                <span className={`mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${idx === 0 ? 'bg-emerald-500/15 text-emerald-400' : 'bg-blue-500/15 text-blue-400'}`}>
                  {side.label}
                </span>
              </div>
            ))}
          </div>
          {/* Target row */}
          {innings2?.target && (
            <div className="border-t border-[#1E2030] px-4 py-2 flex items-center justify-center gap-2">
              <span className="text-white/40 text-xs">Target</span>
              <span className="text-white font-bold text-sm">{innings2.target}</span>
              {innings2.totalRuns >= innings2.target && (
                <span className="text-emerald-400 text-xs font-semibold">· Achieved</span>
              )}
            </div>
          )}
        </motion.div>

        {/* ── Innings Tabs ── */}
        {tabs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65 }}
            className="space-y-3"
          >
            {/* Tab bar */}
            <div className="flex gap-2 bg-[#141620] border border-[#1E2030] rounded-xl p-1">
              {tabs.map((tab, i) => (
                <button
                  key={i}
                  onClick={() => setActiveTab(i)}
                  className={`flex-1 py-2 px-2 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === i
                      ? 'bg-white text-[#0B0D14] shadow'
                      : 'text-white/40 hover:text-white/70'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab content */}
            <AnimatePresence mode="wait">
              {tabs[activeTab] && (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="space-y-3"
                >
                  <BattingCard innings={tabs[activeTab].batting} teamName={tabs[activeTab].batting?.battingTeam?.trim() === match?.team1?.name?.trim() ? team1Name : team2Name} />
                  <BowlingCard innings={tabs[activeTab].batting} teamName={tabs[activeTab].bowlingTeam} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {/* ── Player of the Match ── */}
        {playerOfMatch && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.75 }}
            className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-amber-500/15 to-transparent border-b border-[#1E2030]">
              <svg className="w-4 h-4 text-amber-400 shrink-0" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"/>
              </svg>
              <span className="text-amber-400 text-xs font-bold tracking-widest">PLAYER OF THE MATCH</span>
            </div>

            {/* Player info */}
            <div className="flex items-center gap-4 px-4 py-4">
              {/* Avatar */}
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500/30 to-amber-600/10 border border-amber-500/20 flex items-center justify-center shrink-0">
                <span className="text-amber-300 font-extrabold text-xl">
                  {getInitials(playerOfMatch.name)}
                </span>
              </div>

              {/* Name + team */}
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-bold text-lg leading-tight truncate">
                  {playerOfMatch.name}
                </h3>
                <span className={`inline-block mt-1 text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                  playerOfMatch.team === team1Name
                    ? 'bg-emerald-500/15 text-emerald-400'
                    : 'bg-blue-500/15 text-blue-400'
                }`}>
                  {playerOfMatch.team}
                </span>
              </div>
            </div>

            {/* Stats row */}
            <div className="flex flex-wrap gap-2 px-4 pb-4">
              {playerOfMatch.runs > 0 && (
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                  <span className="text-white/40 text-xs">🏏</span>
                  <span className="text-white font-bold text-sm">{playerOfMatch.runs}</span>
                  <span className="text-white/40 text-xs">({playerOfMatch.balls} b)</span>
                  {playerOfMatch.balls > 0 && (
                    <span className="text-white/30 text-[10px] ml-1">
                      SR {((playerOfMatch.runs / playerOfMatch.balls) * 100).toFixed(0)}
                    </span>
                  )}
                </div>
              )}
              {(playerOfMatch.fours > 0 || playerOfMatch.sixes > 0) && (
                <div className="flex items-center gap-2 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                  {playerOfMatch.fours > 0 && (
                    <span className="text-blue-400 text-xs font-semibold">{playerOfMatch.fours}×4</span>
                  )}
                  {playerOfMatch.sixes > 0 && (
                    <span className="text-emerald-400 text-xs font-semibold">{playerOfMatch.sixes}×6</span>
                  )}
                </div>
              )}
              {playerOfMatch.bowlingFigures && playerOfMatch.wickets > 0 && (
                <div className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-2">
                  <span className="text-white/40 text-xs">⚾</span>
                  <span className="text-white font-bold text-sm">{playerOfMatch.bowlingFigures}</span>
                  <span className="text-white/40 text-xs">wkts</span>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ── Back to Tournament ── */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="pt-1 pb-4"
        >
          <button
            onClick={() => navigate(`/tournament/${match?.tournamentId}`)}
            className="w-full py-4 bg-white hover:bg-white/90 active:scale-[0.98] text-[#0B0D14] font-bold text-base rounded-2xl transition-all"
          >
            Back to Tournament
          </button>
        </motion.div>
      </div>
    </div>
  );
};

/* ── Batting Scorecard ── */
const BattingCard = ({ innings, teamName }) => {
  if (!innings?.currentBatsmen?.length) return null;
  const extras = innings?.extras || {};
  const totalExtras = (extras.wides || 0) + (extras.noBalls || 0) + (extras.byes || 0) + (extras.legByes || 0);
  const topScorer = [...innings.currentBatsmen].sort((a, b) => (b.runs || 0) - (a.runs || 0))[0];

  return (
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F1118] border-b border-[#1E2030]">
        <span className="text-white font-bold text-sm">{teamName}</span>
        <span className="text-white/40 text-[10px] font-bold tracking-widest">BATTING</span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1.5 bg-[#0B0D14]/40">
        <span className="text-white/30 text-[10px] font-bold tracking-wider flex-1">BATTER</span>
        <div className="flex items-center shrink-0">
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">R</span>
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">B</span>
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">4s</span>
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">6s</span>
          <span className="text-white/30 text-[10px] font-bold w-12 text-right">SR</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#1E2030]/30">
        {innings.currentBatsmen.map((b, i) => {
          const sr = b.balls > 0 ? ((b.runs / b.balls) * 100).toFixed(1) : '0.0';
          const isTop = !b.isOut && b.name === topScorer?.name && (b.runs || 0) > 0;
          return (
            <div key={i} className={`flex items-center px-4 py-2.5 ${isTop ? 'bg-amber-500/5' : ''}`}>
              <div className="flex-1 min-w-0 pr-2">
                <div className="flex items-center gap-1.5">
                  <span className={`text-sm font-semibold truncate ${!b.isOut ? 'text-white' : 'text-white/60'}`}>
                    {b.name}
                  </span>
                  {!b.isOut && <span className="text-amber-400 text-xs font-bold">*</span>}
                </div>
                <p className={`text-[10px] mt-0.5 ${b.isOut ? 'text-red-400/60' : 'text-emerald-400/60'}`}>
                  {b.isOut ? (b.dismissalType?.replace(/_/g, ' ') || 'out') : 'not out'}
                </p>
              </div>
              <div className="flex items-center shrink-0">
                <span className={`text-sm w-8 text-right font-bold ${!b.isOut ? 'text-white' : 'text-white/60'}`}>
                  {b.runs || 0}
                </span>
                <span className="text-white/40 text-xs w-8 text-right">{b.balls || 0}</span>
                <span className="text-white/40 text-xs w-8 text-right">{b.fours || 0}</span>
                <span className="text-white/40 text-xs w-8 text-right">{b.sixes || 0}</span>
                <span className="text-white/30 text-[10px] w-12 text-right">{sr}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Extras + Total */}
      <div className="border-t border-[#1E2030]/50 bg-[#0F1118]">
        {totalExtras > 0 && (
          <div className="flex items-center justify-between px-4 py-2 border-b border-[#1E2030]/30">
            <span className="text-white/40 text-xs">
              Extras <span className="text-white/25">(w {extras.wides || 0}, nb {extras.noBalls || 0}, b {extras.byes || 0}, lb {extras.legByes || 0})</span>
            </span>
            <span className="text-white/60 font-semibold text-sm">{totalExtras}</span>
          </div>
        )}
        <div className="flex items-center justify-between px-4 py-2.5">
          <span className="text-white/70 text-xs font-bold">Total</span>
          <div className="flex items-center gap-2">
            <span className="text-white font-bold">{innings.totalRuns ?? 0}/{innings.totalWickets ?? 0}</span>
            <span className="text-white/35 text-[11px]">({innings.totalOvers ?? 0} ov)</span>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Bowling Scorecard ── */
const BowlingCard = ({ innings, teamName }) => {
  const bowlers = innings?.bowlers || [];
  if (bowlers.length === 0) return null;
  const topBowler = [...bowlers].sort((a, b) => (b.wickets || 0) - (a.wickets || 0))[0];

  return (
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0F1118] border-b border-[#1E2030]">
        <span className="text-white font-bold text-sm">{teamName}</span>
        <span className="text-white/40 text-[10px] font-bold tracking-widest">BOWLING</span>
      </div>

      {/* Column headers */}
      <div className="flex items-center px-4 py-1.5 bg-[#0B0D14]/40">
        <span className="text-white/30 text-[10px] font-bold tracking-wider flex-1">BOWLER</span>
        <div className="flex items-center shrink-0">
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">O</span>
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">M</span>
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">R</span>
          <span className="text-white/30 text-[10px] font-bold w-8 text-right">W</span>
          <span className="text-white/30 text-[10px] font-bold w-12 text-right">ECON</span>
        </div>
      </div>

      {/* Rows */}
      <div className="divide-y divide-[#1E2030]/30">
        {bowlers.map((b, i) => {
          const isTopBowler = (b.wickets || 0) > 0 && b.name === topBowler?.name;
          return (
            <div key={i} className={`flex items-center px-4 py-2.5 ${isTopBowler ? 'bg-emerald-500/5' : ''}`}>
              <div className="flex-1 min-w-0 pr-2 flex items-center gap-1.5">
                <span className="text-white/70 text-sm font-semibold truncate">{b.name}</span>
                {(b.wickets || 0) > 0 && (
                  <span className="text-emerald-400 text-[10px] font-bold shrink-0">+{b.wickets}W</span>
                )}
              </div>
              <div className="flex items-center shrink-0">
                <span className="text-white/40 text-xs w-8 text-right">{b.overs || 0}</span>
                <span className="text-white/40 text-xs w-8 text-right">{b.maidens || 0}</span>
                <span className="text-white/70 text-sm w-8 text-right font-bold">{b.runs || 0}</span>
                <span className={`text-sm w-8 text-right font-bold ${(b.wickets || 0) > 0 ? 'text-emerald-400' : 'text-white/40'}`}>
                  {b.wickets || 0}
                </span>
                <span className="text-white/30 text-[10px] w-12 text-right">
                  {typeof b.economy === 'number' ? b.economy.toFixed(1) : '0.0'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MatchComplete;
