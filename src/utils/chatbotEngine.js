import { healthQA } from "../data/healthQA"

/**
 * Find best matching Q&A entry for a given input string.
 * Returns the matched entry or null.
 */
export function findAnswer(input) {
  if (!input || typeof input !== "string") return null
  const normalized = input.toLowerCase().trim()

  // Exact keyword match — score by how many keywords match
  let bestMatch = null
  let bestScore = 0

  for (const item of healthQA) {
    let score = 0
    for (const keyword of item.keywords) {
      if (normalized.includes(keyword.toLowerCase())) {
        score++
      }
    }
    if (score > bestScore) {
      bestScore = score
      bestMatch = item
    }
  }

  return bestScore > 0 ? bestMatch : null
}

/**
 * Get the response text in the correct language.
 */
export function getResponse(input, language = "en") {
  const match = findAnswer(input)

  if (!match) {
    const fallbacks = {
      en: "I'm not sure about that. Please consult a qualified doctor for accurate medical advice. You can also visit the Health Q&A page for more information.",
      te: "నాకు దాని గురించి తెలియదు. ఖచ్చితమైన వైద్య సలహా కోసం అర్హత కలిగిన డాక్టర్‌ను సంప్రదించండి.",
      hi: "मुझे इसके बारे में जानकारी नहीं है। सटीक चिकित्सा सलाह के लिए योग्य डॉक्टर से मिलें।",
    }
    return { text: fallbacks[language] || fallbacks.en, action: null }
  }

  let text = match.answer
  if (language === "te" && match.telugu) text = match.telugu
  if (language === "hi" && match.hindi)  text = match.hindi

  // Detect special actions
  let action = null
  if (match.keywords.some((k) => ["ambulance", "call ambulance", "108"].includes(k))) {
    action = "navigate_sos"
  } else if (match.keywords.some((k) => ["nearest hospital", "find hospital", "nearby hospital"].includes(k))) {
    action = "navigate_hospitals"
  }

  return { text, action }
}

/**
 * Detect if input is an emergency phrase.
 */
export function isEmergency(input) {
  const emergencyKeywords = [
    "chest pain", "heart attack", "stroke", "unconscious", "not breathing",
    "ambulance", "emergency", "can't breathe", "collapsed", "108",
  ]
  const normalized = input.toLowerCase()
  return emergencyKeywords.some((k) => normalized.includes(k))
}
