import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
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
import ScrollToTop from "./components/ScrollToTop";

function App() {
  return (
    <Router>
      <ScrollToTop />
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
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;
