import jwt from 'jsonwebtoken';
import { prisma } from '../index.js';

// Middleware de autenticação JWT
export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        error: true, 
        message: 'Token de autenticação não fornecido' 
      });
    }

    const token = authHeader.split(' ')[1];
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Buscar usuário no banco
    const user = await prisma.adminUser.findUnique({
      where: { id: decoded.userId }
    });

    if (!user || !user.active) {
      return res.status(401).json({ 
        error: true, 
        message: 'Usuário não encontrado ou inativo' 
      });
    }

    // Adicionar usuário ao request
    req.user = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        error: true, 
        message: 'Token inválido' 
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        error: true, 
        message: 'Token expirado' 
      });
    }
    next(error);
  }
};

// Middleware para verificar role de admin
export const requireAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ 
      error: true, 
      message: 'Acesso negado. Permissão de administrador necessária.' 
    });
  }
  next();
};
