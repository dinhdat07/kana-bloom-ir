
import React from 'react';
import { ScreenId, ScriptType } from '../types';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { UI_COLORS } from '../uiConstants';

interface ScriptSelectScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  selectScript: (script: ScriptType) => void;
  isTtsPreferenceEnabled: boolean;
  toggleTtsPreference: () => void; // This function now handles modal logic in App.tsx
  isTtsEffectivelyEnabled: boolean;
}

const ScriptSelectScreen: React.FC<ScriptSelectScreenProps> = ({
  navigateTo,
  selectScript,
  isTtsPreferenceEnabled,
  toggleTtsPreference,
  isTtsEffectivelyEnabled,
}) => {

  const handleScriptSelect = (script: ScriptType) => {
    selectScript(script);
    navigateTo(ScreenId.LineSelect);
  };
  
  let ttsButtonText = `Sound: ${isTtsEffectivelyEnabled ? "On" : "Off"}`;
  let ttsButtonTitle = isTtsEffectivelyEnabled ? "Disable Text-to-Speech" : "Enable Text-to-Speech";
  let ttsButtonIcon = isTtsEffectivelyEnabled ? "🔊" : "🔇";

  if (!isTtsEffectivelyEnabled && isTtsPreferenceEnabled) { // Preference is on, but no key
    ttsButtonText = "Sound: Off (No API Key)";
    ttsButtonTitle = "Azure TTS API Key required. Click to configure.";
  } else if (!isTtsPreferenceEnabled) { // Preference is off
     ttsButtonText = "Sound: Off";
     ttsButtonTitle = "Enable Text-to-Speech (Azure API Key may be required)";
  }


  return (
    <ScreenWrapper title="🌸 Kana Bloom 🌸" className="text-center">
      <h2 className={`text-2xl md:text-3xl font-display text-[var(--color-header-text)] mb-8 text-shadow-cute`}>
        Choose Your Path!
      </h2>
      <div className="space-y-5">
        <Button
          onClick={() => handleScriptSelect(ScriptType.Hiragana)}
          variant="primary" 
          className={`w-full text-xl py-4`}
          icon="🌸"
        >
          Hiragana Drill
        </Button>
        <Button
          onClick={() => handleScriptSelect(ScriptType.Katakana)}
          variant="primary" 
          className={`w-full text-xl py-4`}
          icon="✨"
        >
          Katakana Drill
        </Button>
        <Button
          onClick={() => navigateTo(ScreenId.MazeQuest)}
          variant="secondary" 
          className={`w-full text-xl py-4`}
          icon="🗺️"
        >
          Maze Quest
        </Button>
        <Button
          onClick={() => navigateTo(ScreenId.ImmersiveReadingLevelSelect)}
          variant="secondary"
          className="w-full text-xl py-4"
          icon="📖"
        >
          Immersive Reading
        </Button>
      </div>

      {/* TTS Configuration - Triggered by toggleTtsPreference via Modal in App.tsx */}
      <div className="mt-10">
        <Button
          onClick={toggleTtsPreference} // This now potentially opens the modal via App.tsx
          variant="secondary"
          className={`w-full max-w-xs mx-auto text-base py-3`}
          icon={ttsButtonIcon}
          title={ttsButtonTitle}
        >
          {ttsButtonText}
        </Button>
        {process.env.AZURE_TTS_API_KEY && !isTtsEffectivelyEnabled && isTtsPreferenceEnabled && (
            <p className="text-xs text-[var(--color-main-text)] opacity-70 mt-2">
                (Using API key from environment variables but sound preference is off or modal interaction pending)
            </p>
        )}
         {isTtsEffectivelyEnabled && process.env.AZURE_TTS_API_KEY && (
             <p className="text-xs text-[var(--color-main-text)] opacity-70 mt-2">
                (Sound enabled, using API key from environment)
            </p>
         )}
      </div>

    </ScreenWrapper>
  );
};

export default ScriptSelectScreen;
