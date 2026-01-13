import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();

// --- Public Routes ---
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);
router.get('/categories', productController.getCategories);
router.post('/orders', orderController.createOrder); // Checkout

// --- Admin Routes ---
// Products
router.post('/products', authenticate, requireAdmin, productController.createProduct);
router.put('/products/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/products/:id', authenticate, requireAdmin, productController.deleteProduct);

// Categories
router.post('/categories', authenticate, requireAdmin, productController.createCategory);
router.delete('/categories/:id', authenticate, requireAdmin, productController.deleteCategory);

// Orders
router.get('/orders', authenticate, requireAdmin, orderController.getOrders);
router.get('/orders/:id', authenticate, requireAdmin, orderController.getOrder);
router.patch('/orders/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

export default router;
