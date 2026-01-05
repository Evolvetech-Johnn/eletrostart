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
  RotateCcw
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
              <img src={logo} alt="Eletrostart Logo" className="h-8 w-auto" />
            </div>
            <p className="text-gray-400 text-sm mb-6 leading-relaxed">
              Especialistas em soluções elétricas e energia solar. Qualidade e confiança para seu projeto.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
                <Facebook size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
                <Instagram size={20} />
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 flex items-center justify-center rounded-full hover:bg-primary transition-colors">
                <Linkedin size={20} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Institucional</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/about" className="hover:text-white transition-colors">A Empresa</Link></li>
              <li><Link to="/contact" className="hover:text-white transition-colors">Nossas Lojas</Link></li>
              <li><Link to="/privacy" className="hover:text-white transition-colors">Política de Privacidade</Link></li>
              <li><Link to="/terms" className="hover:text-white transition-colors">Termos de Uso</Link></li>
              <li><Link to="/work-with-us" className="hover:text-white transition-colors">Trabalhe Conosco</Link></li>
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Atendimento</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li><Link to="/contact" className="hover:text-white transition-colors">Fale Conosco</Link></li>
              <li><Link to="/faq" className="hover:text-white transition-colors">Dúvidas Frequentes</Link></li>
              <li><Link to="/shipping" className="hover:text-white transition-colors">Prazos de Entrega</Link></li>
              <li><Link to="/returns" className="hover:text-white transition-colors">Trocas e Devoluções</Link></li>
            </ul>
          </div>

          {/* Contact Details */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Contato</h3>
            <ul className="space-y-4 text-sm text-gray-400">
              <li className="flex items-start space-x-3">
                <MapPin size={18} className="text-primary mt-1 shrink-0" />
                <span>Av. Celso Garcia Cid, 1027<br />Vila Siam, Londrina - PR</span>
              </li>
              <li className="flex items-center space-x-3">
                <Phone size={18} className="text-primary shrink-0" />
                <span>(43) XXXX-XXXX</span>
              </li>
              <li className="flex items-center space-x-3">
                <Mail size={18} className="text-primary shrink-0" />
                <span>contato@eletrostart.com.br</span>
              </li>
            </ul>
          </div>

          {/* Payments & Security */}
          <div>
            <h3 className="text-sm font-bold uppercase tracking-widest mb-6 text-primary">Pagamento</h3>
            <div className="flex flex-wrap gap-2 mb-8">
              <div className="bg-gray-800 p-1.5 rounded w-10 h-7 flex items-center justify-center text-[8px] font-bold">VISA</div>
              <div className="bg-gray-800 p-1.5 rounded w-10 h-7 flex items-center justify-center text-[8px] font-bold">MAST</div>
              <div className="bg-gray-800 p-1.5 rounded w-10 h-7 flex items-center justify-center text-[8px] font-bold">ELO</div>
              <div className="bg-gray-800 p-1.5 rounded w-10 h-7 flex items-center justify-center text-[8px] font-bold">PIX</div>
              <div className="bg-gray-800 p-1.5 rounded w-10 h-7 flex items-center justify-center text-[8px] font-bold">BOL</div>
            </div>

            <h3 className="text-sm font-bold uppercase tracking-widest mb-4 text-primary">Segurança</h3>
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
            &copy; {new Date().getFullYear()} ELETROSTART COMERCIAL ELETRICA LTDA. CNPJ: XX.XXX.XXX/XXXX-XX<br />
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
