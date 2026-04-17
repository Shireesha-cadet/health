import { createContext, useContext, useEffect, useMemo, useState } from "react"

const HEALTH_STORAGE_KEY = "healthData"
const ALERT_STORAGE_KEY = "sosAlert"

const defaultHealthData = {
  rawInput: "",
  bpSystolic: "",
  bpDiastolic: "",
  heartRate: "",
  glucose: "",
  spo2: "",
  temperature: "",
  aiSummary: "Your vitals look stable. Continue regular monitoring.",
  updatedAt: null,
}

const defaultAlert = {
  alertTriggered: false,
  alertType: null,       // "Auto" | "Manual"
  alertTimestamp: null,
  alertStatus: null,     // "Alert Sent" | "Resolved"
  logId: null,
  notifiedContacts: [],
}

const HealthContext = createContext(null)

function readStored(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? { ...fallback, ...JSON.parse(stored) } : fallback
  } catch {
    return fallback
  }
}

export function HealthProvider({ children }) {
  const [healthData, setHealthDataState] = useState(() => readStored(HEALTH_STORAGE_KEY, defaultHealthData))
  const [alertState, setAlertState] = useState(() => readStored(ALERT_STORAGE_KEY, defaultAlert))

  // Persist + broadcast health data
  const setHealthData = (nextValue) => {
    setHealthDataState((prev) => {
      const computed = typeof nextValue === "function" ? nextValue(prev) : nextValue
      const merged = { ...prev, ...computed, updatedAt: Date.now() }
      localStorage.setItem(HEALTH_STORAGE_KEY, JSON.stringify(merged))
      window.dispatchEvent(new CustomEvent("health-data-updated", { detail: merged }))
      return merged
    })
  }

  // Set active alert — persisted so SOS page can read it
  const setAlert = (alertData) => {
    const merged = { ...defaultAlert, ...alertData }
    localStorage.setItem(ALERT_STORAGE_KEY, JSON.stringify(merged))
    setAlertState(merged)
    window.dispatchEvent(new CustomEvent("sos-alert-updated", { detail: merged }))
  }

  // Clear / resolve alert
  const clearAlert = () => {
    localStorage.removeItem(ALERT_STORAGE_KEY)
    setAlertState(defaultAlert)
    window.dispatchEvent(new CustomEvent("sos-alert-updated", { detail: defaultAlert }))
  }

  useEffect(() => {
    const onStorageHealth = (event) => {
      if (event.key === HEALTH_STORAGE_KEY && event.newValue) {
        setHealthDataState({ ...defaultHealthData, ...JSON.parse(event.newValue) })
      }
    }
    const onStorageAlert = (event) => {
      if (event.key === ALERT_STORAGE_KEY) {
        setAlertState(event.newValue ? { ...defaultAlert, ...JSON.parse(event.newValue) } : defaultAlert)
      }
    }
    const onCustomHealth = (event) => {
      setHealthDataState((prev) => ({ ...prev, ...event.detail }))
    }
    const onCustomAlert = (event) => {
      setAlertState(event.detail)
    }

    window.addEventListener("storage", onStorageHealth)
    window.addEventListener("storage", onStorageAlert)
    window.addEventListener("health-data-updated", onCustomHealth)
    window.addEventListener("sos-alert-updated", onCustomAlert)
    return () => {
      window.removeEventListener("storage", onStorageHealth)
      window.removeEventListener("storage", onStorageAlert)
      window.removeEventListener("health-data-updated", onCustomHealth)
      window.removeEventListener("sos-alert-updated", onCustomAlert)
    }
  }, [])

  const value = useMemo(
    () => ({ healthData, setHealthData, alertState, setAlert, clearAlert }),
    [healthData, alertState]
  )

  return <HealthContext.Provider value={value}>{children}</HealthContext.Provider>
}

export function useHealth() {
  const context = useContext(HealthContext)
  if (!context) throw new Error("useHealth must be used within HealthProvider")
  return context
}
