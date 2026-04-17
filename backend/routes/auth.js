const express = require("express")
const jwt = require("jsonwebtoken")
const User = require("../models/User")

const router = express.Router()

router.post("/register", async (req, res) => {
  try {
    const { name, email, password } = req.body
    const existing = await User.findOne({ email })
    if (existing) return res.status(400).json({ message: "Email already registered" })

    const user = await User.create({ name, email, password })
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.status(201).json({ user: { _id: user._id, name: user.name, email: user.email }, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })
    if (!user) return res.status(404).json({ message: "User not found" })

    const match = await user.comparePassword(password)
    if (!match) return res.status(401).json({ message: "Invalid password" })

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" })
    res.json({ user: { _id: user._id, name: user.name, email: user.email }, token })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router
