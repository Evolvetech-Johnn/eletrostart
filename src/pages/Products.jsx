import React from 'react';
import { Package, Battery, Zap, Lightbulb, Cable, ShieldCheck } from 'lucide-react';

const Products = () => {
  const categories = [
    {
      id: 1,
      name: 'Cabos e Fios',
      description: 'Cabos flexíveis, rígidos, PP, coaxiais e de rede para todas as aplicações.',
      icon: <Cable className="w-12 h-12 text-primary" />,
      items: ['Cabo Flexível 2.5mm', 'Cabo Flexível 4.0mm', 'Cabo Flexível 6.0mm', 'Cabo PP 2x1.5mm', 'Cabo de Rede CAT6']
    },
    {
      id: 2,
      name: 'Iluminação',
      description: 'Lâmpadas LED, luminárias, refletores e fitas de LED.',
      icon: <Lightbulb className="w-12 h-12 text-secondary" />,
      items: ['Lâmpada LED Bulbo 9W', 'Refletor LED 50W', 'Painel LED Embutir', 'Fita LED RGB', 'Luminária Industrial']
    },
    {
      id: 3,
      name: 'Disjuntores e Proteção',
      description: 'Disjuntores, DRs, DPS e quadros de distribuição.',
      icon: <ShieldCheck className="w-12 h-12 text-primary" />,
      items: ['Disjuntor Unipolar', 'Disjuntor Bipolar', 'Dispositivo DR', 'DPS 20kA', 'Quadro de Distribuição']
    },
    {
      id: 4,
      name: 'Tomadas e Interruptores',
      description: 'Linhas completas de tomadas, interruptores e placas.',
      icon: <Zap className="w-12 h-12 text-secondary" />,
      items: ['Conjunto Tomada 10A', 'Conjunto Tomada 20A', 'Interruptor Simples', 'Interruptor Paralelo', 'Placa 4x2']
    },
    {
      id: 5,
      name: 'Energia Solar',
      description: 'Painéis solares, inversores, estruturas e conectores.',
      icon: <Battery className="w-12 h-12 text-primary" />,
      items: ['Painel Solar 550W', 'Inversor 5kW', 'Estrutura para Telhado', 'Cabos Solares', 'Conectores MC4']
    },
    {
      id: 6,
      name: 'Ferramentas',
      description: 'Alicates, chaves, multímetros e ferramentas para eletricistas.',
      icon: <Package className="w-12 h-12 text-secondary" />,
      items: ['Alicate Universal', 'Multímetro Digital', 'Chave de Fenda Isolada', 'Passa Fio', 'Fita Isolante']
    }
  ];

  return (
    <div className="font-sans">
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Nossos Produtos</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Trabalhamos com as melhores marcas do mercado para garantir segurança e qualidade para sua obra ou reforma.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {categories.map((category) => (
            <div key={category.id} className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow">
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    {category.icon}
                  </div>
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{category.name}</h3>
                <p className="text-gray-600 mb-4 h-12">{category.description}</p>
                
                <div className="border-t border-gray-100 pt-4">
                  <h4 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">Principais Itens</h4>
                  <ul className="space-y-2">
                    {category.items.map((item, idx) => (
                      <li key={idx} className="flex items-center text-gray-700 text-sm">
                        <div className="w-1.5 h-1.5 bg-secondary rounded-full mr-2"></div>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
                <button className="text-primary font-bold hover:text-blue-700 text-sm flex items-center">
                  Ver catálogo completo
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Products;
