const express = require('express');
const auth = require('../middleware/auth');
const prisma = require('../prisma');

const router = express.Router();

router.post('/', auth, async (req, res) => {
  try {
    const {
      name,
      from_location,
      to_location,
      safety_score,
      alerts_enabled,
      from_latitude,
      from_longitude,
      to_latitude,
      to_longitude
    } = req.body;

    if (!name || !from_location || !to_location || safety_score == null) {
      return res.status(400).json({ error: 'Route name, from_location, to_location, and safety_score are required' });
    }

    const route = await prisma.savedRoute.create({
      data: {
        userId: req.user.userId,
        name,
        fromLocation: from_location,
        toLocation: to_location,
        safetyScore: Number(safety_score),
        alertsEnabled: alerts_enabled !== false,
        fromLatitude: from_latitude != null ? Number(from_latitude) : null,
        fromLongitude: from_longitude != null ? Number(from_longitude) : null,
        toLatitude: to_latitude != null ? Number(to_latitude) : null,
        toLongitude: to_longitude != null ? Number(to_longitude) : null
      }
    });

    res.status(201).json({ route });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to save route' });
  }
});

router.get('/', auth, async (req, res) => {
  try {
    const routes = await prisma.savedRoute.findMany({
      where: { userId: req.user.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json({ routes });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to load saved routes' });
  }
});

router.delete('/:id', auth, async (req, res) => {
  try {
    const deleted = await prisma.savedRoute.deleteMany({
      where: {
        id: Number(req.params.id),
        userId: req.user.userId
      }
    });

    if (deleted.count === 0) {
      return res.status(404).json({ error: 'Saved route not found' });
    }

    res.json({ deleted: true });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Unable to delete saved route' });
  }
});

module.exports = router;
