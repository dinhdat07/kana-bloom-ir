interface CachedToken {
  token: string
  expiry: number
}

let cachedToken: CachedToken | null = null
let currentSynthesisController: AbortController | null = null

// Debug environment variables
// console.log("=== Environment Variables Debug ===")
// console.log("AZURE_TTS_API_KEY:", process.env.AZURE_TTS_API_KEY)
// console.log("AZURE_TTS_REGION:", process.env.AZURE_TTS_REGION)
// console.log("==========================================")

// Use process.env (defined in vite.config.js)
let dynamicApiKey: string | null = process.env.AZURE_TTS_API_KEY || null
let dynamicRegion: string | null = process.env.AZURE_TTS_REGION || "australiaeast"

// console.log("Final values - API Key:", dynamicApiKey ? "Set (hidden)" : "null", "Region:", dynamicRegion)

// IndexedDB Cache variables
const DB_NAME = "KanaBloomTTSCache"
const DB_VERSION = 1
const STORE_NAME = "audioCache"
let dbInstance: IDBDatabase | null = null
let isCacheReady = false

async function initDB(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      console.warn("IndexedDB is not available in this browser. TTS caching will be disabled.")
      isCacheReady = false
      resolve()
      return
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "text" })
      }
    }

    request.onsuccess = (event) => {
      dbInstance = (event.target as IDBOpenDBRequest).result
      isCacheReady = true
      console.log("TTS Cache: Database initialized successfully.")
      resolve()
    }

    request.onerror = (event) => {
      console.error("TTS Cache: Database error:", (event.target as IDBOpenDBRequest).error)
      isCacheReady = false
      reject((event.target as IDBOpenDBRequest).error)
    }
  })
}

initDB().catch((err) => console.error("TTS Cache: Failed to initialize DB on load:", err))

async function cacheAudio(text: string, audioBlob: Blob): Promise<void> {
  if (!isCacheReady || !dbInstance) {
    console.warn("TTS Cache: Database not ready, cannot cache audio.")
    return
  }
  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance!.transaction(STORE_NAME, "readwrite")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.put({ text: text, audio: audioBlob })

      request.onsuccess = () => {
        resolve()
      }
      request.onerror = (event) => {
        console.error("TTS Cache: Error caching audio:", (event.target as IDBRequest).error)
        reject((event.target as IDBRequest).error)
      }
    } catch (error) {
      console.error("TTS Cache: Exception during cacheAudio transaction:", error)
      reject(error)
    }
  })
}

async function getCachedAudio(text: string): Promise<Blob | null> {
  if (!isCacheReady || !dbInstance) {
    return null
  }
  return new Promise((resolve, reject) => {
    try {
      const transaction = dbInstance!.transaction(STORE_NAME, "readonly")
      const store = transaction.objectStore(STORE_NAME)
      const request = store.get(text)

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result
        if (result && result.audio) {
          resolve(result.audio as Blob)
        } else {
          resolve(null)
        }
      }
      request.onerror = (event) => {
        console.error("TTS Cache: Error getting cached audio:", (event.target as IDBRequest).error)
        reject((event.target as IDBRequest).error)
      }
    } catch (error) {
      console.error("TTS Cache: Exception during getCachedAudio transaction:", error)
      reject(error)
    }
  })
}

export function configureAzureTTS(apiKey: string | null, region: string | null) {
  if (apiKey) {
    dynamicApiKey = apiKey
  }
  dynamicRegion = region || "australiaeast"
  cachedToken = null
}

async function getAuthToken(): Promise<string> {
  const apiKeyToUse = dynamicApiKey
  const regionToUse = dynamicRegion || "australiaeast"

  if (!apiKeyToUse) {
    console.error("Azure TTS API key not configured.")
    throw new Error("Azure TTS service not configured: API Key missing.")
  }
  if (!regionToUse) {
    console.error("Azure TTS region not configured.")
    throw new Error("Azure TTS service not configured: Region missing.")
  }

  if (cachedToken && cachedToken.expiry > Date.now() + 60000) {
    return cachedToken.token
  }

  const tokenUrl = `https://${regionToUse}.api.cognitive.microsoft.com/sts/v1.0/issueToken`

  try {
    const response = await fetch(tokenUrl, {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": apiKeyToUse,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Azure TTS: Failed to fetch auth token from ${regionToUse}:`, response.status, errorText)
      throw new Error(`Azure TTS auth failed: ${response.status}`)
    }

    const token = await response.text()
    cachedToken = { token, expiry: Date.now() + 9 * 60 * 1000 }
    return token
  } catch (error) {
    console.error("Azure TTS: Error fetching auth token:", error)
    cachedToken = null
    if (error instanceof Error && error.message.includes("Azure TTS auth failed")) {
      throw error
    }
    throw new Error("Network error fetching Azure TTS token.")
  }
}

export async function speakWithAzureTTS(text: string, lang = "ja-JP", signal?: AbortSignal): Promise<Blob | null> {
  if (!text.trim()) return null

  const apiKeyToUse = dynamicApiKey
  const regionToUse = dynamicRegion || "australiaeast"

  if (!apiKeyToUse || !regionToUse) {
    console.warn("Azure TTS speak called but service not configured with API key/region.")
    throw new Error("Azure TTS service not configured.")
  }

  // DON'T abort previous synthesis - let each request complete independently
  const requestController = new AbortController()
  const internalSignal = requestController.signal

  const externalAbortListener = () => {
    if (!requestController.signal.aborted) {
      console.log("Azure TTS: External signal aborted, aborting current synthesis.")
      requestController.abort()
    }
  }

  if (signal) {
    if (signal.aborted) {
      console.log("Azure TTS: External signal already aborted.")
      return null
    }
    signal.addEventListener("abort", externalAbortListener, { once: true })
  }

  try {
    if (isCacheReady) {
      try {
        const cachedAudioBlob = await getCachedAudio(text)
        if (cachedAudioBlob) {
          return cachedAudioBlob
        }
      } catch (cacheError) {
        console.warn("Azure TTS: Error checking cache, proceeding to fetch:", cacheError)
      }
    }

    const authToken = await getAuthToken()
    if (internalSignal.aborted) {
      console.log("Azure TTS: Aborted after getAuthToken.")
      return null
    }

    const ttsUrl = `https://${regionToUse}.tts.speech.microsoft.com/cognitiveservices/v1`

    const ssml = `
      <speak version='1.0' xml:lang='${lang}'>
        <voice xml:lang='${lang}' name='ja-JP-NanamiNeural'>
          ${text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&apos;")}
        </voice>
      </speak>
    `

    const response = await fetch(ttsUrl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${authToken}`,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-16khz-128kbitrate-mono-mp3",
        "User-Agent": "KanaBloomApp/1.0",
      },
      body: ssml,
      signal: internalSignal,
    })

    if (internalSignal.aborted) {
      console.log("Azure TTS synthesis aborted during fetch.")
      return null
    }

    if (!response.ok) {
      const errorBody = await response.text()
      console.error("Azure TTS: Speech synthesis failed:", response.status, errorBody)
      throw new Error(`Azure TTS synthesis failed: ${response.status}`)
    }

    const audioBlob = await response.blob()

    if (isCacheReady && audioBlob) {
      cacheAudio(text, audioBlob).catch((cacheError) => {
        console.error("Azure TTS: Failed to cache audio:", cacheError)
      })
    }
    return audioBlob
  } catch (error) {
    if (internalSignal.aborted) {
      if (!(error instanceof DOMException && error.name === "AbortError")) {
        console.log("Azure TTS: Operation aborted (internalSignal is aborted), and received error:", error)
      } else {
        console.log("Azure TTS: Operation aborted (AbortError).")
      }
      return null
    }

    console.error("Azure TTS: Error in speakWithAzureTTS:", error)
    if (
      error instanceof Error &&
      (error.message.includes("Azure TTS auth failed") ||
        error.message.includes("Azure TTS synthesis failed") ||
        error.message.includes("not configured"))
    ) {
      throw error
    }
    throw new Error("Failed to synthesize speech with Azure.")
  } finally {
    if (signal) {
      signal.removeEventListener("abort", externalAbortListener)
    }
  }
}

export function cancelAzureTTS() {
  if (currentSynthesisController) {
    if (!currentSynthesisController.signal.aborted) {
      currentSynthesisController.abort()
      console.log("Ongoing Azure TTS synthesis cancelled by user.")
    }
    currentSynthesisController = null
  }
}
