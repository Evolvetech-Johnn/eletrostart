import React from 'react';
import { Zap, Home as HomeIcon, Factory, Sun, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="font-sans">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-brand-blue to-blue-900 text-white py-20 lg:py-32">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center">
          <div className="md:w-1/2 mb-10 md:mb-0">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
              Energia que move o <span className="text-secondary">futuro</span>
            </h1>
            <p className="text-xl mb-8 text-blue-100 max-w-lg">
              Soluções completas em materiais elétricos e energia solar para residências, empresas e indústrias. Qualidade e confiança que você precisa.
            </p>
            <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/contact" className="px-8 py-3 bg-secondary text-white font-bold rounded-lg hover:bg-red-700 transition-colors text-center">
                Solicitar Orçamento
              </Link>
              <Link to="/products" className="px-8 py-3 bg-white text-brand-blue font-bold rounded-lg hover:bg-gray-100 transition-colors text-center">
                Ver Produtos
              </Link>
            </div>
          </div>
          <div className="md:w-1/2 flex justify-center">
             <div className="w-full max-w-md bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center h-32">
                     <Zap className="w-10 h-10 mb-2" />
                     <span className="font-bold">Elétrica</span>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center h-32">
                     <Sun className="w-10 h-10 mb-2" />
                     <span className="font-bold">Solar</span>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center h-32">
                     <Factory className="w-10 h-10 mb-2" />
                     <span className="font-bold">Indústria</span>
                  </div>
                  <div className="bg-white/20 p-4 rounded-lg flex flex-col items-center justify-center h-32">
                     <HomeIcon className="w-10 h-10 mb-2" />
                     <span className="font-bold">Casa</span>
                  </div>
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* Services Preview Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">O que oferecemos</h2>
            <div className="w-20 h-1 bg-secondary mx-auto mb-6"></div>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Soluções integradas para todos os tipos de projetos elétricos.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
             <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
               <Zap className="w-12 h-12 text-secondary mx-auto mb-4" />
               <h3 className="text-xl font-bold mb-2">Materiais Elétricos</h3>
               <p className="text-gray-600 text-sm mb-4">Linha completa de produtos para instalações.</p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
               <HomeIcon className="w-12 h-12 text-primary mx-auto mb-4" />
               <h3 className="text-xl font-bold mb-2">Residencial</h3>
               <p className="text-gray-600 text-sm mb-4">Instalações e manutenção para o seu lar.</p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
               <Factory className="w-12 h-12 text-secondary mx-auto mb-4" />
               <h3 className="text-xl font-bold mb-2">Industrial</h3>
               <p className="text-gray-600 text-sm mb-4">Soluções de alta potência e automação.</p>
             </div>
             <div className="bg-white p-8 rounded-xl shadow-md hover:shadow-lg transition-all text-center">
               <Sun className="w-12 h-12 text-primary mx-auto mb-4" />
               <h3 className="text-xl font-bold mb-2">Energia Solar</h3>
               <p className="text-gray-600 text-sm mb-4">Sustentabilidade e economia na sua conta.</p>
             </div>
          </div>
          
          <div className="text-center">
             <Link to="/services" className="inline-flex items-center text-primary font-bold hover:text-blue-700 transition-colors">
                Conheça todos os nossos serviços <ArrowRight className="ml-2" size={20} />
             </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-primary text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-6">Encontre o produto certo para você</h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Navegue pelo nosso catálogo de produtos e encontre tudo o que precisa para sua instalação elétrica.
          </p>
          <Link to="/products" className="px-8 py-3 bg-white text-primary font-bold rounded-lg hover:bg-gray-100 transition-colors inline-block">
            Ver Catálogo de Produtos
          </Link>
        </div>
      </section>
    </div>
  );
};

export default Home;
