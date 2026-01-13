import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./layout/Layout";
import Home from "./pages/Home";
import Services from "./pages/Services";
import About from "./pages/About";
import Contact from "./pages/Contact";
import Products from "./pages/Products";
import Account from "./pages/Account";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import WorkWithUs from "./pages/WorkWithUs";
import FAQ from "./pages/FAQ";
import Shipping from "./pages/Shipping";
import Returns from "./pages/Returns";
import Cookies from "./pages/Cookies";
import Checkout from "./pages/Checkout";
import ScrollToTop from "./components/ScrollToTop";
import CartDrawer from "./components/CartDrawer";

// Admin Pages
import AdminLogin from "./pages/admin/AdminLogin";
import AdminDashboard from "./pages/admin/AdminDashboard";
import AdminMessages from "./pages/admin/AdminMessages";
import AdminMessageDetail from "./pages/admin/AdminMessageDetail";
import AdminIntegrations from "./pages/admin/AdminIntegrations";
import AdminProducts from "./pages/admin/AdminProducts";
import AdminProductForm from "./pages/admin/AdminProductForm";
import AdminOrders from "./pages/admin/AdminOrders";
import AdminOrderDetail from "./pages/admin/AdminOrderDetail";
import ProtectedRoute from "./pages/admin/components/ProtectedRoute";
import { Toaster } from "react-hot-toast";

function App() {
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Toaster position="top-right" />
          <ScrollToTop />
          <Routes>
            {/* Admin Routes - Outside Layout (no header/footer) */}
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
                    <Route path="/account" element={<Account />} />
                    <Route path="/privacy" element={<Privacy />} />
                    <Route path="/terms" element={<Terms />} />
                    <Route path="/work-with-us" element={<WorkWithUs />} />
                    <Route path="/faq" element={<FAQ />} />
                    <Route path="/shipping" element={<Shipping />} />
                    <Route path="/returns" element={<Returns />} />
                    <Route path="/cookies" element={<Cookies />} />
                    <Route path="/checkout" element={<Checkout />} />
                  </Routes>
                </Layout>
              }
            />
          </Routes>
          <CartDrawer />
        </Router>
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
