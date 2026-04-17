const mongoose = require("mongoose")

const sosLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  status: { type: String, default: "Alert Sent" },
  alertType: { type: String, default: "Auto" }, // "Auto" | "Manual"
  alertTriggered: { type: Boolean, default: true },
  alertTimestamp: { type: Date, default: Date.now },
  notifiedContacts: [String],
  timestamp: { type: Date, default: Date.now },
  resolved: { type: Boolean, default: false },
}, { timestamps: true })

module.exports = mongoose.model("SosLog", sosLogSchema)
