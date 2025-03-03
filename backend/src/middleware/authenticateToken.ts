import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// استخدام التعريف المشترك من types/express.d.ts بدلاً من التعريف المحلي
// عندما يتم استخدام الملف المشترك، لا نحتاج لإعادة تعريف الواجهة هنا

export const authenticateToken = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.startsWith('Bearer ') 
    ? authHeader.split(' ')[1] 
    : null;

  if (!token) {
    return res.status(401).json({ message: 'غير مصرح به' });
  }

  try {
    const secret = process.env.JWT_SECRET || 'default-secret-key';
    const decoded: any = jwt.verify(token, secret);
    
    // استخدام نفس هيكل البيانات المعرف في types/express.d.ts
    req.user = {
      id: decoded.id
    };
    
    next();
  } catch (error) {
    console.error('خطأ في التحقق من التوكن:', error);
    return res.status(401).json({ message: 'غير مصرح به' });
  }
}; 