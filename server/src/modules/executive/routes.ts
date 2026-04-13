// Executive Module – Rotas

import { Router } from 'express';
import { authenticate, requireAdmin } from '../../middlewares/auth.middleware';
import {
  getOverview,
  getFinancial,
  getInventory,
  getCustomers,
  getProfitability,
} from './controllers/executive.controller';

const router = Router();

// Todas as rotas executivas requerem autenticação + ADMIN/SUPER_ADMIN
router.use(authenticate);
router.use(requireAdmin);

router.get('/overview', getOverview);
router.get('/financial', getFinancial);
router.get('/inventory', getInventory);
router.get('/customers', getCustomers);
router.get('/profitability', getProfitability);

export default router;
