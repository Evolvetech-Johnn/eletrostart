import React from "react";
import { ShieldCheck, Info } from "lucide-react";

const Privacy = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none">Privacidade<br/>e Segurança</h1>
          <p className="text-blue-100 font-medium italic opacity-80">Saiba como protegemos seus dados.</p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8">
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          <div className="flex items-center space-x-4 mb-12 text-primary">
            <ShieldCheck size={40} />
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900">Nossa Política</h2>
          </div>
          
          <div className="space-y-12 max-w-4xl">
            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">1. Coleta de Dados</h3>
              <p className="text-gray-600 leading-relaxed">
                Coletamos informações necessárias para processar seus pedidos e melhorar sua experiência de navegação. Isso inclui nome, CPF/CNPJ, e-mail, telefone e endereço de entrega. Seus dados são tratados com o mais alto nível de confidencialidade.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">2. Uso das Informações</h3>
              <p className="text-gray-600 leading-relaxed">
                Utilizamos seus dados exclusivamente para: processamento de transações, envio de atualizações sobre pedidos, suporte ao cliente e, opcionalmente, envio de ofertas e novidades da Eletrostart via newsletter.
              </p>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">3. Segurança dos Pagamentos</h3>
              <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-start space-x-4">
                <Info className="text-secondary shrink-0" size={24} />
                <p className="text-sm text-gray-500 leading-relaxed italic">
                  Utilizamos protocolos de segurança SSL (Secure Socket Layer) para criptografar todas as transações financeiras. Nenhuma informação de cartão de crédito é armazenada em nossos servidores após o processamento do pagamento.
                </p>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">4. Seus Direitos</h3>
              <p className="text-gray-600 leading-relaxed">
                Em conformidade com a LGPD, você tem o direito de acessar, corrigir ou solicitar a exclusão de seus dados pessoais a qualquer momento através de nossos canais de atendimento.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
