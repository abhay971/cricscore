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
    <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-bg-cardLight border-b border-[#4A4B5E]/30">
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
          <div className="text-2xl font-black font-mono text-white">
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
            <span className="font-bold text-brand-blue">{currentBowler.economy.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CurrentBowler;
