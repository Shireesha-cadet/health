const express = require("express")
const router = express.Router()

// In-memory ambulance state (per session simulation)
const ambulances = {}

// GET /api/ambulance/location?userId=xxx&userLat=xx&userLng=xx
router.get("/location", (req, res) => {
  const { userId, userLat, userLng } = req.query

  const uLat = parseFloat(userLat) || 17.4401
  const uLng = parseFloat(userLng) || 78.3489

  if (!ambulances[userId]) {
    // Spawn ambulance ~2km away from user
    ambulances[userId] = {
      lat: uLat + 0.018,
      lng: uLng + 0.018,
      targetLat: uLat,
      targetLng: uLng,
      startTime: Date.now(),
    }
  }

  const amb = ambulances[userId]
  const dist = calcDistance(amb.lat, amb.lng, uLat, uLng)

  res.json({
    ambulance: { lat: amb.lat, lng: amb.lng },
    user: { lat: uLat, lng: uLng },
    distanceKm: parseFloat(dist.toFixed(3)),
    etaMinutes: parseFloat((dist / 0.5).toFixed(1)), // ~30 km/h in city
  })
})

// POST /api/ambulance/update — move ambulance closer to user
router.post("/update", (req, res) => {
  const { userId, userLat, userLng } = req.body

  const uLat = parseFloat(userLat) || 17.4401
  const uLng = parseFloat(userLng) || 78.3489

  if (!ambulances[userId]) {
    ambulances[userId] = {
      lat: uLat + 0.018,
      lng: uLng + 0.018,
      targetLat: uLat,
      targetLng: uLng,
      startTime: Date.now(),
    }
  }

  const amb = ambulances[userId]
  const step = 0.0015 // ~150m per update

  // Move towards user
  const dLat = uLat - amb.lat
  const dLng = uLng - amb.lng
  const dist = Math.sqrt(dLat * dLat + dLng * dLng)

  if (dist > 0.0005) {
    amb.lat += (dLat / dist) * step
    amb.lng += (dLng / dist) * step
  }

  const distKm = calcDistance(amb.lat, amb.lng, uLat, uLng)

  res.json({
    ambulance: { lat: amb.lat, lng: amb.lng },
    user: { lat: uLat, lng: uLng },
    distanceKm: parseFloat(distKm.toFixed(3)),
    etaMinutes: parseFloat((distKm / 0.5).toFixed(1)),
    arrived: distKm < 0.05,
  })
})

// POST /api/ambulance/reset
router.post("/reset", (req, res) => {
  const { userId } = req.body
  delete ambulances[userId]
  res.json({ reset: true })
})

function calcDistance(lat1, lng1, lat2, lng2) {
  const R = 6371
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLng = ((lng2 - lng1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

module.exports = router
