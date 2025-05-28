
import React from 'react';
import { UI_THEME, UI_COLORS } from '../uiConstants'; // Updated import

interface ButtonProps {
  onClick: () => void;
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'default' | 'danger' | 'menu-option' | 'line-select' | 'level-select' | 'back-action' | 'start-drill';
  className?: string;
  disabled?: boolean;
  title?: string;
  icon?: string; // For cute icons, per blueprint
}

const Button: React.FC<ButtonProps> = ({ onClick, children, variant = 'default', className = '', disabled = false, title, icon }) => {
  let styleClasses = `${UI_THEME.buttonBase}`; // Base classes include rounded-full and btn-interactive
  let textClass = '';
  let gradientClass = '';

  switch (variant) {
    case 'primary':
    case 'menu-option':
      gradientClass = 'bg-[image:var(--gradient-primary)]';
      textClass = `text-[var(--color-primary-text)]`;
      styleClasses = `${styleClasses} focus:ring-[var(--color-primary-to)]`;
      break;
    case 'secondary':
      gradientClass = 'bg-[image:var(--gradient-secondary)]';
      textClass = `text-[var(--color-secondary-text)]`;
      styleClasses = `${styleClasses} focus:ring-[var(--color-secondary-to)]`;
      break;
    case 'line-select':
      gradientClass = 'bg-[image:var(--gradient-secondary)]'; // Uses secondary gradient
      textClass = `text-[var(--color-secondary-text)]`;
      styleClasses = `${styleClasses} border border-[var(--color-soft-pink-border)] focus:ring-[var(--color-primary-to)]`;
      break;
    case 'level-select':
       gradientClass = 'bg-[image:var(--gradient-primary)]'; // Similar to primary
       textClass = `text-[var(--color-primary-text)]`;
       styleClasses = `${styleClasses} focus:ring-[var(--color-primary-to)]`;
      break;
    case 'back-action': 
      gradientClass = 'bg-[image:var(--gradient-action)]';
      textClass = `text-[var(--color-action-text)]`;
      styleClasses = `${styleClasses} focus:ring-[var(--color-action-to)]`;
      break;
    case 'start-drill': 
      gradientClass = 'bg-[image:var(--gradient-correct)]';
      textClass = `text-[var(--color-feedback-correct-text)]`;
      styleClasses = `${styleClasses} focus:ring-[var(--color-feedback-correct-bg-to)]`;
      break;
    case 'danger':
      gradientClass = 'bg-[image:var(--gradient-incorrect)]';
      textClass = `text-[var(--color-feedback-incorrect-text)]`; // Dark red text
      styleClasses = `${styleClasses} focus:ring-[var(--color-feedback-incorrect-bg-to)]`;
      break;
    default: // default
      gradientClass = 'bg-gradient-to-br from-slate-200 to-slate-300'; // Keep a neutral default
      textClass = `text-slate-700`; 
      styleClasses = `${styleClasses} focus:ring-slate-400`;
      break;
  }
  
  styleClasses = `${styleClasses} ${gradientClass} ${textClass}`;

  if (disabled) {
    styleClasses = `${UI_THEME.buttonBase} ${textClass} btn-disabled`; 
  }

  return (
    <button
      onClick={onClick}
      className={`${styleClasses} ${className} flex items-center justify-center gap-2.5`} // Slightly increased gap for icons
      disabled={disabled}
      title={title}
    >
      {icon && <span className="text-xl leading-none">{icon}</span>} {/* Ensure icon aligns well */}
      <span className="leading-none">{children}</span> {/* Ensure text aligns well */}
    </button>
  );
};

export default Button;
