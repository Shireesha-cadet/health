const mongoose = require("mongoose")

const schemeSchema = new mongoose.Schema({
  name: String,
  category: String,
  description: String,
  benefits: String,
  eligibility: String,
  applyLink: String,
}, { timestamps: true })

module.exports = mongoose.model("Scheme", schemeSchema)
