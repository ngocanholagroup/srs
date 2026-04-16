const UserService = require('../services/userService');

class UserController {
    static async getAllUsers(req, res) {
        try {
            const users = await UserService.getAll();
            return res.status(200).json({
                code: "SUCCESS",
                message: "Lấy danh sách người dùng thành công",
                data: users
            });
        } catch (error) {
            return res.status(500).json({ code: "SERVER_ERROR", message: error.message });
        }
    }

    static async changeRole(req, res) {
        try {
            const { id } = req.params; // Lấy ID tài khoản từ thanh URL
            const { roleID } = req.body; // Lấy Role mới muốn thăng cấp từ Body

            if (!roleID) {
                return res.status(400).json({ 
                    code: "BAD_REQUEST", 
                    message: "Vui lòng truyền mã roleID mới để thay đổi quyền." 
                });
            }

            const updatedUser = await UserService.changeUserRole(id, roleID);

            return res.status(200).json({
                code: "SUCCESS",
                message: "Cập nhật chức vụ thành công",
                data: updatedUser
            });

        } catch (error) {
            if (error.message === "ROLE_NOT_FOUND") {
                return res.status(404).json({ code: "NOT_FOUND", message: "Mã Quyền (Role) này không tồn tại trong hệ thống." });
            }
            if (error.message === "USER_NOT_FOUND") {
                return res.status(404).json({ code: "NOT_FOUND", message: "Không tìm thấy tài khoản nhân viên cần thay đổi." });
            }
            return res.status(500).json({ code: "SERVER_ERROR", message: error.message });
        }
    }
}

module.exports = UserController;
