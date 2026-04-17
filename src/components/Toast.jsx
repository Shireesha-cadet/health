import { useEffect, useState } from "react"

/**
 * Simple toast notification system.
 * Usage:
 *   import { showToast } from "./Toast"
 *   showToast("🚨 Alert Sent!", "error")
 *
 * Types: "error" | "success" | "info"
 */

// Global event bus
const TOAST_EVENT = "app-toast"

export function showToast(message, type = "info") {
  window.dispatchEvent(new CustomEvent(TOAST_EVENT, { detail: { message, type } }))
}

const typeStyles = {
  error: "bg-red-600 text-white",
  success: "bg-emerald-600 text-white",
  info: "bg-slate-800 text-white",
}

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    const handler = (e) => {
      const id = Date.now()
      setToasts((prev) => [...prev, { id, ...e.detail }])
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
      }, 4000)
    }
    window.addEventListener(TOAST_EVENT, handler)
    return () => window.removeEventListener(TOAST_EVENT, handler)
  }, [])

  if (toasts.length === 0) return null

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`flex items-center gap-3 rounded-xl px-5 py-3 shadow-xl text-sm font-semibold animate-fade-in ${typeStyles[toast.type] || typeStyles.info}`}
        >
          {toast.message}
          <button
            type="button"
            onClick={() => setToasts((prev) => prev.filter((t) => t.id !== toast.id))}
            className="ml-2 opacity-70 hover:opacity-100 text-lg leading-none"
          >
            ×
          </button>
        </div>
      ))}
    </div>
  )
}
