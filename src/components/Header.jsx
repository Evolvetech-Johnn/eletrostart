import React, { useState } from "react";
import { Menu, X, Phone, Mail, ChevronDown } from "lucide-react";
import logo from "../assets/logoeletrostart.png";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { categories } from "../data/products";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProductsDropdownOpen, setIsProductsDropdownOpen] = useState(false);
  const navigate = useNavigate();

  const navLinkClass = ({ isActive }) =>
    `font-medium transition-colors ${
      isActive ? "text-primary font-bold" : "text-gray-700 hover:text-primary"
    }`;

  const handleCategoryClick = (categoryId) => {
    setIsMenuOpen(false);
    setIsProductsDropdownOpen(false);
    navigate(`/products?category=${categoryId}`);
  };

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
          <img src={logo} alt="Eletrostart Logo" className="h-24 w-auto" />
        </Link>

        {/* Desktop Menu */}
        <nav className="hidden md:flex space-x-8 items-center">
          <NavLink to="/" className={navLinkClass}>
            Início
          </NavLink>

          <div className="relative group">
            <button
              className={`flex items-center space-x-1 ${navLinkClass({
                isActive: window.location.pathname === "/products",
              })}`}
            >
              <NavLink
                to="/products"
                className={({ isActive }) =>
                  isActive
                    ? "text-primary font-bold"
                    : "text-gray-700 hover:text-primary"
                }
              >
                Nossos Produtos
              </NavLink>
              <ChevronDown size={16} />
            </button>

            {/* Dropdown Menu */}
            <div className="absolute top-full left-0 w-64 bg-white shadow-xl rounded-lg py-2 mt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-left border-t-4 border-secondary">
              <Link
                to="/products"
                className="block px-4 py-2 text-gray-700 hover:bg-gray-50 hover:text-primary font-medium border-b border-gray-100"
              >
                Ver todos os produtos
              </Link>
              {categories.map((category) => (
                <Link
                  key={category.id}
                  to={`/products?category=${category.id}`}
                  className="block px-4 py-2 text-sm text-gray-600 hover:bg-gray-50 hover:text-secondary"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          </div>

          <NavLink to="/services" className={navLinkClass}>
            Serviços
          </NavLink>
          <NavLink to="/about" className={navLinkClass}>
            Sobre Nós
          </NavLink>
          <NavLink
            to="/contact"
            className="px-4 py-2 bg-secondary text-white rounded-md hover:bg-red-700 transition-colors shadow-sm hover:shadow-md"
          >
            Fale Conosco
          </NavLink>
        </nav>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden text-gray-700 p-2 rounded-md hover:bg-gray-100"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-label="Menu"
        >
          {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full shadow-lg h-screen overflow-y-auto pb-20">
          <div className="flex flex-col px-4 py-2 space-y-1">
            <Link
              to="/"
              className="py-3 text-gray-700 hover:text-primary border-b border-gray-50 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Início
            </Link>

            <div className="border-b border-gray-50">
              <div
                className="flex items-center justify-between py-3 text-gray-700 cursor-pointer"
                onClick={() =>
                  setIsProductsDropdownOpen(!isProductsDropdownOpen)
                }
              >
                <span className="font-medium">Nossos Produtos</span>
                <ChevronDown
                  size={20}
                  className={`transform transition-transform ${
                    isProductsDropdownOpen ? "rotate-180" : ""
                  }`}
                />
              </div>

              {isProductsDropdownOpen && (
                <div className="bg-gray-50 rounded-md mb-2 overflow-hidden">
                  <Link
                    to="/products"
                    className="block px-4 py-2 text-sm font-medium text-primary border-l-4 border-primary bg-blue-50/50"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Ver todos
                  </Link>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryClick(category.id)}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-600 hover:text-secondary border-l-4 border-transparent hover:border-secondary hover:bg-gray-100"
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link
              to="/services"
              className="py-3 text-gray-700 hover:text-primary border-b border-gray-50 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Serviços
            </Link>
            <Link
              to="/about"
              className="py-3 text-gray-700 hover:text-primary border-b border-gray-50 font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Sobre Nós
            </Link>
            <Link
              to="/contact"
              className="mt-4 w-full text-center py-3 bg-secondary text-white rounded-md font-bold shadow-md"
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
