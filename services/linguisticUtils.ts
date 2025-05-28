
import { MORA_DATA, KANA_LINES, KANA_LINE_ORDER, MASTER_VOCAB, KANA_SIMILARITIES_DATA } from '../linguisticConstants'; // Updated import
import { Mora, ScriptType, KanaLine, DrillLevel, Word } from '../types';

export const getMoraInfo = (kanaChar: string): Mora | undefined => {
  return MORA_DATA[kanaChar];
};

export const parseKanaStringToEffectiveMorae = (kanaString: string): string[] => {
  const morae: string[] = [];
  let remainingString = kanaString;
  const allKanaKeys = Object.keys(MORA_DATA).sort((a, b) => b.length - a.length); 

  while (remainingString.length > 0) {
    let foundMatch = false;
    for (const key of allKanaKeys) {
      if (remainingString.startsWith(key)) {
        morae.push(key);
        remainingString = remainingString.substring(key.length);
        foundMatch = true;
        break;
      }
    }
    if (!foundMatch) {
      morae.push(remainingString[0]);
      remainingString = remainingString.substring(1);
    }
  }
  return morae;
};


export const hepburnRomanise = (effectiveMoraArray: string[]): string => {
  let romajiString = "";
  const VOWEL_MACRONS: { [key: string]: string } = {
    'a': 'ā', 'i': 'ī', 'u': 'ū', 'e': 'ē', 'o': 'ō'
  };

  for (let i = 0; i < effectiveMoraArray.length; i++) {
    const currentKana = effectiveMoraArray[i];
    const moraInfo = getMoraInfo(currentKana);

    if (!moraInfo) {
      romajiString += currentKana; 
      continue;
    }

    if (moraInfo.type === 'sokuon') {
      if (i + 1 < effectiveMoraArray.length) {
        const nextKana = effectiveMoraArray[i + 1];
        const nextMoraInfo = getMoraInfo(nextKana);
        if (nextMoraInfo && nextMoraInfo.consonant) {
          if (nextMoraInfo.consonant.startsWith('ch')) {
            romajiString += 't'; 
          } else {
            romajiString += nextMoraInfo.consonant[0];
          }
        }
      }
      continue; 
    }

    if (moraInfo.type === 'n_syllabic') {
      let nSound = 'n';
      if (i + 1 < effectiveMoraArray.length) {
        const nextKana = effectiveMoraArray[i + 1];
        const nextMoraInfo = getMoraInfo(nextKana);
        if (nextMoraInfo && nextMoraInfo.consonant && ['b', 'p', 'm'].includes(nextMoraInfo.consonant[0].toLowerCase())) {
          nSound = 'm';
        }
        if (nSound === 'n' && nextMoraInfo && (nextMoraInfo.vowel || nextMoraInfo.consonant === 'y')) {
            if (nextMoraInfo.romaji && (nextMoraInfo.romaji.match(/^[aiueo]/i) || nextMoraInfo.romaji.startsWith('y'))) {
                 nSound += "'";
            }
        }
      }
      romajiString += nSound;
      continue;
    }

    if (moraInfo.type === 'choonpu') {
      if (romajiString.length > 0) {
        const lastRomajiChar = romajiString[romajiString.length - 1];
        let VOWELS = "aiueoāīūēō"; 
        if (VOWELS.includes(lastRomajiChar.toLowerCase())){
            let charToMacronize = lastRomajiChar;
            if (Object.values(VOWEL_MACRONS).includes(charToMacronize)) {
                charToMacronize = Object.keys(VOWEL_MACRONS).find(v => VOWEL_MACRONS[v] === charToMacronize) || charToMacronize;
            }
             if (VOWEL_MACRONS[charToMacronize.toLowerCase()]) {
                romajiString = romajiString.substring(0, romajiString.length - 1) + VOWEL_MACRONS[charToMacronize.toLowerCase()];
             }
        }
      }
      continue;
    }
    
    romajiString += moraInfo.romaji;
  }

  romajiString = romajiString.replace(/ou/g, 'ō');
  romajiString = romajiString.replace(/oo/g, 'ō');
  romajiString = romajiString.replace(/ee/g, 'ē');
  romajiString = romajiString.replace(/aa/g, 'ā');
  romajiString = romajiString.replace(/ii/g, 'ī'); 
  romajiString = romajiString.replace(/uu/g, 'ū');

  return romajiString;
};


export const reconstructWordFromMoraArray = (effectiveMoraArray: string[]): { kana: string, romaji: string } => {
  const kana = effectiveMoraArray.join('');
  const romaji = hepburnRomanise(effectiveMoraArray);
  return { kana, romaji };
};

export function shuffleArray<T,>(array: readonly T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// Moved from drillService.ts
export const getCumulativeKanaForLine = (script: ScriptType, targetLineId: string | null): Mora[] => {
    let cumulativeKana: Mora[] = [];
    const allLinesForScript = KANA_LINES[script];
    const lineOrder = KANA_LINE_ORDER[script];

    if (!targetLineId || targetLineId === 'mixed' || targetLineId.startsWith('sokuon')) { 
        lineOrder.forEach(lineId => {
            if (allLinesForScript[lineId] && !lineId.startsWith('sokuon')) { 
                cumulativeKana.push(...allLinesForScript[lineId].kana);
            }
        });
        if (MORA_DATA['っ']?.script === script) cumulativeKana.push(MORA_DATA['っ']);
        if (MORA_DATA['ッ']?.script === script) cumulativeKana.push(MORA_DATA['ッ']);
        if (MORA_DATA['ー']?.script === script) cumulativeKana.push(MORA_DATA['ー']);

    } else {
        for (const lineId of lineOrder) {
            if (allLinesForScript[lineId] && !lineId.startsWith('sokuon')) {
                cumulativeKana.push(...allLinesForScript[lineId].kana);
            }
            if (lineId === targetLineId) break; 
        }
    }
    return Array.from(new Set(cumulativeKana.filter(Boolean).map(m => MORA_DATA[m.kana]))).filter(Boolean) as Mora[]; 
};

// Moved from drillService.ts
export const getKanaPoolForDrill = (
  script: ScriptType,
  lineId: string | null,
  level: DrillLevel,
  forStimulusOnly: boolean = false,
  forDistractorContext: boolean = false, 
  contextKanaObject?: Mora
): Mora[] => {
  let pool: Mora[] = [];
  const allLinesForScript = KANA_LINES[script];

  if (lineId && lineId !== 'mixed' && allLinesForScript[lineId] && !lineId.startsWith('sokuon')) {
    pool = [...allLinesForScript[lineId].kana]; 

    if (!forStimulusOnly) { 
      const isSingleKanaDistractorContext = contextKanaObject && !('length' in contextKanaObject);

      if (isSingleKanaDistractorContext) {
        const cumulativeLearned = getCumulativeKanaForLine(script, lineId); 
        const cumulativeLearnedKanaSet = new Set(cumulativeLearned.map(m => m.kana));
        
        let strictDistractorPool: Mora[] = [];
        strictDistractorPool.push(...allLinesForScript[lineId].kana);

        if (contextKanaObject) {
            const baseForContextMora = MORA_DATA[contextKanaObject.baseKana || contextKanaObject.kana];
            if (baseForContextMora) {
                Object.values(MORA_DATA).forEach(mVariant => {
                    if (mVariant.script === script &&
                        (mVariant.baseKana === baseForContextMora.kana || 
                         (baseForContextMora.baseKana && MORA_DATA[baseForContextMora.baseKana]?.kana === mVariant.baseKana)) &&
                        cumulativeLearnedKanaSet.has(mVariant.kana)) {
                        strictDistractorPool.push(mVariant);
                    }
                });
            }
            const similarities = KANA_SIMILARITIES_DATA[script]?.[contextKanaObject.kana];
            if (similarities) {
                similarities.forEach(sim => {
                    if (cumulativeLearnedKanaSet.has(sim.similarKana)) {
                        const simMora = MORA_DATA[sim.similarKana];
                        if (simMora) strictDistractorPool.push(simMora);
                    }
                });
            }
        }
        pool = strictDistractorPool.filter(m => m.kana !== contextKanaObject?.kana);
        pool = Array.from(new Set(pool.map(m => m.kana)))
                   .map(k => MORA_DATA[k])
                   .filter(Boolean) as Mora[];
      } else {
        const baseMoraOfLine = pool.length > 0 ? pool[0] : null; 
        const currentLineIndex = KANA_LINE_ORDER[script].indexOf(lineId);
        
        const indicesToConsider = new Set<number>();
        if (currentLineIndex > -1) {
          indicesToConsider.add(currentLineIndex);
          if (currentLineIndex > 0) indicesToConsider.add(currentLineIndex - 1); 
          if (currentLineIndex < KANA_LINE_ORDER[script].length - 1) indicesToConsider.add(currentLineIndex + 1); 
        }

        const relatedLineIds = new Set<string>();
        if (baseMoraOfLine) {
          const representativeKana = MORA_DATA[baseMoraOfLine.baseKana || baseMoraOfLine.kana]; 
          if (representativeKana) {
            Object.values(allLinesForScript).forEach(line => {
              if (line.kana.some(k => k.baseKana === representativeKana.kana || (representativeKana.baseKana && k.kana === representativeKana.baseKana))) {
                relatedLineIds.add(line.id);
              }
            });
          }
        }
        
        indicesToConsider.forEach(idx => {
          const lId = KANA_LINE_ORDER[script][idx];
          if (lId && allLinesForScript[lId] && !lId.startsWith('sokuon')) pool.push(...allLinesForScript[lId].kana);
        });
        relatedLineIds.forEach(lId => {
          if (allLinesForScript[lId] && !lId.startsWith('sokuon')) pool.push(...allLinesForScript[lId].kana);
        });
        if (contextKanaObject) { 
            const base = contextKanaObject.baseKana ? getMoraInfo(contextKanaObject.baseKana) : contextKanaObject;
            if(base){
              const variants = Object.values(MORA_DATA).filter(m => m.script === script && (m.baseKana === base.kana || (base.baseKana && m.kana === base.baseKana)));
              pool.push(...variants);
            }
        }
        pool = Array.from(new Set(pool.map(m => m.kana))).map(k => MORA_DATA[k]).filter(Boolean) as Mora[];
      }
    }
  } else { 
    if (lineId && allLinesForScript[lineId] && lineId.startsWith('sokuon')) { 
        pool = [...allLinesForScript[lineId].kana];
    } else { 
        pool = getCumulativeKanaForLine(script, null); 
    }
  }
  
  pool = pool.filter(mora => mora && mora.script === script);
  if (contextKanaObject) { 
    pool = pool.filter(m => m.kana !== contextKanaObject.kana);
  }


  if (forStimulusOnly) {
    if (!lineId || lineId === 'mixed') { 
        if (level === DrillLevel.Easy) {
            pool = pool.filter(mora => mora.type === 'basic');
        }
    }
    if (!(lineId && (lineId.startsWith('sokuon')))) {
       pool = pool.filter(mora => mora.type !== 'sokuon' && mora.type !== 'choonpu');
    }
  }

  if (pool.length === 0) { 
      const fallbackKanaChars = script === ScriptType.Hiragana ? ['あ', 'い', 'う'] : ['ア', 'イ', 'ウ'];
      fallbackKanaChars.forEach(kChar => {
          const mora = MORA_DATA[kChar];
          if (mora && mora.kana !== contextKanaObject?.kana) pool.push(mora);
      });
  }
  
  return shuffleArray(pool.filter(Boolean));
};

// Moved from drillService.ts
export const getWordsForDrill = (
  script: ScriptType,
  lineId: string | null, 
  level: DrillLevel,
  config: {
    targetLengthOrLengths?: number | number[];
    phoneticProfile?: Partial<Word['phoneticProfile']>; 
    limit?: number;
    excludePlausibleNonWords?: boolean; 
  } = {}
): Word[] => {
  let candidateWords = MASTER_VOCAB[script] || [];
  const { targetLengthOrLengths, phoneticProfile, limit, excludePlausibleNonWords } = config;

  if (excludePlausibleNonWords) {
    candidateWords = candidateWords.filter(word => !word.isPlausibleNonWord);
  }

  if (lineId && lineId !== 'mixed' && !lineId.startsWith('sokuon')) {
    const specificLineData = KANA_LINES[script][lineId];
    if (!specificLineData || !specificLineData.kana) {
        console.warn(`Invalid lineId "${lineId}" or no kana in line for script "${script}" in getWordsForDrill.`);
        return [];
    }
    const specificLineKanaSet = new Set(specificLineData.kana.map(k => k.kana));
    const cumulativeLearnedKanaSet = new Set(getCumulativeKanaForLine(script, lineId).map(k => k.kana));

    candidateWords = candidateWords.filter(word => {
      const allConstituentKanaLearned = word.constituentKana.every(char => cumulativeLearnedKanaSet.has(char));
      if (!allConstituentKanaLearned) return false;
      
      const hasAtLeastOneKanaFromSpecificLine = word.constituentKana.some(char => specificLineKanaSet.has(char));
      if (!hasAtLeastOneKanaFromSpecificLine) return false;
      
      return true;
    });

  } else { 
    const learnedKanaContext = (lineId === 'mixed' || lineId === null || lineId?.startsWith('sokuon')) ? null : lineId;
    const broadlyLearnedKanaSet = new Set(getCumulativeKanaForLine(script, learnedKanaContext).map(k => k.kana));
    
    candidateWords = candidateWords.filter(word => 
        word.constituentKana.every(char => broadlyLearnedKanaSet.has(char))
    );
    if (lineId?.startsWith('sokuon')) {
        if (script === ScriptType.Hiragana && lineId === 'sokuon-line') {
            candidateWords = candidateWords.filter(word => word.constituentKana.includes('っ'));
        } else if (script === ScriptType.Katakana && lineId === 'sokuon-choonpu-line') {
             candidateWords = candidateWords.filter(word => word.constituentKana.includes('ッ') || word.constituentKana.includes('ー'));
        }
    }
  }

  if (targetLengthOrLengths !== undefined) {
    const lengths = Array.isArray(targetLengthOrLengths) ? targetLengthOrLengths : [targetLengthOrLengths];
    if (lengths.length > 0) {
        candidateWords = candidateWords.filter(word => lengths.includes(word.length));
    }
  }

  if (phoneticProfile) {
    candidateWords = candidateWords.filter(word => {
      let match = true;
      if (phoneticProfile.hasVoiced !== undefined && word.phoneticProfile?.hasVoiced !== phoneticProfile.hasVoiced) match = false;
      if (phoneticProfile.hasHandakuten !== undefined && word.phoneticProfile?.hasHandakuten !== phoneticProfile.hasHandakuten) match = false;
      if (phoneticProfile.hasSokuon !== undefined && word.phoneticProfile?.hasSokuon !== phoneticProfile.hasSokuon) match = false;
      if (phoneticProfile.hasChoonpu !== undefined && word.phoneticProfile?.hasChoonpu !== phoneticProfile.hasChoonpu) match = false;
      // Corrected typo: hasYou to hasYouon
      if (phoneticProfile.hasYouon !== undefined && word.phoneticProfile?.hasYouon !== phoneticProfile.hasYouon) match = false;
      return match;
    });
  }
  
  if (limit !== undefined) {
    candidateWords = shuffleArray(candidateWords).slice(0, limit);
  }

  return candidateWords;
};
