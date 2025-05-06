const { protect } = require('./authMiddleware');

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  next();
};

module.exports = { isAdmin };
