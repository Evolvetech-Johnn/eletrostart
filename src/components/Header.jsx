import React, { useState } from "react";
import { Menu, X, Phone, Mail } from "lucide-react";
import logo from "../assets/logoeletrostart.png";
import { Link, NavLink } from "react-router-dom";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${
      isActive ? "text-primary font-bold" : "text-gray-700 hover:text-primary"
    }`;

  return (
    <header className="bg-white shadow-md fixed w-full z-50">
      <div className="bg-primary text-white py-2 text-sm">
        <div className="container mx-auto px-4 flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-1">
              <Phone size={16} />
              <span>(XX) XXXX-XXXX</span>
            </div>
            <div className="flex items-center space-x-1 hidden sm:flex">
              <Mail size={16} />
              <span>contato@eletrostart.com.br</span>
            </div>
          </div>
          <div className="flex space-x-2">
            {/* Social Media placeholders if needed */}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Eletrostart Logo" className="h-12 w-auto" />
          <span className="ml-2 text-2xl font-bold text-primary hidden md:block">
            ELETROSTART
          </span>
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 items-center">
          <NavLink to="/" className={navLinkClass}>
            Início
          </NavLink>
          <NavLink to="/products" className={navLinkClass}>
            Nossos Produtos
          </NavLink>
          <NavLink to="/services" className={navLinkClass}>
            Serviços
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            Sobre Nós
          </NavLink>
          <NavLink
            to="/contact"
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-red-700 transition-colors"
          >
            Fale Conosco
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg">
          <div className="flex flex-col px-4 py-2 space-y-2">
            <Link
              to="/"
              className="py-2 text-gray-700 hover:text-primary border-b border-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>
            <Link
              to="/products"
              className="py-2 text-gray-700 hover:text-primary border-b border-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Nossos Produtos
            </Link>
            <Link
              to="/services"
              className="py-2 text-gray-700 hover:text-primary border-b border-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Serviços
            </Link>
            <Link
              to="/about"
              className="py-2 text-gray-700 hover:text-primary border-b border-gray-50"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre Nós
            </Link>
            <Link
              to="/contact"
              className="py-2 text-secondary font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
