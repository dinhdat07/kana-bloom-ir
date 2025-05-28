
import React from 'react';
import { ScreenId } from '../types';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';

interface ImmersiveReadingLevelSelectScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  startImmersiveReadingLevel: (level: 1 | 2 | 3) => void;
}

const ImmersiveReadingLevelSelectScreen: React.FC<ImmersiveReadingLevelSelectScreenProps> = ({ navigateTo, startImmersiveReadingLevel }) => {
  const levels: (1 | 2 | 3)[] = [1, 2, 3];

  return (
    <ScreenWrapper title="📖 Immersive Reading 📖" className="text-center">
      <h2 className={`text-2xl md:text-3xl font-display text-[var(--color-header-text)] mb-10 text-shadow-cute`}>
        Select Your Reading Level
      </h2>
      <div className="space-y-5 mb-8">
        {levels.map((level) => (
          <Button
            key={level}
            onClick={() => startImmersiveReadingLevel(level)}
            variant="level-select" // Using similar styling to drill level select
            className="w-full capitalize py-4 text-lg"
            icon="📚"
          >
            Level {level}
          </Button>
        ))}
      </div>
      <Button 
        onClick={() => navigateTo(ScreenId.ScriptSelect)} 
        variant="back-action"
        icon="↩️"
      >
        Back to Main Menu
      </Button>
    </ScreenWrapper>
  );
};

export default ImmersiveReadingLevelSelectScreen;
