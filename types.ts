
export enum ScriptType {
  Hiragana = 'Hiragana',
  Katakana = 'Katakana',
}

export enum ScreenId {
  ScriptSelect = 'scriptSelectScreen',
  LineSelect = 'lineSelectScreen',
  LevelSelect = 'levelSelectScreen',
  Drill = 'drillScreen',
  Results = 'resultsScreen',
  MazeQuest = 'mazeQuestScreen',
  ImmersiveReadingLevelSelect = 'immersiveReadingLevelSelectScreen',
  ImmersiveReading = 'immersiveReadingScreen',
}

export enum DrillLevel {
  Easy = 'easy',
  Medium = 'medium',
  Difficult = 'difficult',
}

export enum QuestionType {
  KanaToRomaji = 'kanaToRomaji',
  RomajiToKana = 'romajiToKana',
  WordToRomaji = 'wordToRomaji',
  RomajiToWord = 'romajiToWord',
}

export interface Mora {
  kana: string;
  romaji: string;
  // Add 'n_syllabic' to the allowed types for Mora.type
  type: 'basic' | 'basic-d' | 'basic-hp' | 'youon-y' | 'youon-w' | 'sokuon' | 'choonpu' | 'extended' | 'n_syllabic';
  script: ScriptType;
  baseKana?: string; // e.g., 'か' for 'が'. The core character this is a variant of.
  consonant?: string;
  vowel?: string;
  constituentKana?: string[]; // For yōon, e.g., ['キ', 'ャ'] for 'キャ'
  particleRomaji?: string; // For は, へ, を when used as particles
}

export interface KanaLine {
  id: string; // e.g., 'a-line', 'ka-line'
  name: string; // e.g., "A-line (あいうえお)"
  kana: Mora[];
}

export interface Word {
  kana: string;
  romaji: string;
  length: number; // Mora count
  constituentKana: string[]; // Array of kana strings (actual kana characters)
  commonLearnerErrors?: string[]; // e.g., ['さかな -> さがな', 'あうい'] (error part)
  phoneticProfile?: {
    hasVoiced?: boolean;
    hasHandakuten?: boolean;
    hasSokuon?: boolean;
    hasChoonpu?: boolean;
    hasYouon?: boolean;
  };
  visualComplexityScore?: number; // Arbitrary score based on stroke count, number of parts, etc.
  isPlausibleNonWord?: boolean; // If this "word" is intentionally a non-word for distractor purposes
  sourceWordKanaFromPlausible?: string; // If PNW, the original word it was derived from
  derivationTypeForPlausible?: string; // How the PNW was formed (e.g., "visualSwap", "voicingError")
  isPhrase?: boolean; // e.g. "おはようございます"
  tags?: string[]; // e.g., "JLPT N5", "greeting", "verb"
}

export interface Question {
  id: string; // Unique ID for the question
  stimulus: string; // The kana/word/romaji shown to the user
  correctAnswer: string; // The correct kana/word/romaji
  options: string[]; // Array of 4 options, including the correct answer
  questionType: QuestionType;
  stimulusType: 'kana' | 'word' | 'romaji';
  answerType: 'kana' | 'word' | 'romaji';
  originalStimulusObject: Mora | Word; // Reference to the full object used for stimulus
  originalCorrectAnswerObject: Mora | Word; // Reference to the full object for the correct answer
}

export interface KanaSimilarities {
  [key: string]: { similarKana: string; strength: number; comment?: string }[];
}

export interface MazeLevelData {
  levelNum: number;
  layout: string[][]; 
  words: Word[]; 
  message?: string;
  kanaSpots: { kana: string; x: number; y: number }[]; 
}

export interface PlayerPosition {
  x: number;
  y: number;
}

export interface GameConfig {
  selectedScript: ScriptType | null;
  selectedLineId: string | null; // Can be 'mixed' or specific line ID
  selectedLevel: DrillLevel | null;
  selectedImmersiveReadingLevel?: 1 | 2 | 3; // Added for immersive mode
}

export interface DrillStats {
  correct: number;
  total: number;
}

// Added PetalEventConfig types
export type PetalEventType = 'burst' | 'swirlAway' | 'resultsShower';

export interface PetalBurstConfig {
  type: 'burst';
  x: number;
  y: number;
  count: number;
}

export interface PetalSwirlConfig {
  type: 'swirlAway';
}

export interface PetalResultsShowerConfig {
  type: 'resultsShower';
  active: boolean;
}

export type PetalEventConfig = PetalBurstConfig | PetalSwirlConfig | PetalResultsShowerConfig | null;

// Added PetalDifficultyContext type
export type PetalDifficultyContext = DrillLevel;

// Immersive Reading Types
export interface ReadingUnit {
  japanese: string; // The segment to highlight
  romaji: string;   // Correct Romanji for this segment
}
export interface ReadingPassage {
  id: string;
  level: 1 | 2 | 3; // Difficulty level
  passageUnits: ReadingUnit[]; // Array of units to test sequentially
  fullText: string; // The full sentence/passage for display
  sourceInfo?: string; // Optional: e.g., "Nakama 1, p. 25"
}

export interface ImmersiveReadingStats {
  wordsCorrect: number;
  wordsTotal: number;
  passagesCompleted: number;
  totalPassagesInLevel: number;
}
