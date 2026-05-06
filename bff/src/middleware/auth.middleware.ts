import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: { userId: number; email: string; role: string };
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  try {
    // Obtener token del header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        code: 'UNAUTHORIZED',
        message: 'Token de autenticación requerido'
      });
    }

    const token = authHeader.substring(7); // Eliminar "Bearer " prefix
    
    const secret = process.env.JWT_SECRET || 'miSecretaClaveJWTDeAlMenos128Bits';
    const decoded = jwt.verify(token, secret) as JwtPayload;
    
    // Guardar datos del usuario en request para usar en handlers
    req.user = {
      userId: parseInt(decoded.userId),
      email: decoded.email,
      role: decoded.role
    };

    next();
  } catch (error) {
    return res.status(401).json({
      code: 'UNAUTHORIZED',
      message: 'Token inválido o expirado'
    });
  }
};