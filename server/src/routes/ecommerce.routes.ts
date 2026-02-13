import express from 'express';
import { authenticate, requireAdmin } from '../middlewares/auth.middleware';
import * as productController from '../controllers/product.controller';
import * as categoryController from '../controllers/category.controller';

import * as orderController from '../controllers/order.controller';
import { upload } from '../middlewares/upload.middleware';

const router = express.Router();

// ============================================
// PUBLIC ROUTES (No authentication required)
// ============================================

// Products
router.get('/products', productController.getProducts);
router.get('/products/:id', productController.getProduct);

// --- Categories ---
router.get('/categories', categoryController.getCategories);
router.get('/categories/:slug', categoryController.getCategoryBySlug);

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

// --- Import / Export / Sync ---
router.post('/products/import', authenticate, requireAdmin, upload.single('file'), productController.importProducts);
router.get('/products/export', authenticate, requireAdmin, productController.exportProducts);
router.post('/products/sync/sheets', authenticate, requireAdmin, productController.syncSheet);

// --- Categories CRUD ---
router.post('/categories', authenticate, requireAdmin, categoryController.createCategory);
router.put('/categories/:id', authenticate, requireAdmin, categoryController.updateCategory);
router.delete('/categories/:id', authenticate, requireAdmin, categoryController.deleteCategory);

// --- Orders Management ---
router.get('/orders', authenticate, requireAdmin, orderController.getOrders);
router.get('/orders/:id', authenticate, requireAdmin, orderController.getOrder);
router.patch('/orders/:id/status', authenticate, requireAdmin, orderController.updateOrderStatus);

export default router;
