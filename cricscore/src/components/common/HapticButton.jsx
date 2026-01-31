import { useHapticFeedback } from '../../hooks/useGesture';
import Button from './Button';

/**
 * Haptic Button - Button with haptic feedback on mobile
 * Wraps the standard Button component with haptic feedback
 */
const HapticButton = ({ children, onClick, hapticType = 'medium', ...props }) => {
  const haptic = useHapticFeedback();

  const handleClick = (e) => {
    // Trigger haptic feedback
    switch (hapticType) {
      case 'light':
        haptic.light();
        break;
      case 'medium':
        haptic.medium();
        break;
      case 'heavy':
        haptic.heavy();
        break;
      case 'success':
        haptic.success();
        break;
      case 'error':
        haptic.error();
        break;
      default:
        haptic.medium();
    }

    // Call original onClick
    if (onClick) {
      onClick(e);
    }
  };

  return (
    <Button {...props} onClick={handleClick}>
      {children}
    </Button>
  );
};

export default HapticButton;
