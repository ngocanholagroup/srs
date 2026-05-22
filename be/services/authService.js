const User = require('../schemas/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { getJwtSecret, getJwtExpiresIn } = require('../config/jwtSecret');

class AuthService {
  static async loginUser(email, password) {
    const user = await User.findOne({ email }).populate('roleID');
    if (!user) throw new Error('Tai_Khoan_Hoac_Mat_Khau_Sai');

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) throw new Error('Tai_Khoan_Hoac_Mat_Khau_Sai');

    return jwt.sign({ id: user._id, email: user.email }, getJwtSecret(), { expiresIn: getJwtExpiresIn() });
  }
}

module.exports = AuthService;
