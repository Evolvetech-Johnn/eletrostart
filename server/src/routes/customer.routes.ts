import { Router } from "express";
import { authenticate, requireAdmin } from "../middlewares/auth.middleware";
import {
  getCustomers,
  getCustomerById,
  createCustomer,
  updateCustomer,
  toggleCustomerStatus,
} from "../controllers/customer.controller";

const router = Router();

// Todas as rotas de clientes requerem autenticação e pelo menos nível Admin
router.use(authenticate, requireAdmin);

router.get("/", getCustomers);
router.get("/:id", getCustomerById);
router.post("/", createCustomer);
router.put("/:id", updateCustomer);
router.patch("/:id/toggle-active", toggleCustomerStatus);

export default router;
