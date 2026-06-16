import i18n from "i18next"
import { initReactI18next } from "react-i18next"
import zh from "./zh.json"
import en from "./en.json"

// Detect browser language, default to English
const language = (navigator.language || (navigator as any).userLanguage || "en").toLowerCase()

i18n.use(initReactI18next).init({
  resources: { zh: { translation: zh }, en: { translation: en } },
  fallbackLng: "en",
  lng: language.split("-")[0] || "en",
  interpolation: { escapeValue: false },
})

export default i18n
