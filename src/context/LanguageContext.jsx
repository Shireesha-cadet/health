import { createContext, useContext, useMemo, useState } from "react"
import { translations } from "../i18n/translations"

const LanguageContext = createContext(null)

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState("en")

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      t: (key) => translations[language][key] || key,
    }),
    [language]
  )

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (!context) throw new Error("useLanguage must be used within LanguageProvider")
  return context
}
