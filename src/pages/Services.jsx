import React from "react";
import { Zap, Home as HomeIcon, Factory, Sun } from "lucide-react";

const Services = () => {
  const services = [
    {
      title: "Materiais Elétricos",
      description:
        "Ampla variedade de produtos para instalações elétricas seguras e eficientes. Trabalhamos com fios, cabos, disjuntores, tomadas, interruptores e iluminação LED das melhores marcas do mercado.",
      icon: <Zap className="w-12 h-12 text-secondary" />,
    },
    {
      title: "Residencial",
      description:
        "Soluções completas para a parte elétrica da sua casa ou apartamento. Projetos personalizados, manutenção preventiva e corretiva, instalação de chuveiros, ventiladores e automação residencial.",
      icon: <HomeIcon className="w-12 h-12 text-primary" />,
    },
    {
      title: "Industrial",
      description:
        "Equipamentos robustos e de alta performance para indústrias. Painéis elétricos, cabeamento estruturado, subestações, motores elétricos e automação industrial para garantir a produtividade da sua fábrica.",
      icon: <Factory className="w-12 h-12 text-secondary" />,
    },
    {
      title: "Energia Solar",
      description:
        "Economize energia e contribua com o meio ambiente com nossas placas solares. Projetos chave na mão (turnkey), homologação na concessionária, instalação e monitoramento de sistemas fotovoltaicos.",
      icon: <Sun className="w-12 h-12 text-primary" />,
    },
  ];

  return (
    <div className="font-sans">
      <div className="bg-gray-900 text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl md:text-4xl font-bold mb-4">
            Nossos Serviços
          </h1>
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl">
            Excelência técnica e compromisso com a qualidade em cada projeto
            executado.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-8 rounded-xl shadow-lg border border-gray-100 flex flex-col md:flex-row gap-6"
            >
              <div className="flex-shrink-0">
                <div className="p-4 bg-gray-50 rounded-lg inline-block">
                  {service.icon}
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold mb-3 text-gray-900">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Services;
