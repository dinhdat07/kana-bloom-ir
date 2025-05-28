
import { DrillLevel, MazeLevelData, ReadingPassage, ScriptType, Word } from './types';
import { MASTER_VOCAB } from './linguisticConstants'; // Import MASTER_VOCAB

export const TOTAL_QUESTIONS_PER_DRILL = 30;
export const TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL = 20; 
export const TARGET_WORDS_PER_IMMERSIVE_LEVEL = 20; 

export const DEFAULT_DRILL_LEVELS: DrillLevel[] = [DrillLevel.Easy, DrillLevel.Medium, DrillLevel.Difficult];

export const MAZE_LEVELS_DATA: MazeLevelData[] = [
  // Level 1: いえ (ie)
  {
    levelNum: 1,
    layout: [ ['S', 'P', 'P'], ['W', 'P', 'W'], ['P', 'P', 'E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'いえ')!],
    kanaSpots: [{ kana: 'い', x: 2, y: 0 }, { kana: 'え', x: 0, y: 2 }],
    message: 'Find いえ (house)!',
  },
  // Level 2: ねこ (neko)
  {
    levelNum: 2,
    layout: [ ['S', 'P', 'P', 'W'], ['W', 'P', 'P', 'P'], ['P', 'P', 'W', 'P'], ['P', 'W', 'P', 'E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'ねこ')!],
    kanaSpots: [{ kana: 'ね', x: 2, y: 0 }, { kana: 'こ', x: 3, y: 1 }],
    message: 'Find ねこ (cat)!',
  },
  // Level 3: いぬ (inu)
  {
    levelNum: 3,
    layout: [ ['S', 'P', 'P', 'P'], ['P', 'W', 'P', 'P'], ['P', 'P', 'W', 'P'], ['W', 'W', 'P', 'E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'いぬ')!],
    kanaSpots: [{ kana: 'い', x: 3, y: 0 }, { kana: 'ぬ', x: 2, y: 1 }],
    message: 'Find いぬ (dog)!',
  },
  // Level 4: やま (yama)
  {
    levelNum: 4,
    layout: [ ['P', 'P', 'S', 'P'], ['P', 'W', 'P', 'W'], ['P', 'P', 'P', 'P'], ['W', 'W', 'P', 'E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'やま')!],
    kanaSpots: [{ kana: 'や', x: 0, y: 0 }, { kana: 'ま', x: 0, y: 2 }],
    message: 'Find やま (mountain)!',
  },
  // Level 5: かさ (kasa)
  {
    levelNum: 5,
    layout: [ ['S', 'P', 'W', 'P'], ['P', 'W', 'P', 'P'], ['P', 'P', 'P', 'P'], ['W', 'P', 'W', 'E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'かさ')!],
    kanaSpots: [{ kana: 'か', x: 3, y: 0 }, { kana: 'さ', x: 3, y: 1 }],
    message: 'Find かさ (umbrella)!',
  },
  // Level 6: すし (sushi)
  {
    levelNum: 6,
    layout: [ ['S','P','P','W','P'], ['W','W','P','P','P'], ['P','P','P','W','E'], ['P','W','P','P','P'], ['P','P','P','W','P'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'すし')!],
    kanaSpots: [{ kana: 'す', x: 4, y: 0 }, { kana: 'し', x: 0, y: 2 }],
    message: 'Find すし (sushi)!',
  },
  // Level 7: パン (pan) - Katakana
  {
    levelNum: 7,
    layout: [ ['S','W','P','P','P'], ['P','P','P','W','P'], ['P','W','W','P','P'], ['P','P','P','P','W'], ['W','W','W','P','E'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'パン')!],
    kanaSpots: [{ kana: 'パ', x: 2, y: 0 }, { kana: 'ン', x: 4, y: 1 }],
    message: 'Find パン (bread)!',
  },
  // Level 8: えき (eki)
  {
    levelNum: 8,
    layout: [ ['P','P','P','S','P'], ['P','W','W','P','P'], ['P','P','P','W','P'], ['W','P','P','P','E'], ['P','P','W','P','P'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'えき')!],
    kanaSpots: [{ kana: 'え', x: 0, y: 0 }, { kana: 'き', x: 4, y: 1 }],
    message: 'Find えき (station)!',
  },
  // Level 9: バス (basu) - Katakana
  {
    levelNum: 9,
    layout: [ ['S','P','W','P','P','W'], ['P','W','P','P','P','P'], ['P','P','W','P','W','P'], ['W','P','P','P','P','E'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'バス')!],
    kanaSpots: [{ kana: 'バ', x: 3, y: 0 }, { kana: 'ス', x: 4, y: 1 }],
    message: 'Find バス (bus)!',
  },
  // Level 10: みせ (mise)
  {
    levelNum: 10,
    layout: [ ['S','P','P','P','P','P'], ['W','W','W','P','W','P'], ['P','P','P','P','P','P'], ['P','W','P','W','W','W'], ['P','P','P','P','P','E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'みせ')!],
    kanaSpots: [{ kana: 'み', x: 4, y: 0 }, { kana: 'せ', x: 5, y: 1 }],
    message: 'Find みせ (shop)!',
  },
  // Level 11: カメラ (kamera) - Katakana
  {
    levelNum: 11,
    layout: [ ['S','P','P','W','P','P'], ['P','W','P','P','P','P'], ['P','P','W','P','W','P'], ['P','W','P','P','P','P'], ['P','P','P','W','P','E'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'カメラ')!],
    kanaSpots: [{ kana: 'カ', x: 5, y: 0 }, { kana: 'メ', x: 5, y: 1 }, { kana: 'ラ', x: 3, y: 2 }],
    message: 'Find カメラ (camera)!',
  },
  // Level 12: でんわ (denwa)
  {
    levelNum: 12,
    layout: [ ['S','W','P','P','P','P','P'], ['P','P','P','W','P','W','P'], ['P','W','P','P','P','P','E'], ['P','P','W','W','W','W','W'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'でんわ')!],
    kanaSpots: [{ kana: 'で', x: 2, y: 0 }, { kana: 'ん', x: 6, y: 0 }, { kana: 'わ', x: 4, y: 1 }],
    message: 'Find でんわ (phone)!',
  },
  // Level 13: スキー (sukī) - Katakana
  {
    levelNum: 13,
    layout: [ ['S','P','P','P','W','P','P'], ['P','W','P','P','P','P','P'], ['P','P','W','P','W','W','P'], ['W','P','P','P','P','P','P'], ['E','P','W','W','W','P','P'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'スキー')!],
    kanaSpots: [{ kana: 'ス', x: 6, y: 0 }, { kana: 'キ', x: 2, y: 1 }, { kana: 'ー', x: 5, y: 3 }],
    message: 'Find スキー (skiing)!',
  },
  // Level 14: てがみ (tegami)
  {
    levelNum: 14,
    layout: [ ['P','P','W','S','P','P','P'], ['P','W','P','P','W','P','P'], ['P','P','P','P','P','P','P'], ['W','W','P','W','P','W','P'], ['P','P','P','P','P','P','E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'てがみ')!],
    kanaSpots: [{ kana: 'て', x: 0, y: 0 }, { kana: 'が', x: 6, y: 0 }, { kana: 'み', x: 3, y: 2 }],
    message: 'Find てがみ (letter)!',
  },
  // Level 15: ホテル (hoteru) - Katakana
  {
    levelNum: 15,
    layout: [ ['S','P','P','P','P','P','P','W'], ['W','W','W','P','W','P','P','P'], ['P','P','P','P','P','W','P','P'], ['P','W','P','W','P','P','P','P'], ['P','P','P','P','P','W','P','E'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'ホテル')!],
    kanaSpots: [{ kana: 'ホ', x: 6, y: 0 }, { kana: 'テ', x: 5, y: 1 }, { kana: 'ル', x: 6, y: 2 }],
    message: 'Find ホテル (hotel)!',
  },
  // Level 16: りょこう (ryokō)
  {
    levelNum: 16,
    layout: [ ['S','P','W','P','P','P','P','P'], ['P','W','P','P','W','P','W','P'], ['P','P','P','P','P','P','P','P'], ['W','P','W','P','W','P','W','E'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'りょこう')!],
    kanaSpots: [{ kana: 'りょ', x: 4, y: 0 }, { kana: 'こ', x: 7, y: 0 }, { kana: 'う', x: 3, y: 2 }],
    message: 'Find りょこう (trip)!',
  },
  // Level 17: ベッド (beddo) - Katakana
  {
    levelNum: 17,
    layout: [ ['P','W','S','P','P','P','P','P'], ['P','P','P','W','P','W','P','P'], ['P','W','P','P','W','P','P','W'], ['P','P','P','W','P','P','P','E'], ['P','W','W','P','P','W','W','W'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'ベッド')!],
    kanaSpots: [{ kana: 'ベ', x: 0, y: 0 }, { kana: 'ッ', x: 7, y: 0 }, { kana: 'ド', x: 4, y: 1 }],
    message: 'Find ベッド (bed)!',
  },
  // Level 18: コーヒー (kōhī) - Katakana
  {
    levelNum: 18,
    layout: [ ['S','P','P','W','P','P','P','P','P'], ['P','W','P','P','P','W','P','W','P'], ['P','P','P','W','P','P','P','P','E'], ['W','P','W','P','W','P','W','W','W'], ['P','P','P','P','P','P','P','P','P'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'コーヒー')!],
    kanaSpots: [{ kana: 'コ', x: 6, y: 0 }, { kana: 'ー', x: 8, y: 0 }, { kana: 'ヒ', x: 2, y: 2 }, { kana: 'ー', x: 3, y: 3 }],
    message: 'Find コーヒー (coffee)!',
  },
  // Level 19: がっこう (gakkō)
  {
    levelNum: 19,
    layout: [ ['S','W','P','P','P','P','W','P','P'], ['P','P','P','W','P','P','P','P','W'], ['P','W','P','P','P','W','P','P','P'], ['P','P','P','W','P','P','P','W','E'], ['P','W','P','P','P','P','W','P','P'] ],
    words: [MASTER_VOCAB[ScriptType.Hiragana].find(w => w.kana === 'がっこう')!],
    kanaSpots: [{ kana: 'が', x: 2, y: 0 }, { kana: 'っ', x: 7, y: 0 }, { kana: 'こ', x: 4, y: 1 }, { kana: 'う', x: 6, y: 2 }],
    message: 'Find がっこう (school)!',
  },
  // Level 20: チョコレート (chokorēto) - Katakana
  {
    levelNum: 20,
    layout: [ ['P','P','P','S','P','W','P','P','P','P'], ['P','W','P','W','P','P','P','W','P','W'], ['P','P','P','P','P','W','P','P','P','P'], ['W','P','W','P','W','P','P','P','W','E'], ['P','P','P','P','P','P','W','P','P','P'] ],
    words: [MASTER_VOCAB[ScriptType.Katakana].find(w => w.kana === 'チョコレート')!],
    kanaSpots: [ { kana: 'チョ', x: 0, y: 0 }, { kana: 'コ', x: 6, y: 0 }, { kana: 'レ', x: 9, y: 0 }, { kana: 'ー', x: 6, y: 2 }, { kana: 'ト', x: 3, y: 3 } ],
    message: 'Find チョコレート (chocolate)!',
  },
];


export const IMMERSIVE_READING_LEVELS: { [level: number]: ReadingPassage[] } = {
  1: [
    // User Provided (4-6 words) - 10 sentences
    {
      id: "L1_N1", level: 1, fullText: "これは ほんです。",
      passageUnits: [ { japanese: "これ", romaji: "kore" }, { japanese: "は", romaji: "wa" }, { japanese: "ほん", romaji: "hon" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N2", level: 1, fullText: "いま なんじ ですか。",
      passageUnits: [ { japanese: "いま", romaji: "ima" }, { japanese: "なんじ", romaji: "nanji" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N3", level: 1, fullText: "おなまえは なんですか。",
      passageUnits: [ { japanese: "おなまえ", romaji: "onamae" }, { japanese: "は", romaji: "wa" }, { japanese: "なん", romaji: "nan" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N4", level: 1, fullText: "わたしは がくせいです。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "がくせい", romaji: "gakusei" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N5", level: 1, fullText: "つくえの うえに あります。",
      passageUnits: [ { japanese: "つくえ", romaji: "tsukue" }, { japanese: "の", romaji: "no" }, { japanese: "うえ", romaji: "ue" }, { japanese: "に", romaji: "ni" }, { japanese: "あります", romaji: "arimasu" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N6", level: 1, fullText: "よく ほんを よみますか。",
      passageUnits: [ { japanese: "よく", romaji: "yoku" }, { japanese: "ほん", romaji: "hon" }, { japanese: "を", romaji: "o" }, { japanese: "よみます", romaji: "yomimasu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N7", level: 1, fullText: "コーヒーを のみます。",
      passageUnits: [ { japanese: "コーヒー", romaji: "kōhī" }, { japanese: "を", romaji: "o" }, { japanese: "のみます", romaji: "nomimasu" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N8", level: 1, fullText: "えきは どこ ですか。",
      passageUnits: [ { japanese: "えき", romaji: "eki" }, { japanese: "は", romaji: "wa" }, { japanese: "どこ", romaji: "doko" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (4-6 words) - Updated"
    },
    {
      id: "L1_N9", level: 1, fullText: "てがみを かきました。",
      passageUnits: [ { japanese: "てがみ", romaji: "tegami" }, { japanese: "を", romaji: "o" }, { japanese: "かきました", romaji: "kakimashita" } ],
      sourceInfo: "User Provided (4-6 words)"
    },
    {
      id: "L1_N10", level: 1, fullText: "きのうは あめ でした。",
      passageUnits: [ { japanese: "きのう", romaji: "kinō" }, { japanese: "は", romaji: "wa" }, { japanese: "あめ", romaji: "ame" }, { japanese: "でした", romaji: "deshita" } ],
      sourceInfo: "User Provided (4-6 words) - Updated"
    },
    // New Simple Sentences - 10 sentences
    {
      id: "L1_N11", level: 1, fullText: "いぬが います。",
      passageUnits: [ { japanese: "いぬ", romaji: "inu" }, { japanese: "が", romaji: "ga" }, { japanese: "います", romaji: "imasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N12", level: 1, fullText: "ねこも います。",
      passageUnits: [ { japanese: "ねこ", romaji: "neko" }, { japanese: "も", romaji: "mo" }, { japanese: "います", romaji: "imasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N13", level: 1, fullText: "それは ペン です。",
      passageUnits: [ { japanese: "それ", romaji: "sore" }, { japanese: "は", romaji: "wa" }, { japanese: "ペン", romaji: "pen" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N14", level: 1, fullText: "パンを たべます。",
      passageUnits: [ { japanese: "パン", romaji: "pan" }, { japanese: "を", romaji: "o" }, { japanese: "たべます", romaji: "tabemasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N15", level: 1, fullText: "みずを のみます。",
      passageUnits: [ { japanese: "みず", romaji: "mizu" }, { japanese: "を", romaji: "o" }, { japanese: "のみます", romaji: "nomimasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N16", level: 1, fullText: "これは なに ですか。",
      passageUnits: [ { japanese: "これ", romaji: "kore" }, { japanese: "は", romaji: "wa" }, { japanese: "なに", romaji: "nani" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N17", level: 1, fullText: "ほんが すき です。",
      passageUnits: [ { japanese: "ほん", romaji: "hon" }, { japanese: "が", romaji: "ga" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N18", level: 1, fullText: "えいがを みます。",
      passageUnits: [ { japanese: "えいが", romaji: "eiga" }, { japanese: "を", romaji: "o" }, { japanese: "みます", romaji: "mimasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N19", level: 1, fullText: "おんがくを ききます。",
      passageUnits: [ { japanese: "おんがく", romaji: "ongaku" }, { japanese: "を", romaji: "o" }, { japanese: "ききます", romaji: "kikimasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
    {
      id: "L1_N20", level: 1, fullText: "おはよう ございます。",
      passageUnits: [ { japanese: "おはよう", romaji: "ohayō" }, { japanese: "ございます", romaji: "gozaimasu" } ],
      sourceInfo: "Crafted Simple Sentence"
    },
  ],
  2: [
    // User Provided (7-9 words) - 10 sentences
    {
      id: "L2_N1", level: 2, fullText: "それは にほんごで なんと いいますか。",
      passageUnits: [ { japanese: "それ", romaji: "sore" }, { japanese: "は", romaji: "wa" }, { japanese: "にほんご", romaji: "nihongo" }, { japanese: "で", romaji: "de" }, { japanese: "なん", romaji: "nan" }, { japanese: "と", romaji: "to" }, { japanese: "いいます", romaji: "iimasu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N2", level: 2, fullText: "わたしは いちねんせい では ありません。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "いちねんせい", romaji: "ichinensei" }, { japanese: "では", romaji: "dewa" }, { japanese: "ありません", romaji: "arimasen" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N3", level: 2, fullText: "やまださんは がくせい ですか。",
      passageUnits: [ { japanese: "やまださん", romaji: "yamadasan" }, { japanese: "は", romaji: "wa" }, { japanese: "がくせい", romaji: "gakusei" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N4", level: 2, fullText: "この へん に ぎんこう が ありますか。",
      passageUnits: [ { japanese: "この", romaji: "kono" }, { japanese: "へん", romaji: "hen" }, { japanese: "に", romaji: "ni" }, { japanese: "ぎんこう", romaji: "ginkō" }, { japanese: "が", romaji: "ga" }, { japanese: "あります", romaji: "arimasu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N5", level: 2, fullText: "わたしは まいにち がっこう へ いきます。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "まいにち", romaji: "mainichi" }, { japanese: "がっこう", romaji: "gakkō" }, { japanese: "へ", romaji: "e" }, { japanese: "いきます", romaji: "ikimasu" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N6", level: 2, fullText: "きのう としょかん で べんきょうしました。",
      passageUnits: [ { japanese: "きのう", romaji: "kinō" }, { japanese: "としょかん", romaji: "toshokan" }, { japanese: "で", romaji: "de" }, { japanese: "べんきょうしました", romaji: "benkyōshimashita" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N7", level: 2, fullText: "あしたは テスト が ある でしょう。",
      passageUnits: [ { japanese: "あした", romaji: "ashita" }, { japanese: "は", romaji: "wa" }, { japanese: "テスト", romaji: "tesuto" }, { japanese: "が", romaji: "ga" }, { japanese: "ある", romaji: "aru" }, { japanese: "でしょう", romaji: "deshō" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N8", level: 2, fullText: "スポーツ の なかで なにが すきですか。",
      passageUnits: [ { japanese: "スポーツ", romaji: "supōtsu" }, { japanese: "の", romaji: "no" }, { japanese: "なか", romaji: "naka" }, { japanese: "で", romaji: "de" }, { japanese: "なに", romaji: "nani" }, { japanese: "が", romaji: "ga" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N9", level: 2, fullText: "わたしは りょうりを するのが すきです。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "りょうり", romaji: "ryōri" }, { japanese: "を", romaji: "o" }, { japanese: "する", romaji: "suru" }, { japanese: "の", romaji: "no" }, { japanese: "が", romaji: "ga" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    {
      id: "L2_N10", level: 2, fullText: "どんな おんがくを きくのが すきですか。",
      passageUnits: [ { japanese: "どんな", romaji: "donna" }, { japanese: "おんがく", romaji: "ongaku" }, { japanese: "を", romaji: "o" }, { japanese: "きく", romaji: "kiku" }, { japanese: "の", romaji: "no" }, { japanese: "が", romaji: "ga" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (7-9 words)"
    },
    // User Provided (10-12 words) - 10 sentences
    {
      id: "L2_N11", level: 2, fullText: "はじめまして。わたしは アリス うえだ です。どうぞ よろしく。",
      passageUnits: [ { japanese: "はじめまして", romaji: "hajimemashite" }, { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "アリス", romaji: "arisu" }, { japanese: "うえだ", romaji: "ueda" }, { japanese: "です", romaji: "desu" }, { japanese: "どうぞ", romaji: "dōzo" }, { japanese: "よろしく", romaji: "yoroshiku" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N12", level: 2, fullText: "あのう、すみません。いま なんじ ですか。いちじ ですよ。",
      passageUnits: [ { japanese: "あのう", romaji: "anō" }, { japanese: "すみません", romaji: "sumimasen" }, { japanese: "いま", romaji: "ima" }, { japanese: "なんじ", romaji: "nanji" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" }, { japanese: "いちじ", romaji: "ichiji" }, { japanese: "です", romaji: "desu" }, { japanese: "よ", romaji: "yo" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N13", level: 2, fullText: "わたしの せんこうは ぶんがく です。リーさんの せんこうは なんですか。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "の", romaji: "no" }, { japanese: "せんこう", romaji: "senkō" }, { japanese: "は", romaji: "wa" }, { japanese: "ぶんがく", romaji: "bungaku" }, { japanese: "です", romaji: "desu" }, { japanese: "リーさん", romaji: "rīsan" }, { japanese: "の", romaji: "no" }, { japanese: "せんこう", romaji: "senkō" }, { japanese: "は", romaji: "wa" }, { japanese: "なん", romaji: "nan" }, { japanese: "です", romaji: "desu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N14", level: 2, fullText: "わたしの こうこうは ミルズ ハイスクール です。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "の", romaji: "no" }, { japanese: "こうこう", romaji: "kōkō" }, { japanese: "は", romaji: "wa" }, { japanese: "ミルズ", romaji: "miruzu" }, { japanese: "ハイスクール", romaji: "haisukūru" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N15", level: 2, fullText: "きょうは はちじに じゅぎょうが ありましたから、たいへんでした。",
      passageUnits: [ { japanese: "きょう", romaji: "kyō" }, { japanese: "は", romaji: "wa" }, { japanese: "はちじ", romaji: "hachiji" }, { japanese: "に", romaji: "ni" }, { japanese: "じゅぎょう", romaji: "jugyō" }, { japanese: "が", romaji: "ga" }, { japanese: "ありました", romaji: "arimashita" }, { japanese: "から", romaji: "kara" }, { japanese: "たいへん", romaji: "taihen" }, { japanese: "でした", romaji: "deshita" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N16", level: 2, fullText: "あした テストが あるから、きょう べんきょうします。",
      passageUnits: [ { japanese: "あした", romaji: "ashita" }, { japanese: "テスト", romaji: "tesuto" }, { japanese: "が", romaji: "ga" }, { japanese: "ある", romaji: "aru" }, { japanese: "から", romaji: "kara" }, { japanese: "きょう", romaji: "kyō" }, { japanese: "べんきょうします", romaji: "benkyōshimasu" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N17", level: 2, fullText: "コーヒーは あさ のみますが、ジュースも あさ のみます。",
      passageUnits: [ { japanese: "コーヒー", romaji: "kōhī" }, { japanese: "は", romaji: "wa" }, { japanese: "あさ", romaji: "asa" }, { japanese: "のみます", romaji: "nomimasu" }, { japanese: "が", romaji: "ga" }, { japanese: "ジュース", romaji: "jūsu" }, { japanese: "も", romaji: "mo" }, { japanese: "あさ", romaji: "asa" }, { japanese: "のみます", romaji: "nomimasu" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N18", level: 2, fullText: "この りょうりは あまり おいしくない と おもいます。",
      passageUnits: [ { japanese: "この", romaji: "kono" }, { japanese: "りょうり", romaji: "ryōri" }, { japanese: "は", romaji: "wa" }, { japanese: "あまり", romaji: "amari" }, { japanese: "おいしくない", romaji: "oishikunai" }, { japanese: "と", romaji: "to" }, { japanese: "おもいます", romaji: "omoimasu" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N19", level: 2, fullText: "きのう ふった おおゆきで でんしゃが ストップ しました。",
      passageUnits: [ { japanese: "きのう", romaji: "kinō" }, { japanese: "ふった", romaji: "futta" }, { japanese: "おおゆき", romaji: "ōyuki" }, { japanese: "で", romaji: "de" }, { japanese: "でんしゃ", romaji: "densha" }, { japanese: "が", romaji: "ga" }, { japanese: "ストップ", romaji: "sutoppu" }, { japanese: "しました", romaji: "shimashita" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
    {
      id: "L2_N20", level: 2, fullText: "リーさんは うちで ゆっくり やすむのが すきです。",
      passageUnits: [ { japanese: "リーさん", romaji: "rīsan" }, { japanese: "は", romaji: "wa" }, { japanese: "うち", romaji: "uchi" }, { japanese: "で", romaji: "de" }, { japanese: "ゆっくり", romaji: "yukkuri" }, { japanese: "やすむ", romaji: "yasumu" }, { japanese: "の", romaji: "no" }, { japanese: "が", romaji: "ga" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (10-12 words)"
    },
  ],
  3: [
    // User Provided (13-15 words) - 10 sentences
    {
      id: "L3_N1", level: 3, fullText: "あのう、すみませんが、この へんに ゆうびんきょくは どこに ありますか。",
      passageUnits: [ { japanese: "あのう", romaji: "anō" }, { japanese: "すみません", romaji: "sumimasen" }, { japanese: "が", romaji: "ga" }, { japanese: "この", romaji: "kono" }, { japanese: "へん", romaji: "hen" }, { japanese: "に", romaji: "ni" }, { japanese: "ゆうびんきょく", romaji: "yūbinkyoku" }, { japanese: "は", romaji: "wa" }, { japanese: "どこ", romaji: "doko" }, { japanese: "に", romaji: "ni" }, { japanese: "あります", romaji: "arimasu" }, { japanese: "か", romaji: "ka" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N2", level: 3, fullText: "わたしは とうきょうに すんでいます。やまださんは アパートに すんでいました。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "とうきょう", romaji: "tōkyō" }, { japanese: "に", romaji: "ni" }, { japanese: "すんでいます", romaji: "sundeimasu" }, { japanese: "やまださん", romaji: "yamadasan" }, { japanese: "は", romaji: "wa" }, { japanese: "アパート", romaji: "apāto" }, { japanese: "に", romaji: "ni" }, { japanese: "すんでいました", romaji: "sundeimashita" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N3", level: 3, fullText: "わたしは コーヒーは すきですが、コーラは あまり すきじゃ ありません。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "コーヒー", romaji: "kōhī" }, { japanese: "は", romaji: "wa" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" }, { japanese: "が", romaji: "ga" }, { japanese: "コーラ", romaji: "kōra" }, { japanese: "は", romaji: "wa" }, { japanese: "あまり", romaji: "amari" }, { japanese: "すきじゃ", romaji: "sukija" }, { japanese: "ありません", romaji: "arimasen" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N4", level: 3, fullText: "わたしは むかし ピアノを ならっていましたが、いまは ぜんぜん ひきません。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "むかし", romaji: "mukashi" }, { japanese: "ピアノ", romaji: "piano" }, { japanese: "を", romaji: "o" }, { japanese: "ならっていました", romaji: "naratteimashita" }, { japanese: "が", romaji: "ga" }, { japanese: "いま", romaji: "ima" }, { japanese: "は", romaji: "wa" }, { japanese: "ぜんぜん", romaji: "zenzen" }, { japanese: "ひきません", romaji: "hikimasen" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N5", level: 3, fullText: "こどもの ときは、よく うみに あそびに いったり、やまに ハイキングに いったり していました。",
      passageUnits: [ { japanese: "こども", romaji: "kodomo" }, { japanese: "の", romaji: "no" }, { japanese: "とき", romaji: "toki" }, { japanese: "は", romaji: "wa" }, { japanese: "よく", romaji: "yoku" }, { japanese: "うみ", romaji: "umi" }, { japanese: "に", romaji: "ni" }, { japanese: "あそび", romaji: "asobi" }, { japanese: "に", romaji: "ni" }, { japanese: "いったり", romaji: "ittari" }, { japanese: "やま", romaji: "yama" }, { japanese: "に", romaji: "ni" }, { japanese: "ハイキング", romaji: "haikingu" }, { japanese: "に", romaji: "ni" }, { japanese: "いったり", romaji: "ittari" }, { japanese: "していました", romaji: "shiteimashita" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N6", level: 3, fullText: "わたしは しんぶんを よんで、がっこうへ いきます。おんがくを きいて、ねます。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "しんぶん", romaji: "shinbun" }, { japanese: "を", romaji: "o" }, { japanese: "よんで", romaji: "yonde" }, { japanese: "がっこう", romaji: "gakkō" }, { japanese: "へ", romaji: "e" }, { japanese: "いきます", romaji: "ikimasu" }, { japanese: "おんがく", romaji: "ongaku" }, { japanese: "を", romaji: "o" }, { japanese: "きいて", romaji: "kiite" }, { japanese: "ねます", romaji: "nemasu" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N7", level: 3, fullText: "としょかんで えいがが ありますから、いっしょに みに いきませんか。",
      passageUnits: [ { japanese: "としょかん", romaji: "toshokan" }, { japanese: "で", romaji: "de" }, { japanese: "えいが", romaji: "eiga" }, { japanese: "が", romaji: "ga" }, { japanese: "あります", romaji: "arimasu" }, { japanese: "から", romaji: "kara" }, { japanese: "いっしょ", romaji: "issho" }, { japanese: "に", romaji: "ni" }, { japanese: "み", romaji: "mi" }, { japanese: "に", romaji: "ni" }, { japanese: "いきませんか", romaji: "ikimasenka" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N8", level: 3, fullText: "この りょうりは おいしそうですから、わたしは これに します。",
      passageUnits: [ { japanese: "この", romaji: "kono" }, { japanese: "りょうり", romaji: "ryōri" }, { japanese: "は", romaji: "wa" }, { japanese: "おいしそう", romaji: "oishisō" }, { japanese: "です", romaji: "desu" }, { japanese: "から", romaji: "kara" }, { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "これ", romaji: "kore" }, { japanese: "に", romaji: "ni" }, { japanese: "します", romaji: "shimasu" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N9", level: 3, fullText: "あしたは あめが ふるでしょうから、かさを もっていったほうが いいですよ。",
      passageUnits: [ { japanese: "あした", romaji: "ashita" }, { japanese: "は", romaji: "wa" }, { japanese: "あめ", romaji: "ame" }, { japanese: "が", romaji: "ga" }, { japanese: "ふるでしょう", romaji: "furudeshō" }, { japanese: "から", romaji: "kara" }, { japanese: "かさ", romaji: "kasa" }, { japanese: "を", romaji: "o" }, { japanese: "もっていった", romaji: "motteitta" }, { japanese: "ほうが", romaji: "hōga" }, { japanese: "いい", romaji: "ii" }, { japanese: "です", romaji: "desu" }, { japanese: "よ", romaji: "yo" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    {
      id: "L3_N10", level: 3, fullText: "きのうは とても さむかったので、うちで あたたかい コーヒーを のみました。",
      passageUnits: [ { japanese: "きのう", romaji: "kinō" }, { japanese: "は", romaji: "wa" }, { japanese: "とても", romaji: "totemo" }, { japanese: "さむかった", romaji: "samukatta" }, { japanese: "ので", romaji: "node" }, { japanese: "うち", romaji: "uchi" }, { japanese: "で", romaji: "de" }, { japanese: "あたたかい", romaji: "atatakai" }, { japanese: "コーヒー", romaji: "kōhī" }, { japanese: "を", romaji: "o" }, { japanese: "のみました", romaji: "nomimashita" } ],
      sourceInfo: "User Provided (13-15 words)"
    },
    // User Provided Passages (3-4 sentences each) - 10 passages
    {
      id: "L3_P1", level: 3, fullText: "わたしは まいあさ しちじに おきます。あさごはんを たべて、コーヒーを のみます。それから、はちじに がっこうへ いきます。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "まいあさ", romaji: "maiasa" }, { japanese: "しちじ", romaji: "shichiji" }, { japanese: "に", romaji: "ni" }, { japanese: "おきます", romaji: "okimasu" }, { japanese: "あさごはん", romaji: "asagohan" }, { japanese: "を", romaji: "o" }, { japanese: "たべて", romaji: "tabete" }, { japanese: "コーヒー", romaji: "kōhī" }, { japanese: "を", romaji: "o" }, { japanese: "のみます", romaji: "nomimasu" }, { japanese: "それから", romaji: "sorekara" }, { japanese: "はちじ", romaji: "hachiji" }, { japanese: "に", romaji: "ni" }, { japanese: "がっこう", romaji: "gakkō" }, { japanese: "へ", romaji: "e" }, { japanese: "いきます", romaji: "ikimasu" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P2", level: 3, fullText: "わたしの しゅみは スポーツと おんがくです。スポーツの なかでは やきゅうが いちばん すきです。おんがくは ジャズを よく ききます。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "の", romaji: "no" }, { japanese: "しゅみ", romaji: "shumi" }, { japanese: "は", romaji: "wa" }, { japanese: "スポーツ", romaji: "supōtsu" }, { japanese: "と", romaji: "to" }, { japanese: "おんがく", romaji: "ongaku" }, { japanese: "です", romaji: "desu" }, { japanese: "スポーツ", romaji: "supōtsu" }, { japanese: "の", romaji: "no" }, { japanese: "なか", romaji: "naka" }, { japanese: "では", romaji: "dewa" }, { japanese: "やきゅう", romaji: "yakyū" }, { japanese: "が", romaji: "ga" }, { japanese: "いちばん", romaji: "ichiban" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" }, { japanese: "おんがく", romaji: "ongaku" }, { japanese: "は", romaji: "wa" }, { japanese: "ジャズ", romaji: "jazu" }, { japanese: "を", romaji: "o" }, { japanese: "よく", romaji: "yoku" }, { japanese: "ききます", romaji: "kikimasu" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P3", level: 3, fullText: "きのうの しゅうまつは とても たのしかったです。ともだちと えいがを みて、レストランで しょくじを しました。それから、うちへ かえって、しゅくだいを しました。",
      passageUnits: [ { japanese: "きのう", romaji: "kinō" }, { japanese: "の", romaji: "no" }, { japanese: "しゅうまつ", romaji: "shūmatsu" }, { japanese: "は", romaji: "wa" }, { japanese: "とても", romaji: "totemo" }, { japanese: "たのしかった", romaji: "tanoshikatta" }, { japanese: "です", romaji: "desu" }, { japanese: "ともだち", romaji: "tomodachi" }, { japanese: "と", romaji: "to" }, { japanese: "えいが", romaji: "eiga" }, { japanese: "を", romaji: "o" }, { japanese: "みて", romaji: "mite" }, { japanese: "レストラン", romaji: "resutoran" }, { japanese: "で", romaji: "de" }, { japanese: "しょくじ", romaji: "shokuji" }, { japanese: "を", romaji: "o" }, { japanese: "しました", romaji: "shimashita" }, { japanese: "それから", romaji: "sorekara" }, { japanese: "うち", romaji: "uchi" }, { japanese: "へ", romaji: "e" }, { japanese: "かえって", romaji: "kaette" }, { japanese: "しゅくだい", romaji: "shukudai" }, { japanese: "を", romaji: "o" }, { japanese: "しました", romaji: "shimashita" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P4", level: 3, fullText: "この レストランの カレーは とても おいしいですよ。でも、すこし からいですから、みずを たくさん のんでください。わたしは いつも この カレーを ちゅうもんします。",
      passageUnits: [ { japanese: "この", romaji: "kono" }, { japanese: "レストラン", romaji: "resutoran" }, { japanese: "の", romaji: "no" }, { japanese: "カレー", romaji: "karē" }, { japanese: "は", romaji: "wa" }, { japanese: "とても", romaji: "totemo" }, { japanese: "おいしい", romaji: "oishii" }, { japanese: "です", romaji: "desu" }, { japanese: "よ", romaji: "yo" }, { japanese: "でも", romaji: "demo" }, { japanese: "すこし", romaji: "sukoshi" }, { japanese: "からい", romaji: "karai" }, { japanese: "です", romaji: "desu" }, { japanese: "から", romaji: "kara" }, { japanese: "みず", romaji: "mizu" }, { japanese: "を", romaji: "o" }, { japanese: "たくさん", romaji: "takusan" }, { japanese: "のんでください", romaji: "nondekudasai" }, { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "いつも", romaji: "itsumo" }, { japanese: "この", romaji: "kono" }, { japanese: "カレー", romaji: "karē" }, { japanese: "を", romaji: "o" }, { japanese: "ちゅうもんします", romaji: "chūmonshimasu" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P5", level: 3, fullText: "きょうの てんきは あめです。かぜも すこし つよいです。あしたは はれると おもいますが、まだ さむい でしょう。",
      passageUnits: [ { japanese: "きょう", romaji: "kyō" }, { japanese: "の", romaji: "no" }, { japanese: "てんき", romaji: "tenki" }, { japanese: "は", romaji: "wa" }, { japanese: "あめ", romaji: "ame" }, { japanese: "です", romaji: "desu" }, { japanese: "かぜ", romaji: "kaze" }, { japanese: "も", romaji: "mo" }, { japanese: "すこし", romaji: "sukoshi" }, { japanese: "つよい", romaji: "tsuyoi" }, { japanese: "です", romaji: "desu" }, { japanese: "あした", romaji: "ashita" }, { japanese: "は", romaji: "wa" }, { japanese: "はれる", romaji: "hareru" }, { japanese: "と", romaji: "to" }, { japanese: "おもいます", romaji: "omoimasu" }, { japanese: "が", romaji: "ga" }, { japanese: "まだ", romaji: "mada" }, { japanese: "さむい", romaji: "samui" }, { japanese: "でしょう", romaji: "deshō" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P6", level: 3, fullText: "わたしの かぞくは よにんです。ちちと ははと あねと わたしです。ちちは かいしゃいんで、ははは せんせいです。あねは だいがくせいです。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "の", romaji: "no" }, { japanese: "かぞく", romaji: "kazoku" }, { japanese: "は", romaji: "wa" }, { japanese: "よにん", romaji: "yonin" }, { japanese: "です", romaji: "desu" }, { japanese: "ちち", romaji: "chichi" }, { japanese: "と", romaji: "to" }, { japanese: "はは", romaji: "haha" }, { japanese: "と", romaji: "to" }, { japanese: "あね", romaji: "ane" }, { japanese: "と", romaji: "to" }, { japanese: "わたし", romaji: "watashi" }, { japanese: "です", romaji: "desu" }, { japanese: "ちち", romaji: "chichi" }, { japanese: "は", romaji: "wa" }, { japanese: "かいしゃいん", romaji: "kaishain" }, { japanese: "で", romaji: "de" }, { japanese: "はは", romaji: "wa" }, { japanese: "せんせい", romaji: "sensei" }, { japanese: "です", romaji: "desu" }, { japanese: "あね", romaji: "ane" }, { japanese: "は", romaji: "wa" }, { japanese: "だいがくせい", romaji: "daigakusei" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P7", level: 3, fullText: "この デパートの しょくひんうりばは ちかに あります。そこで おいしい ケーキを かうことが できます。わたしは きのう そこで ケーキを みっつ かいました。",
      passageUnits: [ { japanese: "この", romaji: "kono" }, { japanese: "デパート", romaji: "depāto" }, { japanese: "の", romaji: "no" }, { japanese: "しょくひんうりば", romaji: "shokuhin'uriba" }, { japanese: "は", romaji: "wa" }, { japanese: "ちか", romaji: "chika" }, { japanese: "に", romaji: "ni" }, { japanese: "あります", romaji: "arimasu" }, { japanese: "そこで", romaji: "sokode" }, { japanese: "おいしい", romaji: "oishii" }, { japanese: "ケーキ", romaji: "kēki" }, { japanese: "を", romaji: "o" }, { japanese: "かう", romaji: "kau" }, { japanese: "こと", romaji: "koto" }, { japanese: "が", romaji: "ga" }, { japanese: "できます", romaji: "dekimasu" }, { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "きのう", romaji: "kinō" }, { japanese: "そこで", romaji: "sokode" }, { japanese: "ケーキ", romaji: "kēki" }, { japanese: "を", romaji: "o" }, { japanese: "みっつ", romaji: "mittsu" }, { japanese: "かいました", romaji: "kaimashita" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P8", level: 3, fullText: "わたしは しろい シャツを きて、くろい ズボンを はいています。そして、あたらしい くつも はいています。この くつは とても すきです。",
      passageUnits: [ { japanese: "わたし", romaji: "watashi" }, { japanese: "は", romaji: "wa" }, { japanese: "しろい", romaji: "shiroi" }, { japanese: "シャツ", romaji: "shatsu" }, { japanese: "を", romaji: "o" }, { japanese: "きて", romaji: "kite" }, { japanese: "くろい", romaji: "kuroi" }, { japanese: "ズボン", romaji: "zubon" }, { japanese: "を", romaji: "o" }, { japanese: "はいています", romaji: "haiteimasu" }, { japanese: "そして", romaji: "soshite" }, { japanese: "あたらしい", romaji: "atarashii" }, { japanese: "くつ", romaji: "kutsu" }, { japanese: "も", romaji: "mo" }, { japanese: "はいています", romaji: "haiteimasu" }, { japanese: "この", romaji: "kono" }, { japanese: "くつ", romaji: "kutsu" }, { japanese: "は", romaji: "wa" }, { japanese: "とても", romaji: "totemo" }, { japanese: "すき", romaji: "suki" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P9", level: 3, fullText: "こどもの とき、よく こうえんで あそびました。ともだちと やきゅうを したり、じてんしゃに のったり しました。とても たのしい おもいでです。",
      passageUnits: [ { japanese: "こども", romaji: "kodomo" }, { japanese: "の", romaji: "no" }, { japanese: "とき", romaji: "toki" }, { japanese: "よく", romaji: "yoku" }, { japanese: "こうえん", romaji: "kōen" }, { japanese: "で", romaji: "de" }, { japanese: "あそびました", romaji: "asobimashita" }, { japanese: "ともだち", romaji: "tomodachi" }, { japanese: "と", romaji: "to" }, { japanese: "やきゅう", romaji: "yakyū" }, { japanese: "を", romaji: "o" }, { japanese: "したり", romaji: "shitari" }, { japanese: "じてんしゃ", romaji: "jitensha" }, { japanese: "に", romaji: "ni" }, { japanese: "のったり", romaji: "nottari" }, { japanese: "しました", romaji: "shimashita" }, { japanese: "とても", romaji: "totemo" }, { japanese: "たのしい", romaji: "tanoshii" }, { japanese: "おもいで", romaji: "omoide" }, { japanese: "です", romaji: "desu" } ],
      sourceInfo: "User Provided (Passage)"
    },
    {
      id: "L3_P10", level: 3, fullText: "あしたの ごご、としょかんで にほんごの べんきょうを します。それから、ともだちと カフェで コーヒーを のむ かもしれません。たのしみに しています。",
      passageUnits: [ { japanese: "あした", romaji: "ashita" }, { japanese: "の", romaji: "no" }, { japanese: "ごご", romaji: "gogo" }, { japanese: "としょかん", romaji: "toshokan" }, { japanese: "で", romaji: "de" }, { japanese: "にほんご", romaji: "nihongo" }, { japanese: "の", romaji: "no" }, { japanese: "べんきょう", romaji: "benkyō" }, { japanese: "を", romaji: "o" }, { japanese: "します", romaji: "shimasu" }, { japanese: "それから", romaji: "sorekara" }, { japanese: "ともだち", romaji: "tomodachi" }, { japanese: "と", romaji: "to" }, { japanese: "カフェ", romaji: "kafe" }, { japanese: "で", romaji: "de" }, { japanese: "コーヒー", romaji: "kōhī" }, { japanese: "を", romaji: "o" }, { japanese: "のむ", romaji: "nomu" }, { japanese: "かもしれません", romaji: "kamoshiremasen" }, { japanese: "たのしみ", romaji: "tanoshimi" }, { japanese: "に", romaji: "ni" }, { japanese: "しています", romaji: "shiteimasu" } ],
      sourceInfo: "User Provided (Passage)"
    },
  ],
};
