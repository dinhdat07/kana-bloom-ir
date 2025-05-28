"use client"

import type React from "react"
import { useState, useCallback, useEffect } from "react"
import {
  ScreenId,
  type ScriptType,
  DrillLevel,
  type Question,
  type GameConfig,
  type DrillStats,
  type PetalEventConfig,
  type PetalDifficultyContext,
  type ImmersiveReadingStats,
  type ReadingPassage,
} from "./types" // Added ImmersiveReadingStats, ReadingPassage

import ScriptSelectScreen from "./screens/ScriptSelectScreen"
import LineSelectScreen from "./screens/LineSelectScreen"
import LevelSelectScreen from "./screens/LevelSelectScreen"
import DrillScreen from "./screens/DrillScreen"
import ResultsScreen from "./screens/ResultsScreen"
import MazeQuestScreen from "./screens/MazeQuestScreen"
import ImmersiveReadingLevelSelectScreen from "./screens/ImmersiveReadingLevelSelectScreen"
import ImmersiveReadingScreen from "./screens/ImmersiveReadingScreen"
import SakuraAnimation from "./components/SakuraAnimation"
import { TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL, IMMERSIVE_READING_LEVELS } from "./gameConfigConstants"
import { prepareDrillSet } from "./services/drillService"
import { shuffleArray } from "./services/linguisticUtils"
import { configureAzureTTS } from "./services/azureTtsService"

const App: React.FC = () => {
  const [currentScreen, setCurrentScreen] = useState<ScreenId>(ScreenId.ScriptSelect)
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    selectedScript: null,
    selectedLineId: null,
    selectedLevel: null,
    selectedImmersiveReadingLevel: undefined,
  })

  const [currentDrillSet, setCurrentDrillSet] = useState<Question[]>([])
  const [currentQuestionNum, setCurrentQuestionNum] = useState<number>(0)
  const [drillScore, setDrillScore] = useState<number>(0)
  const [finalDrillStats, setFinalDrillStats] = useState<DrillStats>({ correct: 0, total: 0 })

  const [immersiveReadingLevel, setImmersiveReadingLevel] = useState<1 | 2 | 3 | null>(null)
  const [immersiveReadingPassages, setImmersiveReadingPassages] = useState<ReadingPassage[]>([])
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentPassageIndex, setCurrentPassageIndex] = useState<number>(0)
  const [immersiveReadingStats, setImmersiveReadingStats] = useState<ImmersiveReadingStats>({
    wordsCorrect: 0,
    wordsTotal: 0,
    passagesCompleted: 0,
    totalPassagesInLevel: TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL,
  })

  const [petalEventConfig, setPetalEventConfig] = useState<PetalEventConfig | null>(null)
  const [petalDifficultyContext, setPetalDifficultyContext] = useState<PetalDifficultyContext>(DrillLevel.Medium)

  const [isTtsPreferenceEnabled, setIsTtsPreferenceEnabled] = useState<boolean>(false)
  const [userAzureApiKey, setUserAzureApiKey] = useState<string | null>(null)
  const azureRegion = "australiaeast"

  useEffect(() => {
    configureAzureTTS(userAzureApiKey, azureRegion)
  }, [userAzureApiKey])

  const isTtsEffectivelyEnabled = isTtsPreferenceEnabled

  const navigateTo = useCallback((screenId: ScreenId) => {
    setPetalEventConfig({ type: "swirlAway" })
    setTimeout(() => {
      setCurrentScreen(screenId)
      setPetalEventConfig(null)
    }, 300)
  }, [])

  const selectScript = useCallback((script: ScriptType) => {
    setGameConfig((prev) => ({ ...prev, selectedScript: script, selectedLineId: null, selectedLevel: null }))
  }, [])

  const selectLine = useCallback((lineId: string | null) => {
    setGameConfig((prev) => ({ ...prev, selectedLineId: lineId, selectedLevel: null }))
  }, [])

  const selectLevel = useCallback((level: DrillLevel) => {
    setGameConfig((prev) => ({ ...prev, selectedLevel: level }))
  }, [])

  const toggleTtsPreference = useCallback(() => {
    setIsTtsPreferenceEnabled((prev) => !prev)
  }, [])

  const startDrill = useCallback(
    (levelToStartWith: DrillLevel) => {
      if (gameConfig.selectedScript && levelToStartWith) {
        setGameConfig((prev) => ({ ...prev, selectedLevel: levelToStartWith }))
        setPetalDifficultyContext(levelToStartWith)

        const newDrillSet = prepareDrillSet(gameConfig.selectedScript, gameConfig.selectedLineId, levelToStartWith)
        setCurrentDrillSet(newDrillSet)
        setCurrentQuestionNum(0)
        setDrillScore(0)
        navigateTo(ScreenId.Drill)
      } else {
        navigateTo(ScreenId.ScriptSelect)
      }
    },
    [gameConfig.selectedScript, gameConfig.selectedLineId, navigateTo],
  )

  const loadNextQuestion = useCallback((): Question | null => {
    const nextNum = currentQuestionNum + 1
    if (nextNum < currentDrillSet.length) {
      setCurrentQuestionNum(nextNum)
      return currentDrillSet[nextNum]
    }
    return null
  }, [currentQuestionNum, currentDrillSet])

  const updateScore = useCallback((isCorrect: boolean) => {
    if (isCorrect) {
      setDrillScore((prev) => prev + 1)
    }
  }, [])

  const triggerCorrectAnswerPetalBurst = useCallback((x: number, y: number, count: number) => {
    setPetalEventConfig({ type: "burst", x, y, count })
    setTimeout(() => setPetalEventConfig(null), 500)
  }, [])

  const triggerResultsPetalShower = useCallback((active: boolean) => {
    setPetalEventConfig({ type: "resultsShower", active })
    if (!active) {
      setTimeout(() => setPetalEventConfig(null), 100)
    }
  }, [])

  const handleDrillCompletion = useCallback(() => {
    const newFinalStats = {
      correct: drillScore,
      total: currentDrillSet.length > 0 ? currentDrillSet.length : 0,
    }
    setFinalDrillStats(newFinalStats)
    navigateTo(ScreenId.Results)
  }, [drillScore, currentDrillSet.length, navigateTo])

  const restartDrill = useCallback(() => {
    if (gameConfig.selectedLevel) {
      triggerResultsPetalShower(false)
      startDrill(gameConfig.selectedLevel)
    } else {
      navigateTo(ScreenId.LevelSelect)
    }
  }, [startDrill, gameConfig.selectedLevel, navigateTo, triggerResultsPetalShower])

  const startImmersiveReadingLevel = useCallback(
    (level: 1 | 2 | 3) => {
      setImmersiveReadingLevel(level)
      const passagesForLevel = IMMERSIVE_READING_LEVELS[level] || []
      const selectedPassages = shuffleArray(passagesForLevel).slice(0, TOTAL_PASSAGES_PER_IMMERSIVE_LEVEL)
      setImmersiveReadingPassages(selectedPassages)
      setCurrentPassageIndex(0)
      setImmersiveReadingStats({
        wordsCorrect: 0,
        wordsTotal: 0,
        passagesCompleted: 0,
        totalPassagesInLevel: selectedPassages.length,
      })
      setGameConfig((prev) => ({ ...prev, selectedImmersiveReadingLevel: level }))
      navigateTo(ScreenId.ImmersiveReading)
    },
    [navigateTo],
  )

  const handleImmersiveReadingCompletion = useCallback(
    (stats: ImmersiveReadingStats) => {
      setFinalDrillStats({ correct: stats.wordsCorrect, total: stats.wordsTotal })
      navigateTo(ScreenId.Results)
    },
    [navigateTo],
  )

  const restartImmersiveReadingLevel = useCallback(() => {
    if (gameConfig.selectedImmersiveReadingLevel) {
      triggerResultsPetalShower(false)
      startImmersiveReadingLevel(gameConfig.selectedImmersiveReadingLevel)
    } else {
      navigateTo(ScreenId.ImmersiveReadingLevelSelect)
    }
  }, [startImmersiveReadingLevel, gameConfig.selectedImmersiveReadingLevel, navigateTo, triggerResultsPetalShower])

  const renderScreen = () => {
    switch (currentScreen) {
      case ScreenId.ScriptSelect:
        return (
          <ScriptSelectScreen
            navigateTo={navigateTo}
            selectScript={selectScript}
            isTtsPreferenceEnabled={isTtsPreferenceEnabled}
            toggleTtsPreference={toggleTtsPreference} // Simple on/off toggle
            isTtsEffectivelyEnabled={isTtsEffectivelyEnabled}
          />
        )
      case ScreenId.LineSelect:
        return (
          <LineSelectScreen
            navigateTo={navigateTo}
            selectedScript={gameConfig.selectedScript}
            selectLine={selectLine}
          />
        )
      case ScreenId.LevelSelect:
        return <LevelSelectScreen navigateTo={navigateTo} selectLevel={selectLevel} startDrill={startDrill} />
      case ScreenId.Drill:
        return (
          <DrillScreen
            navigateTo={navigateTo}
            currentDrillSet={currentDrillSet}
            currentQuestionNum={currentQuestionNum}
            loadNextQuestion={loadNextQuestion}
            updateScore={updateScore}
            handleDrillCompletion={handleDrillCompletion}
            displayScore={drillScore}
            triggerPetalBurst={triggerCorrectAnswerPetalBurst}
            isTtsEnabled={isTtsEffectivelyEnabled}
          />
        )
      case ScreenId.Results:
        const restartAction = gameConfig.selectedImmersiveReadingLevel ? restartImmersiveReadingLevel : restartDrill
        const backNavigationTarget = gameConfig.selectedImmersiveReadingLevel
          ? ScreenId.ImmersiveReadingLevelSelect
          : ScreenId.LevelSelect
        return (
          <ResultsScreen
            navigateTo={(screenId) => navigateTo(screenId === ScreenId.LevelSelect ? backNavigationTarget : screenId)}
            finalStats={finalDrillStats}
            restartDrill={restartAction}
            triggerResultsPetalShower={triggerResultsPetalShower}
          />
        )
      case ScreenId.MazeQuest:
        return <MazeQuestScreen navigateTo={navigateTo} />
      case ScreenId.ImmersiveReadingLevelSelect:
        return (
          <ImmersiveReadingLevelSelectScreen
            navigateTo={navigateTo}
            startImmersiveReadingLevel={startImmersiveReadingLevel}
          />
        )
      case ScreenId.ImmersiveReading:
        return (
          <ImmersiveReadingScreen
            navigateTo={navigateTo}
            level={immersiveReadingLevel!}
            passages={immersiveReadingPassages}
            onComplete={handleImmersiveReadingCompletion}
            isTtsEnabled={isTtsEffectivelyEnabled}
          />
        )
      default:
        return (
          <ScriptSelectScreen
            navigateTo={navigateTo}
            selectScript={selectScript}
            isTtsPreferenceEnabled={isTtsPreferenceEnabled}
            toggleTtsPreference={toggleTtsPreference}
            isTtsEffectivelyEnabled={isTtsEffectivelyEnabled}
          />
        )
    }
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col">
      <SakuraAnimation
        numPetals={30}
        petalEventConfig={petalEventConfig}
        petalDifficultyContext={petalDifficultyContext}
      />
      <div className="relative z-10 flex-grow flex items-center justify-center p-2 sm:p-4">{renderScreen()}</div>

      <footer className={`text-center text-xs text-[var(--color-primary-text)] opacity-75 py-3.5 relative z-0`}>
        Duc Manh Nghiem - S386773
      </footer>
    </div>
  )
}

export default App
