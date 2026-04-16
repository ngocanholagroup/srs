const jwt = require('jsonwebtoken');
const User = require('../schemas/user');

/**
 * Middleware: Check Login (Authentication)
 * Chặn Request nếu chưa đăng nhập, xác thực bằng JWT Token.
 */
const checkLogin = async (req, res, next) => {
    try {
        // Lấy Token từ Header (Format: Bearer <token>)
        const token = req.headers.authorization?.split(" ")[1];
        if (!token) {
            return res.status(401).json({
                code: "UNAUTHORIZED",
                message: "Vui lòng đăng nhập để tiếp tục (Không tìm thấy Token).",
                timestamp: Date.now()
            });
        }

        // Giải mã Token (Tùy chỉnh biến môi trường KEY của bạn)
        const secretKey = process.env.JWT_SECRET || "bi_mat_sieucap_deptrai";
        const decoded = jwt.verify(token, secretKey);

        // Lấy thông tin User và gắn kèm luôn dữ liệu của bảng Role (populate)
        // Chú ý: Ở schema bạn đặt tên khóa là roleID, nên phải populate('roleID')
        const user = await User.findById(decoded.id).populate('roleID');
        if (!user) {
            return res.status(404).json({
                code: "NOT_FOUND",
                message: "Tài khoản không tồn tại hoặc đã bị xóa.",
                timestamp: Date.now()
            });
        }

        // Đính kèm object user vào Request để dùng tiếp cho Middleware/Controller sau
        req.user = user;
        next();
    } catch (error) {
        return res.status(401).json({
            code: "TOKEN_INVALID",
            message: "Mã xác thực không hợp lệ hoặc đã hết hạn.",
            timestamp: Date.now()
        });
    }
};

/**
 * Middleware: Check Role (Authorization)
 * Dùng để kiểm tra quyền hạn sau khi đã qua bước Check Login.
 * @param {Array} allowedRoles Danh sách các quyền được phép (VD: ['Admin', 'Manager'])
 */
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            // Nhờ hàm checkLogin ở trên, ta đã có req.user kèm theo thông tin Role
            const userRoleName = req.user?.roleID?.roleName;

            // Nếu Role của user không nằm trong danh sách cho phép (allowedRoles)
            if (!userRoleName || !allowedRoles.includes(userRoleName)) {
                return res.status(403).json({
                    code: "FORBIDDEN",
                    message: "Từ chối truy cập! Bác không có quyền chức năng này.",
                    timestamp: Date.now()
                });
            }

            // Nếu hợp lệ, duyệt cho đi tiếp vào Controller
            next();
        } catch (error) {
            return res.status(500).json({
                code: "SERVER_ERROR",
                message: "Lỗi hệ thống khi kiểm tra phân quyền.",
                timestamp: Date.now()
            });
        }
    };
};

module.exports = {
    checkLogin,
    checkRole
};
