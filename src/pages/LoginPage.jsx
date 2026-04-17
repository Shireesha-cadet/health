import { useState } from "react"
import { HeartPulse } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { setCurrentUser } from "../utils/session"

function LoginPage() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login") // "login" | "register"
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      let response
      if (mode === "login") {
        response = await api.login({ email: formData.email, password: formData.password })
      } else {
        response = await api.register(formData)
      }
      setCurrentUser(response.user)
      navigate("/setup/contacts")
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-blue-100 via-white to-blue-200 p-4">
      <div className="w-full max-w-md rounded-2xl border border-blue-100 bg-white p-8 shadow-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-blue-600 text-white">
            <HeartPulse />
          </div>
          <h1 className="text-2xl font-bold text-slate-900">AI SMART CARE</h1>
          <p className="mt-1 text-sm text-slate-500">Secure elderly healthcare monitoring</p>
        </div>

        {/* Mode toggle */}
        <div className="mb-6 flex rounded-lg bg-slate-100 p-1">
          <button
            type="button"
            onClick={() => { setMode("login"); setError("") }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${mode === "login" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
          >
            Login
          </button>
          <button
            type="button"
            onClick={() => { setMode("register"); setError("") }}
            className={`flex-1 rounded-md py-2 text-sm font-semibold transition ${mode === "register" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500"}`}
          >
            Register
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          {mode === "register" && (
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-blue-300 transition focus:ring-2"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              required
            />
          )}
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-blue-300 transition focus:ring-2"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email"
            required
          />
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-blue-300 transition focus:ring-2"
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            required
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700 disabled:opacity-70"
          >
            {loading ? "Please wait..." : mode === "login" ? "Login" : "Create Account"}
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}{" "}
          <button
            type="button"
            onClick={() => { setMode(mode === "login" ? "register" : "login"); setError("") }}
            className="font-semibold text-blue-600 hover:underline"
          >
            {mode === "login" ? "Register" : "Login"}
          </button>
        </p>
      </div>
    </div>
  )
}

export default LoginPage
