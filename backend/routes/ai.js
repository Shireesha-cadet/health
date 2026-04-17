const express = require("express")
const { GoogleGenerativeAI } = require("@google/generative-ai")

const router = express.Router()

// ── In-memory cache (question → answer, TTL 10 min) ──────────────────────────
const cache = new Map()
const CACHE_TTL = 10 * 60 * 1000

// ── Throttle: track last call time to avoid hammering API ────────────────────
let lastCallTime = 0
const MIN_INTERVAL = 2000 // 2 seconds between calls

// ── Fallback answers for common healthcare questions ─────────────────────────
const FALLBACKS = {
  stroke: "After a stroke, take prescribed medications daily, attend regular physiotherapy, monitor blood pressure, avoid smoking and alcohol, eat a low-sodium diet, and follow up with your neurologist every 3 months.",
  heart: "For heart care: take medications as prescribed, do light walking daily, eat a heart-healthy diet (low salt, low fat), avoid stress, monitor blood pressure, and visit your cardiologist regularly.",
  diabetes: "Manage diabetes by monitoring blood sugar daily, taking insulin/medications on time, eating low-sugar foods, exercising regularly, and visiting your doctor every 3 months for HbA1c checks.",
  bp: "For blood pressure control: reduce salt intake, exercise 30 minutes daily, avoid stress, take medications regularly, and monitor BP at home. Target: below 130/80 mmHg.",
  fever: "For fever: rest well, drink plenty of fluids, take paracetamol if above 38.5°C, use a cool cloth on forehead. If fever exceeds 39°C or lasts more than 3 days, consult a doctor immediately.",
  diet: "A healthy diet for elderly patients: eat fruits, vegetables, whole grains, lean protein. Reduce salt, sugar, and fried foods. Drink 6-8 glasses of water daily. Avoid skipping meals.",
  default: "I'm here to help with your health questions. For personalized medical advice, please consult your doctor. You can also visit the Health Q&A section for common health topics.",
}

function getFallback(question) {
  const q = question.toLowerCase()
  if (q.includes("stroke") || q.includes("brain")) return FALLBACKS.stroke
  if (q.includes("heart") || q.includes("cardiac") || q.includes("chest")) return FALLBACKS.heart
  if (q.includes("diabetes") || q.includes("sugar") || q.includes("glucose")) return FALLBACKS.diabetes
  if (q.includes("blood pressure") || q.includes("bp") || q.includes("hypertension")) return FALLBACKS.bp
  if (q.includes("fever") || q.includes("temperature")) return FALLBACKS.fever
  if (q.includes("diet") || q.includes("food") || q.includes("eat")) return FALLBACKS.diet
  return FALLBACKS.default
}

// ── Call Gemini with 2 retries ────────────────────────────────────────────────
async function callGemini(prompt, retries = 2) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)

  // Try models in order — fallback to older if newer is unavailable
  const models = ["gemini-2.0-flash", "gemini-1.5-flash", "gemini-pro"]

  for (const modelName of models) {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName })
        const result = await model.generateContent(prompt)
        const text = result.response.text()
        if (text?.trim()) return { answer: text, source: "gemini" }
      } catch (err) {
        const msg = err.message || ""
        // Quota exceeded — no point retrying same model
        if (msg.includes("429") || msg.includes("quota")) break
        // Model not found — try next model
        if (msg.includes("404") || msg.includes("not found")) break
        // On last attempt of last model, throw
        if (modelName === models[models.length - 1] && attempt === retries) throw err
        // Wait before retry
        await new Promise((r) => setTimeout(r, 1000 * attempt))
      }
    }
  }
  throw new Error("All models exhausted")
}

// ── POST /api/ai/chat ─────────────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
  const { question, language = "en", age, symptoms } = req.body

  if (!question?.trim()) {
    return res.status(400).json({ answer: "Please enter a question." })
  }

  // Check cache
  const cacheKey = `${question.trim().toLowerCase()}|${language}`
  const cached = cache.get(cacheKey)
  if (cached && Date.now() - cached.time < CACHE_TTL) {
    return res.json({ answer: cached.answer, source: "cache" })
  }

  // Throttle
  const now = Date.now()
  if (now - lastCallTime < MIN_INTERVAL) {
    const fallback = getFallback(question)
    return res.json({ answer: fallback, source: "fallback", note: "Live data temporarily unavailable, showing last updated data." })
  }
  lastCallTime = now

  // No API key configured
  if (!process.env.GEMINI_API_KEY) {
    return res.json({ answer: getFallback(question), source: "fallback", note: "AI not configured." })
  }

  const langInstruction =
    language === "te" ? "Reply in Telugu language." :
    language === "hi" ? "Reply in Hindi language." :
    "Reply in English."

  const contextParts = []
  if (age) contextParts.push(`Patient age: ${age}`)
  if (symptoms) contextParts.push(`Symptoms: ${symptoms}`)

  const prompt = `You are an AI healthcare assistant for elderly patients.
Rules:
- Give safe, accurate, non-dangerous advice
- Keep answers short and clear (3-5 sentences)
- Do not give diagnoses
- Suggest consulting a doctor when needed
- ${langInstruction}
${contextParts.join(". ")}

Question: ${question}`

  try {
    const { answer, source } = await callGemini(prompt)
    // Store in cache
    cache.set(cacheKey, { answer, time: Date.now() })
    return res.json({ answer, source })
  } catch (err) {
    console.error("Gemini failed:", err.message?.substring(0, 100))
    const fallback = getFallback(question)
    return res.json({
      answer: fallback,
      source: "fallback",
      note: "Live data temporarily unavailable, showing last updated data.",
    })
  }
})

module.exports = router
