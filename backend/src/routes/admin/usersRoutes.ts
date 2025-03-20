import express from 'express';
import * as usersController from '../../controllers/admin/usersController';
import { adminProtect } from '../../middleware/common/authMiddleware';

const router = express.Router();

// حماية جميع المسارات
router.use(adminProtect);

// مسارات إدارة المستخدمين
router.get('/', usersController.getUsers);
router.get('/:id', usersController.getUserById);
router.put('/:id/block', usersController.toggleBlockUser);
router.delete('/:id', usersController.deleteUser);

export default router; 