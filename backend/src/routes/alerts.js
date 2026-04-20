const express = require('express');
const prisma = require('../prisma');

const router = express.Router();

const toRad = (value) => (value * Math.PI) / 180;
const getDistanceMeters = (lat1, lon1, lat2, lon2) => {
  const R = 6371000;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const radius = parseFloat(req.query.radius) || 2;
    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

    const alerts = await prisma.alert.findMany({
      where: {
        latitude: {
          gte: lat - latDelta,
          lte: lat + latDelta
        },
        longitude: {
          gte: lng - lngDelta,
          lte: lng + lngDelta
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const nearbyAlerts = alerts.filter((alert) => {
      const distance = getDistanceMeters(lat, lng, alert.latitude, alert.longitude);
      return distance <= (alert.radiusKm || 2) * 1000;
    });

    res.json({ alerts: nearbyAlerts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load nearby alerts' });
  }
});

module.exports = router;
