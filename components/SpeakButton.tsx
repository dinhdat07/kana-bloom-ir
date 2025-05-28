"use client"

import { useState, useEffect, useCallback, useRef, forwardRef } from "react"
import { speakWithAzureTTS, cancelAzureTTS } from "../services/azureTtsService"

interface SpeakButtonProps {
  textToSpeak: string
  lang?: string
  className?: string
  disabled?: boolean // This prop now reflects if TTS is effectively enabled in App.tsx
  onTtsBusy?: () => void // Called when TTS starts loading or speaking
  onTtsIdle?: () => void // Called when TTS finishes, errors, or is cancelled
}

// Sử dụng forwardRef để chấp nhận ref từ component cha
const SpeakButton = forwardRef<HTMLButtonElement, SpeakButtonProps>(
  ({ textToSpeak, lang = "ja-JP", className = "", disabled = false, onTtsBusy, onTtsIdle }, ref) => {
    const [ttsState, setTtsState] = useState<"idle" | "loading" | "speaking" | "error">("idle")
    const [errorMessage, setErrorMessage] = useState<string | null>(null)
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioActionIdRef = useRef(0)

    // Effect to call onTtsIdle when ttsState changes to idle or error from another state
    useEffect(() => {
      if (ttsState === "idle" || ttsState === "error") {
        onTtsIdle?.()
      }
      if (ttsState === "loading" || ttsState === "speaking") {
        onTtsBusy?.()
      }
    }, [ttsState, onTtsIdle, onTtsBusy])

    useEffect(() => {
      // Cleanup function when component unmounts or textToSpeak changes
      return () => {
        if (audioRef.current) {
          audioRef.current.pause()
          // Revoke object URL if it exists from a previous audio element
          if (audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
            URL.revokeObjectURL(audioRef.current.src)
          }
        }
        cancelAzureTTS()
        // No direct setTtsState here to avoid issues if component unmounts during an operation.
        // The onTtsIdle should have been called if it was in a busy state.
      }
    }, [textToSpeak]) // Re-run cleanup if textToSpeak changes

    const handleSpeak = useCallback(async () => {
      const currentActionId = ++audioActionIdRef.current

      if (disabled || !textToSpeak.trim()) {
        if (ttsState === "speaking" && audioRef.current) {
          audioRef.current.pause() // This will trigger 'onended' or 'onpause' which should set idle
        }
        if (ttsState !== "idle" && ttsState !== "error") setTtsState("idle")
        return
      }

      // If already speaking, clicking again should stop it.
      if (ttsState === "speaking" && audioRef.current) {
        audioRef.current.pause() // This should trigger onended/onpause logic
        cancelAzureTTS() // Cancel any underlying Azure request
        setTtsState("idle")
        return
      }
      // If loading, do nothing on click (or could implement cancel)
      if (ttsState === "loading") return

      setTtsState("loading")
      setErrorMessage(null)

      try {
        const audioBlob = await speakWithAzureTTS(textToSpeak, lang)

        if (audioActionIdRef.current !== currentActionId) {
          if (audioBlob) {
            URL.revokeObjectURL(URL.createObjectURL(audioBlob))
          }
          // If action ID changed, this operation is stale. Ensure state is reset if needed.
          // No explicit setTtsState here, let the new operation control it.
          return
        }

        if (!audioBlob) {
          setErrorMessage("Received no audio data from Azure.")
          setTtsState("error")
          return
        }

        const audioUrl = URL.createObjectURL(audioBlob)

        // Clean up previous audio element if it exists
        if (audioRef.current && audioRef.current.src && audioRef.current.src.startsWith("blob:")) {
          URL.revokeObjectURL(audioRef.current.src)
        }

        const newAudio = new Audio(audioUrl)
        audioRef.current = newAudio

        const cleanupAudioListeners = () => {
          newAudio.oncanplaythrough = null
          newAudio.onplaying = null
          newAudio.onended = null
          newAudio.onerror = null
          newAudio.onpause = null
        }

        const onEndedOrErrorOrPause = () => {
          if (audioActionIdRef.current === currentActionId || audioRef.current === newAudio) {
            setTtsState("idle")
          }
          URL.revokeObjectURL(audioUrl)
          cleanupAudioListeners()
        }

        newAudio.oncanplaythrough = () => {
          if (audioActionIdRef.current === currentActionId) {
            newAudio.play().catch((e) => {
              console.error("Error playing audio:", e)
              setErrorMessage("Could not play audio.")
              if (audioActionIdRef.current === currentActionId) {
                setTtsState("error")
              } else {
                onEndedOrErrorOrPause() // ensure cleanup if stale
              }
            })
          } else {
            onEndedOrErrorOrPause() // Stale action, cleanup and set idle
          }
        }
        newAudio.onplaying = () => {
          if (audioActionIdRef.current === currentActionId) {
            setTtsState("speaking")
          }
        }

        newAudio.onended = onEndedOrErrorOrPause
        newAudio.onpause = onEndedOrErrorOrPause // Treat pause like end for state management
        newAudio.onerror = (e) => {
          console.error("Audio element error:", e)
          setErrorMessage("Audio playback error.")
          if (audioActionIdRef.current === currentActionId) {
            setTtsState("error")
          } else {
            onEndedOrErrorOrPause() // ensure cleanup if stale
          }
        }
        newAudio.load()
      } catch (error) {
        if (audioActionIdRef.current === currentActionId) {
          console.error("Azure TTS Error in SpeakButton:", error)
          const message = error instanceof Error ? error.message : "TTS synthesis failed."
          setErrorMessage(message.includes("configured") ? "TTS not configured." : "Azure TTS Error.")
          setTtsState("error")
        } else {
          // Error for a superseded action, log it but don't update state for current view
          console.log("Error for superseded Azure TTS action:", error)
        }
      }
    }, [textToSpeak, lang, disabled, ttsState])

    let buttonIcon = "🔊"
    let buttonTitle = `Speak "${textToSpeak}"`
    let effectiveDisabled = disabled

    if (disabled) {
      buttonTitle = "Sound is off or API key missing"
    } else {
      switch (ttsState) {
        case "loading":
          buttonIcon = "⏳"
          buttonTitle = "Loading audio..."
          effectiveDisabled = true
          break
        case "speaking":
          buttonIcon = "💬"
          buttonTitle = "Speaking... (Click to stop)"
          break
        case "error":
          buttonIcon = "⚠️"
          buttonTitle = `Error: ${errorMessage || "TTS failed"}. Click to retry.`
          break
        default: // idle
          buttonIcon = "🔊"
          buttonTitle = `Speak "${textToSpeak}"`
          break
      }
    }

    return (
      <button
        ref={ref} // Thêm ref vào button element
        onClick={handleSpeak}
        disabled={effectiveDisabled && ttsState !== "speaking" && ttsState !== "error"}
        title={buttonTitle}
        className={`p-2.5 rounded-full transition-all duration-150 focus:outline-none focus:ring-2 ring-offset-1
                  ${(effectiveDisabled && ttsState !== "speaking" && ttsState !== "error") || ttsState === "loading" ? "opacity-60 cursor-not-allowed" : `hover:bg-[rgba(255,182,193,0.2)] active:bg-[rgba(255,182,193,0.4)] ring-[var(--color-primary-text)]`}
                  ${ttsState === "speaking" || ttsState === "loading" ? `text-[var(--color-stimulus-highlight)] animate-pulse scale-110` : `text-[var(--color-main-text)]`}
                  ${ttsState === "error" ? "ring-red-500 text-red-600" : ""}
                  ${className}`}
        aria-pressed={ttsState === "speaking"}
        aria-label={buttonTitle}
      >
        <span className="text-2xl md:text-3xl" role="img" aria-hidden="true">
          {buttonIcon}
        </span>
      </button>
    )
  },
)

// Thêm displayName cho component
SpeakButton.displayName = "SpeakButton"

export default SpeakButton
