import { Mic, MicOff, Sparkles } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { healthQA } from "../data/healthQA"
import { useLanguage } from "../context/LanguageContext"

function HealthQAPage() {
  const { language } = useLanguage()
  const recognitionRef = useRef(null)
  const [query, setQuery] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [aiStage, setAiStage] = useState("")

  const matchedItem = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase()
    if (!normalizedQuery) return null
    return (
      healthQA.find((item) => item.question.toLowerCase().includes(normalizedQuery)) ||
      healthQA.find((item) => normalizedQuery.includes(item.question.toLowerCase().replace("?", ""))) ||
      null
    )
  }, [query])

  const displayedAnswer = useMemo(() => {
    if (!matchedItem) return ""
    if (language === "te") return matchedItem.telugu
    if (language === "hi") return matchedItem.hindi
    return matchedItem.answer
  }, [language, matchedItem])

  const startVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setAiStage("Voice input not supported in this browser.")
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      setAiStage("Analyzing health data...")
    }
    recognition.onend = () => setIsListening(false)
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setQuery(transcript)
      setAiStage("Fetching medical knowledge...")
      window.setTimeout(() => setAiStage("AI response generated..."), 400)
    }
    recognition.onerror = () => {
      setIsListening(false)
      setAiStage("Unable to capture voice.")
    }

    recognition.start()
  }

  const stopVoiceInput = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Health Q&A</h2>
        <p className="mt-1 text-slate-500">Ask quick healthcare questions by typing or speaking.</p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isListening ? stopVoiceInput : startVoiceInput}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? "Stop Listening" : "Voice Input"}
          </button>
          {aiStage && (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-blue-700">
              <Sparkles size={16} />
              {aiStage}
            </p>
          )}
        </div>

        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Type a health question"
          className="mt-4 w-full rounded-lg border border-slate-200 px-3 py-2.5"
        />
      </section>

      <section className="rounded-2xl bg-blue-50 p-5 ring-1 ring-blue-100">
        <h3 className="text-lg font-semibold text-blue-900">AI Response</h3>
        {displayedAnswer ? (
          <p className="mt-2 text-sm text-blue-800">{displayedAnswer}</p>
        ) : (
          <p className="mt-2 text-sm text-blue-700">
            No exact answer found. Try asking about heart rate, BP, SpO2, sugar, or fever.
          </p>
        )}
      </section>
    </div>
  )
}

export default HealthQAPage
