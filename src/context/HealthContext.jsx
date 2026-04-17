import { createContext, useContext, useEffect, useMemo, useState } from "react"

const HEALTH_STORAGE_KEY = "healthData"
const defaultHealthData = {
  rawInput: "",
  bpSystolic: "",
  bpDiastolic: "",
  heartRate: "",
  glucose: "",
  spo2: "",
  temperature: "",
  aiSummary: "Your vitals look stable. Continue regular monitoring.",
  emergencyTriggered: false,
  updatedAt: null,
}

const HealthContext = createContext(null)

function readStoredHealthData() {
  try {
    const stored = localStorage.getItem(HEALTH_STORAGE_KEY)
    return stored ? { ...defaultHealthData, ...JSON.parse(stored) } : defaultHealthData
  } catch {
    return defaultHealthData
  }
}

export function HealthProvider({ children }) {
  const [healthData, setHealthDataState] = useState(readStoredHealthData)

  const setHealthData = (nextValue) => {
    setHealthDataState((prev) => {
      const computed = typeof nextValue === "function" ? nextValue(prev) : nextValue
      const merged = { ...prev, ...computed, updatedAt: Date.now() }
      localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(merged))
      window.dispatchEvent(new CustomEvent("health-data-updated", { detail: merged }))
      return merged
    })
  }

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key === HEALTH_STORAGE_KEY && event.newValue) {
        setHealthDataState({ ...defaultHealthData, ...JSON.parse(event.newValue) })
      }
    }
    const onCustomSync = (event) => {
      setHealthDataState((prev) => ({ ...prev, ...event.detail }))
    }

    window.addEventListener("storage", onStorage)
    window.addEventListener("health-data-updated", onCustomSync)
    return () => {
      window.removeEventListener("storage", onStorage)
      window.removeEventListener("health-data-updated", onCustomSync)
    }
  }, [])

  const value = useMemo(() => ({ healthData, setHealthData }), [healthData])

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
}

export function useHealth() {
  const context = useContext(HealthContext)
  if (!context) throw new Error("useHealth must be used within HealthProvider")
  return context
}
