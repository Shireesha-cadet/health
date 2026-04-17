const mongoose = require("mongoose")

const hospitalSchema = new mongoose.Schema({
  name: String,
  specialization: String,
  location: String,
  rating: Number,
  image: String,
  googleMapsLink: String,
}, { timestamps: true })

module.exports = mongoose.model("Hospital", hospitalSchema)
