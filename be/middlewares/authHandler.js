const jwt = require('jsonwebtoken');
const User = require('../schemas/user');
const { getJwtSecret } = require('../config/jwtSecret');

const checkLogin = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Vui lòng đăng nhập (thiếu token).',
        timestamp: Date.now(),
      });
    }

    const decoded = jwt.verify(token, getJwtSecret());
    const user = await User.findById(decoded.id).populate('roleID');
    if (!user) {
      return res.status(404).json({
        code: 'NOT_FOUND',
        message: 'Tài khoản không tồn tại.',
        timestamp: Date.now(),
      });
    }

    req.user = user;
    next();
  } catch {
    return res.status(401).json({
      code: 'TOKEN_INVALID',
      message: 'Token không hợp lệ hoặc đã hết hạn.',
      timestamp: Date.now(),
    });
  }
};

const checkRole = (allowedRoles) => (req, res, next) => {
  const userRoleName = req.user?.roleID?.roleName;
  if (!userRoleName || !allowedRoles.includes(userRoleName)) {
    return res.status(403).json({
      code: 'FORBIDDEN',
      message: 'Không có quyền truy cập chức năng này.',
      timestamp: Date.now(),
    });
  }
  next();
};

module.exports = { checkLogin, checkRole };
