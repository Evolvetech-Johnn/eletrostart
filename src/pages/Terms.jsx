import React from "react";
import { FileText, AlertCircle } from "lucide-react";

const Terms = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-center">Termos de<br/>Uso do Site</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 max-w-4xl">
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          <div className="flex items-center justify-center space-x-4 mb-12 text-primary">
            <FileText size={32} />
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Condições Gerais</h2>
          </div>
          
          <div className="prose prose-blue max-w-none text-gray-600 space-y-8">
            <div className="p-6 bg-secondary/5 rounded-2xl border-l-4 border-secondary flex items-start space-x-4">
              <AlertCircle className="text-secondary shrink-0" size={20} />
              <p className="text-sm font-medium italic">Ao navegar em nosso site, você concorda automaticamente com estes termos e condições.</p>
            </div>

            <section>
              <h4 className="font-black uppercase text-gray-900 text-xs tracking-widest mb-3">Utilização do Site</h4>
              <p>O usuário compromete-se a fazer uso adequado dos conteúdos e ferramentas oferecidos pela Eletrostart, não os utilizando para fins ilícitos ou que causem danos à marca ou a terceiros.</p>
            </section>

            <section>
              <h4 className="font-black uppercase text-gray-900 text-xs tracking-widest mb-3">Propriedade Intelectual</h4>
              <p>Todo o conteúdo gráfico, logotipos, textos e imagens são de propriedade exclusiva da Eletrostart ou de seus parceiros, sendo vedada a reprodução sem autorização prévia por escrito.</p>
            </section>

            <section>
              <h4 className="font-black uppercase text-gray-900 text-xs tracking-widest mb-3">Preços e Disponibilidade</h4>
              <p>Os preços e promoções apresentados no site são válidos apenas para compras online. Reservamo-nos o direito de corrigir eventuais erros de digitação e atualizar preços conforme as variações do mercado.</p>
            </section>

            <section>
              <h4 className="font-black uppercase text-gray-900 text-xs tracking-widest mb-3">Responsabilidades</h4>
              <p>A Eletrostart não se responsabiliza por mau uso dos produtos adquiridos ou por danos causados por instalações realizadas por profissionais não qualificados.</p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Terms;
