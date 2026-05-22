const AuthService = require('../services/authService');

class AuthController {
  static async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({
          code: 'BAD_REQUEST',
          message: 'Thiếu email hoặc password',
          timestamp: Date.now(),
        });
      }

      const token = await AuthService.loginUser(email, password);
      return res.status(200).json({
        code: 'SUCCESS',
        message: 'Đăng nhập thành công',
        data: { accessToken: token },
        timestamp: Date.now(),
      });
    } catch (error) {
      if (error.message === 'Tai_Khoan_Hoac_Mat_Khau_Sai') {
        return res.status(401).json({
          code: 'UNAUTHORIZED',
          message: 'Tài khoản hoặc mật khẩu không chính xác.',
          timestamp: Date.now(),
        });
      }
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }

  static async me(req, res) {
    try {
      const user = req.user.toObject();
      delete user.password;
      return res.status(200).json({
        code: 'SUCCESS',
        data: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          roleName: user.roleID?.roleName || null,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      return res.status(500).json({ code: 'SERVER_ERROR', message: error.message });
    }
  }
}

module.exports = AuthController;
