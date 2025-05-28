
// Fix: Import ScriptType from '../types'
import { ReadingUnit, ReadingPassage, Mora, ScriptType } from '../types';
// Fix: Remove ScriptType from '../constants' import as it's now from types
import { MORA_DATA, KANA_SIMILARITIES_DATA } from '../linguisticConstants';
// Fix: Add reconstructWordFromMoraArray to import
import { shuffleArray, hepburnRomanise, parseKanaStringToEffectiveMorae, getMoraInfo, reconstructWordFromMoraArray } from './linguisticUtils';

const ROMANJI_VOWELS = ['a', 'i', 'u', 'e', 'o'];
const ROMANJI_CONSONANTS = ['k', 's', 't', 'n', 'h', 'm', 'y', 'r', 'w', 'g', 'z', 'd', 'b', 'p', 'j', 'ch', 'sh', 'ts'];

// Helper to get a random element from an array
const getRandomElement = <T>(arr: T[]): T | undefined => {
  if (!arr || arr.length === 0) return undefined;
  return arr[Math.floor(Math.random() * arr.length)];
};

// Generate distractors for a given ReadingUnit's Romanji
export const generateRomanjiOptionsForWordSound = (
  correctUnit: ReadingUnit,
  passageUnits: ReadingUnit[], // To pick other words as distractors sometimes
  numOptions: number = 4
): string[] => {
  const correctAnswer = correctUnit.romaji;
  const options = new Set<string>([correctAnswer]); // Start with the correct answer

  // Type 1: Phonetic variations (vowel/consonant swap)
  if (correctAnswer.length > 1) {
    // Vowel swap
    for (let i = 0; i < correctAnswer.length; i++) {
      const originalChar = correctAnswer[i].toLowerCase();
      if (ROMANJI_VOWELS.includes(originalChar)) {
        let newVowel = getRandomElement(ROMANJI_VOWELS.filter(v => v !== originalChar));
        if (newVowel) {
          const distractor = correctAnswer.substring(0, i) + newVowel + correctAnswer.substring(i + 1);
          if (distractor.trim()) options.add(distractor);
        }
      }
    }
    // Consonant swap
    for (let i = 0; i < correctAnswer.length; i++) {
      const originalChar = correctAnswer[i].toLowerCase();
      let matchedConsonant = ROMANJI_CONSONANTS.find(c => correctAnswer.substring(i).toLowerCase().startsWith(c));
      if (matchedConsonant) {
        let newConsonant = getRandomElement(ROMANJI_CONSONANTS.filter(c => c !== matchedConsonant));
        if (newConsonant) {
          const distractor = correctAnswer.substring(0, i) + newConsonant + correctAnswer.substring(i + matchedConsonant.length);
          if (distractor.trim()) options.add(distractor);
        }
        i += matchedConsonant.length -1; 
      }
    }
  }

  // Type 2: Common Hepburn Romanization errors
  const commonErrors: { [key: string]: string[] } = {
    'shi': ['si'], 'chi': ['ti'], 'tsu': ['tu'],
    'ji': ['zi', 'di'], 'zu': ['du'],
    'ō': ['ou', 'oo'], 'ē': ['ei', 'ee'], 'ū': ['uu'], 'ā': ['aa'], 'ī': ['ii']
  };
  for (const [correct, errors] of Object.entries(commonErrors)) {
    if (correctAnswer.includes(correct)) {
      errors.forEach(err => {
        const distractor = correctAnswer.replace(correct, err);
        if (distractor.trim()) options.add(distractor);
      });
    } else {
        errors.forEach(err => {
            if (correctAnswer.includes(err)) {
                 const distractor = correctAnswer.replace(err, correct);
                 if (distractor.trim()) options.add(distractor);
            }
        });
    }
  }
   // Double consonant error
   if (correctAnswer.match(/([kstp])\1/)) { // matches kk, ss, tt, pp
    const singleConsonant = correctAnswer.replace(/([kstp])\1/, '$1');
    if (singleConsonant.trim()) options.add(singleConsonant);
  } else if (correctAnswer.match(/[kstp]/) && correctAnswer.length > 1) {
    const match = correctAnswer.match(/([aiueo])([kstp])/); // vowel followed by k,s,t,p
    if (match && match[1] && match[2]) {
        const doubleConsonant = correctAnswer.replace(new RegExp(match[1] + match[2]), match[1] + match[2] + match[2]);
        if (doubleConsonant.trim()) options.add(doubleConsonant);
    }
  }


  // Type 3: Romanji for visually similar Kana constituents
  const japaneseWordKana = correctUnit.japanese;
  const morae = parseKanaStringToEffectiveMorae(japaneseWordKana);
  if (morae.length > 0) {
    const randomIndex = Math.floor(Math.random() * morae.length);
    const originalMoraChar = morae[randomIndex];
    const moraInfo = getMoraInfo(originalMoraChar);
    // Fix: Add null check for moraInfo and moraInfo.script
    if (moraInfo && moraInfo.script) {
        const script: ScriptType = moraInfo.script;
        const similarities = KANA_SIMILARITIES_DATA[script]?.[originalMoraChar];
        if (similarities && similarities.length > 0) {
            const similarKana = getRandomElement(similarities)?.similarKana;
            if (similarKana) {
                const tempMorae = [...morae];
                tempMorae[randomIndex] = similarKana;
                const { romaji: distractorRomaji } = reconstructWordFromMoraArray(tempMorae);
                if (distractorRomaji.trim()) options.add(distractorRomaji);
            }
        }
    }
  }
  
  // Type 4: Romanji from other units in the passage (if available and different)
  const otherUnits = passageUnits.filter(unit => unit.japanese !== correctUnit.japanese);
  if (otherUnits.length > 0) {
     const randomOtherUnit = getRandomElement(otherUnits);
     if(randomOtherUnit && randomOtherUnit.romaji.trim()) options.add(randomOtherUnit.romaji);
  }

  // Padding loop: Ensure `options` (which includes correctAnswer) has at least `numOptions` items if possible.
  const allPossibleUnits = Object.values(MORA_DATA).filter(m => (m.type ==='basic' || m.type ==='basic-d' || m.type ==='basic-hp') && !m.kana.includes('ゃ') && !m.kana.includes('ゅ') && !m.kana.includes('ょ'));
  let paddingAttempts = 0;
  while (options.size < numOptions && paddingAttempts < 20 && allPossibleUnits.length > 0) {
    let randomRomajiDistractor = "";
    const targetLength = correctAnswer.length; // Try to generate distractors of similar length
    let currentLength = 0;
    let buildAttempts = 0;
    
    while(currentLength < Math.max(1, targetLength - 2) && buildAttempts < 10 && allPossibleUnits.length > 0) {
        const randomMora = getRandomElement(allPossibleUnits);
        if(randomMora) {
            randomRomajiDistractor += randomMora.romaji;
            currentLength += randomMora.romaji.length;
        }
        buildAttempts++;
    }
     if (randomRomajiDistractor === "") { // Fallback if loop didn't produce anything
        const randMora1 = getRandomElement(allPossibleUnits)?.romaji || "ka";
        const randMora2 = getRandomElement(allPossibleUnits)?.romaji || "ki";
        randomRomajiDistractor = randMora1 + randMora2;
     }

    if (randomRomajiDistractor.trim()) options.add(randomRomajiDistractor);
    paddingAttempts++;
  }

  // Final selection logic:
  // 1. Get all unique options (correctAnswer + distractors)
  // 2. Ensure correctAnswer is in the final list of 'numOptions' items
  let finalChoicesList = Array.from(options);

  if (finalChoicesList.includes(correctAnswer)) {
    // Temporarily remove the correct answer
    const distractorsOnly = finalChoicesList.filter(opt => opt !== correctAnswer);
    // Shuffle the distractors
    shuffleArray(distractorsOnly);
    // Select numOptions - 1 distractors (or fewer if not enough are available)
    const selectedDistractors = distractorsOnly.slice(0, numOptions - 1);
    // Add the correct answer back and shuffle the final list
    finalChoicesList = shuffleArray([correctAnswer, ...selectedDistractors]);
  } else {
    // This case should not be reached if correctAnswer is added to the set initially and is not empty.
    // As a robust fallback, create a list with correctAnswer and N-1 other options.
    const otherOptions = finalChoicesList.filter(opt => opt !== correctAnswer);
    shuffleArray(otherOptions);
    const selectedDistractors = otherOptions.slice(0, numOptions - 1);
    finalChoicesList = shuffleArray([correctAnswer, ...selectedDistractors]);
  }
  
  // If after all this, the list is still shorter than numOptions (e.g. very few unique distractors possible)
  // and the correct answer is the only thing, we pad with some fixed placeholders.
  // This is rare but ensures UI doesn't break expecting multiple options.
  const placeholderDistractors = ["teki", "suto", "nera", "mika"];
  let pIdx = 0;
  while(finalChoicesList.length < numOptions && pIdx < placeholderDistractors.length) {
      if(!finalChoicesList.includes(placeholderDistractors[pIdx])) {
          finalChoicesList.push(placeholderDistractors[pIdx]);
      }
      pIdx++;
  }
  // Ensure the list isn't too long due to placeholder addition if it was already full.
  return finalChoicesList.slice(0, numOptions);
};
