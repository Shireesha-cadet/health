import {
  Activity,
  Ambulance,
  BrainCircuit,
  Building2,
  Brain,
  LayoutDashboard,
  ShieldPlus,
  Stethoscope,
} from "lucide-react"
import { NavLink } from "react-router-dom"
import { useLanguage } from "../context/LanguageContext"

function Sidebar() {
  const { language, setLanguage, t } = useLanguage()
  const navItems = [
    { to: "/dashboard", label: t("dashboard"), icon: LayoutDashboard },
    { to: "/sos", label: t("sos"), icon: Ambulance },
    { to: "/doctors", label: t("doctors"), icon: Stethoscope },
    { to: "/hospitals", label: t("hospitals"), icon: Building2 },
    { to: "/schemes", label: t("schemes"), icon: ShieldPlus },
    { to: "/records", label: t("records"), icon: Activity },
    { to: "/health-update", label: t("healthUpdate"), icon: Brain },
    { to: "/health-qa", label: t("healthQa"), icon: BrainCircuit },
  ]

  return (
    <aside className="fixed left-0 top-0 z-20 h-screen w-64 border-r border-blue-800 bg-blue-600 text-blue-50">
      <div className="flex h-full flex-col p-6">
        <div className="mb-8 rounded-xl bg-blue-500/60 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">Healthcare AI</p>
          <h1 className="mt-2 text-2xl font-bold leading-tight text-white">AI SMART CARE</h1>
        </div>

        <nav className="space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition ${
                    isActive ? "bg-blue-900 text-white" : "text-blue-100 hover:bg-blue-500 hover:text-white"
                  }`
                }
              >
                <Icon size={18} />
                <span>{item.label}</span>
              </NavLink>
            )
          })}
        </nav>

        <div className="mt-auto pt-4">
          <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-blue-100">Language</label>
          <select
            value={language}
            onChange={(event) => setLanguage(event.target.value)}
            className="w-full rounded-lg border border-blue-300 bg-blue-500 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="en">English</option>
            <option value="te">Telugu</option>
            <option value="hi">Hindi</option>
          </select>
        </div>
      </div>
    </aside>
  )
}

export default Sidebar
