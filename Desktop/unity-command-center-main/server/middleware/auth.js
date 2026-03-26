const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET || 'dev-secret';

function authMiddleware(req, res, next) {
  // allow x-mock-user for demo; otherwise use Bearer token
  const raw = req.header('x-mock-user');
  if (raw) {
    try { req.user = JSON.parse(raw); return next(); } catch (e) {}
  }
  const auth = req.header('authorization');
  if (!auth) return next();
  const parts = auth.split(' ');
  if (parts.length !== 2) return next();
  const token = parts[1];
  try {
    const payload = jwt.verify(token, SECRET);
    req.user = payload.user;
  } catch (e) {
    // invalid token
  }
  next();
}

function signToken(user) {
  return jwt.sign({ user }, SECRET, { expiresIn: '8h' });
}

module.exports = { authMiddleware, signToken };
