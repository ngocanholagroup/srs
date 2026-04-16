const User = require('../schemas/user');
const Role = require('../schemas/role');

class UserService {
    static async getAll() {
        // Lấy danh sách nhân viên, chừa lại password không hiển thị ra
        return await User.find({}).select('-password').populate('roleID');
    }

    static async changeUserRole(userId, newRoleId) {
        // Kiểm tra xem Role truyền vào có hợp lệ trong CSDL không
        const roleExists = await Role.findById(newRoleId);
        if (!roleExists) {
            throw new Error("ROLE_NOT_FOUND");
        }

        // Đổi Role cho User
        const updatedUser = await User.findByIdAndUpdate(
            userId,
            { roleID: newRoleId },
            { new: true } // Trả về thông tin mới nhất sau khi Update
        ).select('-password').populate('roleID');

        if (!updatedUser) {
            throw new Error("USER_NOT_FOUND");
        }

        return updatedUser;
    }
}

module.exports = UserService;
