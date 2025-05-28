
import React from 'react';
import { ScreenId, ScriptType, KanaLine } from '../types';
import { KANA_LINES, KANA_LINE_ORDER } from '../linguisticConstants';
import { UI_COLORS } from '../uiConstants';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';

interface LineSelectScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  selectedScript: ScriptType | null;
  selectLine: (lineId: string | null) => void;
}

const LineSelectScreen: React.FC<LineSelectScreenProps> = ({ navigateTo, selectedScript, selectLine }) => {
  if (!selectedScript) {
    navigateTo(ScreenId.ScriptSelect);
    return null;
  }

  const linesForScript = KANA_LINES[selectedScript];
  const lineOrder = KANA_LINE_ORDER[selectedScript];

  const handleLineSelect = (lineId: string | null) => {
    selectLine(lineId);
    navigateTo(ScreenId.LevelSelect);
  };

  return (
    <ScreenWrapper title={`Select ${selectedScript} Line`} className="text-center">
      {/* Softer background for scroll area */}
      <div className={`space-y-3.5 mb-6 max-h-[60vh] md:max-h-[65vh] overflow-y-auto p-3 bg-[rgba(255,245,250,0.6)] rounded-xl shadow-inner`}>
        <Button
            onClick={() => handleLineSelect(null)} 
            variant="secondary" 
            className="w-full py-3.5" // Consistent padding with UI_THEME.buttonBase
            icon="📚"
          >
            All Lines Mixed
        </Button>
        {lineOrder.map((lineId) => {
          const line: KanaLine | undefined = linesForScript[lineId];
          return line ? (
            <Button
              key={line.id}
              onClick={() => handleLineSelect(line.id)}
              variant="line-select" 
              className="w-full py-3.5" // Consistent padding
            >
              {line.name}
            </Button>
          ) : null;
        })}
      </div>
      <Button 
        onClick={() => navigateTo(ScreenId.ScriptSelect)} 
        variant="back-action" 
        icon="↩️"
      >
        Back to Script Select
      </Button>
    </ScreenWrapper>
  );
};

export default LineSelectScreen;
