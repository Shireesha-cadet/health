const express = require("express")
const Report = require("../models/Report")

const router = express.Router()

// Upload report
router.post("/upload", async (req, res) => {
  try {
    const { userId, fileName, fileUrl } = req.body
    const report = await Report.create({ userId, fileName, fileUrl })
    res.status(201).json({ report })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all reports for user
router.get("/:userId", async (req, res) => {
  try {
    const reports = await Report.find({ userId: req.params.userId }).sort({ date: -1 })
    res.json({ reports })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Generate AI report
router.post("/generate", async (req, res) => {
  try {
    const { userId, vitals, aiSummary, timestamp } = req.body
    const vitalsSummary = vitals
      ? `HR: ${vitals.heartRate}, BP: ${vitals.bloodPressure}, SpO2: ${vitals.spO2}%, Glucose: ${vitals.glucose} mg/dL, Temp: ${vitals.temperature}`
      : ""
    const report = await Report.create({
      userId,
      fileName: `AI Report - ${new Date(timestamp || Date.now()).toLocaleDateString()}`,
      reportText: aiSummary || "AI health report generated.",
      vitalsSummary,
      aiSummary: aiSummary || "Vitals recorded and analyzed.",
      date: timestamp ? new Date(timestamp) : new Date(),
    })
    res.status(201).json({ report })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
