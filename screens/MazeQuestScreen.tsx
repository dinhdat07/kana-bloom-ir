
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenId, MazeLevelData, PlayerPosition } from '../types';
import { MAZE_LEVELS_DATA } from '../gameConfigConstants';
import { UI_COLORS, UI_THEME } from '../uiConstants';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
// DPad import removed
import { initializeMazeLevel, attemptMovePlayer, MazeGameState, TILE_SIZE_MAZE as INITIAL_TILE_SIZE } from '../services/mazeGameLogic';

interface MazeQuestScreenProps {
  navigateTo: (screenId: ScreenId) => void;
}

const MazeQuestScreen: React.FC<MazeQuestScreenProps> = ({ navigateTo }) => {
  const [isFullScreen, setIsFullScreen] = useState(true); 
  const [gameState, setGameState] = useState<MazeGameState>(() => initializeMazeLevel(MAZE_LEVELS_DATA[0]));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tileSize, setTileSize] = useState(INITIAL_TILE_SIZE);
  const containerRef = useRef<HTMLDivElement>(null);

  const currentLevelData = gameState.levelData || MAZE_LEVELS_DATA[0]; 

  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !currentLevelData) return;

    const { layout, kanaSpots } = currentLevelData;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layout.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'W') ctx.fillStyle = UI_COLORS.primaryInteractivePinkFrom; // Wall: Brighter Pink
        else if (cell === 'S') ctx.fillStyle = '#A9D1F7'; // Start: Softer light blue
        else if (cell === 'E') ctx.fillStyle = '#A0E0A0'; // Exit: Softer light green
        else ctx.fillStyle = UI_COLORS.lavenderBlushBg; // Path: Matches body bg
        
        ctx.fillRect(x * tileSize, y * tileSize, tileSize, tileSize);
        ctx.strokeStyle = UI_COLORS.softPinkBorder; 
        ctx.strokeRect(x * tileSize, y * tileSize, tileSize, tileSize);
      });
    });
    
    const targetWord = currentLevelData.words[gameState.currentTargetWordIndex];
    const collectedSet = new Set(gameState.collectedKanaSequence);

    kanaSpots.forEach(spot => {
        if (targetWord.constituentKana.includes(spot.kana) && !collectedSet.has(spot.kana)) {
            const isNextNeeded = targetWord.constituentKana[gameState.collectedKanaSequence.length] === spot.kana;
            ctx.fillStyle = UI_COLORS.stimulusDisplayPink; 
            ctx.font = `${tileSize * 0.7}px ${UI_THEME.fontDisplay}`; 
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            if(isNextNeeded) { 
                ctx.shadowColor = UI_COLORS.stimulusDisplayPink;
                ctx.shadowBlur = 12; // Enhanced glow
            }
            ctx.fillText(spot.kana, spot.x * tileSize + tileSize / 2, spot.y * tileSize + tileSize / 2);
            ctx.shadowBlur = 0; 
        }
    });

    ctx.fillStyle = '#C70039'; // Player: Richer, deeper pink
    ctx.beginPath();
    ctx.arc(
      gameState.playerPos.x * tileSize + tileSize / 2,
      gameState.playerPos.y * tileSize + tileSize / 2,
      tileSize / 2.7, 
      0,
      2 * Math.PI
    );
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.8)';
    ctx.lineWidth = 2.5;
    ctx.stroke();
    ctx.lineWidth = 1;

  }, [gameState.playerPos, gameState.collectedKanaSequence, gameState.currentTargetWordIndex, currentLevelData, tileSize]);


  useEffect(() => {
    const calculateTileSize = () => {
      if (containerRef.current && currentLevelData) {
        const containerWidth = containerRef.current.offsetWidth - 20; 
        const numCols = currentLevelData.layout[0]?.length || 10;
        const numRows = currentLevelData.layout.length || 10;
        const sizeByWidth = containerWidth / numCols;
        const availableHeight = isFullScreen ? window.innerHeight * 0.58 : window.innerHeight * 0.4; // Slightly more height in fullscreen
        const sizeByHeight = availableHeight / numRows; 
        setTileSize(Math.floor(Math.min(sizeByWidth, sizeByHeight, INITIAL_TILE_SIZE * 1.9))); 
      }
    };

    calculateTileSize();
    window.addEventListener('resize', calculateTileSize);
    return () => window.removeEventListener('resize', calculateTileSize);
  }, [currentLevelData, isFullScreen]);


  useEffect(() => {
    drawMaze();
  }, [drawMaze, tileSize]); 

  const handleMove = useCallback((dx: number, dy: number) => {
    const updates = attemptMovePlayer(gameState, dx, dy);
    setGameState(prev => ({ ...prev, ...updates }));

    if (updates.message?.includes("Complete!")) {
      const nextLevelIndex = gameState.currentLevelIndex + 1;
      if (nextLevelIndex < MAZE_LEVELS_DATA.length) {
        setTimeout(() => {
          setGameState(initializeMazeLevel(MAZE_LEVELS_DATA[nextLevelIndex]));
        }, 2000);
      } else {
        setTimeout(() => {
          setGameState(prev => ({...prev, message: "Congratulations! All mazes cleared! 👑💖🎉"}))
        }, 2000);
      }
    }
  }, [gameState]); // Added gameState to dependencies

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp': handleMove(0, -1); break;
        case 'ArrowDown': handleMove(0, 1); break;
        case 'ArrowLeft': handleMove(-1, 0); break;
        case 'ArrowRight': handleMove(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]); // Changed gameState to handleMove

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const clickX = event.clientX - rect.left;
    const clickY = event.clientY - rect.top;

    const tappedGridX = Math.floor(clickX / tileSize);
    const tappedGridY = Math.floor(clickY / tileSize);

    const playerGridX = gameState.playerPos.x;
    const playerGridY = gameState.playerPos.y;

    const diffX = tappedGridX - playerGridX;
    const diffY = tappedGridY - playerGridY;

    let dx = 0;
    let dy = 0;

    if (diffX === 0 && diffY === 0) {
      return; // Tapped on player's current cell
    }

    if (Math.abs(diffX) > Math.abs(diffY)) {
      dx = Math.sign(diffX);
    } else if (Math.abs(diffY) > Math.abs(diffX)) {
      dy = Math.sign(diffY);
    } else { // Diagonal tap
      if (diffX !== 0) { // Prioritize horizontal
        dx = Math.sign(diffX);
      } else if (diffY !== 0) { // Then vertical
        dy = Math.sign(diffY);
      }
    }
    
    if (dx !== 0 || dy !== 0) {
        handleMove(dx, dy);
    }
  };


  if (!currentLevelData) {
    return <ScreenWrapper title="Loading Maze..."><p>Error: Maze data not found.</p></ScreenWrapper>;
  }
  
  const canvasWidth = currentLevelData.layout[0].length * tileSize;
  const canvasHeight = currentLevelData.layout.length * tileSize;

  const targetWordDisplay = currentLevelData.words[gameState.currentTargetWordIndex].constituentKana
    .map((kana, idx) => gameState.collectedKanaSequence[idx] || '_')
    .join(' ');

  const screenWrapperClasses = isFullScreen 
    ? "fixed inset-0 !p-2 md:!p-4 z-50 !bg-[var(--color-lavender-blush-bg)] !max-w-full !max-h-full !rounded-none overflow-y-auto"
    : "max-w-4xl"; 

  return (
    <ScreenWrapper title={`🗺️ Maze Quest - Lv ${currentLevelData.levelNum}`} className={screenWrapperClasses}>
      <div className="flex flex-col lg:flex-row gap-4 items-center lg:items-start w-full">
        <div ref={containerRef} className="w-full lg:w-auto flex justify-center items-center">
          <canvas 
            ref={canvasRef} 
            width={canvasWidth} 
            height={canvasHeight} 
            onClick={handleCanvasClick} 
            className="border-2 border-[var(--color-soft-pink-border)] rounded-lg shadow-lg bg-[rgba(255,250,250,0.9)] cursor-pointer"
          />
        </div>
        <div className="text-center lg:text-left lg:pl-6 space-y-3.5 flex-grow">
          <h3 className={`${UI_THEME.fontDisplay} text-[var(--color-stimulus-highlight)] text-2xl md:text-3xl text-shadow-cute`}>Target: {currentLevelData.words[gameState.currentTargetWordIndex].kana}</h3>
          <p className={`${UI_THEME.fontKana} text-3xl md:text-4xl text-[var(--color-primary-text)]`}>{targetWordDisplay}</p>
          <p className={`text-sm text-[var(--color-main-text)] min-h-[44px] bg-[rgba(255,240,245,0.7)] p-2.5 rounded-lg shadow-sm`}>{gameState.message}</p>
          {/* Reset button moved to bottom controls */}
        </div>
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3.5 justify-center items-center">
        <Button onClick={() => setGameState(initializeMazeLevel(currentLevelData))} variant="default" icon="🔄">
          Reset Level
        </Button>
        <Button onClick={() => navigateTo(ScreenId.ScriptSelect)} variant="danger" icon="🛑">
          Exit Maze
        </Button>
        <Button onClick={() => setIsFullScreen(!isFullScreen)} variant="secondary" icon={isFullScreen ? " ✨" : "🌟"}>
          {isFullScreen ? "Minimize View" : "Full View"}
        </Button>
      </div>
    </ScreenWrapper>
  );
};

export default MazeQuestScreen;
