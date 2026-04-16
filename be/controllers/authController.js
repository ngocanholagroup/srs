const AuthService = require('../services/authService');

class AuthController {

    static async login(req, res) {
        try {
            const { email, password } = req.body;
            if (!email || !password) {
                return res.status(400).json({
                    code: "BAD_REQUEST",
                    message: "Thiếu email hoặc password",
                    timestamp: Date.now()
                });
            }

            const token = await AuthService.loginUser(email, password);

            return res.status(200).json({
                code: "SUCCESS",
                message: "Đăng nhập thành công",
                data: {
                    accessToken: token
                },
                timestamp: Date.now()
            });

        } catch (error) {
            if (error.message === "Tai_Khoan_Hoac_Mat_Khau_Sai") {
                return res.status(401).json({ code: "UNAUTHORIZED", message: "Tài khoản hoặc mật khẩu không chính xác.", timestamp: Date.now() });
            }
            return res.status(500).json({ code: "SERVER_ERROR", message: error.message });
        }
    }

    static async logout(req, res) {
        try {
            const token = req.headers.authorization?.split(" ")[1];
            await AuthService.logoutUser(token);

            return res.status(200).json({
                code: "SUCCESS",
                message: "Đăng xuất thành công"
            });
        } catch (error) {
            return res.status(500).json({ code: "SERVER_ERROR", message: error.message });
        }
    }

    static async me(req, res) {
        try {
            const userObj = req.user.toObject();
            delete userObj.password;
            
            return res.status(200).json({
                code: "SUCCESS",
                data: userObj
            });
        } catch (error) {
            return res.status(500).json({ code: "SERVER_ERROR", message: error.message });
        }
    }
}


module.exports = AuthController;
