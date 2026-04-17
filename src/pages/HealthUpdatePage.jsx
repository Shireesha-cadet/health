import { Mic, MicOff, Sparkles } from "lucide-react"
import { useMemo, useRef, useState } from "react"
import { api } from "../api"
import { healthQA } from "../data/healthQA"
import { useHealth } from "../context/HealthContext"
import { useLanguage } from "../context/LanguageContext"
import { getCurrentUser } from "../utils/session"

function parseTranscriptToVitals(transcript) {
  const normalized = transcript.toLowerCase().replace(/[,]/g, " ")
  const parsed = {}

  const bpMatch = normalized.match(/(?:bp|blood pressure)[^\d]*(\d{2,3})\s*(?:\/|by)\s*(\d{2,3})/)
  if (bpMatch) {
    parsed.bpSystolic = bpMatch[1]
    parsed.bpDiastolic = bpMatch[2]
  }

  const heartMatch = normalized.match(/(?:heart rate|pulse|hr)[^\d]*(\d{2,3})/)
  if (heartMatch) parsed.heartRate = heartMatch[1]

  const sugarMatch = normalized.match(/(?:sugar|glucose)[^\d]*(\d{2,3})/)
  if (sugarMatch) parsed.glucose = sugarMatch[1]

  const spo2Match = normalized.match(/(?:spo2|oxygen|o2)[^\d]*(\d{2,3})/)
  if (spo2Match) parsed.spo2 = spo2Match[1]

  const tempMatch = normalized.match(/(?:temp|temperature)[^\d]*(\d{2,3}(?:\.\d)?)/)
  if (tempMatch) parsed.temperature = tempMatch[1]

  return parsed
}

function HealthUpdatePage() {
  const { t, language } = useLanguage()
  const { setHealthData } = useHealth()
  const user = getCurrentUser()
  const recognitionRef = useRef(null)

  const [formData, setFormData] = useState({ symptoms: "", voiceText: "" })
  const [isListening, setIsListening] = useState(false)
  const [status, setStatus] = useState("")
  const [message, setMessage] = useState("")
  const [error, setError] = useState("")

  const matchedItem = useMemo(() => {
    const query = formData.symptoms.trim().toLowerCase()
    if (!query) return null
    return (
      healthQA.find((item) => query.includes(item.question.toLowerCase())) ||
      healthQA.find((item) => item.question.toLowerCase().includes(query)) ||
      null
    )
  }, [formData.symptoms])

  const answerText = useMemo(() => {
    if (!matchedItem) return ""
    if (language === "te") return matchedItem.telugu
    if (language === "hi") return matchedItem.hindi
    return matchedItem.answer
  }, [language, matchedItem])

  const startVoice = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setError("Voice input is not supported in this browser.")
      return
    }

    setError("")
    setStatus(t("listening"))
    const recognition = new SpeechRecognition()
    recognition.lang = "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => {
      setIsListening(true)
      setStatus(t("listening"))
    }

    recognition.onend = () => {
      setIsListening(false)
      setStatus("")
    }

    recognition.onerror = () => {
      setIsListening(false)
      setError("Voice capture failed. Please try again.")
    }

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setFormData((prev) => ({
        ...prev,
        voiceText: transcript,
        symptoms: transcript,
      }))
      setMessage("")
      setError("")
    }

    recognition.start()
  }

  const stopVoice = () => {
    recognitionRef.current?.stop()
    setIsListening(false)
  }

  const handleInputChange = (event) => {
    const value = event.target.value
    setFormData((prev) => ({
      ...prev,
      symptoms: value,
      voiceText: value,
    }))
    setMessage("")
    setError("")
  }

  const handleUpdateReport = async () => {
    try {
      setError("")
      setMessage("")
      const latestReport = { ...formData }
      localStorage.setItem("healthReport", JSON.stringify(latestReport))

      if (user?._id) {
        const vitals = parseTranscriptToVitals(latestReport.symptoms)
        setHealthData({
          bpSystolic: vitals.bpSystolic || "",
          bpDiastolic: vitals.bpDiastolic || "",
          heartRate: vitals.heartRate || "",
          spo2: vitals.spo2 || "",
          glucose: vitals.glucose || "",
          temperature: vitals.temperature || "",
          rawInput: latestReport.symptoms || "",
        })

        await api.generateReport({
          userId: user._id,
          vitals: {
            heartRate: vitals.heartRate || "0",
            bloodPressure: `${vitals.bpSystolic || "0"}/${vitals.bpDiastolic || "0"}`,
            spO2: vitals.spo2 || "0",
            glucose: vitals.glucose || "0",
            temperature: vitals.temperature || "0",
          },
          aiSummary: matchedItem ? matchedItem.answer : "Health update saved.",
          timestamp: new Date().toISOString(),
        })
      }

      setMessage("Health report updated successfully.")
    } catch (requestError) {
      setError(requestError.message || "Failed to update health report.")
    }
  }

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Health Update</h2>
        <p className="mt-1 text-slate-500">Voice-assisted health update with AI-style interpretation</p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={isListening ? stopVoice : startVoice}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold text-white ${
              isListening ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {isListening ? <MicOff size={16} /> : <Mic size={16} />}
            {isListening ? "Stop Listening" : "Start Voice Input"}
          </button>
          {status && (
            <p className="inline-flex items-center gap-2 text-sm font-medium text-blue-700">
              <Sparkles size={16} />
              {status}
            </p>
          )}
        </div>

        <div className="mt-4">
          <label className="text-sm font-semibold text-slate-700">
            Symptoms / Health Update
            <textarea
              name="symptoms"
              value={formData.symptoms}
              onChange={handleInputChange}
              className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 text-sm"
              rows={4}
              placeholder="Type or speak symptoms like 'My BP is 140 by 90 and pulse is 95'"
            />
          </label>
        </div>

        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <h3 className="text-sm font-semibold text-blue-900">Voice Transcript</h3>
            <p className="mt-2 text-sm text-blue-800 break-words">
              {formData.voiceText || "No voice input yet."}
            </p>
          </div>

          <div className="rounded-2xl bg-blue-50 p-4 ring-1 ring-blue-100">
            <h3 className="text-sm font-semibold text-blue-900">Trained Q&A Answer</h3>
            <p className="mt-2 text-sm text-blue-800">
              {answerText || "No matching trained answer found. Try asking about heart rate, BP, SpO2, sugar, or fever."}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleUpdateReport}
            className="inline-flex items-center justify-center rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700"
          >
            Update Report
          </button>
          {message && <p className="text-sm text-emerald-700">{message}</p>}
          {error && <p className="text-sm text-rose-700">{error}</p>}
        </div>
      </section>
    </div>
  )
}

export default HealthUpdatePage
