const express = require("express")
const Doctor = require("../models/Doctor")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const filter = {}
    if (req.query.specialization) filter.specialization = req.query.specialization
    if (req.query.location) filter.location = req.query.location
    if (req.query.hospitalName) filter.hospitalName = req.query.hospitalName

    const doctors = await Doctor.find(filter)
    res.json({ doctors })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
