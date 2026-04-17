import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { MessageCircle, Mic, MicOff, Send, X, Bot, User, ChevronDown } from "lucide-react"
import { useLanguage } from "../context/LanguageContext"
import { isEmergency } from "../utils/chatbotEngine"
import { api } from "../api"

// ── Language labels ────────────────────────────────────────────────────────────
const LANG_LABELS = { en: "English", te: "తెలుగు", hi: "हिंदी" }

const SPEECH_LANG_MAP = { en: "en-US", te: "te-IN", hi: "hi-IN" }

// ── Greeting per language ──────────────────────────────────────────────────────
const GREETINGS = {
  en: "👋 Hi! I'm your AI Health Assistant. Ask me about symptoms, vitals, diet, or emergencies. Type or use voice input.",
  te: "👋 నమస్కారం! నేను మీ AI ఆరోగ్య సహాయకుడిని. లక్షణాలు, వైటల్స్, ఆహారం లేదా అత్యవసర పరిస్థితుల గురించి అడగండి.",
  hi: "👋 नमस्ते! मैं आपका AI स्वास्थ्य सहायक हूं। लक्षण, वाइटल्स, आहार या आपातकाल के बारे में पूछें।",
}

// ── Quick suggestion chips ─────────────────────────────────────────────────────
const SUGGESTIONS = {
  en: ["What is normal BP?", "I have a fever", "Chest pain", "Healthy diet tips", "Call ambulance"],
  te: ["సాధారణ BP ఏమిటి?", "నాకు జ్వరం ఉంది", "ఛాతీ నొప్పి", "ఆరోగ్యకరమైన ఆహారం", "అంబులెన్స్ పిలవండి"],
  hi: ["सामान्य BP क्या है?", "मुझे बुखार है", "सीने में दर्द", "स्वस्थ आहार", "एम्बुलेंस बुलाएं"],
}

export default function HealthChatbot() {
  const navigate = useNavigate()
  const { language, setLanguage } = useLanguage()

  const [open, setOpen]         = useState(false)
  const [input, setInput]       = useState("")
  const [messages, setMessages] = useState([])
  const [listening, setListening] = useState(false)
  const [typing, setTyping]     = useState(false)

  const recognitionRef = useRef(null)
  const messagesEndRef = useRef(null)
  const inputRef       = useRef(null)

  // ── Init greeting when opened ────────────────────────────────────────────────
  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: 1, from: "bot", text: GREETINGS[language] || GREETINGS.en }])
    }
  }, [open])

  // ── Update greeting when language changes ────────────────────────────────────
  useEffect(() => {
    setMessages((prev) => {
      if (prev.length === 0) return prev
      return [{ ...prev[0], text: GREETINGS[language] || GREETINGS.en }, ...prev.slice(1)]
    })
  }, [language])

  // ── Auto-scroll to bottom ────────────────────────────────────────────────────
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, typing])

  // ── Send message ─────────────────────────────────────────────────────────────
  const sendMessage = async (text) => {
    const trimmed = (text || input).trim()
    if (!trimmed) return

    const userMsg = { id: Date.now(), from: "user", text: trimmed }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setTyping(true)

    // Emergency navigation (instant, no need to wait for AI)
    if (isEmergency(trimmed)) {
      setTimeout(() => navigate("/sos"), 1200)
    }

    try {
      const { answer, note } = await api.askAI({ question: trimmed, language })
      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: note ? `${answer}\n\n⚠️ ${note}` : answer,
        isEmergency: isEmergency(trimmed),
      }
      setMessages((prev) => [...prev, botMsg])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now() + 1, from: "bot", text: "AI service temporarily unavailable. Please try again." },
      ])
    } finally {
      setTyping(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  // ── Voice input ──────────────────────────────────────────────────────────────
  const toggleVoice = () => {
    if (listening) {
      recognitionRef.current?.stop()
      setListening(false)
      return
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), from: "bot", text: "Voice input is not supported in this browser. Please type your question." },
      ])
      return
    }

    const recognition = new SpeechRecognition()
    recognition.lang = SPEECH_LANG_MAP[language] || "en-US"
    recognition.interimResults = false
    recognition.maxAlternatives = 1
    recognitionRef.current = recognition

    recognition.onstart  = () => setListening(true)
    recognition.onend    = () => setListening(false)
    recognition.onerror  = () => {
      setListening(false)
      setMessages((prev) => [
        ...prev,
        { id: Date.now(), from: "bot", text: "Voice capture failed. Please try again or type your question." },
      ])
    }
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      inputRef.current?.focus()
    }

    recognition.start()
  }

  // ── Toggle open/close ────────────────────────────────────────────────────────
  const toggleOpen = () => {
    setOpen((prev) => !prev)
    if (!open) setTimeout(() => inputRef.current?.focus(), 300)
  }

  return (
    <>
      {/* ── Floating button ── */}
      <button
        type="button"
        onClick={toggleOpen}
        aria-label="Open health chatbot"
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white shadow-xl hover:bg-blue-700 transition-transform hover:scale-105"
      >
        {open ? <X size={22} /> : <MessageCircle size={22} />}
      </button>

      {/* ── Chat window ── */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex w-[360px] max-w-[calc(100vw-2rem)] flex-col rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200 animate-fade-in">

          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-blue-600 px-4 py-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white/20">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">AI Health Assistant</p>
                <p className="text-xs text-blue-100">Always here to help</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Language selector */}
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="rounded-lg border border-blue-400 bg-blue-500 px-2 py-1 text-xs text-white outline-none"
              >
                {Object.entries(LANG_LABELS).map(([code, label]) => (
                  <option key={code} value={code}>{label}</option>
                ))}
              </select>
              <button type="button" onClick={toggleOpen} className="text-white/70 hover:text-white">
                <ChevronDown size={18} />
              </button>
            </div>
          </div>

          {/* Messages */}
          <div className="flex h-80 flex-col gap-3 overflow-y-auto p-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex items-end gap-2 ${msg.from === "user" ? "flex-row-reverse" : "flex-row"}`}
              >
                {/* Avatar */}
                <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-white ${
                  msg.from === "user" ? "bg-blue-500" : msg.isEmergency ? "bg-red-500" : "bg-emerald-500"
                }`}>
                  {msg.from === "user" ? <User size={13} /> : <Bot size={13} />}
                </div>

                {/* Bubble */}
                <div className={`max-w-[78%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                  msg.from === "user"
                    ? "rounded-br-sm bg-blue-600 text-white"
                    : msg.isEmergency
                    ? "rounded-bl-sm bg-red-50 text-red-900 ring-1 ring-red-200"
                    : "rounded-bl-sm bg-slate-100 text-slate-800"
                }`}>
                  {msg.text}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex items-end gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500 text-white">
                  <Bot size={13} />
                </div>
                <div className="rounded-2xl rounded-bl-sm bg-slate-100 px-4 py-3">
                  <span className="flex gap-1">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }} />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }} />
                  </span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick suggestions */}
          <div className="flex gap-2 overflow-x-auto px-4 pb-2 scrollbar-hide">
            {(SUGGESTIONS[language] || SUGGESTIONS.en).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => sendMessage(s)}
                className="shrink-0 rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700 hover:bg-blue-100 transition"
              >
                {s}
              </button>
            ))}
          </div>

          {/* Input area */}
          <div className="flex items-center gap-2 border-t border-slate-100 px-3 py-3">
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                language === "te" ? "మీ ప్రశ్న టైప్ చేయండి..."
                : language === "hi" ? "अपना प्रश्न टाइप करें..."
                : "Type your health question..."
              }
              className="flex-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-300"
            />

            {/* Voice button */}
            <button
              type="button"
              onClick={toggleVoice}
              aria-label="Voice input"
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl transition ${
                listening
                  ? "bg-red-500 text-white animate-pulse"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {listening ? <MicOff size={16} /> : <Mic size={16} />}
            </button>

            {/* Send button */}
            <button
              type="button"
              onClick={() => sendMessage()}
              disabled={!input.trim()}
              aria-label="Send message"
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:opacity-40"
            >
              <Send size={15} />
            </button>
          </div>
        </div>
      )}
    </>
  )
}
