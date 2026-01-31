import { Button } from '../common';

/**
 * Scorer Actions Component
 * ACTION, REVIEW, UNDO buttons
 */
const ScorerActions = ({ onAction, onReview, onUndo }) => {
  return (
    <div className="grid grid-cols-3 gap-2">
      <Button
        variant="primary"
        size="lg"
        fullWidth
        onClick={onAction}
      >
        ACTION
      </Button>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={onReview}
      >
        REVIEW
      </Button>

      <Button
        variant="secondary"
        size="lg"
        fullWidth
        onClick={onUndo}
      >
        UNDO
      </Button>
    </div>
  );
};

export default ScorerActions;
