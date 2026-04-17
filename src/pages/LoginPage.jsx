import { useState } from "react"
import { HeartPulse } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { api } from "../api"
import { setCurrentUser } from "../utils/session"

function LoginPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [error, setError] = useState("")

  const handleChange = (event) => {
    const { name, value } = event.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError("")
    try {
      let response
      try {
        response = await api.login({ email: formData.email, password: formData.password })
      } catch {
        response = await api.register(formData)
      }
      setCurrentUser(response.user)
      navigate("/setup/contacts")
    } catch (requestError) {
      setError(requestError.message)
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

        <form className="space-y-4" onSubmit={handleSubmit}>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2.5 outline-none ring-blue-300 transition focus:ring-2"
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="Name"
            required
          />
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
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white transition hover:bg-blue-700"
          >
            Login
          </button>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      </div>
    </div>
  )
}

export default LoginPage
