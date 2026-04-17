const express = require("express")
const Hospital = require("../models/Hospital")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const filter = {}
    if (req.query.location) filter.location = req.query.location
    const hospitals = await Hospital.find(filter)
    res.json({ hospitals })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/:id", async (req, res) => {
  try {
    const hospital = await Hospital.findById(req.params.id)
    if (!hospital) return res.status(404).json({ message: "Hospital not found" })
    res.json({ hospital })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
