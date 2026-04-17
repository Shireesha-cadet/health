import {
  Activity,
  Droplets,
  Heart,
  Thermometer,
  Waves,
} from "lucide-react"

export const healthCards = [
  { label: "Heart Rate", value: "76 bpm", status: "Normal", icon: Heart },
  { label: "Blood Pressure", value: "126/82", status: "Warning", icon: Activity },
  { label: "SpO2", value: "97%", status: "Normal", icon: Droplets },
  { label: "Glucose", value: "142 mg/dL", status: "Warning", icon: Waves },
  { label: "Temperature", value: "98.4 F", status: "Normal", icon: Thermometer },
]

export const bpWeeklyData = [
  { day: "Mon", systolic: 120, diastolic: 78 },
  { day: "Tue", systolic: 124, diastolic: 80 },
  { day: "Wed", systolic: 128, diastolic: 82 },
  { day: "Thu", systolic: 122, diastolic: 79 },
  { day: "Fri", systolic: 126, diastolic: 81 },
  { day: "Sat", systolic: 130, diastolic: 84 },
  { day: "Sun", systolic: 125, diastolic: 80 },
]

export const emergencyLogs = [
  { id: 1, time: "08:30 AM", event: "Medication reminder missed", status: "Resolved" },
  { id: 2, time: "01:10 PM", event: "Low blood pressure signal", status: "Monitoring" },
  { id: 3, time: "07:45 PM", event: "Caregiver check-in requested", status: "Completed" },
]

export const hospitals = [
  { id: 1, name: "City Life Hospital", rating: 4.7 },
  { id: 2, name: "Green Valley Medical Center", rating: 4.3 },
  { id: 3, name: "Sunrise Senior Care Hospital", rating: 4.9 },
  { id: 4, name: "Hope Multi-Speciality Clinic", rating: 4.5 },
]

export const doctorTypes = [
  "Cardiologist",
  "Neurologist",
  "General Physician",
  "Diabetologist",
]

export const healthTimeline = [
  { id: 1, date: "12 Apr 2026", title: "Routine Checkup", detail: "Vitals stable, no acute issues reported." },
  { id: 2, date: "08 Apr 2026", title: "Glucose Review", detail: "Slightly elevated post-lunch glucose trend." },
  { id: 3, date: "03 Apr 2026", title: "Cardiac Observation", detail: "No irregular rhythm detected in weekly scan." },
]

export const reports = [
  { id: 1, title: "Blood Report - March", type: "Lab Analysis" },
  { id: 2, title: "ECG Summary - April", type: "Cardiology" },
  { id: 3, title: "Diabetes Progress Sheet", type: "Endocrinology" },
]

export const trendData = [
  { month: "Jan", score: 72 },
  { month: "Feb", score: 75 },
  { month: "Mar", score: 74 },
  { month: "Apr", score: 79 },
  { month: "May", score: 81 },
]
