/**
 * Current Batsmen Component - Modern Design
 * Clean table-like layout with strike indicator
 */
const CurrentBatsmen = ({ batsmen = [] }) => {
  // Sample data
  const currentBatsmen = batsmen.length > 0 ? batsmen : [
    { name: 'Virat Kohli', runs: 45, balls: 32, fours: 4, sixes: 2, strikeRate: 140.62, onStrike: true },
    { name: 'AB de Villiers', runs: 38, balls: 24, fours: 3, sixes: 3, strikeRate: 158.33, onStrike: false }
  ];

  return (
    <div className="bg-[#141620] border border-[#1E2030] rounded-2xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-[#0F1118] border-b border-[#1E2030]/30">
        <h3 className="font-bold text-white text-sm">
          Current Batsmen
        </h3>
      </div>

      {/* Batsmen List */}
      <div className="divide-y divide-[#1E2030]/30">
        {currentBatsmen.map((batsman, index) => (
          <div
            key={index}
            className={`px-4 py-4 ${batsman.onStrike ? 'bg-emerald-400/5 border-l-4 border-emerald-400' : ''}`}
          >
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2.5">
                <span className="font-bold text-white text-base">
                  {batsman.name}
                </span>
                {batsman.onStrike && (
                  <div className="flex items-center gap-1 px-2 py-0.5 bg-emerald-400/20 rounded-full">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></div>
                    <span className="text-xs font-bold text-emerald-400">STRIKE</span>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold font-mono text-white">
                {batsman.runs}
              </div>
            </div>

            <div className="flex items-center gap-5 text-xs">
              <div className="flex flex-col">
                <span className="text-white/70">Balls</span>
                <span className="font-bold text-white">{batsman.balls}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/70">4s</span>
                <span className="font-bold text-white">{batsman.fours}</span>
              </div>
              <div className="flex flex-col">
                <span className="text-white/70">6s</span>
                <span className="font-bold text-white">{batsman.sixes}</span>
              </div>
              <div className="flex flex-col ml-auto">
                <span className="text-white/70">Strike Rate</span>
                <span className="font-bold text-emerald-400">{batsman.strikeRate.toFixed(2)}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CurrentBatsmen;
