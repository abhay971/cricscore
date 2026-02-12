/**
 * Current Bowler Component - Modern Design
 * Clean bowling stats display
 */
const CurrentBowler = ({ bowler }) => {
  // Sample data
  const currentBowler = bowler || {
    name: 'Jasprit Bumrah',
    overs: 3.4,
    runs: 28,
    wickets: 1,
    economy: 7.64
  };

  return (
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0F1118] border-b border-[#1E2030]/30">
        <h3 className="font-bold text-white text-sm">
          Current Bowler
        </h3>
      </div>

      {/* Bowler Stats */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between mb-3">
          <span className="font-bold text-white text-base">
            {currentBowler.name}
          </span>
          <div className="text-2xl font-bold font-mono text-white">
            {currentBowler.wickets}/{currentBowler.runs}
          </div>
        </div>

        <div className="flex items-center gap-6 text-xs">
          <div className="flex flex-col">
            <span className="text-white/70">Overs</span>
            <span className="font-bold text-white">{currentBowler.overs}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-white/70">Maidens</span>
            <span className="font-bold text-white">0</span>
          </div>
          <div className="flex flex-col ml-auto">
            <span className="text-white/70">Economy</span>
            <span className="font-bold text-emerald-400">{currentBowler.economy.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentBowler;
