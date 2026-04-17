require("dotenv").config()
const { GoogleGenerativeAI } = require("@google/generative-ai")

const key = process.env.GEMINI_API_KEY
console.log("Key prefix:", key?.substring(0, 8))
console.log("Key length:", key?.length)

async function test() {
  try {
    const genAI = new GoogleGenerativeAI(key)
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" })
    const result = await model.generateContent("What are symptoms of stroke? Answer in 2 sentences.")
    console.log("✅ Gemini works!")
    console.log("Response:", result.response.text())
  } catch (err) {
    console.error("❌ Gemini error:", err.message)
  }
}

test()
