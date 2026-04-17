const mongoose = require("mongoose")

const healthProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, unique: true },
  age: Number,
  gender: String,
  location: String,
  allergies: String,
  medicalHistory: String,
  medications: String,
}, { timestamps: true })

module.exports = mongoose.model("HealthProfile", healthProfileSchema)
