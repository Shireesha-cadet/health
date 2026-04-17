import { useEffect, useMemo, useState } from "react"
import { Download } from "lucide-react"
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts"
import { api } from "../api"
import { getCurrentUser } from "../utils/session"

function RecordsPage() {
  const user = getCurrentUser()
  const [reports, setReports] = useState([])
  const [selectedFile, setSelectedFile] = useState(null)
  const [message, setMessage] = useState("")
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    const fetchReports = async () => {
      const response = await api.getReports(user._id)
      setReports(response.reports)
    }
    fetchReports()
  }, [user._id])

  const uploadFile = async (event) => {
    event.preventDefault()
    if (!selectedFile) {
      return
    }

    const reader = new FileReader()
    reader.onload = async () => {
      await api.uploadReport({
        userId: user._id,
        fileName: selectedFile.name,
        fileUrl: reader.result,
      })
      setMessage("Report uploaded successfully.")
      setSelectedFile(null)
      const response = await api.getReports(user._id)
      setReports(response.reports)
    }
    reader.readAsDataURL(selectedFile)
  }

  const generateAiReport = async () => {
    setGenerating(true)
    await api.generateReport({
      userId: user._id,
      vitals: {
        heartRate: "76 bpm",
        bloodPressure: "126/82",
        spO2: "97",
        glucose: "142",
        temperature: "98.4 F",
      },
    })
    const response = await api.getReports(user._id)
    setReports(response.reports)
    setGenerating(false)
    setMessage("AI health report generated.")
  }

  const trendData = useMemo(
    () =>
      reports.slice(0, 5).map((report, index) => ({
        month: `R${index + 1}`,
        score: 70 + index * 3,
      })),
    [reports]
  )

  return (
    <div className="space-y-6">
      <header>
        <h2 className="text-3xl font-bold text-slate-900">Health Records</h2>
        <p className="mt-1 text-slate-500">Timeline history, reports, and trend monitoring</p>
      </header>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Upload Medical Report</h3>
        <form className="flex flex-wrap items-center gap-3" onSubmit={uploadFile}>
          <input
            type="file"
            onChange={(event) => setSelectedFile(event.target.files?.[0] || null)}
            className="rounded-lg border border-slate-200 px-3 py-2"
          />
          <button type="submit" className="rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white">
            Upload
          </button>
        </form>
        {message && <p className="mt-2 text-sm text-emerald-700">{message}</p>}
        <button
          type="button"
          onClick={generateAiReport}
          className="mt-3 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white"
        >
          {generating ? "Generating..." : "Generate AI Health Report"}
        </button>
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Health History Timeline</h3>
        <div className="space-y-4">
          {reports.map((report) => (
            <article key={report._id} className="relative border-l-2 border-blue-200 pl-4">
              <span className="absolute -left-[7px] top-1 h-3 w-3 rounded-full bg-blue-600" />
              <p className="text-xs font-semibold uppercase text-blue-700">{new Date(report.date).toLocaleDateString()}</p>
              <p className="text-base font-semibold text-slate-900">{report.fileName}</p>
              <p className="text-sm text-slate-500">{report.reportText || "Uploaded record"}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {reports.map((report) => (
          <article key={report._id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs font-semibold uppercase text-blue-700">Report</p>
            <h4 className="mt-2 font-semibold text-slate-900">{report.fileName}</h4>
            {report.vitalsSummary && <p className="mt-2 text-xs text-slate-500">{report.vitalsSummary}</p>}
            <a
              href={report.fileUrl || `data:text/plain;charset=utf-8,${encodeURIComponent(report.reportText || "")}`}
              download={report.fileName || "ai-report.txt"}
              className="mt-4 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-3 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              <Download size={16} />
              Download
            </a>
          </article>
        ))}
      </section>

      <section className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <h3 className="mb-4 text-lg font-semibold text-slate-900">Wellness Trend</h3>
        <div className="h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#dbeafe" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="score" stroke="#2563EB" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>
    </div>
  )
}

export default RecordsPage
