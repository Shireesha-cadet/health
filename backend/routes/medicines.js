const express = require("express")
const Medicine = require("../models/Medicine")

const router = express.Router()

// ── Helpers ───────────────────────────────────────────────────────────────────

// Build today's dose logs for a medicine
function buildTodayLogs(times) {
  const today = new Date()
  return times.map((t) => {
    const [h, m] = t.split(":").map(Number)
    const scheduledAt = new Date(today.getFullYear(), today.getMonth(), today.getDate(), h, m, 0)
    return { scheduledAt, status: "pending", retryCount: 0 }
  })
}

// ── POST /api/medicines/add ───────────────────────────────────────────────────
router.post("/add", async (req, res) => {
  try {
    const { userId, name, dosage, times, startDate, endDate } = req.body
    if (!userId || !name || !times?.length) {
      return res.status(400).json({ message: "userId, name and times are required" })
    }
    const medicine = await Medicine.create({
      userId,
      name,
      dosage,
      times,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      doseLogs: buildTodayLogs(times),
    })
    res.status(201).json({ medicine })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/medicines?userId=xxx ─────────────────────────────────────────────
router.get("/", async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ message: "userId required" })
    const medicines = await Medicine.find({ userId, active: true }).sort({ createdAt: -1 })
    res.json({ medicines })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/medicines/pending?userId=xxx ─────────────────────────────────────
// Returns doses due in the next 60 min or overdue & still pending
router.get("/pending", async (req, res) => {
  try {
    const { userId } = req.query
    if (!userId) return res.status(400).json({ message: "userId required" })

    const now = new Date()
    const soon = new Date(now.getTime() + 60 * 60 * 1000) // +1 hour

    const medicines = await Medicine.find({ userId, active: true })
    const pending = []

    for (const med of medicines) {
      for (const log of med.doseLogs) {
        if (log.status === "pending") {
          const due = new Date(log.scheduledAt)
          // Due now (overdue) or within next 60 min
          if (due <= soon) {
            pending.push({
              medicineId: med._id,
              logId: log._id,
              name: med.name,
              dosage: med.dosage,
              scheduledAt: log.scheduledAt,
              retryCount: log.retryCount,
              overdue: due < now,
            })
          }
        }
      }
    }

    res.json({ pending })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/medicines/mark ──────────────────────────────────────────────────
router.post("/mark", async (req, res) => {
  try {
    const { medicineId, logId, status } = req.body // status: "taken" | "missed"
    if (!["taken", "missed"].includes(status)) {
      return res.status(400).json({ message: "status must be taken or missed" })
    }
    const med = await Medicine.findById(medicineId)
    if (!med) return res.status(404).json({ message: "Medicine not found" })

    const log = med.doseLogs.id(logId)
    if (!log) return res.status(404).json({ message: "Dose log not found" })

    log.status = status
    log.respondedAt = new Date()
    await med.save()

    res.json({ success: true, status })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/medicines/snooze ────────────────────────────────────────────────
// Increment retry count, reschedule +15 min
router.post("/snooze", async (req, res) => {
  try {
    const { medicineId, logId } = req.body
    const med = await Medicine.findById(medicineId)
    if (!med) return res.status(404).json({ message: "Medicine not found" })

    const log = med.doseLogs.id(logId)
    if (!log) return res.status(404).json({ message: "Dose log not found" })

    if (log.retryCount >= 3) {
      log.status = "missed"
    } else {
      log.retryCount += 1
      log.scheduledAt = new Date(new Date(log.scheduledAt).getTime() + 15 * 60 * 1000)
    }
    await med.save()
    res.json({ success: true, retryCount: log.retryCount, nextAt: log.scheduledAt })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/medicines/:id ─────────────────────────────────────────────────
router.delete("/:id", async (req, res) => {
  try {
    await Medicine.findByIdAndUpdate(req.params.id, { active: false })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/medicines/adherence?userId=xxx ───────────────────────────────────
router.get("/adherence", async (req, res) => {
  try {
    const { userId } = req.query
    const medicines = await Medicine.find({ userId })
    let taken = 0, missed = 0, pending = 0
    for (const med of medicines) {
      for (const log of med.doseLogs) {
        if (log.status === "taken") taken++
        else if (log.status === "missed") missed++
        else pending++
      }
    }
    const total = taken + missed
    res.json({ taken, missed, pending, adherence: total ? Math.round((taken / total) * 100) : null })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
