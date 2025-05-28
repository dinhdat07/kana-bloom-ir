
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ScreenId, MazeLevelData, PlayerPosition } from '../types';
import { MAZE_LEVELS_DATA } from '../gameConfigConstants';
import { UI_COLORS, UI_THEME } from '../uiConstants';
import Button from '../components/Button';
import ScreenWrapper from '../components/ScreenWrapper';
import { initializeMazeLevel, attemptMovePlayer, MazeGameState, TILE_SIZE_MAZE as INITIAL_TILE_SIZE } from '../services/mazeGameLogic';

interface MazeQuestScreenProps {
  navigateTo: (screenId: ScreenId) => void;
}

const MazeQuestScreen: React.FC<MazeQuestScreenProps> = ({ navigateTo }) => {
  const [isFullScreen, setIsFullScreen] = useState(false); // Default to non-fullscreen
  const [gameState, setGameState] = useState<MazeGameState>(() => initializeMazeLevel(MAZE_LEVELS_DATA[0]));
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [tileSize, setTileSize] = useState(INITIAL_TILE_SIZE);
  const containerRef = useRef<HTMLDivElement>(null); // Ref for the canvas container

  const currentLevelData = gameState.levelData || MAZE_LEVELS_DATA[0];

  const drawMaze = useCallback(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas || !currentLevelData) return;

    const { layout, kanaSpots } = currentLevelData;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    layout.forEach((row, y) => {
      row.forEach((cell, x) => {
        if (cell === 'W') ctx.fillStyle = UI_COLORS.primaryInteractivePinkFrom;
        else if (cell === 'S') ctx.fillStyle = '#A9D1F7';
        else if (cell === 'E') ctx.fillStyle = '#A0E0A0';
        else ctx.fillStyle = UI_COLORS.lavenderBlushBg;
        
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
                ctx.shadowBlur = 12;
            }
            ctx.fillText(spot.kana, spot.x * tileSize + tileSize / 2, spot.y * tileSize + tileSize / 2);
            ctx.shadowBlur = 0; 
        }
    });

    ctx.fillStyle = '#C70039';
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
        const containerWidth = containerRef.current.offsetWidth - 10; // Small padding within canvas container
        const numCols = currentLevelData.layout[0]?.length || 10;
        const numRows = currentLevelData.layout.length || 10;
        
        const sizeByWidth = Math.max(10, Math.floor(containerWidth / numCols));

        // Estimate available height for the canvas area
        const fixedVerticalSpace = isFullScreen ? 100 : 140; // Approx pixels for title + buttons + margins
        const screenHeightForCanvas = window.innerHeight - (isFullScreen ? 0 : 40); // Account for app shell padding if not fullscreen
        const availableCanvasHeight = screenHeightForCanvas - fixedVerticalSpace;
        
        const sizeByHeight = Math.max(10, Math.floor(availableCanvasHeight / numRows));
        
        setTileSize(Math.min(sizeByWidth, sizeByHeight, INITIAL_TILE_SIZE * (isFullScreen ? 2.2 : 1.8)));
      }
    };

    calculateTileSize();
    const debouncedCalculateTileSize = setTimeout(calculateTileSize, 50); // Recalculate slightly after potential reflow

    window.addEventListener('resize', calculateTileSize);
    return () => {
      clearTimeout(debouncedCalculateTileSize);
      window.removeEventListener('resize', calculateTileSize);
    };
  }, [currentLevelData, isFullScreen, gameState.currentLevelIndex]);


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
  }, [gameState]);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'ArrowUp': event.preventDefault(); handleMove(0, -1); break;
        case 'ArrowDown': event.preventDefault(); handleMove(0, 1); break;
        case 'ArrowLeft': event.preventDefault(); handleMove(-1, 0); break;
        case 'ArrowRight': event.preventDefault(); handleMove(1, 0); break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleMove]);

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

    if (diffX === 0 && diffY === 0) return; 

    let dx = 0;
    let dy = 0;

    if (Math.abs(diffX) > Math.abs(diffY)) {
      dx = Math.sign(diffX);
    } else if (Math.abs(diffY) > Math.abs(diffX)) {
      dy = Math.sign(diffY);
    } else { 
      if (Math.random() < 0.5) { // Prefer horizontal on exact diagonal
        dx = Math.sign(diffX);
      } else {
        dy = Math.sign(diffY);
      }
      if (dx === 0 && dy === 0 && diffX !== 0) dx = Math.sign(diffX); // fallback if random chose 0 move
      if (dx === 0 && dy === 0 && diffY !== 0) dy = Math.sign(diffY);
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
    ? "fixed inset-0 !p-2 md:!p-3 z-50 !bg-[var(--color-lavender-blush-bg)] !max-w-full !max-h-full !rounded-none overflow-y-auto"
    : "max-w-4xl"; 

  return (
    <ScreenWrapper title={`🗺️ Maze Quest - Lv ${currentLevelData.levelNum}`} className={`${screenWrapperClasses}`}>
      {/* This inner div ensures correct flex behavior for mt-auto on buttons */}
      <div className="flex flex-col flex-grow w-full">
        {/* Main content area: Canvas and Info Panel */}
        <div className="flex flex-col lg:flex-row lg:gap-x-5 w-full items-start flex-grow mb-3 lg:mb-5">
          {/* Canvas Area (Left on LG, Bottom on SM) */}
          <div ref={containerRef} className="w-full lg:w-[calc(60%-0.625rem)] xl:w-[calc(65%-0.625rem)] order-2 lg:order-1 flex justify-center items-center mt-3 lg:mt-0 min-h-[150px]"> {/* min-h for initial calculation */}
            <canvas
              ref={canvasRef}
              width={canvasWidth}
              height={canvasHeight}
              onClick={handleCanvasClick}
              className="border-2 border-[var(--color-soft-pink-border)] rounded-lg shadow-xl bg-[rgba(255,250,250,0.95)] cursor-pointer max-w-full"
              style={{ touchAction: 'none' }} 
            />
          </div>

          {/* Info Panel (Right on LG, Top on SM) */}
          <div className="w-full lg:w-[calc(40%-0.625rem)] xl:w-[calc(35%-0.625rem)] order-1 lg:order-2 space-y-2.5 lg:space-y-3 text-center lg:text-left">
            <div className="mt-1">
              <h3 className={`${UI_THEME.fontDisplay} text-[var(--color-stimulus-highlight)] text-xl sm:text-2xl md:text-3xl text-shadow-cute`}>
                Target: {currentLevelData.words[gameState.currentTargetWordIndex].kana}
              </h3>
              <p className={`${UI_THEME.fontKana} text-2xl sm:text-3xl md:text-4xl text-[var(--color-primary-text)] break-all`}>
                {targetWordDisplay}
              </p>
            </div>
            <p className={`text-sm sm:text-base text-[var(--color-main-text)] min-h-[50px] sm:min-h-[60px] bg-[rgba(255,240,245,0.8)] p-2.5 rounded-lg shadow-md flex items-center justify-center lg:justify-start`}>
              {gameState.message || "Use arrow keys or tap to move."}
            </p>
          </div>
        </div>

        {/* Controls Area - Pushed to bottom */}
        <div className="mt-auto pt-3 flex flex-col sm:flex-row gap-3 justify-center items-center border-t border-[var(--color-soft-pink-border)] border-opacity-60">
          <Button onClick={() => setGameState(initializeMazeLevel(currentLevelData))} variant="default" icon="🔄" className="py-2.5 px-5 text-sm sm:text-base">
            Reset Level
          </Button>
          <Button onClick={() => navigateTo(ScreenId.ScriptSelect)} variant="danger" icon="🛑" className="py-2.5 px-5 text-sm sm:text-base">
            Exit Maze
          </Button>
          <Button onClick={() => setIsFullScreen(!isFullScreen)} variant="secondary" icon={isFullScreen ? " ✨" : "🌟"} className="py-2.5 px-5 text-sm sm:text-base">
            {isFullScreen ? "Minimize View" : "Maximize View"}
          </Button>
        </div>
      </div>
    </ScreenWrapper>
  );
};

export default MazeQuestScreen;
