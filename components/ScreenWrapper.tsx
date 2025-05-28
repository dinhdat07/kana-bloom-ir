
import React from 'react';
import { UI_COLORS } from '../uiConstants'; // Updated import

interface ScreenWrapperProps {
  children: React.ReactNode;
  title?: string;
  className?: string; 
}

const ScreenWrapper: React.FC<ScreenWrapperProps> = ({ children, title, className }) => {
  return (
    <div 
      className={`app-shell-container w-full max-w-xl md:max-w-2xl lg:max-w-3xl p-1.5 md:p-2 animate-popIn ${className}`} // Slightly reduced outer padding to compensate for increased inner padding
    >
      {title && (
        <h1 
            className={`text-4xl md:text-5xl font-display text-[var(--color-header-text)] text-center my-5 md:my-7 px-2 text-shadow-cute`} // Larger, styled title
        >
          {title}
        </h1>
      )}
      {/* Added flex flex-col to screen-content to enable mt-auto for last child */}
      <div className="screen-content px-5 md:px-6 pb-6 flex flex-col flex-grow"> {/* Increased padding & flex properties */}
        {children}
      </div>
    </div>
  );
};

export default ScreenWrapper;
