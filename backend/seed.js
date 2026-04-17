require("dotenv").config()
const mongoose = require("mongoose")
const Doctor = require("./models/Doctor")
const Hospital = require("./models/Hospital")
const Scheme = require("./models/Scheme")

const doctors = [
  { name: "Dr. Ramesh Kumar", specialization: "Cardiologist", hospitalName: "City Life Hospital", location: "KPHB", workingHours: "9AM - 5PM", rating: 4.8, availableSlots: ["9:00 AM", "11:00 AM", "3:00 PM"] },
  { name: "Dr. Priya Sharma", specialization: "Neurologist", hospitalName: "Green Valley Medical", location: "Gachibowli", workingHours: "10AM - 6PM", rating: 4.6, availableSlots: ["10:00 AM", "1:00 PM", "4:00 PM"] },
  { name: "Dr. Suresh Reddy", specialization: "General Physician", hospitalName: "Sunrise Senior Care", location: "Aziznagar", workingHours: "8AM - 4PM", rating: 4.5, availableSlots: ["8:00 AM", "10:00 AM", "2:00 PM"] },
  { name: "Dr. Anitha Rao", specialization: "Diabetologist", hospitalName: "Hope Multi-Speciality", location: "KPHB", workingHours: "11AM - 7PM", rating: 4.7, availableSlots: ["11:00 AM", "2:00 PM", "5:00 PM"] },
  { name: "Dr. Venkat Naidu", specialization: "Cardiologist", hospitalName: "City Life Hospital", location: "Gachibowli", workingHours: "9AM - 3PM", rating: 4.9, availableSlots: ["9:30 AM", "12:00 PM", "2:30 PM"] },
]

const hospitals = [
  { name: "City Life Hospital", specialization: "Multi-Speciality", location: "KPHB", rating: 4.7, image: "https://images.unsplash.com/photo-1586773860418-d37222d8fce3?w=400", googleMapsLink: "https://maps.google.com/?q=KPHB+Hospital+Hyderabad" },
  { name: "Green Valley Medical Center", specialization: "Neurology & Ortho", location: "Gachibowli", rating: 4.3, image: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?w=400", googleMapsLink: "https://maps.google.com/?q=Gachibowli+Hospital+Hyderabad" },
  { name: "Sunrise Senior Care Hospital", specialization: "Geriatrics & General", location: "Aziznagar", rating: 4.9, image: "https://images.unsplash.com/photo-1538108149393-fbbd81895907?w=400", googleMapsLink: "https://maps.google.com/?q=Aziznagar+Hospital+Hyderabad" },
  { name: "Hope Multi-Speciality Clinic", specialization: "Diabetes & Cardiology", location: "KPHB", rating: 4.5, image: "https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400", googleMapsLink: "https://maps.google.com/?q=KPHB+Clinic+Hyderabad" },
]

const schemes = [
  { name: "Ayushman Bharat PM-JAY", category: "Health", description: "Health insurance coverage up to ₹5 lakh per family per year for secondary and tertiary care.", benefits: "₹5 lakh health cover", eligibility: "BPL families and low-income groups", applyLink: "https://pmjay.gov.in" },
  { name: "PM Kisan Samman Nidhi", category: "Agriculture", description: "Direct income support of ₹6000/year to farmer families.", benefits: "₹6000/year direct transfer", eligibility: "Small and marginal farmers", applyLink: "https://pmkisan.gov.in" },
  { name: "Pradhan Mantri Awas Yojana", category: "Housing", description: "Affordable housing for urban and rural poor.", benefits: "Subsidy on home loans", eligibility: "EWS/LIG/MIG categories", applyLink: "https://pmaymis.gov.in" },
  { name: "PM Jeevan Jyoti Bima Yojana", category: "Insurance", description: "Life insurance cover of ₹2 lakh at ₹436/year premium.", benefits: "₹2 lakh life cover", eligibility: "Age 18-50, bank account holders", applyLink: "https://jansuraksha.gov.in" },
  { name: "National Scholarship Portal", category: "Education", description: "Scholarships for students from minority and SC/ST communities.", benefits: "Tuition and maintenance allowance", eligibility: "Students with family income below ₹2.5 lakh", applyLink: "https://scholarships.gov.in" },
  { name: "PM SVANidhi", category: "Business", description: "Micro-credit for street vendors to restart livelihoods.", benefits: "Loan up to ₹50,000", eligibility: "Street vendors with vending certificate", applyLink: "https://pmsvanidhi.mohua.gov.in" },
  { name: "Indira Gandhi National Old Age Pension", category: "Pension", description: "Monthly pension for elderly BPL citizens.", benefits: "₹200-₹500/month pension", eligibility: "Age 60+, BPL households", applyLink: "https://nsap.nic.in" },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log("Connected to MongoDB")

  await Doctor.deleteMany({})
  await Hospital.deleteMany({})
  await Scheme.deleteMany({})

  await Doctor.insertMany(doctors)
  await Hospital.insertMany(hospitals)
  await Scheme.insertMany(schemes)

  console.log("✅ Seeded doctors, hospitals, and schemes")
  process.exit(0)
}

seed().catch((err) => {
  console.error(err)
  process.exit(1)
})
