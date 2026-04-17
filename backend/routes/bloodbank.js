const express = require("express")
const BloodBank = require("../models/BloodBank")
const Donor = require("../models/Donor")

const router = express.Router()

// GET /api/bloodbanks
router.get("/", async (req, res) => {
  try {
    const filter = {}
    if (req.query.location) filter.location = req.query.location
    const banks = await BloodBank.find(filter)
    res.json({ bloodBanks: banks })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// GET /api/donors
router.get("/donors", async (req, res) => {
  try {
    const filter = {}
    if (req.query.bloodGroup) filter.bloodGroup = req.query.bloodGroup
    if (req.query.location) filter.location = req.query.location
    const donors = await Donor.find(filter).sort({ available: -1 })
    res.json({ donors })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/bloodbanks/register-donor
router.post("/register-donor", async (req, res) => {
  try {
    const { name, bloodGroup, phone, location, available } = req.body
    if (!name || !bloodGroup || !phone || !location) {
      return res.status(400).json({ message: "All fields are required" })
    }
    const donor = await Donor.create({ name, bloodGroup, phone, location, available: available ?? true })
    res.status(201).json({ donor })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// POST /api/bloodbanks/request-blood
router.post("/request-blood", async (req, res) => {
  try {
    const { bloodGroup, location } = req.body
    if (!bloodGroup) return res.status(400).json({ message: "Blood group is required" })

    const donorFilter = { bloodGroup, available: true }
    if (location) donorFilter.location = location

    const donors = await Donor.find(donorFilter)

    // Find banks that have this blood group with units > 0
    const bankFilter = {}
    if (location) bankFilter.location = location
    const allBanks = await BloodBank.find(bankFilter)
    const banks = allBanks.filter((b) => (b.bloodGroups?.[bloodGroup] || 0) > 0)

    res.json({ donors, bloodBanks: banks })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
