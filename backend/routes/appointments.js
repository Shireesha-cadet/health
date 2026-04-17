const express = require("express")
const Appointment = require("../models/Appointment")
const Doctor = require("../models/Doctor")

const router = express.Router()

router.post("/book", async (req, res) => {
  try {
    const { userId, doctorId, slot, patientName } = req.body
    const doctor = await Doctor.findById(doctorId)
    const appointment = await Appointment.create({
      userId,
      doctorId,
      slot,
      patientName,
      doctorName: doctor?.name || "Doctor",
      specialization: doctor?.specialization || "",
      hospitalName: doctor?.hospitalName || "",
      location: doctor?.location || "",
    })
    res.status(201).json({ appointment })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/:userId", async (req, res) => {
  try {
    const appointments = await Appointment.find({ userId: req.params.userId }).sort({ createdAt: -1 })
    res.json({ appointments })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
