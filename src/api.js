const API_BASE_URL = "http://localhost:5000/api"

async function request(path, options = {}) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), 8000)

  let response
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      headers: { "Content-Type": "application/json" },
      signal: controller.signal,
      ...options,
    })
  } catch (err) {
    clearTimeout(timeout)
    if (err.name === "AbortError") {
      throw new Error("Server not responding. Make sure the backend is running.")
    }
    throw new Error("Cannot connect to server. Make sure the backend is running.")
  }
  clearTimeout(timeout)

  let data = {}
  try {
    data = await response.json()
  } catch {
    data = { message: "Invalid server response" }
  }
  if (!response.ok) {
    throw new Error(data.message || "Request failed")
  }
  return data
}

export const api = {
  register: (payload) =>
    request("/auth/register", { method: "POST", body: JSON.stringify(payload) }),
  login: (payload) =>
    request("/auth/login", { method: "POST", body: JSON.stringify(payload) }),

  addEmergencyContact: (payload) =>
    request("/emergency/add", { method: "POST", body: JSON.stringify(payload) }),
  getEmergencyContacts: (userId) => request(`/emergency/${userId}`),

  saveHealthProfile: (payload) =>
    request("/health/add", { method: "POST", body: JSON.stringify(payload) }),
  getHealthProfile: (userId) => request(`/health/${userId}`),

  uploadReport: (payload) =>
    request("/reports/upload", { method: "POST", body: JSON.stringify(payload) }),
  getReports: (userId) => request(`/reports/${userId}`),

  triggerSOS: (payload) =>
    request("/sos/trigger", { method: "POST", body: JSON.stringify(payload) }),
  getSOSLogs: (userId) => request(`/sos/${userId}`),
  getActiveAlert: (userId) => request(`/sos/active/${userId}`),
  resolveAlert: (logId) => request(`/sos/resolve/${logId}`, { method: "POST" }),

  getDoctors: (filters = {}) => {
    const params = new URLSearchParams(filters)
    const suffix = params.toString() ? `?${params.toString()}` : ""
    return request(`/doctors${suffix}`)
  },
  bookAppointment: (payload) =>
    request("/appointment/book", { method: "POST", body: JSON.stringify(payload) }),
  getAppointments: (userId) => request(`/appointment/${userId}`),

  getSchemes: (category) => request(category ? `/schemes?category=${encodeURIComponent(category)}` : "/schemes"),
  getHospitals: (location) => request(location ? `/hospitals?location=${encodeURIComponent(location)}` : "/hospitals"),
  getHospitalById: (id) => request(`/hospitals/${id}`),
  getDoctorsByHospital: (hospitalName) => request(`/doctors?hospitalName=${encodeURIComponent(hospitalName)}`),

  askAI: (payload) => request("/ai/chat", { method: "POST", body: JSON.stringify(payload) }),

  getBloodBanks: (location) => request(location ? `/bloodbanks?location=${encodeURIComponent(location)}` : "/bloodbanks"),
  getDonors: (filters = {}) => {
    const params = new URLSearchParams(filters)
    return request(`/bloodbanks/donors${params.toString() ? `?${params}` : ""}`)
  },
  registerDonor: (payload) => request("/bloodbanks/register-donor", { method: "POST", body: JSON.stringify(payload) }),
  requestBlood: (payload) => request("/bloodbanks/request-blood", { method: "POST", body: JSON.stringify(payload) }),

  getAmbulanceLocation: (userId, userLat, userLng) =>
    request(`/ambulance/location?userId=${userId}&userLat=${userLat}&userLng=${userLng}`),
  updateAmbulance: (payload) => request("/ambulance/update", { method: "POST", body: JSON.stringify(payload) }),
  resetAmbulance: (userId) => request("/ambulance/reset", { method: "POST", body: JSON.stringify({ userId }) }),

  getMedicines: (userId) => request(`/medicines?userId=${userId}`),
  getPendingReminders: (userId) => request(`/medicines/pending?userId=${userId}`),
  addMedicine: (payload) => request("/medicines/add", { method: "POST", body: JSON.stringify(payload) }),
  markDose: (payload) => request("/medicines/mark", { method: "POST", body: JSON.stringify(payload) }),
  snoozeDose: (payload) => request("/medicines/snooze", { method: "POST", body: JSON.stringify(payload) }),
  deleteMedicine: (id) => request(`/medicines/${id}`, { method: "DELETE" }),
  getAdherence: (userId) => request(`/medicines/adherence?userId=${userId}`),

  generateReport: (payload) =>
    request("/report/generate", { method: "POST", body: JSON.stringify(payload) }),
}
