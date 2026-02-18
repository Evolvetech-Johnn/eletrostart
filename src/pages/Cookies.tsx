import { Cookie, Settings, BarChart3, Target, Shield, CheckCircle, Info } from "lucide-react";
import { Link } from "react-router-dom";

const Cookies: React.FC = () => {
  const lastUpdate = "12 de Janeiro de 2026";

  const cookieTypes = [
    {
      id: "necessary",
      title: "Cookies Essenciais",
      icon: Shield,
      required: true,
      description: "Necessários para o funcionamento básico do site. Não podem ser desativados.",
      examples: [
        "Manter você conectado durante a navegação",
        "Lembrar itens no carrinho de compras",
        "Garantir segurança das transações",
        "Salvar preferências de cookies"
      ]
    },
    {
      id: "analytics",
      title: "Cookies de Análise",
      icon: BarChart3,
      required: false,
      description: "Nos ajudam a entender como os visitantes interagem com o site.",
      examples: [
        "Google Analytics (estatísticas de visitas)",
        "Páginas mais acessadas",
        "Tempo de permanência no site",
        "Taxa de rejeição e conversão"
      ]
    },
    {
      id: "marketing",
      title: "Cookies de Marketing",
      icon: Target,
      required: false,
      description: "Utilizados para exibir anúncios relevantes e medir campanhas.",
      examples: [
        "Facebook Pixel (remarketing)",
        "Google Ads (anúncios personalizados)",
        "Rastreamento de conversões",
        "Ofertas personalizadas"
      ]
    },
    {
      id: "preferences",
      title: "Cookies de Preferências",
      icon: Settings,
      required: false,
      description: "Permitem que o site lembre suas escolhas e personalize a experiência.",
      examples: [
        "Idioma preferido",
        "Região/localização",
        "Tema claro/escuro",
        "Produtos visualizados recentemente"
      ]
    }
  ];

  const cookieList = [
    { name: "_ga", provider: "Google Analytics", type: "Análise", duration: "2 anos", purpose: "Distinguir usuários únicos" },
    { name: "_gid", provider: "Google Analytics", type: "Análise", duration: "24 horas", purpose: "Distinguir usuários" },
    { name: "_fbp", provider: "Facebook", type: "Marketing", duration: "3 meses", purpose: "Rastrear visitas para remarketing" },
    { name: "cart_session", provider: "Eletrostart", type: "Essencial", duration: "Sessão", purpose: "Manter carrinho de compras" },
    { name: "cookie_consent", provider: "Eletrostart", type: "Essencial", duration: "1 ano", purpose: "Salvar preferências de cookies" },
  ];

  return (
    <div className="bg-[#f8f9fa] min-h-screen pb-20">
      {/* Hero */}
      <div className="bg-gradient-to-br from-[#222998] to-[#1a1f7a] text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 right-20 w-48 h-48 border border-white/20 rounded-full"></div>
          <div className="absolute bottom-20 left-20 w-72 h-72 border border-white/20 rounded-full"></div>
        </div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="flex items-center gap-4 mb-6">
            <div className="bg-white/10 p-4 rounded-2xl backdrop-blur-sm">
              <Cookie size={40} />
            </div>
            <div>
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter leading-none">
                Política de Cookies
              </h1>
              <p className="text-blue-200 mt-2 font-medium">
                Transparência no uso de tecnologias de rastreamento
              </p>
            </div>
          </div>
          <p className="text-blue-100 max-w-2xl text-lg">
            Entenda como utilizamos cookies e tecnologias similares para melhorar sua experiência em nosso site.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 -mt-10 relative z-20">
        {/* Last Update Card */}
        <div className="bg-white rounded-3xl shadow-xl shadow-blue-900/5 p-6 md:p-8 mb-8 flex flex-wrap items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Info className="text-primary" size={24} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Última atualização</p>
              <p className="font-bold text-gray-900">{lastUpdate}</p>
            </div>
          </div>
          <p className="text-sm text-gray-500">
            Conforme LGPD (Lei nº 13.709/2018) e Marco Civil da Internet
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-[40px] shadow-xl shadow-blue-900/5 p-8 md:p-16">
          
          {/* What are Cookies */}
          <section className="mb-16">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6 flex items-center gap-3">
              <Cookie className="text-primary" size={28} />
              O que são Cookies?
            </h2>
            <div className="bg-gray-50 rounded-3xl p-8">
              <p className="text-gray-600 leading-relaxed mb-4">
                Cookies são pequenos arquivos de texto armazenados em seu dispositivo (computador, tablet ou celular) quando você visita um site. Eles são amplamente utilizados para fazer os sites funcionarem de forma mais eficiente e fornecer informações aos proprietários do site.
              </p>
              <p className="text-gray-600 leading-relaxed">
                Os cookies não contêm informações pessoalmente identificáveis e não podem acessar outros dados em seu dispositivo.
              </p>
            </div>
          </section>

          {/* Cookie Types */}
          <section className="mb-16">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-8">
              Tipos de Cookies que Utilizamos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {cookieTypes.map((type) => (
                <div 
                  key={type.id}
                  className={`rounded-3xl p-6 border-2 transition-all ${
                    type.required 
                      ? 'bg-primary/5 border-primary/20' 
                      : 'bg-gray-50 border-gray-100 hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-3 rounded-xl ${type.required ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'}`}>
                        <type.icon size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-gray-900">{type.title}</h3>
                        {type.required && (
                          <span className="text-xs font-bold text-primary uppercase">Sempre ativo</span>
                        )}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mb-4">{type.description}</p>
                  <div className="space-y-2">
                    {type.examples.map((example, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-500">
                        <CheckCircle size={14} className="text-green-500 shrink-0" />
                        <span>{example}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>

          {/* Cookie List Table */}
          <section className="mb-16">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-8">
              Lista de Cookies Utilizados
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-gray-400 rounded-tl-2xl">Cookie</th>
                    <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-gray-400">Provedor</th>
                    <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-gray-400">Tipo</th>
                    <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-gray-400">Duração</th>
                    <th className="text-left p-4 font-black text-xs uppercase tracking-widest text-gray-400 rounded-tr-2xl">Finalidade</th>
                  </tr>
                </thead>
                <tbody>
                  {cookieList.map((cookie, idx) => (
                    <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                      <td className="p-4 font-mono text-sm font-bold text-primary">{cookie.name}</td>
                      <td className="p-4 text-sm text-gray-600">{cookie.provider}</td>
                      <td className="p-4">
                        <span className={`text-xs font-bold px-3 py-1 rounded-full ${
                          cookie.type === 'Essencial' ? 'bg-green-100 text-green-700' :
                          cookie.type === 'Análise' ? 'bg-blue-100 text-blue-700' :
                          'bg-purple-100 text-purple-700'
                        }`}>
                          {cookie.type}
                        </span>
                      </td>
                      <td className="p-4 text-sm text-gray-600">{cookie.duration}</td>
                      <td className="p-4 text-sm text-gray-600">{cookie.purpose}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* How to Manage */}
          <section className="mb-16">
            <h2 className="text-2xl font-black uppercase tracking-tight text-gray-900 mb-6">
              Como Gerenciar seus Cookies
            </h2>
            <div className="bg-gray-50 rounded-3xl p-8 space-y-6">
              <p className="text-gray-600 leading-relaxed">
                Você pode controlar e/ou excluir cookies conforme desejar. A maioria dos navegadores permite:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">🌐 Google Chrome</h4>
                  <p className="text-sm text-gray-500">Configurações → Privacidade e segurança → Cookies e outros dados do site</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">🦊 Mozilla Firefox</h4>
                  <p className="text-sm text-gray-500">Configurações → Privacidade & Segurança → Cookies e dados de sites</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">🧭 Safari</h4>
                  <p className="text-sm text-gray-500">Preferências → Privacidade → Gerenciar dados do site</p>
                </div>
                <div className="bg-white p-6 rounded-2xl border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-2">📘 Microsoft Edge</h4>
                  <p className="text-sm text-gray-500">Configurações → Cookies e permissões do site → Cookies</p>
                </div>
              </div>
              <div className="bg-secondary/10 border-l-4 border-secondary p-4 rounded-r-xl">
                <p className="text-sm text-gray-700">
                  <strong>Atenção:</strong> Bloquear todos os cookies pode afetar a funcionalidade do site, como manter itens no carrinho ou fazer login.
                </p>
              </div>
            </div>
          </section>

          {/* Links */}
          <div className="mt-12 bg-gradient-to-r from-primary to-[#1a1f7a] rounded-3xl p-8 md:p-12 text-white text-center">
            <h3 className="text-2xl font-black uppercase mb-4">Documentos Relacionados</h3>
            <p className="text-blue-100 mb-8 max-w-xl mx-auto">
              Consulte também nossa Política de Privacidade e Termos de Uso para informações completas.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link 
                to="/privacy"
                className="bg-white text-primary px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-gray-100 transition-colors shadow-lg"
              >
                Política de Privacidade
              </Link>
              <Link 
                to="/terms"
                className="bg-white/10 text-white px-8 py-4 rounded-xl font-bold uppercase tracking-widest hover:bg-white/20 transition-colors border border-white/20"
              >
                Termos de Uso
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Cookies;
