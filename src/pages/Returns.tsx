import { RotateCcw, ShieldCheck, AlertCircle } from "lucide-react";

const Returns = () => {
  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      <div className="bg-[#222998] text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter mb-4 leading-none text-center">Trocas e<br/>Devoluções</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-8 max-w-4xl">
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          <div className="flex items-center space-x-4 mb-12 text-secondary">
            <RotateCcw size={32} />
            <h2 className="text-xl font-black uppercase tracking-tight text-gray-900">Nossa Política de Satisfação</h2>
          </div>

          <div className="space-y-12">
            <div className="bg-blue-50/50 p-8 rounded-3xl border border-blue-100 flex items-start space-x-6">
              <ShieldCheck className="text-primary shrink-0" size={32} />
              <div>
                <h4 className="font-bold text-gray-900 uppercase text-xs mb-2">Direito de Arrependimento</h4>
                <p className="text-sm text-gray-600 leading-relaxed">Conforme o Código de Defesa do Consumidor, você tem até **7 dias corridos** após o recebimento para desistir da compra e solicitar o reembolso integral.</p>
              </div>
            </div>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4 flex items-center">
                <AlertCircle size={16} className="mr-2" />
                Condições para Troca
              </h3>
              <ul className="list-disc list-inside space-y-4 text-sm text-gray-600 ml-4">
                <li>O produto deve estar em sua embalagem original, sem indícios de uso.</li>
                <li>Deve acompanhar a Nota Fiscal (DANFE) original.</li>
                <li>Componentes elétricos não devem ter sido instalados ou sofrido qualquer alteração.</li>
                <li>Produtos sob encomenda ou cortados (como cabos e fios) possuem políticas de troca específicas.</li>
              </ul>
            </section>

            <section>
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-primary mb-4">Como solicitar</h3>
              <p className="text-gray-600 leading-relaxed text-sm">
                Entre em contato através do e-mail **sac@eletrostart.com.br** ou pelo nosso WhatsApp, informando o número do pedido e o motivo da troca. Nossa equipe retornará com as instruções para o envio da logística reversa.
              </p>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Returns;
