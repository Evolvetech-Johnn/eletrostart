// Executive Module – Rotas

import { Router } from 'express';
import { authenticate } from '../../middlewares/auth.middleware';
import { requireSuperAdmin } from '../../middlewares/executive.middleware';
import {
  getOverview,
  getFinancial,
  getInventory,
  getCustomers,
  getProfitability,
} from './controllers/executive.controller';

const router = Router();

// Todas as rotas executivas requerem autenticação + SUPER_ADMIN
router.use(authenticate);
router.use(requireSuperAdmin);

router.get('/overview', getOverview);
router.get('/financial', getFinancial);
router.get('/inventory', getInventory);
router.get('/customers', getCustomers);
router.get('/profitability', getProfitability);

export default router;
