function requireRole(allowedRoles) {
  return function (req, res, next) {
    const user = req.user || { role: 'anonymous' };
    if (!allowedRoles || allowedRoles.length === 0) return next();
    if (allowedRoles.includes(user.role)) return next();
    return res.status(403).json({ error: 'Forbidden' });
  };
}

module.exports = { requireRole };
