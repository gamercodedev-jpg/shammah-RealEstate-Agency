const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json());

const PORT = process.env.PORT || 4000;

// Mock database
const reports = [];
const panicAlerts = [];

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Report submission
app.post('/api/reports', (req, res) => {
  const report = {
    id: `SR-${Math.floor(Math.random() * 10000)}`,
    ...req.body,
    submittedAt: new Date().toISOString(),
    status: 'received'
  };
  
  reports.push(report);
  console.log('[REPORT]', report.id, report.incidentType, report.province, report.district);
  
  res.status(201).json({
    success: true,
    caseId: report.id,
    message: 'Report received. Help is on the way.'
  });
});

// Panic button
app.post('/api/panic', (req, res) => {
  const alert = {
    id: `PANIC-${Date.now()}`,
    ...req.body,
    timestamp: new Date().toISOString(),
    priority: 'critical'
  };
  
  panicAlerts.push(alert);
  console.log('[PANIC ALERT]', alert.id, 'Location:', alert.latitude, alert.longitude);
  
  res.status(200).json({
    success: true,
    alertId: alert.id,
    message: 'Emergency services notified. Stay safe.'
  });
});

// Get reports (for dashboard)
app.get('/api/reports', (req, res) => {
  res.json({
    total: reports.length,
    reports: reports.slice(-10) // Last 10
  });
});

// Get panic alerts
app.get('/api/panic-alerts', (req, res) => {
  res.json({
    total: panicAlerts.length,
    alerts: panicAlerts.slice(-10)
  });
});

app.listen(PORT, () => {
  console.log(`\n╔════════════════════════════════════════╗`);
  console.log(`║  SafeReport Server running on port ${PORT}    ║`);
  console.log(`║  http://localhost:${PORT}                    ║`);
  console.log(`╚════════════════════════════════════════╝\n`);
});
