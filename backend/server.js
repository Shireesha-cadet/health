require("dotenv").config()
const express = require("express")
const cors = require("cors")
const mongoose = require("mongoose")

const app = express()
app.use(cors())
app.use(express.json({ limit: "10mb" }))

// Routes
app.use("/api/auth", require("./routes/auth"))
app.use("/api/emergency", require("./routes/emergency"))
app.use("/api/health", require("./routes/health"))
app.use("/api/reports", require("./routes/reports"))
app.use("/api/report", require("./routes/reports"))
app.use("/api/sos", require("./routes/sos"))
app.use("/api/doctors", require("./routes/doctors"))
app.use("/api/appointment", require("./routes/appointments"))
app.use("/api/schemes", require("./routes/schemes"))
app.use("/api/hospitals", require("./routes/hospitals"))
app.use("/api/ai", require("./routes/ai"))
app.use("/api/bloodbanks", require("./routes/bloodbank"))
app.use("/api/ambulance", require("./routes/ambulance"))
app.use("/api/medicines", require("./routes/medicines"))

app.get("/", (req, res) => res.json({ message: "AI Smart Care API running" }))

async function connectDB() {
  console.log("Checking MongoDB connection...")
  try {
    await mongoose.connect(process.env.MONGO_URI)
    console.log("✅ MongoDB Connected")
  } catch (err) {
    console.error("❌ MongoDB Connection Failed:", err.message)
    console.error("👉 Make sure MongoDB is running: run 'mongod' in a terminal")
    process.exit(1)
  }
}

connectDB().then(() => {
  app.listen(process.env.PORT, () =>
    console.log(`Server running on http://localhost:${process.env.PORT}`)
  )
})
