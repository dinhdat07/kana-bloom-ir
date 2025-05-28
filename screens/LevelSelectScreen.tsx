
import React from 'react';
import { ScreenId, DrillLevel } from '../types';
import { DEFAULT_DRILL_LEVELS } from '../gameConfigConstants';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';

interface LevelSelectScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  selectLevel: (level: DrillLevel) => void; 
  startDrill: (level: DrillLevel) => void;  
}

const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ navigateTo, selectLevel, startDrill }) => {
  
  const handleLevelSelect = (level: DrillLevel) => {
    selectLevel(level); 
    startDrill(level);  
  };

  return (
    <ScreenWrapper title="Select Difficulty" className="text-center">
      <div className="space-y-5 mb-8"> {/* Increased spacing */}
        {DEFAULT_DRILL_LEVELS.map((level) => (
          <Button
            key={level}
            onClick={() => handleLevelSelect(level)}
            variant="level-select" 
            className="w-full capitalize py-4 text-lg" // Using py-4 for a bit more height
          >
            {level}
          </Button>
        ))}
      </div>
      <Button 
        onClick={() => navigateTo(ScreenId.LineSelect)} 
        variant="back-action"
        icon="↩️"
      >
        Back to Line Select
      </Button>
    </ScreenWrapper>
  );
};

export default LevelSelectScreen;
