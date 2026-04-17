const API_BASE_URL = "http://localhost:5000/api"

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  })

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

  generateReport: (payload) =>
    request("/report/generate", { method: "POST", body: JSON.stringify(payload) }),
}
