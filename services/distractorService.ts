
import { QuestionType, Mora, Word, ScriptType, DrillLevel } from '../types';
import { MORA_DATA, MASTER_VOCAB, KANA_SIMILARITIES_DATA, KANA_LINES, KANA_LINE_ORDER } from '../linguisticConstants';
// Updated imports: getKanaPoolForDrill, getWordsForDrill now come from linguisticUtils
import { shuffleArray, getMoraInfo, reconstructWordFromMoraArray, parseKanaStringToEffectiveMorae, hepburnRomanise, getKanaPoolForDrill, getWordsForDrill, getCumulativeKanaForLine } from './linguisticUtils';


// --- Transformation Utilities (Focus on Length Preservation for Words) ---

const getKanaVariant = (kanaChar: string, targetType: 'basic' | 'basic-d' | 'basic-hp'): Mora | null => {
    const baseMora = getMoraInfo(kanaChar);
    if (!baseMora) return null;
    const originalBase = baseMora.baseKana ? getMoraInfo(baseMora.baseKana) : baseMora;
    if(!originalBase) return null;
    if (targetType === 'basic') return originalBase;
    return Object.values(MORA_DATA).find(m => 
        m.script === baseMora.script &&
        m.baseKana === originalBase.kana &&
        m.type === targetType &&
        m.vowel === originalBase.vowel
    ) || null;
};

// For single Mora distractors
const applyVoicingHandakutenVariationToSingleMora = (mora: Mora): Mora | null => {
  const { type, kana } = mora;
  let newMora: Mora | null = null;
  if (type === 'basic') {
    newMora = getKanaVariant(kana, 'basic-d');
    if (!newMora && (mora.consonant === 'h')) newMora = getKanaVariant(kana, 'basic-hp');
  } else if (type === 'basic-d') {
    newMora = getKanaVariant(kana, 'basic');
    if (!newMora && mora.baseKana && getMoraInfo(mora.baseKana)?.consonant === 'h') newMora = getKanaVariant(kana, 'basic-hp');
  } else if (type === 'basic-hp') {
    newMora = getKanaVariant(kana, 'basic');
     if (!newMora && mora.baseKana) newMora = getKanaVariant(kana, 'basic-d');
  }
  return newMora && newMora.kana !== mora.kana ? newMora : null;
};

// For single Mora distractors
const applyVisualSwapToSingleMora = (mora: Mora, script: ScriptType): Mora | null => {
  const similarities = KANA_SIMILARITIES_DATA[script]?.[mora.kana];
  if (!similarities || similarities.length === 0) return null;
  const sortedSimilarities = [...similarities].sort((a, b) => b.strength - a.strength);
  const swapWithKana = sortedSimilarities[Math.floor(Math.random() * Math.min(sortedSimilarities.length, 3))].similarKana;
  const swappedMora = getMoraInfo(swapWithKana);
  return (swappedMora && swappedMora.script === script) ? swappedMora : null;
};


// --- Word Transformation Utilities (Strictly Length-Preserving) ---

const applyVoicingHandakutenVariationToMoraInWord = (constituents: string[], script: ScriptType): string[] | null => {
    if (constituents.length === 0) return null;
    const mutableConstituents = [...constituents];
    const idx = Math.floor(Math.random() * mutableConstituents.length);
    const moraToChange = getMoraInfo(mutableConstituents[idx]);
    if (moraToChange) {
        const variant = applyVoicingHandakutenVariationToSingleMora(moraToChange);
        if (variant && variant.kana !== mutableConstituents[idx]) {
            mutableConstituents[idx] = variant.kana;
            return mutableConstituents;
        }
    }
    return null;
};

const applyVisualSwapToMoraInWord = (constituents: string[], script: ScriptType): string[] | null => {
    if (constituents.length === 0) return null;
    const mutableConstituents = [...constituents];
    const idx = Math.floor(Math.random() * mutableConstituents.length);
    const moraToChange = getMoraInfo(mutableConstituents[idx]);
    if (moraToChange) {
        const swapped = applyVisualSwapToSingleMora(moraToChange, script);
        if (swapped && swapped.kana !== mutableConstituents[idx]) {
            mutableConstituents[idx] = swapped.kana;
            return mutableConstituents;
        }
    }
    return null;
};

const substituteRandomMoraInWord = (constituents: string[], script: ScriptType, level: DrillLevel, activeDrillLineId: string | null): string[] | null => {
    if (constituents.length === 0) return null;
    const mutableConstituents = [...constituents];
    const idx = Math.floor(Math.random() * mutableConstituents.length);
    const originalMora = getMoraInfo(mutableConstituents[idx]);
    if (!originalMora) return null;

    const replacementPool = getKanaPoolForDrill(script, activeDrillLineId, level, false, true, originalMora)
                            .filter(m => m.kana !== originalMora.kana && MORA_DATA[m.kana]?.type !== 'sokuon' && MORA_DATA[m.kana]?.type !== 'choonpu');

    if (replacementPool.length > 0) {
        const replacement = replacementPool[Math.floor(Math.random() * replacementPool.length)];
        if (replacement.kana !== mutableConstituents[idx]) {
            mutableConstituents[idx] = replacement.kana;
            return mutableConstituents;
        }
    }
    return null;
};

const transposeAdjacentMoraeInWord = (constituents: string[]): string[] | null => {
    if (constituents.length < 2) return null;
    const mutableConstituents = [...constituents];
    const idx = Math.floor(Math.random() * (mutableConstituents.length - 1));
    if (mutableConstituents[idx] !== mutableConstituents[idx+1]) {
      [mutableConstituents[idx], mutableConstituents[idx+1]] = [mutableConstituents[idx+1], mutableConstituents[idx]];
      return mutableConstituents;
    }
    return null;
};

const applyYouonVowelSwapInWord = (constituents: string[], script: ScriptType): string[] | null => {
    const yoonMoraIndex = constituents.findIndex(kStr => MORA_DATA[kStr]?.type === 'youon-y' && MORA_DATA[kStr]?.constituentKana);
    if (yoonMoraIndex === -1) return null;

    const yoonMora = MORA_DATA[constituents[yoonMoraIndex]];
    if (!yoonMora || !yoonMora.constituentKana) return null;

    const [baseKanaStr, smallKanaStr] = yoonMora.constituentKana;
    const currentSmallVowelInfo = MORA_DATA[smallKanaStr];
    if (!currentSmallVowelInfo) return null;

    const otherSmallVowelChars = ['ゃ', 'ゅ', 'ょ'].filter(svChar => MORA_DATA[svChar]?.script === script && MORA_DATA[svChar]?.vowel !== currentSmallVowelInfo.vowel);
    if (otherSmallVowelChars.length > 0) {
        const randomOtherSmallVowelStr = otherSmallVowelChars[Math.floor(Math.random() * otherSmallVowelChars.length)];
        const newYoonCombo = Object.values(MORA_DATA).find(m => 
            m.type === 'youon-y' && 
            m.script === script && 
            m.constituentKana?.[0] === baseKanaStr && 
            m.constituentKana?.[1] === randomOtherSmallVowelStr
        );
        if (newYoonCombo && newYoonCombo.kana !== constituents[yoonMoraIndex]) {
            const newConstituents = [...constituents];
            newConstituents[yoonMoraIndex] = newYoonCombo.kana;
            return newConstituents;
        }
    }
    return null;
};

const applyConsonantSwapToMoraInWord = (constituents: string[], script: ScriptType): string[] | null => {
    if (constituents.length === 0) return null;
    const mutableConstituents = [...constituents];
    const eligibleIndices = mutableConstituents
        .map((_, i) => i)
        .filter(i => {
            const mora = getMoraInfo(mutableConstituents[i]);
            return mora && mora.consonant !== '' && mora.type !== 'sokuon' && mora.type !== 'choonpu' && mora.type !== 'n_syllabic' && !mora.type.startsWith('youon-');
        });

    if (eligibleIndices.length === 0) return null;
    const idx = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
    
    const originalMora = getMoraInfo(mutableConstituents[idx]);
    if (!originalMora || !originalMora.vowel) return null;

    const replacementPool = Object.values(MORA_DATA).filter(m =>
        m.script === script &&
        m.vowel === originalMora.vowel &&
        m.consonant !== originalMora.consonant &&
        m.consonant !== '' && 
        m.type === 'basic' 
    );

    if (replacementPool.length > 0) {
        const replacement = replacementPool[Math.floor(Math.random() * replacementPool.length)];
        if (replacement.kana !== mutableConstituents[idx]) {
            mutableConstituents[idx] = replacement.kana;
            return mutableConstituents;
        }
    }
    return null;
};

const applyVowelSwapToMoraInWord = (constituents: string[], script: ScriptType): string[] | null => {
    if (constituents.length === 0) return null;
    const mutableConstituents = [...constituents];
    const eligibleIndices = mutableConstituents
        .map((_, i) => i)
        .filter(i => {
            const mora = getMoraInfo(mutableConstituents[i]);
            return mora && mora.consonant !== '' && mora.type !== 'sokuon' && mora.type !== 'choonpu' && mora.type !== 'n_syllabic' && !mora.type.startsWith('youon-');
        });

    if (eligibleIndices.length === 0) return null;
    const idx = eligibleIndices[Math.floor(Math.random() * eligibleIndices.length)];
    
    const originalMora = getMoraInfo(mutableConstituents[idx]);
    if (!originalMora || !originalMora.consonant) return null;

    const replacementPool = Object.values(MORA_DATA).filter(m =>
        m.script === script &&
        m.consonant === originalMora.consonant &&
        m.vowel !== originalMora.vowel &&
        m.type === 'basic' 
    );
    
    if (replacementPool.length > 0) {
        const replacement = replacementPool[Math.floor(Math.random() * replacementPool.length)];
         if (replacement.kana !== mutableConstituents[idx]) {
            mutableConstituents[idx] = replacement.kana;
            return mutableConstituents;
        }
    }
    return null;
};

const applySokuonConsonantChangeInWord = (constituents: string[], script: ScriptType): string[] | null => {
    const sokuonIndex = constituents.findIndex(kStr => MORA_DATA[kStr]?.type === 'sokuon');
    if (sokuonIndex === -1 || sokuonIndex === constituents.length - 1) return null;

    const mutableConstituents = [...constituents];
    const moraAfterSokuon = getMoraInfo(mutableConstituents[sokuonIndex + 1]);
    if (!moraAfterSokuon || !moraAfterSokuon.consonant) return null;

    let replacementOptions: Mora[] = [];
    const voicedVariant = applyVoicingHandakutenVariationToSingleMora(moraAfterSokuon);
    if (voicedVariant) replacementOptions.push(voicedVariant);
    
    const visualSimilar = KANA_SIMILARITIES_DATA[script]?.[moraAfterSokuon.kana];
    if (visualSimilar) {
        visualSimilar.forEach(vs => {
            const vsMora = getMoraInfo(vs.similarKana);
            if (vsMora && vsMora.script === script && vsMora.consonant && vsMora.consonant[0] === MORA_DATA[moraAfterSokuon.kana]?.consonant?.[0]) {
                replacementOptions.push(vsMora);
            }
        });
    }
    const phoneticSimilar = Object.values(MORA_DATA).filter(m => 
        m.script === script &&
        m.vowel === moraAfterSokuon.vowel &&
        m.consonant !== moraAfterSokuon.consonant && 
        m.consonant 
    );
    replacementOptions.push(...phoneticSimilar);

    replacementOptions = replacementOptions.filter(r => r.kana !== moraAfterSokuon.kana);
    if (replacementOptions.length > 0) {
        const replacement = replacementOptions[Math.floor(Math.random() * replacementOptions.length)];
        mutableConstituents[sokuonIndex + 1] = replacement.kana;
        return mutableConstituents;
    }
    return null;
};

const applyChoonpuToExplicitVowelPairVariationInWord = (constituents: string[], script: ScriptType): string[] | null => {
    if (script !== ScriptType.Katakana || constituents.length < 2) return null;
    
    const mutableConstituents = [...constituents];
    for (let i = 0; i < mutableConstituents.length -1; i++) {
        const firstMora = getMoraInfo(mutableConstituents[i]);
        const secondMora = getMoraInfo(mutableConstituents[i+1]);

        if (firstMora && secondMora && secondMora.kana === 'ー') {
            const vowelOfFirstMora = firstMora.vowel;
            const katakanaVowelMora = Object.values(MORA_DATA).find(m => 
                m.script === ScriptType.Katakana && 
                m.type === 'basic' && 
                m.romaji === vowelOfFirstMora &&
                m.consonant === '' 
            );

            if (katakanaVowelMora && katakanaVowelMora.kana !== mutableConstituents[i+1]) { 
                mutableConstituents[i+1] = katakanaVowelMora.kana;
                return mutableConstituents;
            }
        }
    }
    return null;
};

const applyExplicitVowelPairToChoonpuVariationInWord = (constituents: string[], script: ScriptType): string[] | null => {
    if (script !== ScriptType.Katakana || constituents.length < 2) return null;

    const mutableConstituents = [...constituents];
    for (let i = 0; i < mutableConstituents.length - 1; i++) {
        const firstMora = getMoraInfo(mutableConstituents[i]);
        const secondMora = getMoraInfo(mutableConstituents[i+1]);

        if (firstMora && secondMora && 
            firstMora.vowel && 
            secondMora.type === 'basic' && 
            secondMora.consonant === '' && 
            firstMora.vowel === secondMora.romaji 
        ) {
            const choonpuMora = MORA_DATA['ー'];
            if (choonpuMora && choonpuMora.kana !== mutableConstituents[i+1]) { 
                 mutableConstituents[i+1] = choonpuMora.kana;
                 return mutableConstituents;
            }
        }
    }
    return null;
};


const transformWordConstituentsStrictLength = (word: Word, script: ScriptType, level: DrillLevel, activeDrillLineId: string | null): string | null => {
    let constituents = [...word.constituentKana];
    let transformedConstituentsArray: string[] | null = null;

    const transformationFunctions = [
        () => substituteRandomMoraInWord(constituents, script, level, activeDrillLineId),
        () => applyVoicingHandakutenVariationToMoraInWord(constituents, script),
        () => applyVisualSwapToMoraInWord(constituents, script),
        () => transposeAdjacentMoraeInWord(constituents),
        () => applyYouonVowelSwapInWord(constituents, script),
        () => applyConsonantSwapToMoraInWord(constituents, script),
        () => applyVowelSwapToMoraInWord(constituents, script),
        () => applySokuonConsonantChangeInWord(constituents, script),
    ];

    if (script === ScriptType.Katakana) {
        transformationFunctions.push(() => applyChoonpuToExplicitVowelPairVariationInWord(constituents, script));
        transformationFunctions.push(() => applyExplicitVowelPairToChoonpuVariationInWord(constituents, script));
    }
    
    const shuffledTransformations = shuffleArray(transformationFunctions);

    for (const transformFunc of shuffledTransformations) {
        transformedConstituentsArray = transformFunc();
        if (transformedConstituentsArray) {
            if (transformedConstituentsArray.join('') !== word.kana) {
                return transformedConstituentsArray.join('');
            }
        }
    }
    return null; 
};

export const generateSyntheticWord = (
    script: ScriptType,
    activeDrillLineId: string | null, 
    level: DrillLevel, 
    targetMoraLength: number,
    existingMasterVocab: Word[] 
): Word | null => {
    if (targetMoraLength <= 0) return null;

    const cumulativeLearnedMorae = getCumulativeKanaForLine(script, activeDrillLineId);
    
    let usableMoraePool = cumulativeLearnedMorae.filter(mora =>
        mora.kana !== 'っ' && mora.kana !== 'ッ' && 
        mora.kana !== 'ー' && 
        !mora.type.startsWith('youon-') && 
        mora.type !== 'extended' && 
        mora.kana !== 'ん' && mora.kana !== 'ン' 
    );

    if (usableMoraePool.length === 0) { 
        usableMoraePool = cumulativeLearnedMorae.filter(m => m.kana !== 'っ' && m.kana !== 'ッ' && m.kana !== 'ー');
    }
    if (usableMoraePool.length === 0) return null; 

    let attemptCount = 0;
    const MAX_GENERATION_ATTEMPTS = 20;

    while (attemptCount < MAX_GENERATION_ATTEMPTS) {
        attemptCount++;
        const syntheticConstituentKana: string[] = [];
        for (let i = 0; i < targetMoraLength; i++) {
            const randomMora = usableMoraePool[Math.floor(Math.random() * usableMoraePool.length)];
            if (randomMora) {
                syntheticConstituentKana.push(randomMora.kana);
            } else {
                return null;
            }
        }

        if (syntheticConstituentKana.length !== targetMoraLength) continue;

        const kanaString = syntheticConstituentKana.join('');
        
        if (existingMasterVocab.some(word => word.kana === kanaString)) {
            continue; 
        }

        const romajiString = hepburnRomanise(syntheticConstituentKana);

        return {
            kana: kanaString,
            romaji: romajiString,
            length: targetMoraLength,
            constituentKana: syntheticConstituentKana,
            isPlausibleNonWord: true,
            derivationTypeForPlausible: 'synthetic_for_padding', 
            tags: ['synthetic'],
        };
    }
    return null; 
};


// --- Main Distractor Generation ---
export const generateDrillOptions = (
  correctAnswerObject: Mora | Word,
  questionType: QuestionType,
  currentSelectedLevel: DrillLevel,
  scriptType: ScriptType,
  activeDrillLineId: string | null 
): string[] => {
  const isWordQuestion = 'length' in correctAnswerObject; 
  const correctAnswerText = (questionType === QuestionType.RomajiToKana || questionType === QuestionType.RomajiToWord) 
                            ? correctAnswerObject.kana 
                            : correctAnswerObject.romaji;

  const potentialDistractors: { text: string; priority: number }[] = [];
  const usedOptionTexts = new Set<string>([correctAnswerText]);
  const lineIdForDistractorPoolContext = (activeDrillLineId && activeDrillLineId !== 'mixed') ? activeDrillLineId : null;
  // Fix: contextMoraForKanaPool should be Mora | undefined, correctly typed for getKanaPoolForDrill
  const contextMoraForKanaPool: Mora | undefined = isWordQuestion ? undefined : (correctAnswerObject as Mora);


  const addDistractor = (text: string | null, priority: number, originalKana?: string) => {
    if (text && text.trim() !== "" && text !== correctAnswerText && !usedOptionTexts.has(text)) {
        if (isWordQuestion && originalKana) {
             if (originalKana === (correctAnswerObject as Word).kana) return; 
        }
      potentialDistractors.push({ text, priority });
      usedOptionTexts.add(text);
    }
  };
  
  if (isWordQuestion && (correctAnswerObject as Word).commonLearnerErrors) {
    (correctAnswerObject as Word).commonLearnerErrors!.forEach(errorKana => {
        const errorWordObj = MASTER_VOCAB[scriptType].find(w => w.kana === errorKana && w.length === (correctAnswerObject as Word).length); 
        if (errorWordObj) { 
             addDistractor(
                (questionType === QuestionType.RomajiToWord) ? errorWordObj.kana : errorWordObj.romaji, 
                1,
                errorWordObj.kana
             );
        } else { 
            const pnwErrorConstituents = parseKanaStringToEffectiveMorae(errorKana);
            if (pnwErrorConstituents.length === (correctAnswerObject as Word).length) {
                const romaji = reconstructWordFromMoraArray(pnwErrorConstituents).romaji;
                addDistractor(
                    (questionType === QuestionType.RomajiToWord) ? errorKana : romaji,
                    1,
                    errorKana
                );
            }
        }
    });
  }

  if (isWordQuestion) {
    for (let i = 0; i < 10; i++) { 
      const pnwKanaString = transformWordConstituentsStrictLength(correctAnswerObject as Word, scriptType, currentSelectedLevel, activeDrillLineId);
      if (pnwKanaString) { 
        const pnwConstituentsArray = parseKanaStringToEffectiveMorae(pnwKanaString); 
        const pnwRomaji = reconstructWordFromMoraArray(pnwConstituentsArray).romaji;
        addDistractor(
            (questionType === QuestionType.RomajiToWord) ? pnwKanaString : pnwRomaji,
            2,
            pnwKanaString
        );
      }
    }
  } else { 
    const singleMora = correctAnswerObject as Mora;
    const variant = applyVoicingHandakutenVariationToSingleMora(singleMora);
    if(variant) addDistractor((questionType === QuestionType.RomajiToKana) ? variant.kana : variant.romaji, 2);
    
    const visualSwap = applyVisualSwapToSingleMora(singleMora, scriptType);
    if(visualSwap) addDistractor((questionType === QuestionType.RomajiToKana) ? visualSwap.kana : visualSwap.romaji, 2);
  }

  let similarPool: (Mora | Word)[] = [];
  if (isWordQuestion) {
    similarPool = getWordsForDrill(scriptType, lineIdForDistractorPoolContext, currentSelectedLevel, {
        targetLengthOrLengths: (correctAnswerObject as Word).length, 
        limit: 15, 
    });
  } else { 
    // Fix: Pass contextMoraForKanaPool (which is Mora | undefined) correctly
    similarPool = getKanaPoolForDrill(scriptType, lineIdForDistractorPoolContext, currentSelectedLevel, false, true, contextMoraForKanaPool);
  }

  similarPool.forEach(item => {
    if (item.kana !== correctAnswerObject.kana) { 
        addDistractor(
            (questionType === QuestionType.RomajiToKana || questionType === QuestionType.RomajiToWord) ? item.kana : item.romaji, 
            3,
            item.kana
        );
    }
  });

  potentialDistractors.sort((a,b) => a.priority - b.priority || Math.random() - 0.5);
  
  let selectedDistractors = potentialDistractors.map(d => d.text).filter((value, index, self) => self.indexOf(value) === index); 

  
  if (selectedDistractors.length < 3) {
      const fallbackPool = isWordQuestion 
          ? getWordsForDrill(scriptType, lineIdForDistractorPoolContext || 'mixed', currentSelectedLevel, { targetLengthOrLengths: (correctAnswerObject as Word).length, limit: 20 })
          // Fix: Pass contextMoraForKanaPool (which is Mora | undefined) correctly
          : getKanaPoolForDrill(scriptType, lineIdForDistractorPoolContext || 'mixed', currentSelectedLevel, false, true, contextMoraForKanaPool);

      for (const item of shuffleArray<Mora | Word>(fallbackPool)) {
          if (selectedDistractors.length >= 3) break;
          if (item.kana === correctAnswerObject.kana) continue;
           const distractorText = (questionType === QuestionType.RomajiToKana || questionType === QuestionType.RomajiToWord) ? item.kana : item.romaji;
           if (!usedOptionTexts.has(distractorText)) {
                addDistractor(distractorText, 4, item.kana);
                selectedDistractors = Array.from(usedOptionTexts).filter(t => t !== correctAnswerText);
           }
      }
      selectedDistractors = Array.from(usedOptionTexts).filter(t => t !== correctAnswerText);
  }


  let genericCounter = 1;
  while (selectedDistractors.length < 3 && genericCounter < 50) { 
    const baseKanaChars = scriptType === ScriptType.Hiragana ? 'あいうえおかきくけこ' : 'アイウエオカキクケコ'; 
    let genericText: string;
    if (isWordQuestion) {
        let tempGenericKana = "";
        for(let i=0; i < (correctAnswerObject as Word).length; i++) {
            tempGenericKana += baseKanaChars[(genericCounter + i) % baseKanaChars.length];
        }
        const tempGenericConstituents = parseKanaStringToEffectiveMorae(tempGenericKana);
        genericText = (questionType === QuestionType.RomajiToWord) ? tempGenericKana : reconstructWordFromMoraArray(tempGenericConstituents).romaji;
    } else {
        const moraForGeneric = MORA_DATA[baseKanaChars[genericCounter % baseKanaChars.length]];
        if (moraForGeneric) {
             genericText = (questionType === QuestionType.RomajiToKana) ? moraForGeneric.kana : moraForGeneric.romaji;
        } else {
            genericText = `err${genericCounter}`; 
        }
    }
    
    if (!usedOptionTexts.has(genericText)) {
        selectedDistractors.push(genericText);
        usedOptionTexts.add(genericText); 
    }
    genericCounter++;
  }
  
  const finalOptions = shuffleArray([correctAnswerText, ...selectedDistractors.slice(0,3)]);
  
  const cleanedOptions = finalOptions
    .filter(opt => opt && opt.trim() !== "") 
    .filter((opt, index, self) => self.indexOf(opt) === index); 

  let emergencyCounter = 0;
  const emergencyBaseChars = scriptType === ScriptType.Hiragana ? 'さしすせそたちつてと' : 'サシスセソタチツテト';
  while(cleanedOptions.length < 4 && emergencyCounter < 20) { 
      let emergencyText: string;
       if (isWordQuestion) {
            let tempEmergencyKana = "";
            for(let i=0; i < (correctAnswerObject as Word).length; i++) {
                tempEmergencyKana += emergencyBaseChars[(emergencyCounter + i) % emergencyBaseChars.length];
            }
            const tempEmergencyConstituents = parseKanaStringToEffectiveMorae(tempEmergencyKana);
            emergencyText = (questionType === QuestionType.RomajiToWord) ? tempEmergencyKana : reconstructWordFromMoraArray(tempEmergencyConstituents).romaji;
       } else {
            const moraForEmergency = MORA_DATA[emergencyBaseChars[emergencyCounter % emergencyBaseChars.length]];
            emergencyText = moraForEmergency 
                ? ((questionType === QuestionType.RomajiToKana) ? moraForEmergency.kana : moraForEmergency.romaji)
                : `fallback${emergencyCounter}`;
       }

      if(!cleanedOptions.includes(emergencyText)) cleanedOptions.push(emergencyText);
      emergencyCounter++;
  }
  while(cleanedOptions.length < 4){
      cleanedOptions.push(`エラー${Math.floor(Math.random()*1000)}`)
  }

  return cleanedOptions.slice(0,4);
};
