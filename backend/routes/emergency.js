const express = require("express")
const EmergencyContact = require("../models/EmergencyContact")

const router = express.Router()

router.post("/add", async (req, res) => {
  try {
    const { userId, name, phone, relation } = req.body
    const contact = await EmergencyContact.create({ userId, name, phone, relation })
    res.status(201).json({ contact })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/:userId", async (req, res) => {
  try {
    const contacts = await EmergencyContact.find({ userId: req.params.userId })
    res.json({ contacts })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
