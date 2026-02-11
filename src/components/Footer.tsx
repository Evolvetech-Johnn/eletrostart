import React from "react";
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
                <a href="/about" className="hover:text-primary transition-colors">
                  Quem Somos
                </a>
              </li>
              <li>
                <a href="/contact" className="hover:text-primary transition-colors">
                  Fale Conosco
                </a>
              </li>
              <li>
                <a href="/work-with-us" className="hover:text-primary transition-colors">
                  Trabalhe Conosco
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Ajuda</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="/shipping" className="hover:text-primary transition-colors">
                  Fretes e Entregas
                </a>
              </li>
              <li>
                <a href="/returns" className="hover:text-primary transition-colors">
                  Trocas e Devoluções
                </a>
              </li>
              <li>
                <a href="/faq" className="hover:text-primary transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-lg mb-6 text-white">Legal</h4>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <a href="/privacy" className="hover:text-primary transition-colors">
                  Política de Privacidade
                </a>
              </li>
              <li>
                <a href="/terms" className="hover:text-primary transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="/cookies" className="hover:text-primary transition-colors">
                  Política de Cookies
                </a>
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
                <span>
                  Av. Tiradentes, 6166 - Jardim Rosicler, Londrina - PR, 86072-000
                </span>
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
