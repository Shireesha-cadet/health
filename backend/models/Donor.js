const mongoose = require("mongoose")

const donorSchema = new mongoose.Schema({
  name: String,
  bloodGroup: { type: String, enum: ["A+","A-","B+","B-","O+","O-","AB+","AB-"] },
  phone: String,
  location: String,
  available: { type: Boolean, default: true },
}, { timestamps: true })

module.exports = mongoose.model("Donor", donorSchema)
