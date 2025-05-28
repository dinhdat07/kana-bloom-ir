
import React, { useEffect } from 'react';
import { ScreenId, DrillStats, PetalEventConfig, GameConfig } from '../types'; // Added GameConfig for context
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { UI_COLORS } from '../uiConstants';

interface ResultsScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  finalStats: DrillStats;
  restartDrill: () => void; // This will be a generic restart function
  triggerResultsPetalShower?: (active: boolean) => void;
  // Add gameConfig or a specific flag to know if we came from immersive reading
  // For simplicity, we'll assume restartDrill is made generic by App.tsx
}

const ResultsScreen: React.FC<ResultsScreenProps> = ({ navigateTo, finalStats, restartDrill, triggerResultsPetalShower }) => {
  const percentage = finalStats.total > 0 ? Math.round((finalStats.correct / finalStats.total) * 100) : 0;
  let message = "Good effort! Keep blooming! 💪🌸";
  let titleIcon = "🧸";
  if (percentage >= 90) { message = "Absolutely Brilliant! You're a Kana Star! 🌟💖"; titleIcon = "👑";}
  else if (percentage >= 70) { message = "Fantastic Job! You're shining! 👍✨"; titleIcon = "🎉";}
  else if (percentage >= 50) { message = "Sweet! Keep up the practice! 😊🎀"; titleIcon = "🍬";}

  useEffect(() => {
    const currentPercentage = finalStats.total > 0 ? Math.round((finalStats.correct / finalStats.total) * 100) : 0;
    if (currentPercentage >= 70 && triggerResultsPetalShower) { // Lowered threshold for shower
      triggerResultsPetalShower(true);
    }
    return () => {
      if (triggerResultsPetalShower) {
        triggerResultsPetalShower(false);
      }
    };
  }, [finalStats, triggerResultsPetalShower]);


  return (
    <ScreenWrapper title={`${titleIcon} Session Results ${titleIcon}`} className="text-center">
      <div className={`mb-8 p-6 bg-gradient-to-br from-[rgba(255,245,250,0.9)] to-[rgba(255,230,240,0.95)] rounded-2xl shadow-inner border border-[var(--color-soft-pink-border)]`}>
        <p className={`text-2xl text-[var(--color-header-text)] mb-2 text-shadow-cute`}>You Scored</p>
        <p className={`font-display text-7xl text-[var(--color-stimulus-highlight)] mb-3 text-shadow-cute`}>
          {finalStats.correct} / {finalStats.total}
        </p>
        <p className={`text-4xl text-[var(--color-stimulus-highlight)] text-shadow-cute`}>({percentage}%)</p>
      </div>
      <p className={`text-xl text-[var(--color-main-text)] mb-10 px-2`}>{message}</p>
      <div className="space-y-5">
        <Button
            onClick={restartDrill} // This will be restartDrill or restartImmersiveReadingLevel based on App.tsx logic
            variant="start-drill" 
            className="w-full text-lg py-3.5"
            icon="🔄">
          Retry Same Session
        </Button>
        <Button
            onClick={() => navigateTo(ScreenId.LevelSelect)} // App.tsx will route this to LevelSelect or ImmersiveReadingLevelSelect
            variant="level-select" 
            className="w-full text-lg py-3.5"
            icon="📚">
           Select New Level/Mode
        </Button>
        <Button
            onClick={() => navigateTo(ScreenId.ScriptSelect)}
            variant="default" 
            className="w-full text-lg py-3.5"
            icon="🏠">
          Main Menu
        </Button>
      </div>
    </ScreenWrapper>
  );
};

export default ResultsScreen;
