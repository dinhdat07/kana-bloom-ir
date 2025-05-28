
import { MazeLevelData, PlayerPosition, Word } from '../types';

export const TILE_SIZE_MAZE = 40; // px, will be dynamically adjusted later

export interface MazeGameState {
  currentLevelIndex: number;
  playerPos: PlayerPosition;
  collectedKanaSequence: string[];
  currentTargetWordIndex: number; // Index in levelData.words
  wordFormationComplete: boolean;
  levelData?: MazeLevelData;
  message: string;
}

export const initializeMazeLevel = (levelData: MazeLevelData): MazeGameState => {
  let startPos: PlayerPosition = { x: 0, y: 0 };
  for (let y = 0; y < levelData.layout.length; y++) {
    for (let x = 0; x < levelData.layout[y].length; x++) {
      if (levelData.layout[y][x] === 'S') {
        startPos = { x, y };
        break;
      }
    }
  }

  return {
    currentLevelIndex: levelData.levelNum -1, // Assuming levelNum is 1-based
    playerPos: startPos,
    collectedKanaSequence: [],
    currentTargetWordIndex: 0, // Start with the first word
    wordFormationComplete: false,
    levelData: levelData,
    message: levelData.message || `Collect kana to form: ${levelData.words[0].kana}`,
  };
};

export const attemptMovePlayer = (
  currentState: MazeGameState,
  dx: number,
  dy: number
): Partial<MazeGameState> => {
  if (!currentState.levelData) return { message: "No level loaded." };

  const { playerPos, levelData } = currentState;
  const newX = playerPos.x + dx;
  const newY = playerPos.y + dy;

  // Check bounds
  if (newY < 0 || newY >= levelData.layout.length || newX < 0 || newX >= levelData.layout[newY].length) {
    return { message: "Cannot move out of bounds." };
  }

  // Check wall
  if (levelData.layout[newY][newX] === 'W') {
    return { message: "Ouch! A wall." };
  }

  // Valid move
  const newPlayerPos = { x: newX, y: newY };
  let updates: Partial<MazeGameState> = { playerPos: newPlayerPos, message: "" };

  // Check kana collection
  const targetWord = levelData.words[currentState.currentTargetWordIndex];
  const nextKanaNeeded = targetWord.constituentKana[currentState.collectedKanaSequence.length];
  
  // Check if player landed on a kana spot defined in `kanaSpots`
  const landedOnKanaSpot = levelData.kanaSpots.find(spot => spot.x === newX && spot.y === newY);
  
  if (landedOnKanaSpot && !currentState.wordFormationComplete) {
    // Check if this kana is the one we are looking for.
    // For simplicity, we assume kanaSpots are unique and their `kana` property is what matters.
    // The original blueprint describes `layout` having 'K1', 'K2' etc. which link to kana.
    // Here, we use `kanaSpots` array directly.
    if (landedOnKanaSpot.kana === nextKanaNeeded) {
      const newCollectedSequence = [...currentState.collectedKanaSequence, landedOnKanaSpot.kana];
      updates.collectedKanaSequence = newCollectedSequence;
      
      // Remove collected kana visually (actual removal from `kanaSpots` might be needed or a 'collected' flag)
      // For now, just feedback.
      updates.message = `Collected ${landedOnKanaSpot.kana}!`;

      if (newCollectedSequence.length === targetWord.constituentKana.length) {
        updates.wordFormationComplete = true;
        updates.message = `Word "${targetWord.kana}" formed! Head to the Exit (E).`;
      } else {
        updates.message = `Collected ${landedOnKanaSpot.kana}! Next: ${targetWord.constituentKana[newCollectedSequence.length]}`;
      }
    } else {
      updates.message = `That's ${landedOnKanaSpot.kana}, but you need ${nextKanaNeeded} next.`;
    }
  }

  // Check win condition
  if (currentState.wordFormationComplete && levelData.layout[newY][newX] === 'E') {
    updates.message = `Level ${levelData.levelNum} Complete! 🎉`;
    // Logic for advancing to next level would go here (e.g. update currentLevelIndex, load new level)
    // For now, just a win message. This state should trigger navigation in the UI.
  }
  
  return updates;
};
