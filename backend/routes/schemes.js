const express = require("express")
const Scheme = require("../models/Scheme")

const router = express.Router()

router.get("/", async (req, res) => {
  try {
    const filter = {}
    if (req.query.category) filter.category = req.query.category
    const schemes = await Scheme.find(filter)
    res.json({ schemes })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
