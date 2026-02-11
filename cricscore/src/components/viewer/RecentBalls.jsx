import { motion } from 'framer-motion';

/**
 * Recent Balls Component - Modern Design
 * Clean balls display with current over info
 */
const RecentBalls = ({ balls = [], partnership = { runs: 0, balls: 0 }, currentInningsNumber }) => {
  // Get balls from current over only by checking over number
  let currentOverBalls = [];

  if (balls.length > 0) {
    // Filter to current innings first (prevents 1st innings balls leaking into 2nd)
    const inningsBalls = currentInningsNumber
      ? balls.filter(b => b.inningsNumber === currentInningsNumber)
      : balls;

    if (inningsBalls.length > 0) {
      // Get the over number from the most recent ball
      const latestBall = inningsBalls[inningsBalls.length - 1];
      const currentOverNumber = latestBall.overNumber;

      // Collect all balls from the current over (same over number)
      for (let i = inningsBalls.length - 1; i >= 0; i--) {
        const ball = inningsBalls[i];
        if (ball.overNumber === currentOverNumber) {
          currentOverBalls.unshift(ball);
        } else {
          // Different over number, stop collecting
          break;
        }
      }
    }
  }

  const recentBalls = currentOverBalls;

  // Convert backend ball data to display format
  const formatBall = (ball) => {
    // Check for wicket first
    if (ball.isWicket) {
      return { display: 'W', type: 'wicket' };
    }

    // Check for extras with declare 1
    if (ball.extras?.type === 'wide') {
      if (ball.isDeclareOne) {
        return { display: 'WD*', type: 'wide-declare' };  // * indicates declare 1
      }
      return { display: 'WD', type: 'wide' };
    }
    if (ball.extras?.type === 'noball') {
      if (ball.isDeclareOne) {
        return { display: 'NB*', type: 'noball-declare' };  // * indicates declare 1
      }
      return { display: 'NB', type: 'noball' };
    }

    // Check for boundaries
    if (ball.runs === 6) {
      return { display: '6', type: 'six' };
    }
    if (ball.runs === 4) {
      return { display: '4', type: 'four' };
    }

    // Check for declare 1 (regular run)
    if (ball.isDeclareOne && ball.runs === 1) {
      return { display: 'D1', type: 'declare-one' };
    }

    // Regular runs
    if (ball.runs === 0) {
      return { display: '0', type: 'dot' };
    }
    return { display: ball.runs.toString(), type: 'run' };
  };

  const getBallStyle = (type) => {
    const baseStyle = "w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm";

    switch (type) {
      case 'wicket':
        return `${baseStyle} bg-red-500 text-white`;
      case 'six':
        return `${baseStyle} bg-green-500 text-white`;
      case 'four':
        return `${baseStyle} bg-[#8BC9E8] text-white`;
      case 'wide':
      case 'noball':
        return `${baseStyle} bg-yellow-500 text-white`;
      case 'wide-declare':
      case 'noball-declare':
        return `${baseStyle} bg-yellow-500 text-white border-2 border-[#8BC9E8]`;  // Yellow with blue border for declare 1
      case 'declare-one':
        return `${baseStyle} bg-[#8BC9E8] text-white border-2 border-white`;  // Special style for D1
      case 'dot':
        return `${baseStyle} bg-[#4A4B5E] text-white`;
      default:
        return `${baseStyle} bg-[#353647] border-2 border-[#4A4B5E] text-white`;
    }
  };

  return (
    <div className="bg-[#353647] border border-[#4A4B5E] rounded-[24px] shadow-lg p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-bold text-white text-sm">
          This Over
        </h3>
        {partnership && partnership.runs > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-white/70">Partnership:</span>
            <span className="text-xs font-bold text-white">{partnership.runs} ({partnership.balls})</span>
          </div>
        )}
      </div>

      {/* Balls grid or empty state */}
      {recentBalls.length > 0 ? (
        <>
          <div className="flex items-center justify-center gap-2.5">
            {recentBalls.map((ball, index) => {
              const formattedBall = formatBall(ball);
              return (
                <motion.div
                  key={index}
                  className={getBallStyle(formattedBall.type)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{
                    delay: index * 0.08,
                    type: "spring",
                    stiffness: 300,
                    damping: 20
                  }}
                >
                  {formattedBall.display}
                </motion.div>
              );
            })}
          </div>

          {/* Over runs - calculate from actual balls */}
          <div className="mt-3 pt-3 border-t border-[#4A4B5E]/30 text-center">
            <span className="text-xs text-white/70">
              Runs from over: <span className="font-bold text-[#8BC9E8]">
                {recentBalls.reduce((sum, ball) => {
                  // Total runs = batsman runs + extra runs
                  const batsmanRuns = ball.runs || 0;
                  const extraRuns = ball.extras?.runs || 0;
                  return sum + batsmanRuns + extraRuns;
                }, 0)}
              </span>
            </span>
          </div>
        </>
      ) : (
        <div className="py-8 text-center">
          <p className="text-white/50 text-sm">No balls bowled yet</p>
        </div>
      )}
    </div>
  );
};

export default RecentBalls;
