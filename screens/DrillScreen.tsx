
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenId, Question, Word } from '../types'; // Added Word type
import { UI_COLORS, UI_THEME } from '../uiConstants';
import { TOTAL_QUESTIONS_PER_DRILL } from '../gameConfigConstants';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import DrillOptionButton from '../components/DrillOptionButton';
import SpeakButton from '../components/SpeakButton';
import { speakWithAzureTTS, cancelAzureTTS } from '../services/azureTtsService';

interface DrillScreenProps {
  navigateTo: (screenId: ScreenId) => void;
  currentDrillSet: Question[];
  currentQuestionNum: number;
  loadNextQuestion: () => Question | null;
  updateScore: (isCorrect: boolean) => void;
  handleDrillCompletion: () => void;
  displayScore: number;
  triggerPetalBurst?: (x: number, y: number, count: number) => void;
  isTtsEnabled: boolean;
}

const DrillScreen: React.FC<DrillScreenProps> = ({
  navigateTo,
  currentDrillSet,
  currentQuestionNum: currentQuestionNumFromApp,
  loadNextQuestion,
  updateScore,
  handleDrillCompletion,
  displayScore,
  triggerPetalBurst,
  isTtsEnabled,
}) => {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showFeedback, setShowFeedback] = useState<boolean>(false);
  const [feedbackMessage, setFeedbackMessage] = useState<string>('');

  const [stimulusAudioState, setStimulusAudioState] = useState<'idle' | 'loading' | 'speaking' | 'error'>('idle');
  const [stimulusAudioErrorMessage, setStimulusAudioErrorMessage] = useState<string | null>(null);
  const [answerOptionsDisabled, setAnswerOptionsDisabled] = useState<boolean>(false);

  const feedbackDisplayRef = useRef<HTMLDivElement>(null);
  const nextQuestionTimerRef = useRef<number | null>(null);
  const advancementGateOpenRef = useRef<boolean>(true);
  const stimulusAbortControllerRef = useRef<AbortController | null>(null);
  const audioStimulusPlayerRef = useRef<HTMLAudioElement | null>(null);


  const cleanupStimulusAudio = useCallback(() => {
    if (stimulusAbortControllerRef.current) {
      stimulusAbortControllerRef.current.abort();
      stimulusAbortControllerRef.current = null;
    }
    if (audioStimulusPlayerRef.current) {
      audioStimulusPlayerRef.current.pause();
      if (audioStimulusPlayerRef.current.src && audioStimulusPlayerRef.current.src.startsWith('blob:')) {
        URL.revokeObjectURL(audioStimulusPlayerRef.current.src);
      }
      audioStimulusPlayerRef.current = null;
    }
    setStimulusAudioState('idle');
    setStimulusAudioErrorMessage(null);
  }, []);

  const playStimulusAudio = useCallback(async (stimulusText: string) => {
    cleanupStimulusAudio(); // Clean up any previous audio first
    if (!isTtsEnabled || !stimulusText.trim()) {
      setAnswerOptionsDisabled(false);
      return;
    }

    setStimulusAudioState('loading');
    setAnswerOptionsDisabled(true);
    stimulusAbortControllerRef.current = new AbortController();
    const signal = stimulusAbortControllerRef.current.signal;

    try {
      const audioBlob = await speakWithAzureTTS(stimulusText, 'ja-JP', signal);

      if (signal.aborted) return;

      if (audioBlob) {
        const audioUrl = URL.createObjectURL(audioBlob);
        const newAudio = new Audio(audioUrl);
        audioStimulusPlayerRef.current = newAudio;

        newAudio.oncanplaythrough = () => { if (!signal.aborted) newAudio.play().catch(handleAudioError); };
        newAudio.onplaying = () => { if (!signal.aborted) setStimulusAudioState('speaking'); };
        newAudio.onended = () => {
          if (!signal.aborted) {
            setStimulusAudioState('idle');
            setAnswerOptionsDisabled(false);
            URL.revokeObjectURL(audioUrl);
          }
        };

        newAudio.onended = () => {
          if (!signal.aborted && audioStimulusPlayerRef.current === newAudio) {
            console.log("Audio playback ended")
            setStimulusAudioState("idle")
            setAnswerOptionsDisabled(false)
            URL.revokeObjectURL(audioUrl)
          }
        }
        newAudio.onerror = (e) => {
            console.error('Stimulus audio element error:', e);
            handleAudioError(new Error("Audio playback failed"));
            URL.revokeObjectURL(audioUrl); // Ensure revoke on error
        };
        newAudio.load();
      } else {
        handleAudioError(new Error("No audio data received for stimulus."));
      }
    } catch (error) {
      if (signal.aborted) return;
      console.error("Error playing stimulus audio:", error);
      handleAudioError(error instanceof Error ? error : new Error("TTS error for stimulus."));
    }
  }, [isTtsEnabled, cleanupStimulusAudio]);

  const handleAudioError = useCallback((error: Error) => {
    setStimulusAudioState('error');
    setStimulusAudioErrorMessage(error.message.includes("configured") ? "TTS not configured." : "Stimulus audio error.");
    setAnswerOptionsDisabled(false);
  }, []);


  useEffect(() => {
    cleanupStimulusAudio(); // Clean up on unmount or before new question setup
    if (currentDrillSet.length > 0 && currentQuestionNumFromApp < currentDrillSet.length) {
      const newQ = currentDrillSet[currentQuestionNumFromApp];
      setCurrentQuestion(newQ);
      setSelectedAnswer(null);
      setShowFeedback(false);
      setFeedbackMessage('');
      advancementGateOpenRef.current = true;
      clearTimeout(nextQuestionTimerRef.current!);

      if (isTtsEnabled) {
        const stimulusTextToPlay = newQ.stimulusType === 'kana' || newQ.stimulusType === 'word'
            ? newQ.stimulus
            : newQ.correctAnswer; // If stimulus is Romaji, speak the Kana/Word answer
        playStimulusAudio(stimulusTextToPlay);
      } else {
        setAnswerOptionsDisabled(false);
      }
    }
    return cleanupStimulusAudio;
  }, [currentDrillSet, currentQuestionNumFromApp, isTtsEnabled, playStimulusAudio, cleanupStimulusAudio]);


  useEffect(() => {
    return () => { // Component unmount cleanup
      clearTimeout(nextQuestionTimerRef.current!);
      cleanupStimulusAudio();
    };
  }, [cleanupStimulusAudio]);

  const attemptAdvance = useCallback(() => {
    clearTimeout(nextQuestionTimerRef.current!);
    if (advancementGateOpenRef.current) {
      const nextQ = loadNextQuestion();
      if (!nextQ) {
        handleDrillCompletion();
      }
    }
  }, [loadNextQuestion, handleDrillCompletion]);

  const handleAnswer = (answer: string) => {
    if (showFeedback || !currentQuestion || stimulusAudioState === 'loading' || stimulusAudioState === 'speaking') return;

    setSelectedAnswer(answer);
    setShowFeedback(true);
    const isCorrect = answer === currentQuestion.correctAnswer;
    updateScore(isCorrect);
    setFeedbackMessage(isCorrect ? "Correct! 💖✨" : "Not quite... 💧");

    if (isCorrect && triggerPetalBurst && feedbackDisplayRef.current) {
      const rect = feedbackDisplayRef.current.getBoundingClientRect();
      triggerPetalBurst(rect.left + rect.width / 2, rect.top + rect.height / 2 - 20, isCorrect ? 7 : 3);
    }

    clearTimeout(nextQuestionTimerRef.current!)
    console.log("TTS enabled:", isTtsEnabled)

    // Thời gian cố định: 4000ms khi TTS bật, 1800ms khi TTS tắt
    const delayTime = isTtsEnabled ? 4000 : 1800
    console.log(`Setting delay: ${delayTime}ms`)

    advancementGateOpenRef.current = !isTtsEnabled // Chỉ mở gate khi không có TTS

    nextQuestionTimerRef.current = setTimeout(() => {
      attemptAdvance();
    }, delayTime);

  };

  const handleTtsBusy = useCallback(() => {
    advancementGateOpenRef.current = false;
    clearTimeout(nextQuestionTimerRef.current!);
  }, []);

  const handleTtsIdle = useCallback(() => {
    advancementGateOpenRef.current = true;
    clearTimeout(nextQuestionTimerRef.current!);
    nextQuestionTimerRef.current = setTimeout(attemptAdvance, 1800);
  }, [attemptAdvance]);

  if (!currentQuestion) {
    return (
      <ScreenWrapper title="Loading Drill...">
        <p className="text-center text-xl text-[var(--color-main-text)]">Preparing questions...</p>
        <Button onClick={() => navigateTo(ScreenId.ScriptSelect)} variant="default" className="mt-6" icon="🏠">
          Return to Menu
        </Button>
      </ScreenWrapper>
    );
  }

  const stimulusIsKanaOrWord = currentQuestion.stimulusType === 'kana' || currentQuestion.stimulusType === 'word';
  const stimulusFontSize = `clamp(3rem, 15vw, 6rem)`;

  const originalStimulusAsWord = currentQuestion.originalStimulusObject as Word;
  const stimulusIsPlausibleNonWord =
    currentQuestion.stimulusType === 'word' &&
    originalStimulusAsWord &&
    typeof originalStimulusAsWord.isPlausibleNonWord === 'boolean' &&
    originalStimulusAsWord.isPlausibleNonWord === true;

  const feedbackTextForSpeech = currentQuestion
    ? (currentQuestion.stimulusType === 'kana' || currentQuestion.stimulusType === 'word'
      ? currentQuestion.stimulus
      : currentQuestion.correctAnswer)
    : "";

  return (
    <ScreenWrapper title="Kana Drill Time!" className="text-center">
      <div className="mb-5 flex justify-between items-center px-1">
        <p className={`text-base text-[var(--color-header-text)]`}>Question: {currentQuestionNumFromApp + 1} / {currentDrillSet.length}</p>
        <p className={`text-base text-[var(--color-header-text)]`}>Score: {displayScore}</p>
      </div>

      <div className="relative my-6 md:my-8">
        <div
          id="stimulusDisplay"
          className={`p-6 md:p-10 bg-gradient-to-br from-[rgba(255,245,250,0.95)] to-[rgba(255,235,242,0.98)] rounded-2xl shadow-inner flex flex-col items-center justify-center min-h-[130px] md:min-h-[160px]
                     ${stimulusIsKanaOrWord ? 'font-kana' : UI_THEME.fontBody} text-[var(--color-stimulus-highlight)] border border-[var(--color-soft-pink-border)] text-shadow-cute`}
        >
          <span style={{ fontSize: stimulusFontSize }}>{currentQuestion.stimulus}</span>
          {stimulusIsPlausibleNonWord && (
            <span className="block text-xs sm:text-sm text-[var(--color-main-text)] opacity-80 mt-1 font-sans">
              (imaginary word)
            </span>
          )}
           {(stimulusAudioState === 'loading' || stimulusAudioState === 'speaking') && (
            <span className="absolute top-1 right-2 text-xs text-[var(--color-main-text)] opacity-70">
              {stimulusAudioState === 'loading' ? 'Loading audio...' : 'Speaking...'}
            </span>
          )}
          {stimulusAudioState === 'error' && stimulusAudioErrorMessage && (
            <span className="absolute bottom-1 right-2 text-xs text-red-500 opacity-90 p-1 bg-white/50 rounded">
              {stimulusAudioErrorMessage}
            </span>
          )}
        </div>
      </div>

      {showFeedback && feedbackMessage && (
        <div
            id="feedbackDisplay"
            ref={feedbackDisplayRef}
            className={`py-2.5 px-4 mb-3 rounded-xl text-center text-lg font-semibold shadow-sm
            ${selectedAnswer === currentQuestion.correctAnswer ? `bg-[rgba(224,242,241,0.8)] text-[var(--color-feedback-correct-text)]` : `bg-[rgba(255,235,238,0.8)] text-[var(--color-feedback-incorrect-text)]`}`}
        >
            {feedbackMessage}
        </div>
      )}

      {isTtsEnabled && showFeedback && feedbackTextForSpeech && (
        <div className="my-3 flex justify-center">
            <SpeakButton
                textToSpeak={feedbackTextForSpeech}
                lang="ja-JP"
                disabled={!isTtsEnabled}
                onTtsBusy={handleTtsBusy}
                onTtsIdle={handleTtsIdle}
            />
        </div>
      )}

      <div className="grid grid-cols-2 gap-3.5 md:gap-4">
        {currentQuestion.options.map((option, index) => (
          <DrillOptionButton
            key={index}
            text={option}
            onClick={() => handleAnswer(option)}
            disabled={showFeedback || answerOptionsDisabled || stimulusAudioState === 'loading' || stimulusAudioState === 'speaking'}
            isSelected={selectedAnswer === option}
            isCorrect={option === currentQuestion.correctAnswer}
            showFeedback={showFeedback}
          />
        ))}
      </div>

      <Button onClick={() => {
          clearTimeout(nextQuestionTimerRef.current!);
          cleanupStimulusAudio();
          handleDrillCompletion();
        }}
        variant="danger" className="mt-10" icon="🛑">
        End Drill
      </Button>
    </ScreenWrapper>
  );
};

export default DrillScreen;
