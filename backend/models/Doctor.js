const mongoose = require("mongoose")

const doctorSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  hospitalName: String,
  location: String,
  workingHours: String,
  rating: Number,
  availableSlots: [String],
}, { timestamps: true })

module.exports = mongoose.model("Doctor", doctorSchema)
