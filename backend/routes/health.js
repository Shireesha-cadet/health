const express = require("express")
const HealthProfile = require("../models/HealthProfile")

const router = express.Router()

router.post("/add", async (req, res) => {
  try {
    const { userId, ...rest } = req.body
    const profile = await HealthProfile.findOneAndUpdate(
      { userId },
      { userId, ...rest },
      { upsert: true, new: true }
    )
    res.json({ profile })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.get("/:userId", async (req, res) => {
  try {
    const profile = await HealthProfile.findOne({ userId: req.params.userId })
    res.json({ profile })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
