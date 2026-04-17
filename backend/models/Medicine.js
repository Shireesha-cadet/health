const mongoose = require("mongoose")

const doseLogSchema = new mongoose.Schema({
  scheduledAt: Date,
  status: { type: String, enum: ["pending", "taken", "missed"], default: "pending" },
  respondedAt: Date,
  retryCount: { type: Number, default: 0 },
})

const medicineSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  name: { type: String, required: true },
  dosage: String,
  times: [String],       // e.g. ["08:00", "14:00", "20:00"]
  startDate: Date,
  endDate: Date,
  active: { type: Boolean, default: true },
  doseLogs: [doseLogSchema],
}, { timestamps: true })

module.exports = mongoose.model("Medicine", medicineSchema)
