import { Button } from '../common';

/**
 * Ball Input Component
 * Grid layout of number buttons (0-6, WKT, extras, Declare 1)
 */
const BallInput = ({ onBallClick, onExtrasClick, onWicketClick, onDeclareOneClick, selectedBall }) => {
  const numberButtons = ['0', '1', '2', '3', '4', '5'];
  const specialButtons = ['6', 'WKT', 'WD'];
  const extraButtons = ['NB', 'BYE', 'LB'];

  const isRunSelected = (num) =>
    selectedBall?.runs === num && selectedBall?.type === 'run';

  const selectedStyle = '!bg-white !text-[#0B0D14] !border-white ring-2 ring-white/50';

  return (
    <div className="space-y-3">
      {/* First row: 0-5 */}
      <div className="grid grid-cols-3 gap-3">
        {numberButtons.map((num) => (
          <Button
            key={num}
            variant="grid"
            size="grid"
            onClick={() => onBallClick(parseInt(num))}
            className={`min-h-[64px] text-2xl font-bold ${isRunSelected(parseInt(num)) ? selectedStyle : ''}`}
          >
            {num}
          </Button>
        ))}
      </div>

      {/* Second row: 6, WKT, WD */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="grid"
          size="grid"
          onClick={() => onBallClick(6)}
          className={`min-h-[64px] text-2xl font-bold ${isRunSelected(6) ? selectedStyle : ''}`}
        >
          6
        </Button>
        <Button
          variant="grid"
          size="grid"
          onClick={onWicketClick}
          className="min-h-[64px] text-xl font-bold"
        >
          WKT
        </Button>
        <Button
          variant="grid"
          size="grid"
          onClick={() => onExtrasClick('wide')}
          className="min-h-[64px] text-xl font-bold"
        >
          WD
        </Button>
      </div>

      {/* Third row: NB, BYE, LB */}
      <div className="grid grid-cols-3 gap-3">
        <Button
          variant="grid"
          size="grid"
          onClick={() => onExtrasClick('noball')}
          className="min-h-[64px] text-lg font-bold"
        >
          NB
        </Button>
        <Button
          variant="grid"
          size="grid"
          onClick={() => onExtrasClick('bye')}
          className="min-h-[64px] text-base font-bold"
        >
          BYE
        </Button>
        <Button
          variant="grid"
          size="grid"
          onClick={() => onExtrasClick('legbye')}
          className="min-h-[64px] text-base font-bold"
        >
          LB
        </Button>
      </div>

      {/* Fourth row: Declare 1 (if enabled) */}
      {onDeclareOneClick && (
        <div className="grid grid-cols-1 gap-3">
          <Button
            variant="grid"
            size="grid"
            onClick={onDeclareOneClick}
            className="min-h-[64px] text-base font-bold bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20"
          >
            DECLARE 1 RUN
          </Button>
        </div>
      )}
    </div>
  );
};

export default BallInput;
