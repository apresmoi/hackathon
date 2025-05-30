"use client"

import { useState, useEffect, useRef } from "react"

interface SuggestionPanelProps {
  suggestion: string
}

type SuggestionType = "breathing" | "music" | "visual" | "general"
type InteractionMode = "primary" | "alternative"

export default function SuggestionPanel({ suggestion }: SuggestionPanelProps) {
  const [suggestionType, setSuggestionType] = useState<SuggestionType>("general")
  const [interactionMode, setInteractionMode] = useState<InteractionMode>("primary")

  useEffect(() => {
    const lowerSuggestion = suggestion.toLowerCase()

    if (lowerSuggestion.includes("breath") || lowerSuggestion.includes("breathing")) {
      setSuggestionType("breathing")
    } else if (
      lowerSuggestion.includes("music") ||
      lowerSuggestion.includes("listen") ||
      lowerSuggestion.includes("sound")
    ) {
      setSuggestionType("music")
    } else if (
      lowerSuggestion.includes("visual") ||
      lowerSuggestion.includes("look") ||
      lowerSuggestion.includes("see") ||
      lowerSuggestion.includes("watch")
    ) {
      setSuggestionType("visual")
    } else {
      setSuggestionType("general")
    }

    // Reset to primary mode when suggestion changes
    setInteractionMode("primary")
  }, [suggestion])

  const toggleInteractionMode = () => {
    setInteractionMode((prev) => (prev === "primary" ? "alternative" : "primary"))
  }

  const renderSwitchButton = () => {
    if (suggestionType === "general") return null

    let buttonText = ""
    if (suggestionType === "breathing") {
      buttonText = interactionMode === "primary" ? "Switch to Videos" : "Switch to Breathing"
    } else if (suggestionType === "music") {
      buttonText = interactionMode === "primary" ? "Switch to Breathing" : "Switch to Music"
    } else if (suggestionType === "visual") {
      buttonText = interactionMode === "primary" ? "Switch to Breathing" : "Switch to Quotes"
    }

    return (
      <div className="text-center mb-4">
        <button
          onClick={toggleInteractionMode}
          className="px-4 py-2 bg-white/50 hover:bg-white/70 border border-white/40 rounded-full text-sm font-medium text-slate-700 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-300/50"
          aria-label={`Switch interaction type: ${buttonText}`}
        >
          {buttonText}
        </button>
      </div>
    )
  }

  const renderContent = () => {
    // For breathing type, show breathing exercise or videos
    if (suggestionType === "breathing") {
      return interactionMode === "primary" ? <BreathingExercise /> : <WellnessVideos />
    }

    // For music type, show music player or breathing exercise
    if (suggestionType === "music") {
      return interactionMode === "primary" ? <MusicPlayer /> : <BreathingExercise />
    }

    // For visual type, show quotes or breathing exercise
    if (suggestionType === "visual") {
      return interactionMode === "primary" ? <VisualInspiration /> : <BreathingExercise />
    }

    // For general type, always show general wellness
    return <GeneralWellness suggestion={suggestion} />
  }

  return (
    <section
      className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl border border-white/30 p-8 animate-in slide-in-from-bottom-4 duration-700"
      aria-labelledby="interactive-wellness-heading"
    >
      <header className="text-center mb-6">
        <h3 id="interactive-wellness-heading" className="text-xl font-medium text-slate-800">
          Interactive Wellness
        </h3>
        <p className="text-slate-600 text-sm font-light mt-2">Let's practice together</p>
      </header>

      {renderSwitchButton()}
      {renderContent()}

      {/* AI Disclaimer */}
      <div className="mt-6 pt-4 border-t border-slate-200/50">
        <p className="text-xs text-slate-500 text-center">
          <span className="font-medium">Disclaimer:</span> This AI-powered wellness tool is designed to provide general
          guidance and is not a substitute for professional mental health care. If you're experiencing persistent
          distress, please consider consulting with a qualified mental health professional.
        </p>
      </div>
    </section>
  )
}

function BreathingExercise() {
  const [isActive, setIsActive] = useState(false)
  const [phase, setPhase] = useState<"inhale" | "hold" | "exhale">("inhale")
  const [count, setCount] = useState(4)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const stopExercise = () => {
    setIsActive(false)
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
    setPhase("inhale")
    setCount(4)
  }

  useEffect(() => {
    if (!isActive) {
      stopExercise()
      return
    }

    const phases = [
      { name: "inhale" as const, duration: 4000, count: 4 },
      { name: "hold" as const, duration: 2000, count: 2 },
      { name: "exhale" as const, duration: 6000, count: 6 },
    ]

    let currentPhaseIndex = 0

    const cyclePhases = () => {
      if (!isActive) return

      const currentPhase = phases[currentPhaseIndex]
      setPhase(currentPhase.name)

      // Count down
      let timeLeft = currentPhase.count
      setCount(timeLeft)

      intervalRef.current = setInterval(() => {
        timeLeft--
        setCount(timeLeft)
        if (timeLeft <= 0 && intervalRef.current) {
          clearInterval(intervalRef.current)
          intervalRef.current = null
        }
      }, 1000)

      timeoutRef.current = setTimeout(() => {
        currentPhaseIndex = (currentPhaseIndex + 1) % phases.length
        if (isActive) cyclePhases()
      }, currentPhase.duration)
    }

    cyclePhases()

    // Cleanup function
    return () => {
      stopExercise()
    }
  }, [isActive])

  return (
    <div className="text-center space-y-6">
      <div className="relative flex items-center justify-center h-64" role="img" aria-label="Breathing exercise circle">
        <div
          className={`w-32 h-32 rounded-full border-4 transition-all duration-1000 ease-in-out ${
            isActive
              ? phase === "inhale"
                ? "scale-150 border-blue-400 bg-blue-100/50"
                : phase === "hold"
                  ? "scale-150 border-purple-400 bg-purple-100/50"
                  : "scale-100 border-green-400 bg-green-100/50"
              : "scale-100 border-slate-300 bg-slate-100/50"
          }`}
        >
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="text-2xl font-bold text-slate-700" aria-live="polite">
                {count}
              </div>
              <div className="text-sm text-slate-600 capitalize" aria-live="polite">
                {phase}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div className="text-center">
          <p className="text-slate-700 mb-2" aria-live="polite">
            {isActive ? (
              <span className="capitalize font-medium">{phase}</span>
            ) : (
              "Ready to begin your breathing exercise?"
            )}
          </p>
          <p className="text-sm text-slate-600">
            {isActive ? "Follow the circle and breathe with the rhythm" : "4 seconds in, 2 seconds hold, 6 seconds out"}
          </p>
        </div>

        <button
          onClick={() => (isActive ? stopExercise() : setIsActive(true))}
          className={`px-8 py-3 rounded-2xl font-medium transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300/50 ${
            isActive
              ? "bg-red-100 hover:bg-red-200 text-red-700 border border-red-200"
              : "bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
          }`}
          aria-label={isActive ? "Stop breathing exercise" : "Start breathing exercise"}
        >
          {isActive ? "Stop Exercise" : "Start Breathing"}
        </button>
      </div>
    </div>
  )
}

function WellnessVideos() {
  const wellnessVideos = [
    {
      title: "5-Minute Meditation",
      embedId: "inpok4MKVLM",
      description: "Quick guided meditation for stress relief",
    },
    {
      title: "Gentle Yoga Flow",
      embedId: "v7AYKMP6rOE",
      description: "Relaxing yoga sequence for beginners",
    },
    {
      title: "Mindfulness Practice",
      embedId: "ZToicYcHIOU",
      description: "Simple mindfulness techniques",
    },
  ]

  const [selectedVideo, setSelectedVideo] = useState(0)

  return (
    <div className="space-y-6">
      <nav className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Wellness video selection">
        {wellnessVideos.map((video, index) => (
          <button
            key={index}
            onClick={() => setSelectedVideo(index)}
            role="tab"
            aria-selected={selectedVideo === index}
            aria-controls={`video-panel-${index}`}
            className={`p-3 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-300/50 ${
              selectedVideo === index
                ? "bg-gradient-to-r from-blue-100 to-green-100 border-2 border-blue-300"
                : "bg-white/50 border border-white/40 hover:bg-white/70"
            }`}
          >
            <div className="font-medium text-slate-800 text-sm">{video.title}</div>
            <div className="text-xs text-slate-600 mt-1">{video.description}</div>
          </button>
        ))}
      </nav>

      <div
        className="relative aspect-video rounded-2xl overflow-hidden shadow-lg"
        role="tabpanel"
        id={`video-panel-${selectedVideo}`}
        aria-labelledby={`video-tab-${selectedVideo}`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${wellnessVideos[selectedVideo].embedId}?autoplay=0&rel=0&modestbranding=1`}
          title={wellnessVideos[selectedVideo].title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="text-center">
        <p className="text-slate-600 text-sm">Take your time and follow along at your own pace</p>
      </div>
    </div>
  )
}

function MusicPlayer() {
  // Using reliable, non-livestream YouTube videos
  const calmingPlaylists = [
    {
      title: "Peaceful Piano",
      embedId: "jfKfPfyJRdk",
      description: "Gentle piano melodies for relaxation",
    },
    {
      title: "Nature Sounds",
      embedId: "eKFTSSKCzWA",
      description: "Calming sounds from nature",
    },
    {
      title: "Meditation Music",
      embedId: "1ZYbU82GVz4",
      description: "Ambient music for mindfulness",
    },
  ]

  const [selectedPlaylist, setSelectedPlaylist] = useState(0)

  return (
    <div className="space-y-6">
      <nav className="grid grid-cols-1 sm:grid-cols-3 gap-3" role="tablist" aria-label="Music playlist selection">
        {calmingPlaylists.map((playlist, index) => (
          <button
            key={index}
            onClick={() => setSelectedPlaylist(index)}
            role="tab"
            aria-selected={selectedPlaylist === index}
            aria-controls={`music-panel-${index}`}
            className={`p-3 rounded-2xl text-left transition-all duration-300 transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-blue-300/50 ${
              selectedPlaylist === index
                ? "bg-gradient-to-r from-blue-100 to-green-100 border-2 border-blue-300"
                : "bg-white/50 border border-white/40 hover:bg-white/70"
            }`}
          >
            <div className="font-medium text-slate-800 text-sm">{playlist.title}</div>
            <div className="text-xs text-slate-600 mt-1">{playlist.description}</div>
          </button>
        ))}
      </nav>

      <div
        className="relative aspect-video rounded-2xl overflow-hidden shadow-lg"
        role="tabpanel"
        id={`music-panel-${selectedPlaylist}`}
        aria-labelledby={`music-tab-${selectedPlaylist}`}
      >
        <iframe
          src={`https://www.youtube.com/embed/${calmingPlaylists[selectedPlaylist].embedId}?autoplay=0&rel=0&modestbranding=1`}
          title={calmingPlaylists[selectedPlaylist].title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="w-full h-full"
        />
      </div>

      <div className="text-center">
        <p className="text-slate-600 text-sm">Take a moment to listen and let the music guide your relaxation</p>
      </div>
    </div>
  )
}

function VisualInspiration() {
  const quotes = [
    {
      text: "Peace comes from within. Do not seek it without.",
      author: "Buddha",
    },
    {
      text: "The present moment is the only time over which we have dominion.",
      author: "Thích Nhất Hạnh",
    },
    {
      text: "Wherever you are, be there totally.",
      author: "Eckhart Tolle",
    },
    {
      text: "Breathe in peace, breathe out stress.",
      author: "Anonymous",
    },
    {
      text: "You are exactly where you need to be.",
      author: "Anonymous",
    },
  ]

  const [currentQuote, setCurrentQuote] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [quotes.length])

  return (
    <div className="space-y-6">
      <div className="relative h-48 flex items-center justify-center">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-3xl"></div>
        <div className="relative text-center px-6 space-y-4">
          <div className="transition-all duration-1000 ease-in-out">
            <blockquote className="text-lg font-medium text-slate-800 italic leading-relaxed">
              "{quotes[currentQuote].text}"
            </blockquote>
            <cite className="text-slate-600 text-sm font-light mt-3 block">— {quotes[currentQuote].author}</cite>
          </div>
        </div>
      </div>

      <nav className="flex justify-center space-x-2" role="tablist" aria-label="Quote navigation">
        {quotes.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuote(index)}
            role="tab"
            aria-selected={index === currentQuote}
            aria-label={`View quote ${index + 1}`}
            className={`w-2 h-2 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-300/50 ${
              index === currentQuote ? "bg-blue-400 w-6" : "bg-slate-300"
            }`}
          />
        ))}
      </nav>

      <div className="text-center">
        <p className="text-slate-600 text-sm">Let these words guide your reflection and inner peace</p>
      </div>
    </div>
  )
}

function GeneralWellness({ suggestion }: { suggestion: string }) {
  return (
    <div className="text-center space-y-6">
      <div className="bg-gradient-to-br from-blue-50 via-purple-50 to-green-50 rounded-3xl p-8">
        <div className="w-16 h-16 bg-gradient-to-r from-blue-400 to-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
        </div>
        <h4 className="text-lg font-semibold text-slate-800 mb-3">Your Wellness Journey</h4>
        <p className="text-slate-700 leading-relaxed">{suggestion}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4" role="group" aria-label="Wellness principles">
        <div className="bg-white/50 rounded-2xl p-4 text-center border border-white/40 transition-all duration-300 hover:bg-white/70 hover:scale-[1.02]">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707"
              />
            </svg>
          </div>
          <div className="text-sm font-medium text-slate-800">Mindful</div>
          <div className="text-xs text-slate-600">Stay present</div>
        </div>

        <div className="bg-white/50 rounded-2xl p-4 text-center border border-white/40 transition-all duration-300 hover:bg-white/70 hover:scale-[1.02]">
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <div className="text-sm font-medium text-slate-800">Gentle</div>
          <div className="text-xs text-slate-600">Be kind to yourself</div>
        </div>

        <div className="bg-white/50 rounded-2xl p-4 text-center border border-white/40 transition-all duration-300 hover:bg-white/70 hover:scale-[1.02]">
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <div className="text-sm font-medium text-slate-800">Progress</div>
          <div className="text-xs text-slate-600">Small steps matter</div>
        </div>
      </div>
    </div>
  )
}
