const path = require('path');
const fs = require('fs');
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const reportRoutes = require('./routes/reports');
const savedRouteRoutes = require('./routes/routes');
const alertRoutes = require('./routes/alerts');

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;
const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
const uploadDir = path.join(__dirname, '../uploads');

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

app.use(cors({ origin: clientUrl }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(uploadDir));

app.use('/api/auth', authRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/routes', savedRouteRoutes);
app.use('/api/alerts', alertRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'SafeRoute SA backend is running' });
});

app.use((err, req, res, next) => {
  console.error(err);
  res.status(500).json({ error: 'Server error' });
});

app.listen(port, () => {
  console.log(`SafeRoute SA backend listening on http://localhost:${port}`);
});
