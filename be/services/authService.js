const User = require('../schemas/user');
const Role = require('../schemas/role');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

class AuthService {

    static async loginUser(email, password) {
        const user = await User.findOne({ email }).populate('roleID');
        if (!user) {
            throw new Error("Tai_Khoan_Hoac_Mat_Khau_Sai");
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            throw new Error("Tai_Khoan_Hoac_Mat_Khau_Sai");
        }

        const secretKey = process.env.JWT_SECRET || "bi_mat_sieucap_deptrai";
        const token = jwt.sign(
            { id: user._id, email: user.email },
            secretKey,
            { expiresIn: '1d' }
        );

        // Trả duy nhất Token chuẩn như yêu cầu
        return token;
    }

    static async logoutUser(token) {
        // Tương lai (Scale Hệ thống): Tại hàm này bạn sẽ lấy Token hiện tại nhét vào Redis (BlackList)
        // để chặn không cho hacker dùng lại token cũ.
        // Hiện tại: Mô hình JWT Stateless nên chỉ cần Frontend tự xóa là đủ.
        return true;
    }
}

module.exports = AuthService;
