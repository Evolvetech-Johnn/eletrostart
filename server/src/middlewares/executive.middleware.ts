// Executive Module – Middleware de Autorização (ADMIN/SUPER_ADMIN)

import { Request, Response, NextFunction } from 'express';

/**
 * Middleware dedicado para rotas executivas.
 * Deve ser usado APÓS o middleware `authenticate` (que já popula req.user).
 * Exige role === 'ADMIN' OU 'SUPER_ADMIN'.
 */
export const requireExecutiveAccess = (req: Request, res: Response, next: NextFunction): void => {
  const role = ((req as any).user?.role || '').toUpperCase();

  if (role !== 'ADMIN' && role !== 'SUPER_ADMIN') {
    res.status(403).json({
      error: true,
      message: 'Acesso negado. Este módulo é restrito a administradores.',
    });
    return;
  }

  next();
};
