import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware.js';
import * as productController from '../controllers/product.controller.js';
import * as orderController from '../controllers/order.controller.js';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Products
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);

// Categories
router.get('/categories', productController.getCategories);
router.get('/categories/:slug', productController.getCategoryBySlug);

// Orders (Checkout - public for customers)
router.post('/orders', orderController.createOrder);

// Stats (public - basic info)
router.get('/products/stats/overview', productController.getProductStats);

// ============================================
// ADMIN ROUTES (Authentication required)
// ============================================

// --- Products CRUD ---
router.post('/products', authenticate, requireAdmin, productController.createProduct);
router.put('/products/:id', authenticate, requireAdmin, productController.updateProduct);
router.patch('/products/:id', authenticate, requireAdmin, productController.updateProduct);
router.delete('/products/:id', authenticate, requireAdmin, productController.deleteProduct);

// --- Bulk Operations ---
router.patch('/products/bulk/update', authenticate, requireAdmin, productController.bulkUpdateProducts);
router.delete('/products/bulk/delete', authenticate, requireAdmin, productController.bulkDeleteProducts);

// --- Categories CRUD ---
router.post('/categories', authenticate, requireAdmin, productController.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, productController.updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, productController.deleteCategory);

// --- Orders Management ---
router.get('/orders', authenticate, requireAdmin, orderController.getOrders);
router.get('/orders/:id', authenticate, requireAdmin, orderController.getOrder);
router.patch('/orders/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

export default router;
