const mongoose = require("mongoose")

const appointmentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  doctorId: { type: mongoose.Schema.Types.ObjectId, ref: "Doctor" },
  doctorName: String,
  specialization: String,
  hospitalName: String,
  location: String,
  slot: String,
  patientName: String,
  status: { type: String, default: "Confirmed" },
}, { timestamps: true })

module.exports = mongoose.model("Appointment", appointmentSchema)
