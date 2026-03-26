const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const helmet = require('helmet');
const cors = require('cors');

const { requireRole } = require('./middleware/rbac');
const { auditLogMiddleware, auditStore } = require('./middleware/audit');
const { authMiddleware } = require('./middleware/auth');
const db = require('./db');
const cryptoUtil = require('./crypto');
const sms = require('./smsProvider');

// --- AI Integration: OpenAI ---
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';
const AI_SYSTEM_PROMPT = `You are an empathetic, non-judgmental GBV (Gender-Based Violence) support assistant developed for a secure, anonymous USSD reporting system in Zambia. Your goal is to guide the survivor through the reporting process calmly and safely. Tone: Always maintain a supportive, trauma-informed, and calm tone. Task: Extract three specific data points from the user's input: Incident Type (e.g., rape, defilement), Location (e.g., district or specific area), and Severity Level (High, Medium, or Low). Constraint: Never ask for the survivor's name or any personally identifiable information. Emergency: If the input indicates immediate physical danger (High Severity), immediately guide the user to contact emergency services while noting the report for automated alert triggering. Output Format: Provide a brief, supportive acknowledgment followed by a request for the next missing piece of information if necessary, or a confirmation message if the report is complete. You are assisting users who may have low digital literacy or are reporting from rural areas in Zambia. Keep all responses under 160 characters (the limit for USSD/SMS). Use clear, simple, and direct language. Avoid technical jargon. If the user provides an ambiguous location, kindly ask them to name the nearest landmark or local district.`;

async function getAISummary(description, incidentType, province, district) {
  if (!OPENAI_API_KEY) return 'AI summary unavailable (no API key)';
  const prompt = `${AI_SYSTEM_PROMPT}\n\nIncident Type: ${incidentType}\nLocation: ${province}, ${district}\nDescription: ${description}\n\nSummarize the above in a supportive, trauma-informed way. Also, classify severity as High, Medium, or Low.`;
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'system', content: AI_SYSTEM_PROMPT },
          { role: 'user', content: prompt }
        ],
        max_tokens: 120
      })
    });
    const data = await response.json();
    if (data.choices && data.choices[0] && data.choices[0].message) {
      return data.choices[0].message.content.trim();
    }
    return 'AI summary unavailable (no response)';
  } catch (e) {
    return 'AI summary unavailable (error)';
  }
}

const app = express();
app.use(helmet());
app.use(cors());
app.use(bodyParser.json());

// Mock authentication middleware for demo purposes.
// Send header: x-mock-user: {"id":"user1","role":"activist","assignedCases":["case-123"]}
// auth middleware: supports x-mock-user or Authorization Bearer JWT
app.use(authMiddleware);

// attach audit middleware globally (records requests of interest)
app.use(auditLogMiddleware);

// Demo data store (in-memory)
const CASES = [
  {
    id: 'case-123',
    victimName: 'Jane Doe',
    phone: '+260971234567',
    address: '123 Kitwe Lane',
    assignedTo: 'responder-1',
    assigned: true,
  },
  {
    id: 'case-456',
    victimName: 'Anonymous',
    phone: '+260971111111',
    address: 'Unknown',
    assignedTo: null,
    assigned: false,
  },
];

const RESPONDERS = [
  { id: 'R-001', name: 'Remmy Kangwa', type: 'Activist', zone: 'Lusaka Central', province: 'Lusaka', status: 'On Case', phone: '+260971234567', casesHandled: 47, latitude: -15.3875, longitude: 28.3228 },
  { id: 'R-002', name: 'Copperbelt VSU', type: 'Police Station', zone: 'Kitwe-Ndola Corridor', province: 'Copperbelt', status: 'Available', phone: '+260962345678', casesHandled: 83, latitude: -12.8024, longitude: 28.2132 },
  { id: 'R-003', name: 'Grace Mwamba', type: 'Activist', zone: 'Livingstone District', province: 'Southern', status: 'Available', phone: '+260953456789', casesHandled: 31, latitude: -17.8419, longitude: 25.8606 },
  { id: 'R-004', name: 'Eastern Province VSU', type: 'Police Station', zone: 'Chipata District', province: 'Eastern', status: 'Offline', phone: '+260944567890', casesHandled: 56, latitude: -13.6333, longitude: 32.6500 },
  { id: 'R-005', name: 'Chanda Mutale', type: 'Activist', zone: 'Kasama Urban', province: 'Northern', status: 'Available', phone: '+260935678901', casesHandled: 22, latitude: -10.2167, longitude: 31.1833 },
  { id: 'R-006', name: 'Western Province VSU', type: 'Police Station', zone: 'Mongu District', province: 'Western', status: 'Available', phone: '+260926789012', casesHandled: 38, latitude: -15.2547, longitude: 23.1522 },
];

// WebSocket for realtime updates
let wss;
try {
  const WebSocket = require('ws');
  const server = require('http').createServer(app);
  wss = new WebSocket.Server({ server });
  server.listen(process.env.PORT || 4000, () => {
    console.log(`Demo RBAC + WS server listening on http://localhost:${process.env.PORT || 4000}`);
  });

  function broadcast(event, payload) {
    const msg = JSON.stringify({ event, payload });
    wss.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) client.send(msg);
    });
  }

  // expose broadcast for later use via app.locals
  app.locals.broadcast = broadcast;
} catch (e) {
  // fallback: start express alone
  const PORT = process.env.PORT || 4000;
  app.listen(PORT, () => {
    console.log(`Demo RBAC server listening on http://localhost:${PORT}`);
  });
}

function redactPII(caseItem, user) {
  // If user is admin or assigned to case, reveal full PII; otherwise redact
  if (!user) return { ...caseItem, phone: 'REDACTED', address: 'REDACTED' };
  const isAssigned = (user.assignedCases || []).includes(caseItem.id) || user.role === 'admin' || user.role === 'responder';
  if (isAssigned) {
    try {
      const out = { ...caseItem };
      if (caseItem.victim_phone_encrypted && caseItem.encrypted_dek) {
        const dek = cryptoUtil.unwrapDEK(caseItem.encrypted_dek);
        out.phone = cryptoUtil.decryptField(caseItem.victim_phone_encrypted, caseItem.victim_phone_iv, caseItem.victim_phone_tag, dek);
      }
      if (caseItem.victim_address_encrypted && caseItem.encrypted_dek_address) {
        const dek2 = cryptoUtil.unwrapDEK(caseItem.encrypted_dek_address);
        out.address = cryptoUtil.decryptField(caseItem.victim_address_encrypted, caseItem.victim_address_iv, caseItem.victim_address_tag, dek2);
      }
      return out;
    } catch (e) {
      return { ...caseItem, phone: 'REDACTED', address: 'REDACTED' };
    }
  }
  return { ...caseItem, phone: 'REDACTED', address: 'REDACTED' };
}

// Public: list cases (PII redacted unless user assigned)
app.get('/api/cases', requireRole(['admin', 'responder', 'activist', 'anonymous']), (req, res) => {
  const province = req.query.province;
  let list = CASES.slice();
  if (province) list = list.filter((c) => c.province === province);
  const results = list.map((c) => redactPII(c, req.user));
  res.json({ data: results });
});

// View case detail with audit entry
app.get('/api/cases/:id', requireRole(['admin', 'responder', 'activist']), (req, res) => {
  const c = CASES.find((x) => x.id === req.params.id);
  if (!c) return res.status(404).json({ error: 'Not found' });
  const item = redactPII(c, req.user);
  // record detailed view in audit store
  auditStore.record({
    action: 'view_case',
    caseId: c.id,
    user: req.user?.id,
    role: req.user?.role,
    timestamp: new Date().toISOString(),
    ip: req.ip,
  });
  res.json({ data: item });
});

// Return audit history for a case (admin only)
app.get('/api/cases/:id/history', requireRole(['admin']), (req, res) => {
  const history = auditStore.findByCase(req.params.id);
  res.json({ data: history });
});

// Get responders
app.get('/api/responders', requireRole(['admin', 'responder', 'activist']), (req, res) => {
  res.json({ data: RESPONDERS });
});

// Update responder status
app.put('/api/responders/:id/status', requireRole(['admin', 'responder']), (req, res) => {
  const r = RESPONDERS.find((x) => x.id === req.params.id);
  if (!r) return res.status(404).json({ error: 'Responder not found' });
  const { status } = req.body;
  r.status = status;
  res.json({ data: r });
  app.locals.broadcast && app.locals.broadcast('responder:update', r);
});

// Submit report endpoint (from USSD/PWA)

app.post('/api/reports', async (req, res) => {
  const { incidentType, province, district, description, latitude, longitude, reportChannel } = req.body;
  const id = `SR-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const createdAt = new Date().toISOString();
  let aiSummary = 'Pending AI triage';
  try {
    aiSummary = await getAISummary(description, incidentType, province, district);
  } catch (e) {
    aiSummary = 'AI summary unavailable';
  }
  const newCase = { id, incidentType, province, district, description, status: 'New', createdAt, assignedResponder: null, aiSummary, reportChannel: reportChannel || 'USSD', latitude: latitude || null, longitude: longitude || null };
  // Field-level encryption for PII (if phone/address present in body)
  try {
    if (req.body.phone) {
      const dek = cryptoUtil.genDEK();
      const wrapped = cryptoUtil.wrapDEK(dek);
      const encrypted = cryptoUtil.encryptField(req.body.phone, dek);
      newCase.victim_phone_encrypted = encrypted.ciphertext;
      newCase.victim_phone_iv = encrypted.iv;
      newCase.victim_phone_tag = encrypted.tag;
      newCase.encrypted_dek = wrapped; // store wrapped DEK metadata
    }
    if (req.body.address) {
      const dek2 = cryptoUtil.genDEK();
      const wrapped2 = cryptoUtil.wrapDEK(dek2);
      const encrypted2 = cryptoUtil.encryptField(req.body.address, dek2);
      newCase.victim_address_encrypted = encrypted2.ciphertext;
      newCase.victim_address_iv = encrypted2.iv;
      newCase.victim_address_tag = encrypted2.tag;
      newCase.encrypted_dek_address = wrapped2;
    }
  } catch (e) {
    console.warn('Field encryption skipped:', e && e.message);
  }
  // Geofencing: select nearest Available responder by distance (haversine) if coordinates provided
  function haversine(lat1, lon1, lat2, lon2) {
    const toRad = (v) => (v * Math.PI) / 180;
    const R = 6371; // km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  }

  let candidate = null;
  if (latitude && longitude) {
    const available = RESPONDERS.filter((r) => r.status === 'Available' && r.latitude && r.longitude);
    if (available.length) {
      available.sort((a,b) => haversine(latitude, longitude, a.latitude, a.longitude) - haversine(latitude, longitude, b.latitude, b.longitude));
      candidate = available[0];
    }
  }
  if (candidate) {
    newCase.assignedResponder = candidate.id;
    newCase.status = 'In Progress';
    candidate.status = 'On Case';
    candidate.casesHandled = (candidate.casesHandled || 0) + 1;
    auditStore.record({ action: 'assign_case', caseId: id, responderId: candidate.id, user: req.user?.id || 'system', timestamp: new Date().toISOString() });
  } else {
    // fallback: try province-level available
    const provincial = RESPONDERS.find((r) => r.province === province && r.status === 'Available');
    if (provincial) {
      newCase.assignedResponder = provincial.id;
      newCase.status = 'In Progress';
      provincial.status = 'On Case';
      provincial.casesHandled = (provincial.casesHandled || 0) + 1;
      auditStore.record({ action: 'assign_case', caseId: id, responderId: provincial.id, user: req.user?.id || 'system', timestamp: new Date().toISOString(), note: 'Assigned by province fallback' });
    } else {
      newCase.assignedResponder = null;
      newCase.status = 'New';
      auditStore.record({ action: 'escalate_case', caseId: id, user: req.user?.id || 'system', timestamp: new Date().toISOString(), note: 'No available responder' });
    }
  }
  CASES.unshift(newCase);
  auditStore.record({ action: 'create_case', caseId: id, user: req.user?.id || 'anonymous', timestamp: createdAt });
  app.locals.broadcast && app.locals.broadcast('case:new', newCase);
  // Persist to Postgres if available
  (async () => {
    try {
      if (db && db.query) {
        await db.query(`INSERT INTO cases(id, incident_type, province, district, description, status, created_at, assigned_responder, ai_summary, report_channel, latitude, longitude, victim_phone_encrypted, victim_phone_iv, victim_phone_tag, encrypted_dek, victim_address_encrypted, victim_address_iv, victim_address_tag, encrypted_dek_address) VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20)`, [
          newCase.id, newCase.incidentType, newCase.province, newCase.district, newCase.description, newCase.status, newCase.createdAt, newCase.assignedResponder, newCase.aiSummary, newCase.reportChannel, newCase.latitude, newCase.longitude, newCase.victim_phone_encrypted || null, newCase.victim_phone_iv || null, newCase.victim_phone_tag || null, JSON.stringify(newCase.encrypted_dek) || null, newCase.victim_address_encrypted || null, newCase.victim_address_iv || null, newCase.victim_address_tag || null, JSON.stringify(newCase.encrypted_dek_address) || null
        ]);
      }
    } catch (e) {
      // ignore DB errors in demo
      console.warn('DB persist failed', e.message);
    }
  })();
  res.json({ data: newCase });
});

// When panic triggers, send SMS using provider stub
app.post('/api/panic', (req, res) => {
  const { latitude, longitude, province, district } = req.body;
  const id = `PANIC-${String(Math.floor(Math.random() * 9000) + 1000)}`;
  const entry = { id, action: 'panic_alert', province, district, latitude, longitude, receivedAt: new Date().toISOString(), user: req.user?.id || 'anonymous' };
  auditStore.record(entry);
  // notify nearest available police station in province
  const police = RESPONDERS.find((r) => r.province === province && r.type === 'Police Station');
  if (police) {
    const msg = `PANIC: Coordinates ${latitude},${longitude}. Please respond to ${district || 'unknown district'}`;
    sms.sendSMS(police.phone, msg).then((r) => {
      app.locals.broadcast && app.locals.broadcast('panic:alert', { to: police.id, alert: entry });
    });
  }
  res.json({ data: { ok: true, id } });
});

// Request PII via server-side mediator (records audit entry server-side)
app.post('/api/request-pii', requireRole(['admin', 'responder']), async (req, res) => {
  const { reportId, reason } = req.body;
  const mediatorUrl = process.env.PII_MEDIATOR_URL;
  const mediatorSecret = process.env.MEDIATOR_SECRET;
  if (!mediatorUrl || !mediatorSecret) return res.status(500).json({ error: 'PII mediator not configured' });
  try {
    const resp = await fetch(mediatorUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-mediator-secret': mediatorSecret },
      body: JSON.stringify({ report_id: reportId, reason, actor_id: req.user?.id }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return res.status(502).json({ error: 'mediator error', details: txt });
    }
    const j = await resp.json();
    // record audit entry in demo audit store
    auditStore.record({ action: 'pii_request', caseId: reportId, user: req.user?.id, role: req.user?.role, reason, timestamp: new Date().toISOString() });
    return res.json({ data: j.data || j });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
});

// (duplicate panic handler removed)

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Demo RBAC server listening on http://localhost:${PORT}`);
});
