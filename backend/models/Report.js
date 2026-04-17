const mongoose = require("mongoose")

const reportSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  fileName: { type: String, default: "AI Health Report" },
  fileUrl: { type: String, default: "" },
  reportText: { type: String, default: "" },
  vitalsSummary: { type: String, default: "" },
  aiSummary: { type: String, default: "" },
  date: { type: Date, default: Date.now },
}, { timestamps: true })

module.exports = mongoose.model("Report", reportSchema)
