
import React from 'react';
import { UI_THEME, UI_COLORS } from '../uiConstants'; // Updated import

interface DrillOptionButtonProps {
  onClick: () => void;
  text: string;
  disabled?: boolean;
  isCorrect?: boolean;
  isSelected?: boolean;
  showFeedback?: boolean;
  className?: string;
}

const DrillOptionButton: React.FC<DrillOptionButtonProps> = ({
  onClick,
  text,
  disabled = false,
  isCorrect,
  isSelected,
  showFeedback = false,
  className = '',
}) => {
  // Base style from UI_THEME.buttonBase (includes rounded-full)
  // Increased height and adjusted padding for a "chubbier" pill button
  let buttonClasses = `${UI_THEME.buttonBase} ${UI_THEME.fontKana} text-xl md:text-2xl w-full min-h-[5.5rem] md:min-h-[6.5rem] flex items-center justify-center text-center break-words px-3 py-2`; // Adjusted padding for pill shape
  let textClass = `text-[var(--color-secondary-text)]`;
  let gradientClass = '';

  if (showFeedback && isSelected) {
    if (isCorrect) {
      gradientClass = 'bg-[image:var(--gradient-correct)]';
      textClass = `text-[var(--color-feedback-correct-text)]`;
      buttonClasses = `${buttonClasses} animate-bounce-correct`;
    } else {
      gradientClass = 'bg-[image:var(--gradient-incorrect)]';
      textClass = `text-[var(--color-feedback-incorrect-text)]`;
      buttonClasses = `${buttonClasses} animate-shake`;
    }
  } else if (isSelected && !disabled) { 
     gradientClass = 'bg-[image:var(--gradient-primary)]'; // Use primary gradient for selection highlight
     textClass = `text-[var(--color-primary-text)]`; // Ensure text is readable on primary
     buttonClasses = `${buttonClasses} ring-2 ring-offset-1 ring-[var(--color-primary-to)]`;
  } else {
    // Default option button background - using secondary gradient for consistency
    gradientClass = 'bg-[image:var(--gradient-secondary)]';
    buttonClasses = `${buttonClasses} border border-[var(--color-soft-pink-border)]`;
    // textClass remains default option text color
  }
  
  buttonClasses = `${buttonClasses} ${gradientClass} ${textClass}`;

  if (disabled && !(showFeedback && isSelected)) {
    buttonClasses = `${UI_THEME.buttonBase} ${UI_THEME.fontKana} text-xl md:text-2xl w-full min-h-[5.5rem] md:min-h-[6.5rem] flex items-center justify-center text-center break-words px-3 py-2 ${textClass} btn-disabled`;
  }


  return (
    <button
      onClick={onClick}
      className={`${buttonClasses} ${className}`}
      disabled={disabled}
    >
      {text}
    </button>
  );
};

export default DrillOptionButton;
