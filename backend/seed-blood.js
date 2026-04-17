require("dotenv").config()
const mongoose = require("mongoose")
const BloodBank = require("./models/BloodBank")
const Donor = require("./models/Donor")

const bloodBanks = [
  // KPHB
  {
    name: "Red Cross Blood Bank",
    location: "KPHB",
    contact: "9000000001",
    address: "KPHB Colony, Hyderabad",
    bloodGroups: { "A+": 12, "A-": 0, "B+": 10, "B-": 0, "O+": 15, "O-": 6, "AB+": 8, "AB-": 0 },
  },
  {
    name: "LifeCare Blood Center",
    location: "KPHB",
    contact: "9000000002",
    address: "KPHB Phase 2, Hyderabad",
    bloodGroups: { "A+": 10, "A-": 4, "B+": 9, "B-": 0, "O+": 14, "O-": 0, "AB+": 6, "AB-": 0 },
  },
  // Gachibowli
  {
    name: "Apollo Blood Bank",
    location: "Gachibowli",
    contact: "9000000003",
    address: "Apollo Hospital, Gachibowli, Hyderabad",
    bloodGroups: { "A+": 11, "A-": 0, "B+": 8, "B-": 0, "O+": 16, "O-": 5, "AB+": 0, "AB-": 3 },
  },
  {
    name: "Care Hospitals Blood Bank",
    location: "Gachibowli",
    contact: "9000000004",
    address: "Care Hospitals, Gachibowli, Hyderabad",
    bloodGroups: { "A+": 9, "A-": 0, "B+": 0, "B-": 4, "O+": 13, "O-": 0, "AB+": 7, "AB-": 2 },
  },
  // Madhapur
  {
    name: "Yashoda Blood Bank",
    location: "Madhapur",
    contact: "9000000005",
    address: "Yashoda Hospital, Madhapur, Hyderabad",
    bloodGroups: { "A+": 14, "A-": 3, "B+": 11, "B-": 0, "O+": 18, "O-": 0, "AB+": 9, "AB-": 0 },
  },
  {
    name: "Medicover Blood Center",
    location: "Madhapur",
    contact: "9000000006",
    address: "Medicover Hospital, Madhapur, Hyderabad",
    bloodGroups: { "A+": 0, "A-": 0, "B+": 7, "B-": 0, "O+": 12, "O-": 4, "AB+": 5, "AB-": 3 },
  },
  // Kukatpally
  {
    name: "KIMS Blood Bank",
    location: "Kukatpally",
    contact: "9000000007",
    address: "KIMS Hospital, Kukatpally, Hyderabad",
    bloodGroups: { "A+": 13, "A-": 0, "B+": 10, "B-": 0, "O+": 17, "O-": 6, "AB+": 8, "AB-": 0 },
  },
  {
    name: "Sunshine Blood Bank",
    location: "Kukatpally",
    contact: "9000000008",
    address: "Sunshine Hospital, Kukatpally, Hyderabad",
    bloodGroups: { "A+": 0, "A-": 5, "B+": 0, "B-": 4, "O+": 9, "O-": 7, "AB+": 0, "AB-": 3 },
  },
]

const donors = [
  // KPHB - A+
  { name: "Ramesh", bloodGroup: "A+", phone: "9876543210", location: "KPHB", available: true },
  { name: "Suresh", bloodGroup: "A+", phone: "9876543211", location: "KPHB", available: true },
  { name: "Mahesh", bloodGroup: "A+", phone: "9876543212", location: "KPHB", available: true },
  { name: "Naresh", bloodGroup: "A+", phone: "9876543213", location: "KPHB", available: true },
  { name: "Kiran",  bloodGroup: "A+", phone: "9876543214", location: "KPHB", available: true },
  // KPHB - B+
  { name: "Ravi",   bloodGroup: "B+", phone: "9876543215", location: "KPHB", available: true },
  { name: "Ajay",   bloodGroup: "B+", phone: "9876543216", location: "KPHB", available: true },
  { name: "Vijay",  bloodGroup: "B+", phone: "9876543217", location: "KPHB", available: true },
  { name: "Sanjay", bloodGroup: "B+", phone: "9876543218", location: "KPHB", available: true },
  { name: "Deepak", bloodGroup: "B+", phone: "9876543219", location: "KPHB", available: true },
  // KPHB - O+
  { name: "Rahul",  bloodGroup: "O+", phone: "9876543220", location: "KPHB", available: true },
  { name: "Varun",  bloodGroup: "O+", phone: "9876543221", location: "KPHB", available: true },
  { name: "Tarun",  bloodGroup: "O+", phone: "9876543222", location: "KPHB", available: true },
  { name: "Arjun",  bloodGroup: "O+", phone: "9876543223", location: "KPHB", available: true },
  { name: "Naveen", bloodGroup: "O+", phone: "9876543224", location: "KPHB", available: true },
  // KPHB - AB+
  { name: "Pavan",  bloodGroup: "AB+", phone: "9876543225", location: "KPHB", available: true },
  { name: "Charan", bloodGroup: "AB+", phone: "9876543226", location: "KPHB", available: true },
  { name: "Teja",   bloodGroup: "AB+", phone: "9876543227", location: "KPHB", available: true },
  { name: "Manoj",  bloodGroup: "AB+", phone: "9876543228", location: "KPHB", available: true },
  { name: "Vamsi",  bloodGroup: "AB+", phone: "9876543229", location: "KPHB", available: true },
  // Gachibowli - A-
  { name: "Srikanth", bloodGroup: "A-", phone: "9876543230", location: "Gachibowli", available: true },
  { name: "Praveen",  bloodGroup: "A-", phone: "9876543231", location: "Gachibowli", available: true },
  { name: "Rakesh",   bloodGroup: "A-", phone: "9876543232", location: "Gachibowli", available: true },
  { name: "Dinesh",   bloodGroup: "A-", phone: "9876543233", location: "Gachibowli", available: true },
  { name: "Harish",   bloodGroup: "A-", phone: "9876543234", location: "Gachibowli", available: true },
  // Gachibowli - B-
  { name: "Karthik", bloodGroup: "B-", phone: "9876543235", location: "Gachibowli", available: true },
  { name: "Rohit",   bloodGroup: "B-", phone: "9876543236", location: "Gachibowli", available: true },
  { name: "Nikhil",  bloodGroup: "B-", phone: "9876543237", location: "Gachibowli", available: true },
  { name: "Surya",   bloodGroup: "B-", phone: "9876543238", location: "Gachibowli", available: true },
  { name: "Aditya",  bloodGroup: "B-", phone: "9876543239", location: "Gachibowli", available: true },
  // Gachibowli - O-
  { name: "Anand",   bloodGroup: "O-", phone: "9876543240", location: "Gachibowli", available: true },
  { name: "Gopi",    bloodGroup: "O-", phone: "9876543241", location: "Gachibowli", available: true },
  { name: "Sandeep", bloodGroup: "O-", phone: "9876543242", location: "Gachibowli", available: true },
  { name: "Vinay",   bloodGroup: "O-", phone: "9876543243", location: "Gachibowli", available: true },
  { name: "Uday",    bloodGroup: "O-", phone: "9876543244", location: "Gachibowli", available: true },
  // Gachibowli - AB-
  { name: "Lokesh",  bloodGroup: "AB-", phone: "9876543245", location: "Gachibowli", available: true },
  { name: "Bharat",  bloodGroup: "AB-", phone: "9876543246", location: "Gachibowli", available: true },
  { name: "Chandu",  bloodGroup: "AB-", phone: "9876543247", location: "Gachibowli", available: true },
  { name: "Raju",    bloodGroup: "AB-", phone: "9876543248", location: "Gachibowli", available: true },
  { name: "Kishore", bloodGroup: "AB-", phone: "9876543249", location: "Gachibowli", available: true },
  // Madhapur - A+
  { name: "Akhil",  bloodGroup: "A+", phone: "9876543250", location: "Madhapur", available: true },
  { name: "Sai",    bloodGroup: "A+", phone: "9876543251", location: "Madhapur", available: true },
  { name: "Rohith", bloodGroup: "A+", phone: "9876543252", location: "Madhapur", available: true },
  { name: "Ganesh", bloodGroup: "A+", phone: "9876543253", location: "Madhapur", available: true },
  { name: "Kalyan", bloodGroup: "A+", phone: "9876543254", location: "Madhapur", available: true },
  // Madhapur - O+
  { name: "Prasad",  bloodGroup: "O+", phone: "9876543255", location: "Madhapur", available: true },
  { name: "Venu",    bloodGroup: "O+", phone: "9876543256", location: "Madhapur", available: true },
  { name: "Ramu",    bloodGroup: "O+", phone: "9876543257", location: "Madhapur", available: true },
  { name: "Krishna", bloodGroup: "O+", phone: "9876543258", location: "Madhapur", available: true },
  { name: "Shiva",   bloodGroup: "O+", phone: "9876543259", location: "Madhapur", available: true },
  // Kukatpally - B+
  { name: "Rajesh", bloodGroup: "B+", phone: "9876543260", location: "Kukatpally", available: true },
  { name: "Murali", bloodGroup: "B+", phone: "9876543261", location: "Kukatpally", available: true },
  { name: "Hari",   bloodGroup: "B+", phone: "9876543262", location: "Kukatpally", available: true },
  { name: "Sunil",  bloodGroup: "B+", phone: "9876543263", location: "Kukatpally", available: true },
  { name: "Anil",   bloodGroup: "B+", phone: "9876543264", location: "Kukatpally", available: true },
]

async function seed() {
  await mongoose.connect(process.env.MONGO_URI)
  console.log("Connected to MongoDB")
  await BloodBank.deleteMany({})
  await Donor.deleteMany({})
  await BloodBank.insertMany(bloodBanks)
  await Donor.insertMany(donors)
  console.log(`✅ Seeded ${bloodBanks.length} blood banks and ${donors.length} donors`)
  process.exit(0)
}

seed().catch((err) => { console.error(err); process.exit(1) })
