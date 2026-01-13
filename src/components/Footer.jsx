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
import { Link } from "react-router-dom";

const Footer = () => {
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

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">
              Institucional
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/about"
                  className="hover:text-white transition-colors"
                >
                  A Empresa
                </Link>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Nossas Lojas
                </Link>
              </li>
              <li>
                <Link
                  to="/privacy"
                  className="hover:text-white transition-colors"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <Link
                  to="/cookies"
                  className="hover:text-white transition-colors"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  to="/terms"
                  className="hover:text-white transition-colors"
                >
                  Termos de Uso
                </Link>
              </li>
              <li>
                <Link
                  to="/work-with-us"
                  className="hover:text-white transition-colors"
                >
                  Trabalhe Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">
              Atendimento
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li>
                <Link
                  to="/contact"
                  className="hover:text-white transition-colors"
                >
                  Fale Conosco
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-white transition-colors">
                  Dúvidas Frequentes
                </Link>
              </li>
              <li>
                <Link
                  to="/shipping"
                  className="hover:text-white transition-colors"
                >
                  Prazos de Entrega
                </Link>
              </li>
              <li>
                <Link
                  to="/returns"
                  className="hover:text-white transition-colors"
                >
                  Trocas e Devoluções
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">
              Contato
            </h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-1 shrink-0" />
                <span>
                  Av. Celso Garcia Cid, 1027
                  <br />
                  Vila Siam, Londrina - PR
                </span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>(43) 3029-5020</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>contato@eletrostart.com.br</span>
              </li>
            </ul>

            {/* Navigation Buttons */}
            <div className="mt-6">
              <h4 className="text-xs font-bold uppercase tracking-widest mb-3 text-gray-500">
                Como Chegar
              </h4>
              <div className="flex flex-wrap gap-2">
                {/* Google Maps */}
                <a
                  href="https://www.google.com/maps/search/?api=1&query=Av.+Celso+Garcia+Cid,+1027,+Vila+Siam,+Londrina,+PR"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir localização no Google Maps"
                  className="flex items-center gap-2 bg-gray-800 hover:bg-[#4285F4] px-3 py-2 rounded-lg transition-all text-xs font-bold group"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
                  </svg>
                  <span>Maps</span>
                </a>

                {/* Waze */}
                <a
                  href="https://waze.com/ul?q=Av.+Celso+Garcia+Cid,+1027,+Vila+Siam,+Londrina,+PR&navigate=yes"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Abrir localização no Waze"
                  className="flex items-center gap-2 bg-gray-800 hover:bg-[#33CCFF] px-3 py-2 rounded-lg transition-all text-xs font-bold group"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12c0 5.52 4.48 10 10 10s10-4.48 10-10c0-5.52-4.48-10-10-10zM8.5 9c.83 0 1.5.67 1.5 1.5S9.33 12 8.5 12 7 11.33 7 10.5 7.67 9 8.5 9zm7 0c.83 0 1.5.67 1.5 1.5s-.67 1.5-1.5 1.5-1.5-.67-1.5-1.5.67-1.5 1.5-1.5zm-3.5 8c-2.33 0-4.32-1.45-5.12-3.5h1.67c.69 1.19 1.97 2 3.45 2s2.76-.81 3.45-2h1.67c-.8 2.05-2.79 3.5-5.12 3.5z" />
                  </svg>
                  <span>Waze</span>
                </a>

                {/* Uber */}
                <a
                  href="https://m.uber.com/ul/?action=setPickup&pickup=my_location&dropoff[formatted_address]=Av.+Celso+Garcia+Cid,+1027,+Vila+Siam,+Londrina,+PR"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Solicitar corrida no Uber"
                  className="flex items-center gap-2 bg-gray-800 hover:bg-black px-3 py-2 rounded-lg transition-all text-xs font-bold group"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm3.5 14.5c-2.5 1.5-5.5 1.5-7 0V10c0-1.933 1.567-3.5 3.5-3.5s3.5 1.567 3.5 3.5v6.5z" />
                  </svg>
                  <span>Uber</span>
                </a>
              </div>
            </div>
          </div>

          {/* Payments & Security */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">
              Pagamento
            </h3>
            <div className="flex flex-wrap gap-2 mb-8">
              {/* Visa */}
              <div className="bg-white p-2 rounded w-12 h-8 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path
                    fill="#1565C0"
                    d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                  />
                  <path
                    fill="#FFF"
                    d="M15.186 19l-2.626 7.832c0 0-.667-3.313-.733-3.729-1.495-3.411-3.701-3.221-3.701-3.221L10.726 30v-.002h3.161L18.258 19H15.186zM17.689 30L20.56 30 22.296 19 19.389 19zM38.008 19h-3.021l-4.71 11h2.852l.588-1.571h3.596L37.619 30h2.613L38.008 19zM34.513 26.328l1.563-4.157.818 4.157H34.513zM26.369 22.206c0-.606.498-1.057 1.926-1.057.928 0 1.991.674 1.991.674l.466-2.309c0 0-1.358-.515-2.691-.515-3.019 0-4.576 1.444-4.576 3.272 0 3.306 3.979 2.853 3.979 4.551 0 .291-.231.964-1.888.964-1.662 0-2.759-.609-2.759-.609l-.495 2.216c0 0 1.063.606 3.117.606 2.059 0 4.915-1.54 4.915-3.752C30.354 23.586 26.369 23.394 26.369 22.206z"
                  />
                </svg>
              </div>
              {/* Mastercard */}
              <div className="bg-white p-2 rounded w-12 h-8 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path
                    fill="#3F51B5"
                    d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                  />
                  <path
                    fill="#FFC107"
                    d="M30 24A6 6 0 1 0 30 36A6 6 0 1 0 30 24Z"
                  />
                  <path
                    fill="#FF3D00"
                    d="M18 24A6 6 0 1 0 18 36 6 6 0 1 0 18 24zM24 26.5c-.9-1.5-1-3.5 0-5 1 1.5 1 3.5 0 5z"
                  />
                </svg>
              </div>
              {/* Elo */}
              <div className="bg-white p-2 rounded w-12 h-8 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path
                    fill="#FFC107"
                    d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                  />
                  <path
                    fill="#263238"
                    d="M12 20h4v8h-4zM18 24c0-3.314 2.686-6 6-6s6 2.686 6 6-2.686 6-6 6-6-2.686-6-6zm3 0c0 1.657 1.343 3 3 3s3-1.343 3-3-1.343-3-3-3-3 1.343-3 3z"
                  />
                  <path
                    fill="#00BCD4"
                    d="M32 24c0-2.209 1.791-4 4-4v8c-2.209 0-4-1.791-4-4z"
                  />
                  <path
                    fill="#FF5722"
                    d="M36 20v8c2.209 0 4-1.791 4-4s-1.791-4-4-4z"
                  />
                </svg>
              </div>
              {/* Pix */}
              <div className="bg-white p-2 rounded w-12 h-8 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path
                    fill="#4DB6AC"
                    d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                  />
                  <path
                    fill="#FFF"
                    d="M28.3 18.5l-4.3 4.3-4.3-4.3-2.1 2.1 4.3 4.3-4.3 4.3 2.1 2.1 4.3-4.3 4.3 4.3 2.1-2.1-4.3-4.3 4.3-4.3z"
                  />
                </svg>
              </div>
              {/* Boleto */}
              <div className="bg-white p-2 rounded w-12 h-8 flex items-center justify-center">
                <svg viewBox="0 0 48 48" className="w-full h-full">
                  <path
                    fill="#607D8B"
                    d="M45,35c0,2.209-1.791,4-4,4H7c-2.209,0-4-1.791-4-4V13c0-2.209,1.791-4,4-4h34c2.209,0,4,1.791,4,4V35z"
                  />
                  <path
                    fill="#FFF"
                    d="M10 16h2v16h-2zM14 16h1v16h-1zM17 16h3v16h-3zM22 16h2v16h-2zM26 16h1v16h-1zM29 16h1v16h-1zM32 16h3v16h-3zM37 16h1v16h-1z"
                  />
                </svg>
              </div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">
              Segurança
            </h3>
            <div className="flex space-x-4">
              <div className="bg-gray-800 p-2 rounded text-green-500">
                <ShieldCheck size={28} />
              </div>
              <div className="bg-gray-800 p-2 rounded text-blue-400">
                <ShieldCheck size={28} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Copyright */}
      <div className="bg-[#111111] py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center text-xs text-gray-500 gap-4 text-center md:text-left">
          <p>
            &copy; {new Date().getFullYear()} ELETROSTART COMERCIAL ELETRICA
            LTDA. CNPJ: XX.XXX.XXX/XXXX-XX
            <br />
            Todos os direitos reservados.
          </p>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span>Tecnologia:</span>
              <span className="font-bold text-gray-300">Evolvetech</span>
            </div>
            <div className="flex items-center space-x-2">
              <span>Design:</span>
              <span className="font-bold text-gray-300">Eletrostart</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
