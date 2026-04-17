const express = require("express")
const SosLog = require("../models/SosLog")
const EmergencyContact = require("../models/EmergencyContact")

const router = express.Router()

// Trigger SOS (manual or auto)
router.post("/trigger", async (req, res) => {
  try {
    const { userId, alertType = "Manual", vitals } = req.body

    // Prevent duplicate: if unresolved alert exists in last 60s, return it
    const recent = await SosLog.findOne({
      userId,
      resolved: false,
      timestamp: { $gte: new Date(Date.now() - 60 * 1000) },
    })
    if (recent) {
      return res.json({ log: recent, notifiedContacts: recent.notifiedContacts, duplicate: true })
    }

    const contacts = await EmergencyContact.find({ userId })
    const notifiedContacts = contacts.map((c) => `${c.name} (${c.phone})`)

    const log = await SosLog.create({
      userId,
      notifiedContacts,
      alertType,
      alertTriggered: true,
      alertTimestamp: new Date(),
      status: "Alert Sent",
      resolved: false,
      ...(vitals ? { vitalsSnapshot: JSON.stringify(vitals) } : {}),
    })

    res.json({ log, notifiedContacts, duplicate: false })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// IMPORTANT: specific routes MUST come before /:userId wildcard
// Get active (unresolved) alert for a user
router.get("/active/:userId", async (req, res) => {
  try {
    const log = await SosLog.findOne({
      userId: req.params.userId,
      resolved: false,
    }).sort({ timestamp: -1 })

    if (!log) return res.json({ alertTriggered: false })

    res.json({
      alertTriggered: true,
      alertType: log.alertType,
      alertTimestamp: log.alertTimestamp || log.timestamp,
      status: log.status,
      notifiedContacts: log.notifiedContacts,
      logId: log._id,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Resolve / reset alert
router.post("/resolve/:logId", async (req, res) => {
  try {
    await SosLog.findByIdAndUpdate(req.params.logId, { resolved: true, status: "Resolved" })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get all logs for a user — wildcard LAST
router.get("/:userId", async (req, res) => {
  try {
    const logs = await SosLog.find({ userId: req.params.userId }).sort({ timestamp: -1 })
    res.json({ logs })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
