const path = require('path');
const express = require('express');
const multer = require('multer');
const auth = require('../middleware/auth');
const prisma = require('../prisma');

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, '../../uploads'));
    },
    filename: (req, file, cb) => {
      const safeName = file.originalname.replace(/\s+/g, '_');
      cb(null, `${Date.now()}-${safeName}`);
    }
  })
});

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

router.post('/', auth, upload.single('photo'), async (req, res) => {
  try {
    const { incident_type, description, severity, latitude, longitude, status } = req.body;
    if (!incident_type || !description || !severity || !latitude || !longitude) {
      return res.status(400).json({ error: 'Missing required report fields' });
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);
    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'Latitude and longitude must be valid numbers' });
    }

    const photoUrl = req.file
      ? `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`
      : null;

    const report = await prisma.report.create({
      data: {
        userId: req.user.userId,
        incidentType: incident_type,
        description,
        severity,
        latitude: lat,
        longitude: lng,
        photoUrl,
        status: status || 'open'
      }
    });

    const savedRoutes = await prisma.savedRoute.findMany({
      where: {
        alertsEnabled: true,
        OR: [
          { fromLatitude: { not: null }, fromLongitude: { not: null } },
          { toLatitude: { not: null }, toLongitude: { not: null } }
        ]
      }
    });

    const nearbyRoutes = savedRoutes.filter((route) => {
      const points = [];
      if (route.fromLatitude != null && route.fromLongitude != null) {
        points.push({ lat: route.fromLatitude, lng: route.fromLongitude });
      }
      if (route.toLatitude != null && route.toLongitude != null) {
        points.push({ lat: route.toLatitude, lng: route.toLongitude });
      }
      return points.some((point) => getDistanceMeters(lat, lng, point.lat, point.lng) <= 2000);
    });

    const alerts = [];
    for (const route of nearbyRoutes) {
      const message = `Incident near saved route ${route.name} — please review your route alerts.`;
      const alert = await prisma.alert.create({
        data: {
          reportId: report.id,
          message,
          latitude: lat,
          longitude: lng,
          radiusKm: 2
        }
      });
      alerts.push(alert);
    }

    res.status(201).json({ report, alerts, message: 'Report submitted! Thank you for keeping your community safe.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to submit report' });
  }
});

router.get('/', async (req, res) => {
  try {
    const reports = await prisma.report.findMany({ orderBy: { createdAt: 'desc' } });
    res.json({ reports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch reports' });
  }
});

router.get('/nearby', async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radius = parseFloat(req.query.radius) || 5;

    if (Number.isNaN(lat) || Number.isNaN(lng)) {
      return res.status(400).json({ error: 'lat and lng query parameters are required' });
    }

    const latDelta = radius / 111;
    const lngDelta = radius / (111 * Math.cos((lat * Math.PI) / 180));

    const reports = await prisma.report.findMany({
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

    const nearbyReports = reports.filter((report) => {
      const distance = getDistanceMeters(lat, lng, report.latitude, report.longitude);
      return distance <= radius * 1000;
    });

    res.json({ reports: nearbyReports });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch nearby reports' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const report = await prisma.report.findUnique({
      where: { id: Number(req.params.id) }
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json({ report });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to fetch report' });
  }
});

module.exports = router;
