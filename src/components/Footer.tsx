import React from "react";
import { Link } from "react-router-dom";
import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Linkedin,
  ShieldCheck,
  CreditCard,
  Truck,
  RotateCcw,
} from "lucide-react";
import logo from "../assets/logoeletrostart.png";

const Footer: React.FC = () => {
  return (
    <footer className="bg-[#1a1a1a] text-white pt-16">
      {/* Service Highlights */}
      <div className="container mx-auto px-4 pb-12 border-b border-gray-800">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-800 rounded-full text-primary">
              <Truck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase">Entrega Rápida</h4>
              <p className="text-xs text-gray-400">Para toda a região</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-800 rounded-full text-primary">
              <ShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase">Compra Segura</h4>
              <p className="text-xs text-gray-400">Proteção de dados</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-800 rounded-full text-primary">
              <RotateCcw size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase">Troca Fácil</h4>
              <p className="text-xs text-gray-400">Até 7 dias grátis</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-gray-800 rounded-full text-primary">
              <CreditCard size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm uppercase">Parcelamento</h4>
              <p className="text-xs text-gray-400">Em até 10x sem juros</p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand & Social */}
          <div className="lg:col-span-1">
            <div className="bg-white p-3 rounded mb-6 w-fit">
              <img
                src={logo}
                alt="Eletrostart Logo"
                className="h-[42px] w-auto"
              />
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Especialistas em soluções elétricas e energia solar. Qualidade e
              confiança para seu projeto.
            </p>
            <div className="flex space-x-4 mt-6">
              <a
                href="https://www.facebook.com/eletro.start.1/?locale=pt_BR"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook da Eletrostart"
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Facebook size={20} />
              </a>
              <a
                href="https://www.instagram.com/eletrostartlondrina"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram da Eletrostart"
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Instagram size={20} />
              </a>
              <a
                href="#"
                aria-label="LinkedIn da Eletrostart"
                className="bg-gray-800 p-2 rounded-full hover:bg-secondary transition-colors"
              >
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Links */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Institucional</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-primary transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-primary transition-colors"
                >
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link
                  to="/work-with-us"
                  className="hover:text-primary transition-colors"
                >
                  Trabalhe Conosco
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Ajuda</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-primary transition-colors"
                >
                  Fretes e Entregas
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-primary transition-colors"
                >
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-primary transition-colors">
                  Perguntas Frequentes
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-primary transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-primary transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="hover:text-primary transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Contato</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <Phone size={18} className="mt-1 flex-shrink-0" />
                <span>(43) 3029-5020</span>
              </li>
              <li className="flex items-start space-x-3">
                <Mail size={18} className="mt-1 flex-shrink-0" />
                <span>contato@eletrostart.com.br</span>
              </li>
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="mt-1 flex-shrink-0" />
                <span>Av. Celso Garcia Cid 1027, Londrina 86039000</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 text-center text-sm text-gray-500">
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
