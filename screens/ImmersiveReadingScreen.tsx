
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ScreenId, ReadingPassage, ReadingUnit, ImmersiveReadingStats } from '../types';
import { UI_COLORS, UI_THEME } from '../uiConstants';
import { TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL } from '../gameConfigConstants';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import DrillOptionButton from '../components/DrillOptionButton'; 
import SpeakButton from '../components/SpeakButton';
import { generateRomanjiOptionsForWordSound } from '../services/immersiveReadingDistractorService'; 
import { shuffleArray } from '../services/linguisticUtils';


interface ImmersiveReadingScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  level: 1 | 2 | 3;
  passages: ReadingPassage[];
  onComplete: (stats: ImmersiveReadingStats) => void;
  isTtsEnabled: boolean; // This prop now reflects isTtsEffectivelyEnabled from App.tsx
}

const ImmersiveReadingScreen: React.FC<ImmersiveReadingScreenProps> = ({
  navigateTo,
  level,
  passages,
  onComplete,
  isTtsEnabled, // This is isTtsEffectivelyEnabled
}) => {
  const [currentPassageNum, setCurrentPassageNum] = useState(0);
  const [currentWordInPassageIndex, setCurrentWordInPassageIndex] = useState(0);
  const [currentPassage, setCurrentPassage] = useState<ReadingPassage | null>(null);
  const [currentUnit, setCurrentUnit] = useState<ReadingUnit | null>(null);
  const [answerOptions, setAnswerOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState('');
  const [stats, setStats] = useState<ImmersiveReadingStats>({ wordsCorrect: 0, wordsTotal: 0, passagesCompleted: 0, totalPassagesInLevel: passages.length || TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL });
  const feedbackDisplayRef = useRef<HTMLDivElement>(null);

  const advancePassage = useCallback(() => {
    setStats(prev => ({...prev, passagesCompleted: prev.passagesCompleted + 1}));
    if (currentPassageNum < (passages.length || TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL) - 1) {
        setCurrentPassageNum(prev => prev + 1);
    } else {
        setCurrentPassageNum(prev => prev + 1);
    }
  }, [currentPassageNum, passages]);

  useEffect(() => {
    if (passages.length > 0 && currentPassageNum < passages.length) {
      const passage = passages[currentPassageNum];
      setCurrentPassage(passage);
      setCurrentWordInPassageIndex(0); 
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedbackMessage('');
      if (passage.passageUnits.length > 0) {
        const firstUnit = passage.passageUnits[0];
        setCurrentUnit(firstUnit);
        setAnswerOptions(generateRomanjiOptionsForWordSound(firstUnit, passage.passageUnits));
      } else {
        advancePassage();
      }
    }
  }, [passages, currentPassageNum, advancePassage]);

  useEffect(() => {
    const isCompletedByPassageCount = passages.length > 0 && currentPassageNum >= passages.length;
    const isCompletedByNoPassages = passages.length === 0 && stats.totalPassagesInLevel > 0 && currentPassageNum === 0;

    if (isCompletedByPassageCount || isCompletedByNoPassages) {
      const timerId = setTimeout(() => {
        onComplete(stats);
      }, 0);
      return () => clearTimeout(timerId); 
    }
  }, [currentPassageNum, passages, stats, onComplete]);


  const advanceWord = useCallback(() => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    setFeedbackMessage('');

    if (currentPassage && currentWordInPassageIndex < currentPassage.passageUnits.length - 1) {
      const nextWordIndex = currentWordInPassageIndex + 1;
      setCurrentWordInPassageIndex(nextWordIndex);
      const nextUnit = currentPassage.passageUnits[nextWordIndex];
      setCurrentUnit(nextUnit);
      setAnswerOptions(generateRomanjiOptionsForWordSound(nextUnit, currentPassage.passageUnits));
    } else {
      advancePassage(); 
    }
  }, [currentPassage, currentWordInPassageIndex, advancePassage]);
  

  const handleAnswer = (answer: string) => {
    if (showFeedback || !currentUnit) return;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    const isCorrect = answer === currentUnit.romaji;
    setStats(prev => ({
      ...prev,
      wordsCorrect: isCorrect ? prev.wordsCorrect + 1 : prev.wordsCorrect,
      wordsTotal: prev.wordsTotal + 1,
    }));
    setFeedbackMessage(isCorrect ? "Correct! 💖✨" : `Not quite... Correct: ${currentUnit.romaji} 💧`);

    setTimeout(() => {
      if(isCorrect) {
        advanceWord();
      } else {
         setTimeout(advanceWord, 1800); 
      }
    }, isCorrect ? 1200 : 2500);
  };

  if (!currentPassage || !currentUnit) {
    const isTrulyLoading = !( (passages.length > 0 && currentPassageNum >= passages.length) || (passages.length === 0 && stats.totalPassagesInLevel > 0) );

    if (!isTrulyLoading) {
        return null; 
    }

    return (
      <ScreenWrapper title={`Level ${level} Reading`}>
        <p className="text-center text-xl text-[var(--color-main-text)]">Loading passage...</p>
         <Button onClick={() => navigateTo(ScreenId.ImmersiveReadingLevelSelect)} variant="default" className="mt-6" icon="🏠">
          Back to Level Select
        </Button>
      </ScreenWrapper>
    );
  }

  const renderPassageWithHighlight = () => {
    return currentPassage.passageUnits.map((unit, index) => (
      <span
        key={index}
        className={`transition-all duration-200 ease-in-out p-1 mx-px rounded
          ${index === currentWordInPassageIndex ? 'bg-[var(--color-primary-to)] text-[var(--color-primary-text)] scale-110 ring-2 ring-[var(--color-primary-from)]' : 'text-[var(--color-main-text)]'}`}
      >
        {unit.japanese}
      </span>
    ));
  };

  return (
    <ScreenWrapper title={`📖 Reading Level ${level} 📖`} className="text-center">
      <div className="mb-4 flex justify-between items-center px-1">
        <p className={`text-sm text-[var(--color-header-text)]`}>Passage: {Math.min(currentPassageNum + 1, stats.totalPassagesInLevel)} / {stats.totalPassagesInLevel}</p>
        <p className={`text-sm text-[var(--color-header-text)]`}>Words: {stats.wordsCorrect} / {stats.wordsTotal}</p>
      </div>

      <div className={`my-5 p-4 bg-gradient-to-br from-[rgba(255,245,250,0.9)] to-[rgba(255,230,240,0.95)] rounded-lg shadow-inner min-h-[100px] flex items-center justify-center text-2xl md:text-3xl ${UI_THEME.fontKana} leading-relaxed text-center flex-wrap border border-[var(--color-soft-pink-border)] text-shadow-cute`}>
        {renderPassageWithHighlight()}
      </div>
      
      {showFeedback && feedbackMessage && (
        <div
            ref={feedbackDisplayRef}
             className={`py-2.5 px-4 mb-3 rounded-xl text-center text-lg font-semibold shadow-sm
            ${selectedAnswer === currentUnit.romaji ? `bg-[rgba(224,242,241,0.8)] text-[var(--color-feedback-correct-text)]` : `bg-[rgba(255,235,238,0.8)] text-[var(--color-feedback-incorrect-text)]`}`}
        >
            {feedbackMessage}
        </div>
      )}

      {/* SpeakButton is disabled based on isTtsEnabled which is now isTtsEffectivelyEnabled */}
      {currentUnit && ( 
          <div className="my-3 flex justify-center">
              <SpeakButton 
                textToSpeak={currentUnit.japanese} 
                lang="ja-JP" 
                disabled={!isTtsEnabled} // Pass the effective status
              />
          </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 md:gap-4 mt-4">
        {answerOptions.map((option, index) => (
          <DrillOptionButton
            key={index}
            text={option}
            onClick={() => handleAnswer(option)}
            disabled={showFeedback}
            isSelected={selectedAnswer === option}
            isCorrect={option === currentUnit.romaji}
            showFeedback={showFeedback}
            className="text-lg md:text-xl min-h-[4.5rem] md:min-h-[5.5rem]"
          />
        ))}
      </div>

      <Button onClick={() => {
          onComplete(stats);
      }} variant="danger" className="mt-8" icon="🛑">
        End Reading Session
      </Button>
    </ScreenWrapper>
  );
};

export default ImmersiveReadingScreen;
