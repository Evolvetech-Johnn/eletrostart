import React, { Suspense, lazy } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout/Layout";
import Home from "./pages/Home"; // Keep Home eager for LCP
import ScrollToTop from "./components/ScrollToTop";
import CartDrawer from "./components/CartDrawer";
import ProtectedRoute from "./pages/admin/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";
import NotFound from "./pages/NotFound";

// Public Pages (Lazy Loaded)
const Services = lazy(() => import("./pages/Services"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Products = lazy(() => import("./pages/Products"));
const ProductDetail = lazy(() => import("./pages/ProductDetail"));
const Account = lazy(() => import("./pages/Account"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const WorkWithUs = lazy(() => import("./pages/WorkWithUs"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Shipping = lazy(() => import("./pages/Shipping"));
const Returns = lazy(() => import("./pages/Returns"));
const Cookies = lazy(() => import("./pages/Cookies"));
const Checkout = lazy(() => import("./pages/Checkout"));

// Admin Pages (Lazy Loaded)
const AdminLogin = lazy(() => import("./pages/admin/AdminLogin"));
const AdminDashboard = lazy(() => import("./pages/admin/AdminDashboard"));
const AdminMessages = lazy(() => import("./pages/admin/AdminMessages"));
const AdminMessageDetail = lazy(
  () => import("./pages/admin/AdminMessageDetail"),
);
const AdminIntegrations = lazy(() => import("./pages/admin/AdminIntegrations"));
const AdminProducts = lazy(() => import("./pages/admin/AdminProducts"));
const AdminProductForm = lazy(() => import("./pages/admin/AdminProductForm"));
const AdminCategories = lazy(() => import("./pages/admin/AdminCategories"));
const AdminOrders = lazy(() => import("./pages/admin/AdminOrders"));
const AdminOrderDetail = lazy(() => import("./pages/admin/AdminOrderDetail"));

// Loading Component
const AdminLoading = () => (
  <div className="flex items-center justify-center h-screen bg-gray-50">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
  </div>
);

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" />
          <ScrollToTop />
          <Suspense fallback={<AdminLoading />}>
            <Routes>
              {/* Admin Routes - Outside Layout (no header/footer) */}
              <Route
                path="/admin"
                element={<Navigate to="/admin/login" replace />}
              />
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route
                path="/admin/dashboard"
                element={
                  <ProtectedRoute>
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages"
                element={
                  <ProtectedRoute>
                    <AdminMessages />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/messages/:id"
                element={
                  <ProtectedRoute>
                    <AdminMessageDetail />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/integrations"
                element={
                  <ProtectedRoute>
                    <AdminIntegrations />
                  </ProtectedRoute>
                }
              />

              {/* Admin Store Routes */}
              <Route
                path="/admin/products"
                element={
                  <ProtectedRoute>
                    <AdminProducts />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/new"
                element={
                  <ProtectedRoute>
                    <AdminProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/products/:id"
                element={
                  <ProtectedRoute>
                    <AdminProductForm />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/categories"
                element={
                  <ProtectedRoute>
                    <AdminCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders"
                element={
                  <ProtectedRoute>
                    <AdminOrders />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/admin/orders/:id"
                element={
                  <ProtectedRoute>
                    <AdminOrderDetail />
                  </ProtectedRoute>
                }
              />

              {/* Public Routes - Inside Layout (with header/footer) */}
              <Route
                path="/*"
                element={
                  <Layout>
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/services" element={<Services />} />
                      <Route path="/about" element={<About />} />
                      <Route path="/contact" element={<Contact />} />
                      <Route path="/products" element={<Products />} />
                      <Route path="/product/:id" element={<ProductDetail />} />
                      <Route path="/account" element={<Account />} />
                      <Route path="/privacy" element={<Privacy />} />
                      <Route path="/terms" element={<Terms />} />
                      <Route path="/work-with-us" element={<WorkWithUs />} />
                      <Route path="/faq" element={<FAQ />} />
                      <Route path="/shipping" element={<Shipping />} />
                      <Route path="/returns" element={<Returns />} />
                      <Route path="/cookies" element={<Cookies />} />
                      <Route path="/checkout" element={<Checkout />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Layout>
                }
              />
            </Routes>
          </Suspense>
          <CartDrawer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
