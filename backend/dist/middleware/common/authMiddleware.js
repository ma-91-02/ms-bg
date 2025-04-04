"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.adminProtect = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../../models/mobile/User"));
const Admin_1 = __importDefault(require("../../models/admin/Admin"));
// Mobile user authentication middleware
const protect = async (req, res, next) => {
    try {
        let token;
        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        // Find user
        const userId = decoded.id || decoded.userId;
        const user = await User_1.default.findById(userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'User not found'
            });
        }
        // Check if user is blocked
        if (user.isBlocked) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been blocked'
            });
        }
        // Set user in request
        req.user = user;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};
exports.protect = protect;
// Admin authentication middleware
const adminProtect = async (req, res, next) => {
    try {
        let token;
        // Check if token exists in headers
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }
        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized, no token provided'
            });
        }
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your_jwt_secret');
        // Find admin
        const admin = await Admin_1.default.findById(decoded.id);
        if (!admin) {
            return res.status(401).json({
                success: false,
                message: 'Admin not found'
            });
        }
        // Check if admin is active
        if (!admin.isActive) {
            return res.status(403).json({
                success: false,
                message: 'Your account has been deactivated'
            });
        }
        // Set admin in request
        req.admin = admin;
        next();
    }
    catch (error) {
        console.error('Admin authentication error:', error);
        return res.status(401).json({
            success: false,
            message: 'Not authorized, token failed'
        });
    }
};
exports.adminProtect = adminProtect;
//# sourceMappingURL=authMiddleware.js.map