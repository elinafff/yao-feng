import jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import { getCollection } from '../db';

export interface AuthRequest extends Request {
  admin?: any;
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction) => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];

      // Dev mode skip
      if (token === 'mock-token-for-dev') {
        req.admin = { id: 'admin_1', username: 'admin', role: 'superadmin' };
        return next();
      }

      const decoded: any = jwt.verify(token!, process.env.JWT_SECRET!);
      
      const admins = await getCollection('admins');
      const admin = admins.find((a: any) => a.id === decoded.id);
      
      if (admin) {
        const { password, ...adminWithoutPassword } = admin;
        req.admin = adminWithoutPassword;
        next();
      } else {
        res.status(401).json({ message: 'Not authorized, admin not found' });
      }
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
