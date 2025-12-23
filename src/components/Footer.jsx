import React from "react";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
} from "lucide-react";
import logo from "../assets/logoeletrostart.png";
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center mb-4 bg-white p-2 rounded w-fit">
              <img src={logo} alt="Eletrostart Logo" className="h-10 w-auto" />
            </div>
            <p className="text-gray-400 mb-4">
              Soluções completas em materiais elétricos e energia solar para sua
              casa, empresa ou indústria.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b-2 border-secondary w-fit pb-1">
              Links Rápidos
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  to="/"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Início
                </Link>
              </li>
              <li>
                <Link
                  to="/products"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Nossos Produtos
                </Link>
              </li>
              <li>
                <Link
                  to="/services"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Serviços
                </Link>
              </li>
              <li>
                <Link
                  to="/about"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Sobre Nós
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  Contato
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b-2 border-secondary w-fit pb-1">
              Serviços
            </h3>
            <ul className="space-y-2">
              <li className="text-gray-400">Materiais Elétricos</li>
              <li className="text-gray-400">Instalação Residencial</li>
              <li className="text-gray-400">Projetos Industriais</li>
              <li className="text-gray-400">Energia Solar</li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-lg font-bold mb-4 border-b-2 border-secondary w-fit pb-1">
              Contato
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start space-x-3 text-gray-400">
                <MapPin
                  className="mt-1 flex-shrink-0 text-secondary"
                  size={18}
                />
                <div>
                  <span className="block">Avenida Celso Garcia Cid, 1027</span>
                  <span className="block">Vila Siam/Centro, Londrina – PR</span>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    <a 
                      href="https://www.google.com/maps/search/?api=1&query=Avenida+Celso+Garcia+Cid+1027+Londrina+PR" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                    >
                      Google Maps
                    </a>
                    <a 
                      href="https://waze.com/ul?q=Avenida+Celso+Garcia+Cid+1027+Londrina+PR" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-cyan-500 text-white text-xs rounded hover:bg-cyan-600 transition-colors"
                    >
                      Waze
                    </a>
                    <a 
                      href="https://m.uber.com/ul/?action=setPickup&dropoff[formatted_address]=Avenida%20Celso%20Garcia%20Cid%2C%201027%20-%20Vila%20Siam%2C%20Londrina%20-%20PR" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 bg-black text-white text-xs rounded hover:bg-gray-800 transition-colors"
                    >
                      Uber
                    </a>
                  </div>
                </div>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Phone className="flex-shrink-0 text-secondary" size={18} />
                <span>(XX) XXXX-XXXX</span>
              </li>
              <li className="flex items-center space-x-3 text-gray-400">
                <Mail className="flex-shrink-0 text-secondary" size={18} />
                <span>contato@eletrostart.com.br</span>
              </li>
            </ul>
            <div className="flex space-x-4 mt-6">
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 pt-6 text-center text-gray-500 text-sm">
          <p>
            &copy; {new Date().getFullYear()} Eletrostart. Todos os direitos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
