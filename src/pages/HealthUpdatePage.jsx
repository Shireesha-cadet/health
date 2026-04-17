import { useEffect, useRef, useState } from "react"
import {
  Mic, MicOff, CheckCircle, PenLine, RotateCcw,
  Sparkles, AlertTriangle, Save, ClipboardList,
} from "lucide-react"
import { api } from "../api"
import { useHealth } from "../context/HealthContext"
import { useLanguage } from "../context/LanguageContext"
import { getCurrentUser } from "../utils/session"
import { showToast } from "../components/Toast"
import { parseVitalsFromSpeech, highlightKeywords } from "../utils/parseVitalsFromSpeech"

// ─────────────────────────────────────────────────────────────────────────────
// Emergency helpers
// ─────────────────────────────────────────────────────────────────────────────
function checkEmergency(v) {
  const s  = Number(v.bpSystolic)
  const o  = Number(v.spo2)
  const hr = Number(v.heartRate)
  const g  = Number(v.glucose)
  const hasValue = v.bpSystolic || v.spo2 || v.heartRate || v.glucose
  if (!hasValue) return false
  return (
    s > 160 || (s > 0 && s < 90) ||
    o < 92  ||
    hr > 120 || (hr > 0 && hr < 50) ||
    g > 200
  )
}

function getAlertType(v) {
  const s  = Number(v.bpSystolic)
  const o  = Number(v.spo2)
  const hr = Number(v.heartRate)
  const g  = Number(v.glucose)
  if (s > 160 || (s > 0 && s < 90))   return "High/Low Blood Pressure"
  if (o < 92)                           return "Low SpO2"
  if (hr > 120 || (hr > 0 && hr < 50)) return "Abnormal Heart Rate"
  if (g > 200)                          return "High Glucose"
  return "Critical Vitals"
}

// ─────────────────────────────────────────────────────────────────────────────
// Language-aware voice hints
// ─────────────────────────────────────────────────────────────────────────────
const VOICE_HINTS = {
  en: '"BP 120 over 80, heart rate 72, sugar 140, oxygen 98"',
  te: '"బీపీ 120 బై 80, హార్ట్ రేట్ 72, షుగర్ 140, ఆక్సిజన్ 98"',
  hi: '"बीपी 120 बाय 80, हार्ट रेट 72, शुगर 140, ऑक्सीजन 98"',
}

const PLACEHOLDER_TEXT = {
  en: "Your speech will appear here...",
  te: "మీ మాటలు ఇక్కడ కనిపిస్తాయి...",
  hi: "आपकी बात यहाँ दिखेगी...",
}

const LISTENING_TEXT = {
  en: "🔴 Listening...",
  te: "🔴 వింటోంది...",
  hi: "🔴 सुन रहा है...",
}

const SPEAK_HINT_TEXT = {
  en: "Speak your vitals. Say things like:",
  te: "మీ వైటల్స్ చెప్పండి. ఇలా చెప్పవచ్చు:",
  hi: "अपने वाइटल्स बोलें। जैसे:",
}
const VITAL_FIELDS = [
  { name: "bpSystolic",  label: "BP Systolic",  unit: "mmHg", placeholder: "e.g. 120", step: "1"   },
  { name: "bpDiastolic", label: "BP Diastolic", unit: "mmHg", placeholder: "e.g. 80",  step: "1"   },
  { name: "heartRate",   label: "Heart Rate",   unit: "bpm",  placeholder: "e.g. 75",  step: "1"   },
  { name: "spo2",        label: "SpO2",         unit: "%",    placeholder: "e.g. 98",  step: "1"   },
  { name: "glucose",     label: "Glucose",      unit: "mg/dL",placeholder: "e.g. 110", step: "1"   },
  { name: "temperature", label: "Temperature",  unit: "°F",   placeholder: "e.g. 98.6",step: "0.1" },
]

const EMPTY_VITALS = {
  bpSystolic: "", bpDiastolic: "", heartRate: "",
  spo2: "", glucose: "", temperature: "",
}

// ─────────────────────────────────────────────────────────────────────────────
// Modes: "select" | "voice" | "manual" | "preview"
// ─────────────────────────────────────────────────────────────────────────────

export default function HealthUpdatePage() {
  const { language } = useLanguage()
  const { setHealthData, setAlert } = useHealth()
  const user = getCurrentUser()

  const [mode, setMode]               = useState("select")   // current UI mode
  const [vitals, setVitals]           = useState(EMPTY_VITALS)
  const [transcript, setTranscript]   = useState("")         // full accumulated speech
  const [interimText, setInterimText] = useState("")         // live interim speech
  const [isListening, setIsListening] = useState(false)
  const [parseWarning, setParseWarning] = useState("")       // partial parse warning
  const [saving, setSaving]           = useState(false)
  const [savedMsg, setSavedMsg]       = useState("")

  const recognitionRef  = useRef(null)
  const accumulatedRef  = useRef("")   // accumulates across multiple speech segments

  // ── Reset everything ────────────────────────────────────────────────────────
  const reset = () => {
    stopListening()
    setMode("select")
    setVitals(EMPTY_VITALS)
    setTranscript("")
    setInterimText("")
    setParseWarning("")
    setSavedMsg("")
    accumulatedRef.current = ""
  }

  // ── Start continuous listening ───────────────────────────────────────────────
  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SR) {
      showToast("Voice input not supported in this browser. Use manual entry.", "info")
      setMode("manual")
      return
    }

    accumulatedRef.current = ""
    setTranscript("")
    setInterimText("")

    const recognition = new SR()
    // Use correct language code for speech recognition
    const langMap = { en: "en-IN", te: "te-IN", hi: "hi-IN" }
    recognition.lang = langMap[language] || "en-IN"
    recognition.continuous      = true
    recognition.interimResults  = true
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart = () => setIsListening(true)

    recognition.onresult = (event) => {
      let interim = ""
      let finalChunk = ""

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i]
        if (result.isFinal) {
          finalChunk += result[0].transcript + " "
        } else {
          interim += result[0].transcript
        }
      }

      if (finalChunk) {
        accumulatedRef.current += finalChunk
        setTranscript(accumulatedRef.current.trim())
      }
      setInterimText(interim)
    }

    recognition.onerror = (e) => {
      // "no-speech" is normal — don't treat as error
      if (e.error !== "no-speech") {
        showToast("Voice capture error. Please try again.", "info")
      }
    }

    recognition.onend = () => {
      // If still in listening mode, restart to keep continuous
      if (isListeningRef.current) {
        try { recognition.start() } catch { /* already started */ }
      } else {
        setIsListening(false)
        setInterimText("")
      }
    }

    recognition.start()
  }

  // Use a ref to track listening state inside the onend closure
  const isListeningRef = useRef(false)
  useEffect(() => { isListeningRef.current = isListening }, [isListening])

  const stopListening = () => {
    isListeningRef.current = false
    setIsListening(false)
    setInterimText("")
    try { recognitionRef.current?.stop() } catch { /* ignore */ }
  }

  // ── When user clicks "Stop & Parse" ─────────────────────────────────────────
  const handleStopAndParse = () => {
    stopListening()
    const fullText = accumulatedRef.current.trim() || transcript
    if (!fullText) {
      showToast("No speech detected. Please try again.", "info")
      return
    }

    const parsed = parseVitalsFromSpeech(fullText)
    const { detectedFields = [], ...parsedVitals } = parsed

    // Merge into vitals state
    setVitals({
      bpSystolic:  parsedVitals.bpSystolic  || "",
      bpDiastolic: parsedVitals.bpDiastolic || "",
      heartRate:   parsedVitals.heartRate   || "",
      spo2:        parsedVitals.spo2        || "",
      glucose:     parsedVitals.glucose     || "",
      temperature: parsedVitals.temperature || "",
    })

    if (detectedFields.length === 0) {
      setParseWarning("Could not fully understand input. Please edit manually.")
    } else if (detectedFields.length < 3) {
      setParseWarning(`Partially detected: ${detectedFields.join(", ")}. You can edit the rest manually.`)
    } else {
      setParseWarning("")
    }

    setMode("preview")
  }

  // ── Handle manual field change ───────────────────────────────────────────────
  const handleVitalChange = (e) => {
    const { name, value } = e.target
    setVitals((prev) => ({ ...prev, [name]: value }))
    setSavedMsg("")
  }

  // ── Final save ───────────────────────────────────────────────────────────────
  const handleSave = async () => {
    const hasValue = Object.values(vitals).some((v) => v !== "")
    if (!hasValue) {
      showToast("Please enter at least one vital value.", "info")
      return
    }

    setSaving(true)
    try {
      // 1. Save to global context → Dashboard updates instantly
      setHealthData({
        bpSystolic:  vitals.bpSystolic,
        bpDiastolic: vitals.bpDiastolic,
        heartRate:   vitals.heartRate,
        spo2:        vitals.spo2,
        glucose:     vitals.glucose,
        temperature: vitals.temperature,
        rawInput:    transcript,
        aiSummary:   "Health update saved.",
      })

      // 2. Emergency check
      if (checkEmergency(vitals)) {
        const alertType      = getAlertType(vitals)
        const alertTimestamp = new Date().toISOString()

        setAlert({
          alertTriggered:   true,
          alertType,
          alertTimestamp,
          alertStatus:      "Alert Sent",
          notifiedContacts: [],
          logId:            null,
        })

        showToast(`🚨 Emergency Alert Sent! (${alertType})`, "error")

        if (user?._id) {
          api.triggerSOS({ userId: user._id, alertType, vitals }).then((res) => {
            if (!res.duplicate) {
              setAlert({
                alertTriggered:   true,
                alertType,
                alertTimestamp,
                alertStatus:      "Alert Sent",
                notifiedContacts: res.notifiedContacts || [],
                logId:            res.log?._id || null,
              })
            }
          }).catch(() => {})
        }
      }

      // 3. Save report to backend
      if (user?._id) {
        await api.generateReport({
          userId: user._id,
          vitals: {
            heartRate:     vitals.heartRate   || "0",
            bloodPressure: `${vitals.bpSystolic || "0"}/${vitals.bpDiastolic || "0"}`,
            spO2:          vitals.spo2         || "0",
            glucose:       vitals.glucose      || "0",
            temperature:   vitals.temperature  || "0",
          },
          aiSummary:  "Health update saved.",
          timestamp:  new Date().toISOString(),
        }).catch(() => {})
      }

      showToast("✅ Vitals saved successfully!", "success")
      setSavedMsg("✅ Vitals saved! Dashboard updated.")
      // Stay on preview/manual so user can see what was saved
    } catch (err) {
      showToast("Failed to save. Please try again.", "info")
    } finally {
      setSaving(false)
    }
  }

  // ── Highlighted transcript ───────────────────────────────────────────────────
  const highlightedParts = highlightKeywords(transcript)

  const isCritical = checkEmergency(vitals)

  // ─────────────────────────────────────────────────────────────────────────────
  // RENDER
  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-slate-900">Health Update</h2>
          <p className="mt-1 text-slate-500">Voice or manual entry — with smart parsing & preview</p>
        </div>
        {mode !== "select" && (
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
          >
            <RotateCcw size={14} />
            Start Over
          </button>
        )}
      </header>

      {/* ── MODE: SELECT ─────────────────────────────────────────────────────── */}
      {mode === "select" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => { setMode("voice"); startListening() }}
            className="flex flex-col items-center gap-3 rounded-2xl bg-blue-600 p-8 text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Mic size={36} />
            <span className="text-lg font-semibold">🎤 Voice Input</span>
            <span className="text-sm text-blue-100 text-center">Speak your vitals naturally. We'll parse them intelligently.</span>
          </button>
          <button
            type="button"
            onClick={() => setMode("manual")}
            className="flex flex-col items-center gap-3 rounded-2xl bg-white p-8 text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 transition"
          >
            <PenLine size={36} className="text-slate-500" />
            <span className="text-lg font-semibold">✍️ Manual Entry</span>
            <span className="text-sm text-slate-400 text-center">Type your vitals directly into the form fields.</span>
          </button>
        </div>
      )}

      {/* ── MODE: VOICE ──────────────────────────────────────────────────────── */}
      {mode === "voice" && (
        <div className="space-y-4">
          {/* Listening indicator */}
          <div className={`rounded-2xl p-6 text-center shadow-sm ring-1 transition ${
            isListening ? "bg-red-50 ring-red-200" : "bg-white ring-slate-100"
          }`}>
            <div className={`mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full ${
              isListening ? "bg-red-100 animate-pulse" : "bg-slate-100"
            }`}>
              {isListening
                ? <Mic size={36} className="text-red-600" />
                : <MicOff size={36} className="text-slate-400" />
              }
            </div>

            {isListening ? (
              <>
                <p className="text-lg font-semibold text-red-700">{LISTENING_TEXT[language] || LISTENING_TEXT.en}</p>
                <p className="mt-1 text-sm text-red-500">{SPEAK_HINT_TEXT[language] || SPEAK_HINT_TEXT.en}</p>
                <p className="mt-2 rounded-lg bg-red-100 px-4 py-2 text-xs font-mono text-red-700 inline-block">
                  {VOICE_HINTS[language] || VOICE_HINTS.en}
                </p>
              </>
            ) : (
              <p className="text-slate-500 text-sm">Microphone stopped.</p>
            )}
          </div>

          {/* Live transcript */}
          <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-400">Live Transcript</p>
            <div className="min-h-[48px] text-sm text-slate-700 leading-relaxed">
              {/* Final text with keyword highlights */}
              {highlightedParts.map((part, i) => (
                <span
                  key={i}
                  className={part.highlight ? "rounded bg-yellow-100 px-0.5 font-semibold text-yellow-800" : ""}
                >
                  {part.text}
                </span>
              ))}
              {/* Interim (live) text */}
              {interimText && (
                <span className="text-slate-400 italic"> {interimText}</span>
              )}
              {!transcript && !interimText && (
                <span className="text-slate-300 italic">{PLACEHOLDER_TEXT[language] || PLACEHOLDER_TEXT.en}</span>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex flex-wrap gap-3">
            {isListening ? (
              <button
                type="button"
                onClick={handleStopAndParse}
                className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-red-700"
              >
                <MicOff size={16} />
                Stop & Parse
              </button>
            ) : (
              <>
                <button
                  type="button"
                  onClick={startListening}
                  className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  <Mic size={16} />
                  Resume Listening
                </button>
                {transcript && (
                  <button
                    type="button"
                    onClick={handleStopAndParse}
                    className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-green-700"
                  >
                    <Sparkles size={16} />
                    Parse Speech
                  </button>
                )}
              </>
            )}
            <button
              type="button"
              onClick={() => { stopListening(); setMode("manual") }}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
            >
              <PenLine size={15} />
              Switch to Manual
            </button>
          </div>
        </div>
      )}

      {/* ── MODE: PREVIEW (after voice parse) ────────────────────────────────── */}
      {mode === "preview" && (
        <div className="space-y-4">
          {/* Transcript used */}
          {transcript && (
            <div className="rounded-xl bg-slate-50 p-4 ring-1 ring-slate-200">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">Voice Input Used</p>
              <p className="text-sm text-slate-600 leading-relaxed">
                {highlightedParts.map((part, i) => (
                  <span
                    key={i}
                    className={part.highlight ? "rounded bg-yellow-100 px-0.5 font-semibold text-yellow-800" : ""}
                  >
                    {part.text}
                  </span>
                ))}
              </p>
            </div>
          )}

          {/* Parse warning */}
          {parseWarning && (
            <div className="flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 p-3 text-amber-800">
              <AlertTriangle size={16} className="mt-0.5 shrink-0" />
              <p className="text-sm">{parseWarning}</p>
            </div>
          )}

          {/* Detected values preview */}
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardList size={18} className="text-blue-600" />
              <h3 className="font-semibold text-slate-900">Detected Values — Review Before Saving</h3>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {VITAL_FIELDS.map((field) => (
                <div
                  key={field.name}
                  className={`rounded-xl p-3 ring-1 ${
                    vitals[field.name]
                      ? "bg-blue-50 ring-blue-200"
                      : "bg-slate-50 ring-slate-200"
                  }`}
                >
                  <p className="text-xs font-semibold text-slate-500">{field.label}</p>
                  <p className={`mt-1 text-xl font-bold ${vitals[field.name] ? "text-blue-700" : "text-slate-300"}`}>
                    {vitals[field.name] ? `${vitals[field.name]} ${field.unit}` : "—"}
                  </p>
                </div>
              ))}
            </div>

            {/* Critical warning */}
            {isCritical && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-red-800 animate-fade-in">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">⚠️ Critical values detected!</p>
                  <p className="text-xs mt-0.5">Saving will automatically trigger an SOS alert — {getAlertType(vitals)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                isCritical ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <CheckCircle size={16} />
              {saving ? "Saving..." : isCritical ? "🚨 Confirm & Trigger SOS" : "✅ Confirm & Save"}
            </button>
            <button
              type="button"
              onClick={() => setMode("edit")}
              className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <PenLine size={15} />
              ✏️ Edit Manually
            </button>
            <button
              type="button"
              onClick={() => { setMode("voice"); startListening() }}
              className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
            >
              <Mic size={15} />
              Re-record
            </button>
          </div>

          {savedMsg && <p className="text-sm font-medium text-emerald-700">{savedMsg}</p>}
        </div>
      )}

      {/* ── MODE: MANUAL or EDIT ─────────────────────────────────────────────── */}
      {(mode === "manual" || mode === "edit") && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <h3 className="mb-4 font-semibold text-slate-900">
              {mode === "edit" ? "✏️ Edit Detected Values" : "✍️ Enter Vitals Manually"}
            </h3>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {VITAL_FIELDS.map((field) => (
                <label key={field.name} className="flex flex-col gap-1 text-sm font-medium text-slate-600">
                  {field.label}
                  <span className="text-xs font-normal text-slate-400">{field.unit}</span>
                  <input
                    type="number"
                    name={field.name}
                    value={vitals[field.name]}
                    onChange={handleVitalChange}
                    placeholder={field.placeholder}
                    step={field.step}
                    className={`rounded-lg border px-3 py-2 text-sm outline-none transition focus:ring-2 focus:ring-blue-300 ${
                      vitals[field.name] ? "border-blue-300 bg-blue-50" : "border-slate-200 bg-white"
                    }`}
                  />
                </label>
              ))}
            </div>

            {/* Critical warning */}
            {isCritical && (
              <div className="mt-4 flex items-start gap-2 rounded-xl border border-red-300 bg-red-50 p-3 text-red-800 animate-fade-in">
                <AlertTriangle size={16} className="mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold">⚠️ Critical values detected!</p>
                  <p className="text-xs mt-0.5">Saving will automatically trigger an SOS alert — {getAlertType(vitals)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold text-white transition disabled:opacity-60 ${
                isCritical ? "bg-red-600 hover:bg-red-700" : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <Save size={16} />
              {saving ? "Saving..." : isCritical ? "🚨 Save & Trigger SOS" : "Save Vitals"}
            </button>

            {mode === "edit" && (
              <button
                type="button"
                onClick={() => setMode("preview")}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Back to Preview
              </button>
            )}

            {mode === "manual" && (
              <button
                type="button"
                onClick={() => { setMode("voice"); startListening() }}
                className="inline-flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-4 py-2.5 text-sm font-medium text-blue-700 hover:bg-blue-100"
              >
                <Mic size={15} />
                Switch to Voice
              </button>
            )}
          </div>

          {savedMsg && <p className="text-sm font-medium text-emerald-700">{savedMsg}</p>}
        </div>
      )}
    </div>
  )
}
