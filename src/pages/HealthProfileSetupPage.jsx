import { Mic, MicOff } from "lucide-react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

function HealthProfileSetupPage() {
  const user = getCurrentUser()
  const navigate = useNavigate()
  const [listening, setListening] = useState(false)
  const [form, setForm] = useState({
    age: "",
    gender: "",
    location: "",
    allergies: "",
    medicalHistory: "",
    medications: "",
  })
  const [error, setError] = useState("")
  const [reportFile, setReportFile] = useState(null)

  const startVoiceInput = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) {
      setError("Voice input is not supported in this browser.")
      return
    }
    setError("")
    const recognition = new Recognition()
    recognition.lang = "en-US"
    recognition.start()
    setListening(true)

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript
      setForm((prev) => ({ ...prev, medicalHistory: `${prev.medicalHistory} ${transcript}`.trim() }))
    }

    recognition.onend = () => {
      setListening(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    try {
      await api.saveHealthProfile({
        ...form,
        age: Number(form.age),
        userId: user._id,
      })
      if (reportFile) {
        const reader = new FileReader()
        reader.onload = async () => {
          await api.uploadReport({
            userId: user._id,
            fileName: reportFile.name,
            fileUrl: reader.result,
          })
          navigate("/dashboard")
        }
        reader.readAsDataURL(reportFile)
        return
      }
      navigate("/dashboard")
    } catch (requestError) {
      setError(requestError.message)
    }
  }

  return (
    <div className="mx-auto min-h-screen max-w-3xl space-y-6 p-6">
      <h2 className="text-3xl font-bold text-slate-900">Health Profile Setup</h2>
      <p className="text-slate-500">Fill details manually or use voice input for medical history.</p>

      <form className="space-y-4 rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100" onSubmit={handleSubmit}>
        <div className="grid gap-4 sm:grid-cols-2">
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Age" type="number" value={form.age} onChange={(e) => setForm((prev) => ({ ...prev, age: e.target.value }))} required />
          <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Gender" value={form.gender} onChange={(e) => setForm((prev) => ({ ...prev, gender: e.target.value }))} required />
        </div>
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Location" value={form.location} onChange={(e) => setForm((prev) => ({ ...prev, location: e.target.value }))} required />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" placeholder="Allergies" value={form.allergies} onChange={(e) => setForm((prev) => ({ ...prev, allergies: e.target.value }))} />
        <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2.5" rows="3" placeholder="Medical History" value={form.medicalHistory} onChange={(e) => setForm((prev) => ({ ...prev, medicalHistory: e.target.value }))} />
        <textarea className="w-full rounded-lg border border-slate-200 px-3 py-2.5" rows="2" placeholder="Medications" value={form.medications} onChange={(e) => setForm((prev) => ({ ...prev, medications: e.target.value }))} />
        <input className="w-full rounded-lg border border-slate-200 px-3 py-2.5" type="file" onChange={(e) => setReportFile(e.target.files?.[0] || null)} />

        <button
          type="button"
          onClick={startVoiceInput}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-800 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-900"
        >
          {listening ? <MicOff size={16} /> : <Mic size={16} />}
          {listening ? "Listening..." : "Voice Input"}
        </button>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <button className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-700" type="submit">
          Save Health Profile
        </button>
      </form>
    </div>
  )
}

export default HealthProfileSetupPage
