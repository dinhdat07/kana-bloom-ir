
import {
  ScriptType,
  DrillLevel,
  Question,
  QuestionType,
  Mora,
  Word,
} from '../types';
import { TOTAL_QUESTIONS_PER_DRILL } from '../gameConfigConstants';
import { MORA_DATA, MASTER_VOCAB } from '../linguisticConstants';
import { generateDrillOptions, generateSyntheticWord } from './distractorService';
// Updated imports: shuffleArray, getCumulativeKanaForLine, getKanaPoolForDrill, getWordsForDrill now come from linguisticUtils
import { shuffleArray, getCumulativeKanaForLine, getKanaPoolForDrill, getWordsForDrill } from './linguisticUtils';


export const prepareDrillSet = (
  script: ScriptType,
  lineId: string | null, 
  level: DrillLevel
): Question[] => {
  const drillSet: Question[] = [];
  const usedStimuliObjects = new Set<Mora | Word>(); 
  const stimulusUsageCount = new Map<string, number>();

  let quotas: { kanaToRomaji: number, romajiToKana: number, wordToRomaji: number, romajiToWord: number };

  switch (level) {
    case DrillLevel.Easy:
      quotas = { kanaToRomaji: 12, romajiToKana: 6, wordToRomaji: 8, romajiToWord: 4 };
      break;
    case DrillLevel.Medium:
      quotas = { kanaToRomaji: 8, romajiToKana: 7, wordToRomaji: 8, romajiToWord: 7 };
      break;
    case DrillLevel.Difficult:
      quotas = { kanaToRomaji: 5, romajiToKana: 7, wordToRomaji: 7, romajiToWord: 11 };
      break;
    default: 
      quotas = { kanaToRomaji: 8, romajiToKana: 7, wordToRomaji: 8, romajiToWord: 7 };
  }

  const MAX_REPETITIONS_WORD_STIMULUS = (level === DrillLevel.Difficult) ? 1 : 2; 
  const MAX_REPETITIONS_KANA_STIMULUS = (level === DrillLevel.Difficult) ? 2 : 3;


  const addQuestion = (
    item: Mora | Word, 
    type: QuestionType, 
    bypassUsedStimuliObjectCheck: boolean = false,
    currentStimulusUsage: Map<string, number>
  ): boolean => {
    if (!item || !item.kana || !item.romaji) return false;
    if (drillSet.length >= TOTAL_QUESTIONS_PER_DRILL) return false;

    if (!bypassUsedStimuliObjectCheck && usedStimuliObjects.has(item)) return false;
    
    let stimulus: string, correctAnswer: string, stimulusType: 'kana' | 'word' | 'romaji', answerType: 'kana' | 'word' | 'romaji';
    const isKanaItem = !('length' in item); 

    switch (type) {
      case QuestionType.KanaToRomaji:
        if (!isKanaItem) return false;
        stimulus = item.kana;
        correctAnswer = (item.kana === 'は' && (item as Mora).particleRomaji) ? (item as Mora).particleRomaji! : item.romaji;
        stimulusType = 'kana'; answerType = 'romaji';
        break;
      case QuestionType.RomajiToKana:
        if (!isKanaItem) return false;
        stimulus = (item.kana === 'は' && (item as Mora).particleRomaji) ? (item as Mora).particleRomaji! : item.romaji;
        correctAnswer = item.kana; stimulusType = 'romaji'; answerType = 'kana';
        break;
      case QuestionType.WordToRomaji:
        if (isKanaItem) return false;
        stimulus = item.kana; correctAnswer = item.romaji; stimulusType = 'word'; answerType = 'romaji';
        break;
      case QuestionType.RomajiToWord:
        if (isKanaItem) return false;
        stimulus = item.romaji; correctAnswer = item.kana; stimulusType = 'romaji'; answerType = 'word';
        break;
      default: return false;
    }
    
    const currentCountForStimulusString = currentStimulusUsage.get(stimulus) || 0;
    const repetitionLimit = isKanaItem ? MAX_REPETITIONS_KANA_STIMULUS : MAX_REPETITIONS_WORD_STIMULUS;

    if (currentCountForStimulusString >= repetitionLimit) {
        return false; 
    }
    
    if (!bypassUsedStimuliObjectCheck) {
        const existingStimulusTextsForThisPass = new Set(drillSet.map(q => q.stimulus));
        if (existingStimulusTextsForThisPass.has(stimulus)) return false;
    }

    const options = generateDrillOptions(item, type, level, script, lineId); 
    const questionId = `q_${isKanaItem ? 'kana' : 'word'}_${type}_${drillSet.length}_${Date.now()}_${Math.random().toString(16).slice(2)}`;
    
    if (!bypassUsedStimuliObjectCheck) {
        const newQuestionSignature = `${stimulus}-${correctAnswer}-${options.sort().join(',')}`;
        const existingQuestionSignatures = new Set(drillSet.map(q => `${q.stimulus}-${q.correctAnswer}-${q.options.sort().join(',')}`));
        if (existingQuestionSignatures.has(newQuestionSignature)) {
            return false;
        }
    }
    
    drillSet.push({
      id: questionId,
      stimulus,
      correctAnswer,
      options,
      questionType: type,
      stimulusType,
      answerType,
      originalStimulusObject: item,
      originalCorrectAnswerObject: item,
    });

    if (!bypassUsedStimuliObjectCheck) {
      usedStimuliObjects.add(item);
    }
    currentStimulusUsage.set(stimulus, currentCountForStimulusString + 1);
    return true;
  };

  const initialKanaPool = getKanaPoolForDrill(script, lineId, level, true);
  let ktrAdded = 0, rtkAdded = 0;
  for (const mora of shuffleArray(initialKanaPool)) {
    if (ktrAdded < quotas.kanaToRomaji && addQuestion(mora, QuestionType.KanaToRomaji, false, stimulusUsageCount)) ktrAdded++;
    if (rtkAdded < quotas.romajiToKana && addQuestion(mora, QuestionType.RomajiToKana, false, stimulusUsageCount)) rtkAdded++;
  }

  const initialWordLengthsConfig = level === DrillLevel.Easy ? [2,3] : (level === DrillLevel.Medium ? [2,3,4] : [2,3,4,5]);
  const initialWordConfig = { 
    targetLengthOrLengths: initialWordLengthsConfig, 
    limit: Math.max(quotas.wordToRomaji, quotas.romajiToWord) * 5, 
    excludePlausibleNonWords: true, 
  };
  const initialWordPool = getWordsForDrill(script, lineId, level, initialWordConfig);
  let wtrAdded = 0, rtwAdded = 0;
  for (const word of shuffleArray(initialWordPool)) {
    if (wtrAdded < quotas.wordToRomaji && addQuestion(word, QuestionType.WordToRomaji, false, stimulusUsageCount)) wtrAdded++;
    if (rtwAdded < quotas.romajiToWord && addQuestion(word, QuestionType.RomajiToWord, false, stimulusUsageCount)) rtwAdded++;
  }
  
  const questionTypesCycle: QuestionType[] = shuffleArray([ 
      QuestionType.KanaToRomaji, QuestionType.RomajiToKana, 
      QuestionType.WordToRomaji, QuestionType.RomajiToWord
  ]);

  let paddingAttempts = 0;
  const MAX_PADDING_ATTEMPTS = TOTAL_QUESTIONS_PER_DRILL * 40;
  
  const useSpecificLinePools = lineId && lineId !== 'mixed';
  
  let kanaPaddingPoolSpecific = shuffleArray(getKanaPoolForDrill(script, useSpecificLinePools ? lineId : null, level, true));
  let wordPaddingPoolSpecific = shuffleArray(getWordsForDrill(script, useSpecificLinePools ? lineId : null, level, { ...initialWordConfig, excludePlausibleNonWords: false }));

  let kanaPaddingPoolMixed = shuffleArray(getKanaPoolForDrill(script, 'mixed', level, true));
  let wordPaddingPoolMixed = shuffleArray(getWordsForDrill(script, 'mixed', level, {...initialWordConfig, targetLengthOrLengths: undefined, excludePlausibleNonWords: false }));

  const absFallbackKanaChars = script === ScriptType.Hiragana ? ['あ', 'い', 'う', 'か', 'き', 'さ', 'し', 'す'] : ['ア', 'イ', 'ウ', 'カ', 'キ', 'サ', 'シ', 'ス'];
  const absoluteFallbackKanaPool = absFallbackKanaChars.map(k => MORA_DATA[k]).filter(Boolean) as Mora[];
  
  // Fix: Ensure MASTER_VOCAB is accessed correctly using MASTER_VOCAB[script].
  const masterVocabForScript = MASTER_VOCAB[script] ? MASTER_VOCAB[script].filter(w => !w.isPlausibleNonWord) : [];
  let absoluteFallbackWordPool = masterVocabForScript.length > 0 ? shuffleArray(masterVocabForScript).slice(0, 10) : [];
   if (absoluteFallbackWordPool.length === 0 && masterVocabForScript.length > 0) {
      absoluteFallbackWordPool.push(masterVocabForScript[0]);
   }


  while (drillSet.length < TOTAL_QUESTIONS_PER_DRILL && paddingAttempts < MAX_PADDING_ATTEMPTS) {
    const typeToAttempt = questionTypesCycle[paddingAttempts % questionTypesCycle.length];
    let itemToAttempt: Mora | Word | undefined;

    if (typeToAttempt === QuestionType.KanaToRomaji || typeToAttempt === QuestionType.RomajiToKana) {
        if (useSpecificLinePools && kanaPaddingPoolSpecific.length > 0) {
            itemToAttempt = kanaPaddingPoolSpecific[paddingAttempts % kanaPaddingPoolSpecific.length];
        } else if (!useSpecificLinePools && kanaPaddingPoolMixed.length > 0) {
            itemToAttempt = kanaPaddingPoolMixed[paddingAttempts % kanaPaddingPoolMixed.length];
        }
        if (itemToAttempt && level === DrillLevel.Difficult && useSpecificLinePools && 
            ( (useSpecificLinePools && !kanaPaddingPoolSpecific.includes(itemToAttempt as Mora)) || (!useSpecificLinePools && !kanaPaddingPoolMixed.includes(itemToAttempt as Mora))) ) {
        }
        if (!itemToAttempt && !(level === DrillLevel.Difficult && useSpecificLinePools) && absoluteFallbackKanaPool.length > 0) {
            itemToAttempt = absoluteFallbackKanaPool[paddingAttempts % absoluteFallbackKanaPool.length];
        } else if (!itemToAttempt && level === DrillLevel.Difficult && useSpecificLinePools) {
             itemToAttempt = undefined; 
        }

    } else { 
        if (useSpecificLinePools && wordPaddingPoolSpecific.length > 0) {
            itemToAttempt = wordPaddingPoolSpecific[paddingAttempts % wordPaddingPoolSpecific.length];
        } else if (!useSpecificLinePools && wordPaddingPoolMixed.length > 0) {
            itemToAttempt = wordPaddingPoolMixed[paddingAttempts % wordPaddingPoolMixed.length];
        }

        let currentItemIsRepeat = itemToAttempt && (stimulusUsageCount.get(itemToAttempt.kana) || 0) >= MAX_REPETITIONS_WORD_STIMULUS;
        if (!itemToAttempt || currentItemIsRepeat) {
            const contextForSynthetic = (useSpecificLinePools && lineId) ? lineId : 'mixed';
            if (!currentItemIsRepeat || !(level === DrillLevel.Difficult && useSpecificLinePools)) {
                 const desiredLength = level === DrillLevel.Easy ? (Math.random() < 0.7 ? 2 : 3) :
                                  (level === DrillLevel.Medium ? (Math.floor(Math.random() * 2) + 2) :
                                  (Math.floor(Math.random() * 3) + 2)); 
                // Fix: Ensure MASTER_VOCAB is accessed correctly using MASTER_VOCAB[script].
                const syntheticWord = generateSyntheticWord(script, contextForSynthetic, level, desiredLength, MASTER_VOCAB[script] || []);
                if (syntheticWord && (stimulusUsageCount.get(syntheticWord.kana) || 0) < MAX_REPETITIONS_WORD_STIMULUS) {
                    itemToAttempt = syntheticWord;
                } else {
                    itemToAttempt = currentItemIsRepeat ? undefined : itemToAttempt; 
                }
            } else if (currentItemIsRepeat && level === DrillLevel.Difficult && useSpecificLinePools) {
                itemToAttempt = undefined; 
            }


            if (!itemToAttempt && !(level === DrillLevel.Difficult && useSpecificLinePools) && absoluteFallbackWordPool.length > 0) {
                 itemToAttempt = absoluteFallbackWordPool[paddingAttempts % absoluteFallbackWordPool.length];
            } else if (!itemToAttempt && level === DrillLevel.Difficult && useSpecificLinePools) {
                 itemToAttempt = undefined; 
            }
        }
    }

    if (itemToAttempt) {
        if ('length' in itemToAttempt) { 
            addQuestion(itemToAttempt, typeToAttempt, true, stimulusUsageCount);
        } else { 
            addQuestion(itemToAttempt, typeToAttempt, true, stimulusUsageCount);
        }
    }
    paddingAttempts++;
  }
  
  let emergencyFillAttempts = 0;
  while(drillSet.length < TOTAL_QUESTIONS_PER_DRILL && emergencyFillAttempts < TOTAL_QUESTIONS_PER_DRILL * 2) { 
      const type = questionTypesCycle[emergencyFillAttempts % questionTypesCycle.length];
      let item: Mora | Word | undefined;
      
      const isDifficultSpecific = level === DrillLevel.Difficult && useSpecificLinePools && lineId;
      const emergencyContext = isDifficultSpecific ? lineId : 'mixed';

      if (type === QuestionType.KanaToRomaji || type === QuestionType.RomajiToKana) {
        if (isDifficultSpecific && kanaPaddingPoolSpecific.length > 0) {
            item = kanaPaddingPoolSpecific[emergencyFillAttempts % kanaPaddingPoolSpecific.length];
        } else if (isDifficultSpecific) { 
            item = undefined;
        }
        else { 
            item = absoluteFallbackKanaPool.length > 0 ? absoluteFallbackKanaPool[emergencyFillAttempts % absoluteFallbackKanaPool.length] : MORA_DATA[script === ScriptType.Hiragana ? 'あ' : 'ア'];
        }
      } else { 
        const desiredLength = Math.floor(Math.random() * 2) + 2; 
        // Fix: Ensure MASTER_VOCAB is accessed correctly using MASTER_VOCAB[script].
        item = generateSyntheticWord(script, emergencyContext, level, desiredLength, MASTER_VOCAB[script] || []);
        if (!item) { 
            if (isDifficultSpecific && wordPaddingPoolSpecific.length > 0){
                 item = wordPaddingPoolSpecific[emergencyFillAttempts % wordPaddingPoolSpecific.length];
            } else if (isDifficultSpecific) { 
                 item = undefined;
            }
             else if (absoluteFallbackWordPool.length > 0) {
                item = absoluteFallbackWordPool[emergencyFillAttempts % absoluteFallbackWordPool.length];
            } else {
                // Fix: Ensure MASTER_VOCAB is accessed correctly using MASTER_VOCAB[script].
                // Also provide a default for constituentKana if not found.
                const fallbackWordData = MASTER_VOCAB[script]?.filter(w => !w.isPlausibleNonWord)[0];
                item = (fallbackWordData || {
                    kana: script === ScriptType.Hiragana ? 'ねこ' : 'ネコ', 
                    romaji: 'neko', 
                    length: 2, 
                    constituentKana: script === ScriptType.Hiragana ? ['ね', 'こ'] : ['ネ', 'コ'], 
                    script: script
                } as Word);
            }
        }
      }
      if (item) {
        if ('length' in item) { 
            addQuestion(item, type, true, stimulusUsageCount);
        } else { 
            addQuestion(item, type, true, stimulusUsageCount);
        }
      }
      emergencyFillAttempts++;
  }

  return shuffleArray(drillSet);
};
