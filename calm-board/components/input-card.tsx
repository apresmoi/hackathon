"use client"

import { useState, useMemo } from "react"
import ResponseDisplay from "./response-display"

interface AnalysisResponse {
  mood: string
  message: string
  suggestion: string
}

const allMoodSuggestions = [
  { label: "Calm", emoji: "😌" },
  { label: "Stressed", emoji: "😰" },
  { label: "Tired", emoji: "😴" },
  { label: "Anxious", emoji: "😟" },
  { label: "Motivated", emoji: "💪" },
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Excited", emoji: "🤩" },
  { label: "Peaceful", emoji: "🕊️" },
  { label: "Overwhelmed", emoji: "🌊" },
  { label: "Grateful", emoji: "🙏" },
  { label: "Confused", emoji: "🤔" },
  { label: "Energetic", emoji: "⚡" },
  { label: "Lonely", emoji: "🥺" },
  { label: "Hopeful", emoji: "🌟" },
  { label: "Frustrated", emoji: "😤" },
  { label: "Content", emoji: "😊" },
  { label: "Worried", emoji: "😰" },
  { label: "Inspired", emoji: "✨" },
  { label: "Restless", emoji: "😣" },
]

export default function InputCard() {
  const [feeling, setFeeling] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [response, setResponse] = useState<AnalysisResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Randomly select 10 moods each time the component mounts
  const randomMoods = useMemo(() => {
    const shuffled = [...allMoodSuggestions].sort(() => 0.5 - Math.random())
    return shuffled.slice(0, 10)
  }, [])

  const handleGenerate = async () => {
    if (!feeling.trim()) return

    setIsGenerating(true)
    setError(null)
    setResponse(null)

    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userInput: feeling }),
      })

      if (!res.ok) {
        throw new Error("Failed to analyze your input")
      }

      const data = await res.json()
      setResponse(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong")
    } finally {
      setIsGenerating(false)
    }
  }

  const handleReset = () => {
    setFeeling("")
    setResponse(null)
    setError(null)
  }

  const handleMoodClick = (moodLabel: string, autoGenerate = false) => {
    setFeeling(`I'm feeling ${moodLabel.toLowerCase()} today.`)
    if (autoGenerate) {
      // Small delay to allow state to update
      setTimeout(() => {
        handleGenerate()
      }, 100)
    }
  }

  return (
    <div className="w-full max-w-2xl mx-auto space-y-6 animate-in fade-in duration-700">
      <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 space-y-6 transition-all duration-500 hover:shadow-3xl hover:bg-white/70">
        <header className="text-center space-y-2 animate-in slide-in-from-top duration-500 delay-100">
          <h2 className="text-2xl font-medium text-slate-800 leading-relaxed">How are you feeling today?</h2>
          <p className="text-slate-600 text-sm font-light">Share your thoughts and let us help you reflect</p>
        </header>

        <div className="space-y-4 animate-in slide-in-from-bottom duration-500 delay-200">
          <div className="space-y-2">
            <label htmlFor="feeling-input" className="sr-only">
              Describe how you're feeling today
            </label>
            <textarea
              id="feeling-input"
              value={feeling}
              onChange={(e) => setFeeling(e.target.value)}
              placeholder="I'm feeling..."
              className="w-full h-32 px-4 py-3 bg-white/60 backdrop-blur-sm border border-white/40 rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-300/50 focus:border-transparent placeholder-slate-400 text-slate-700 font-light leading-relaxed transition-all duration-300 focus:bg-white/80"
              maxLength={500}
              disabled={isGenerating}
              aria-describedby="char-count privacy-notice"
            />

            <div className="flex justify-between items-center text-xs text-slate-500">
              <span id="char-count" aria-live="polite">
                {feeling.length}/500 characters
              </span>
            </div>

            {/* Privacy Notice */}
            <div
              id="privacy-notice"
              className="text-xs text-slate-500 bg-blue-50/50 rounded-lg p-3 border border-blue-200/30"
            >
              <p>
                <span className="font-medium">Privacy:</span> Your input is processed to provide personalized wellness
                suggestions. We use AI to analyze your mood and recommend helpful activities. No personal data is stored
                permanently.
              </p>
            </div>
          </div>

          {/* Mood Suggestion Pills */}
          <div className="space-y-3">
            <p className="text-sm text-slate-600 font-medium">Quick mood selection:</p>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Quick mood selection buttons">
              {randomMoods.map((mood) => (
                <button
                  key={mood.label}
                  onClick={() => handleMoodClick(mood.label, true)}
                  disabled={isGenerating}
                  className="inline-flex items-center space-x-2 px-4 py-2 bg-white/50 hover:bg-white/70 border border-white/40 rounded-full text-sm font-medium text-slate-700 transition-all duration-200 hover:scale-105 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
                  aria-label={`Select ${mood.label} mood and analyze`}
                >
                  <span role="img" aria-label={`${mood.label} emoji`}>
                    {mood.emoji}
                  </span>
                  <span>{mood.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-3 animate-in slide-in-from-bottom duration-500 delay-300">
          <button
            onClick={handleGenerate}
            disabled={!feeling.trim() || isGenerating}
            className="flex-1 py-3 px-6 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 disabled:from-slate-300 disabled:to-slate-400 text-white font-medium rounded-2xl transition-all duration-300 transform hover:scale-[1.02] disabled:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl disabled:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-300/50"
            aria-describedby={isGenerating ? "analyzing-status" : undefined}
          >
            {isGenerating ? (
              <div className="flex items-center justify-center space-x-2">
                <div
                  className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"
                  aria-hidden="true"
                ></div>
                <span id="analyzing-status">Analyzing...</span>
              </div>
            ) : (
              "Analyze"
            )}
          </button>

          {(response || error) && (
            <button
              onClick={handleReset}
              className="py-3 px-6 bg-white/60 hover:bg-white/80 backdrop-blur-sm border border-white/40 text-slate-700 font-medium rounded-2xl transition-all duration-300 hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-300/50"
              aria-label="Reset form and clear results"
            >
              Reset
            </button>
          )}
        </div>

        {error && (
          <div
            className="p-4 bg-red-50/80 backdrop-blur-sm border border-red-200/50 rounded-2xl animate-in slide-in-from-bottom duration-300"
            role="alert"
            aria-live="polite"
          >
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}
      </div>

      {response && <ResponseDisplay response={response} />}

      {/* Easter Egg - Hidden in the footer area */}
      <div className="text-center mt-8">
        <button
          className="text-slate-400 hover:text-blue-500 transition-colors duration-300 text-xs opacity-50 hover:opacity-100 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-blue-300/50 rounded"
          onClick={() => {
            const messages = [
              "✨ You found the secret! Keep being awesome! ✨",
              "🌟 Hidden gem discovered! You have great attention to detail! 🌟",
              "💎 Easter egg activated! May your day be filled with calm vibes! 💎",
              "🦋 Secret unlocked! Remember, small moments of joy matter! 🦋",
            ]
            const randomMessage = messages[Math.floor(Math.random() * messages.length)]
            alert(randomMessage)
          }}
          aria-label="Hidden easter egg - click for a surprise message"
        >
          ···
        </button>
      </div>
    </div>
  )
}
