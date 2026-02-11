import React from "react";
import { ShieldCheck, Eye, Database, Lock, UserCheck, Mail, Phone, AlertCircle, CheckCircle, FileText } from "lucide-react";
import { Link } from "react-router-dom";

const Privacy: React.FC = () => {
  const lastUpdate = "12 de Janeiro de 2026";

  const sections = [
    {
      id: "coleta",
      title: "1. Coleta de Dados Pessoais",
      icon: Database,
      content: [
        "A ELETROSTART coleta dados pessoais de forma ética e transparente, sempre com base legal adequada conforme a LGPD (Lei nº 13.709/2018).",
        "**Dados que coletamos:**",
        "• Nome completo e CPF/CNPJ para emissão de notas fiscais",
        "• E-mail e telefone para comunicação sobre pedidos",
        "• Endereço para entrega de produtos",
        "• Dados de navegação (cookies) para melhorar a experiência",
        "• Histórico de compras para ofertas personalizadas"
      ]
    },
    {
      id: "finalidade",
      title: "2. Finalidade do Tratamento",
      icon: Eye,
      content: [
        "Utilizamos seus dados pessoais exclusivamente para:",
        "• Processar e entregar seus pedidos",
        "• Emitir documentos fiscais obrigatórios",
        "• Enviar atualizações sobre status de compras",
        "• Fornecer suporte ao cliente",
        "• Enviar ofertas e promoções (mediante seu consentimento)",
        "• Cumprir obrigações legais e regulatórias",
        "• Melhorar nossos produtos e serviços"
      ]
    },
    {
      id: "compartilhamento",
      title: "3. Compartilhamento de Dados",
      icon: UserCheck,
      content: [
        "Seus dados podem ser compartilhados com:",
        "• **Transportadoras**: Nome, endereço e telefone para entrega",
        "• **Gateways de pagamento**: Dados necessários para processar transações",
        "• **Órgãos fiscais**: Conforme exigências legais",
        "Não vendemos, alugamos ou compartilhamos seus dados para fins de marketing de terceiros."
      ]
    },
    {
      id: "seguranca",
      title: "4. Segurança dos Dados",
      icon: Lock,
      content: [
        "Implementamos medidas técnicas e organizacionais para proteger seus dados:",
        "• Criptografia SSL/TLS em todas as transmissões",
        "• Servidores protegidos com firewall e monitoramento",
        "• Acesso restrito apenas a funcionários autorizados",
        "• Backups regulares com criptografia",
        "• Política de senhas fortes e autenticação"
      ]
    },
    {
      id: "direitos",
      title: "5. Seus Direitos (LGPD)",
      icon: CheckCircle,
      content: [
        "Conforme a LGPD, você tem direito a:",
        "• **Confirmação**: Saber se tratamos seus dados",
        "• **Acesso**: Obter cópia dos dados que possuímos",
        "• **Correção**: Atualizar dados incompletos ou incorretos",
        "• **Anonimização**: Solicitar anonimização de dados desnecessários",
        "• **Eliminação**: Pedir exclusão de dados tratados com consentimento",
        "• **Portabilidade**: Receber seus dados em formato estruturado",
        "• **Revogação**: Retirar consentimento a qualquer momento"
      ]
    },
    {
      id: "cookies",
      title: "6. Cookies e Tecnologias",
      icon: FileText,
      content: [
        "Utilizamos cookies para melhorar sua experiência. Para mais detalhes, consulte nossa",
        "→ Política de Cookies completa"
      ],
      link: "/cookies"
    },
    {
      id: "retencao",
      title: "7. Retenção de Dados",
      icon: Database,
      content: [
        "Mantemos seus dados pelo tempo necessário para:",
        "• Cumprir obrigações legais (ex: 5 anos para dados fiscais)",
        "• Exercer direitos em processos judiciais",
        "• Manter relacionamento comercial ativo",
        "Após esse período, os dados são eliminados de forma segura."
      ]
    }
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#222998] to-[#1a1f7a] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-10 left-10 w-96 h-96 border border-white/20 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <ShieldCheck size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Política de Privacidade
              </h1>
              <p className="text-blue-200 mt-2 font-medium">
                Lei Geral de Proteção de Dados (LGPD)
              </p>
            </div>
          </div>
          <p className="text-blue-100 max-w-2xl text-lg">
            A ELETROSTART está comprometida com a proteção dos seus dados pessoais e com a transparência no tratamento das suas informações.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* Quick Info Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 md:p-8 mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <AlertCircle className="text-primary" size={24} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Última atualização</p>
              <p className="font-bold text-gray-900">{lastUpdate}</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Mail className="text-primary" size={24} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Encarregado (DPO)</p>
              <p className="font-bold text-gray-900">privacidade@eletrostart.com.br</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Phone className="text-primary" size={24} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Contato</p>
              <p className="font-bold text-gray-900">(43) 3029-5020</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          {/* Table of Contents */}
          <div className="bg-gray-50 rounded-3xl p-8 mb-12">
            <h2 className="text-sm font-black uppercase tracking-widest text-gray-400 mb-6">Índice</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {sections.map((section) => (
                <a 
                  key={section.id}
                  href={`#${section.id}`}
                  className="flex items-center gap-3 text-gray-600 hover:text-primary transition-colors group"
                >
                  <section.icon size={16} className="text-primary" />
                  <span className="group-hover:underline">{section.title}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Sections */}
          <div className="space-y-16">
            {sections.map((section) => (
              <section key={section.id} id={section.id} className="scroll-mt-32">
                <div className="flex items-center gap-4 mb-6">
                  <div className="bg-primary/10 p-3 rounded-xl text-primary">
                    <section.icon size={24} />
                  </div>
                  <h3 className="text-xl font-black uppercase tracking-tight text-gray-900">
                    {section.title}
                  </h3>
                </div>
                <div className="pl-14 space-y-3">
                  {section.content.map((paragraph, idx) => (
                    <p 
                      key={idx} 
                      className={`text-gray-600 leading-relaxed ${paragraph.startsWith('•') ? 'pl-4' : ''} ${paragraph.startsWith('**') ? 'font-semibold text-gray-700' : ''}`}
                      dangerouslySetInnerHTML={{ 
                        __html: paragraph
                          .replace(/\*\*(.*?)\*\*/g, '<strong class="text-gray-800">$1</strong>')
                          .replace(/→/g, '<span class="text-primary">→</span>')
                      }}
                    />
                  ))}
                  {section.link && (
                    <Link 
                      to={section.link}
                      className="inline-flex items-center gap-2 text-primary font-bold hover:underline mt-2"
                    >
                      Ver Política de Cookies →
                    </Link>
                  )}
                </div>
              </section>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 bg-gradient-to-r from-primary to-[#1a1f7a] rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl font-black uppercase mb-4">Dúvidas sobre seus dados?</h3>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Entre em contato com nosso Encarregado de Proteção de Dados (DPO) para exercer seus direitos ou esclarecer dúvidas.
            </p>
            <Link 
              to="/contact"
              className="inline-block bg-white text-primary px-8 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg"
            >
              Fale Conosco
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Privacy;
