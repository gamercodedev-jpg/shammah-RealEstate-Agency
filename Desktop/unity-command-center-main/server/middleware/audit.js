const fs = require('fs');
const path = require('path');

const auditFile = path.join(__dirname, '..', 'audit.log');

const memoryStore = [];

function appendToFile(entry) {
  try {
    fs.appendFileSync(auditFile, JSON.stringify(entry) + '\n');
  } catch (e) {
    // ignore write errors for demo
  }
}

const auditStore = {
  record(entry) {
    memoryStore.push(entry);
    appendToFile(entry);
  },
  findByCase(caseId) {
    return memoryStore.filter((e) => e.caseId === caseId);
  },
  all() {
    return memoryStore.slice();
  },
};

function auditLogMiddleware(req, res, next) {
  // Record high-level actions: GET /api/cases, GET /api/cases/:id, POST /api/cases
  const isApi = req.path.startsWith('/api/');
  if (!isApi) return next();
  const entry = {
    timestamp: new Date().toISOString(),
    path: req.path,
    method: req.method,
    user: req.user?.id || 'anonymous',
    role: req.user?.role || 'anonymous',
    ip: req.ip,
  };
  auditStore.record(entry);
  next();
}

module.exports = { auditLogMiddleware, auditStore };
