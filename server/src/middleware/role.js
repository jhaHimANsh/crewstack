// Role-based gate (e.g., onlyAdmins, onlyRoles('ADMIN', 'MEMBER'))
const onlyRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated' });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden — requires role: ${roles.join(' or ')}`
      });
    }
    next();
  };
};

module.exports = { onlyRoles, onlyAdmins: onlyRoles('ADMIN') };
