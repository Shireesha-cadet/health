/**
 * Intelligent vitals parser — English + Telugu + Hindi
 * Extracts health values from free-form speech, order-independent.
 * Numbers in speech come as digits (e.g. "120") regardless of language.
 */

// ─────────────────────────────────────────────────────────────────────────────
// Keyword maps per vital — all languages
// ─────────────────────────────────────────────────────────────────────────────

const KEYWORDS = {
  bp: [
    // English
    "blood pressure", "bp", "b p", "b.p",
    // Telugu
    "బీపీ", "బి పి", "రక్తపోటు", "బ్లడ్ ప్రెషర్", "బ్లడ్ ప్రెజర్",
    // Hindi
    "बीपी", "बी पी", "रक्तचाप", "ब्लड प्रेशर", "ब्लड प्रेषर",
  ],

  heartRate: [
    // English
    "heart rate", "heartbeat", "heart beat", "heart", "pulse", "hr", "bpm",
    // Telugu
    "హార్ట్ రేట్", "హృదయ స్పందన", "హార్ట్", "పల్స్", "గుండె వేగం", "గుండె స్పందన",
    "హృదయ గతి", "హార్ట్ బీట్",
    // Hindi
    "हार्ट रेट", "हृदय गति", "हार्ट", "पल्स", "दिल की धड़कन", "हार्ट बीट",
    "धड़कन",
  ],

  spo2: [
    // English
    "spo2", "spo 2", "oxygen level", "oxygen saturation", "oxygen", "o2 saturation", "o2",
    // Telugu
    "ఆక్సిజన్", "ఆక్సిజన్ లెవల్", "ఆక్సిజన్ స్థాయి", "స్పో2", "స్పో టూ",
    "ఆక్సిజన్ శాతం",
    // Hindi
    "ऑक्सीजन", "ऑक्सीजन लेवल", "ऑक्सीजन स्तर", "एसपीओ2", "एसपीओ टू",
    "ऑक्सीजन सैचुरेशन",
  ],

  glucose: [
    // English
    "blood sugar", "fasting sugar", "sugar level", "sugar", "glucose",
    // Telugu
    "చక్కెర", "బ్లడ్ షుగర్", "షుగర్", "గ్లూకోజ్", "రక్తంలో చక్కెర",
    "చక్కెర స్థాయి", "షుగర్ లెవల్",
    // Hindi
    "शुगर", "ब्लड शुगर", "रक्त शर्करा", "ग्लूकोज", "शुगर लेवल",
    "शर्करा",
  ],

  temperature: [
    // English
    "body temperature", "temperature", "temp", "fever",
    // Telugu
    "జ్వరం", "టెంపరేచర్", "శరీర ఉష్ణోగ్రత", "ఉష్ణోగ్రత", "బాడీ టెంపరేచర్",
    // Hindi
    "बुखार", "तापमान", "टेम्परेचर", "शरीर का तापमान", "बॉडी टेम्परेचर",
  ],
}

// Separator words used between two BP numbers ("120 over 80", "120 బై 80")
const BP_SEPARATORS = [
  // English
  "over", "by", "upon", "slash",
  // Telugu
  "బై", "పై", "వై", "స్లాష్",
  // Hindi
  "बाय", "पर", "ऊपर", "स्लैश",
  // symbol
  "/",
]

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

/** Escape special regex chars in a string */
function escRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
}

/**
 * Build a regex that matches any keyword from a list followed by
 * optional non-digit chars then a number.
 * Returns the number captured.
 */
function matchKeywordThenNumber(text, keywords) {
  // Sort longest first so "blood pressure" matches before "pressure"
  const sorted = [...keywords].sort((a, b) => b.length - a.length)
  for (const kw of sorted) {
    const pattern = new RegExp(escRe(kw) + "[^\\d]{0,20}?(\\d{2,3}(?:[.,]\\d)?)", "i")
    const m = text.match(pattern)
    if (m) return m[1].replace(",", ".")
  }
  return null
}

/**
 * Normalize text:
 * - lowercase
 * - replace commas with space
 * - collapse whitespace
 * NOTE: We do NOT lowercase Telugu/Hindi unicode — they are already
 * case-insensitive (no case concept). toLowerCase() is safe for all.
 */
function normalizeText(raw) {
  return raw
    .toLowerCase()
    .replace(/[,،،]/g, " ")   // English, Arabic, Urdu commas
    .replace(/\s+/g, " ")
    .trim()
}

// ─────────────────────────────────────────────────────────────────────────────
// Main parser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @param {string} transcript - raw speech (any language)
 * @returns {{ bpSystolic, bpDiastolic, heartRate, spo2, glucose, temperature, detectedFields }}
 */
export function parseVitalsFromSpeech(transcript) {
  if (!transcript) return { detectedFields: [] }

  const text = normalizeText(transcript)
  const result = {}
  const detectedFields = []

  // ── Blood Pressure ─────────────────────────────────────────────────────────
  // Strategy: find a BP keyword, then look for "NNN <sep> NNN" pattern
  const bpKwSorted = [...KEYWORDS.bp].sort((a, b) => b.length - a.length)
  const sepPattern = BP_SEPARATORS.map(escRe).join("|")

  let bpFound = false
  for (const kw of bpKwSorted) {
    // Pattern: keyword ... NNN (sep) NNN
    const p = new RegExp(
      escRe(kw) + "[^\\d]{0,15}?(\\d{2,3})\\s*(?:" + sepPattern + ")\\s*(\\d{2,3})",
      "i"
    )
    const m = text.match(p)
    if (m) {
      result.bpSystolic  = m[1]
      result.bpDiastolic = m[2]
      detectedFields.push("Blood Pressure")
      bpFound = true
      break
    }
  }

  // Fallback: plain "NNN / NNN" or "NNN over NNN" anywhere (no keyword needed)
  if (!bpFound) {
    const p = new RegExp(
      "(\\d{2,3})\\s*(?:" + sepPattern + ")\\s*(\\d{2,3})",
      "i"
    )
    const m = text.match(p)
    if (m) {
      result.bpSystolic  = m[1]
      result.bpDiastolic = m[2]
      detectedFields.push("Blood Pressure")
    }
  }

  // ── Heart Rate ─────────────────────────────────────────────────────────────
  const hr = matchKeywordThenNumber(text, KEYWORDS.heartRate)
  if (hr) {
    result.heartRate = hr
    detectedFields.push("Heart Rate")
  }

  // ── SpO2 ───────────────────────────────────────────────────────────────────
  const spo2 = matchKeywordThenNumber(text, KEYWORDS.spo2)
  if (spo2) {
    result.spo2 = spo2
    detectedFields.push("SpO2")
  }

  // ── Glucose ────────────────────────────────────────────────────────────────
  const glucose = matchKeywordThenNumber(text, KEYWORDS.glucose)
  if (glucose) {
    result.glucose = glucose
    detectedFields.push("Glucose")
  }

  // ── Temperature ────────────────────────────────────────────────────────────
  const temp = matchKeywordThenNumber(text, KEYWORDS.temperature)
  if (temp) {
    result.temperature = temp
    detectedFields.push("Temperature")
  }

  result.detectedFields = detectedFields
  return result
}

// ─────────────────────────────────────────────────────────────────────────────
// Keyword highlighter (all languages)
// ─────────────────────────────────────────────────────────────────────────────

const ALL_KEYWORDS = [
  ...KEYWORDS.bp,
  ...KEYWORDS.heartRate,
  ...KEYWORDS.spo2,
  ...KEYWORDS.glucose,
  ...KEYWORDS.temperature,
  ...BP_SEPARATORS,
]

/**
 * Split transcript into segments, marking keyword segments for highlight.
 * @returns {{ text: string, highlight: boolean }[]}
 */
export function highlightKeywords(transcript) {
  if (!transcript) return [{ text: "", highlight: false }]

  // Sort longest first
  const sorted = [...ALL_KEYWORDS].sort((a, b) => b.length - a.length)
  const pattern = new RegExp(
    "(" + sorted.map(escRe).join("|") + ")",
    "gi"
  )

  const parts = transcript.split(pattern)
  const lowerSorted = sorted.map((k) => k.toLowerCase())

  return parts
    .filter((p) => p !== undefined && p !== "")
    .map((part) => ({
      text: part,
      highlight: lowerSorted.includes(part.toLowerCase()),
    }))
}
