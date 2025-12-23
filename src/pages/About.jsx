import React from "react";
import { CheckCircle, Award, Users, Clock } from "lucide-react";

const About = () => {
  return (
    <div className="font-sans">
      <div className="bg-primary text-white py-16">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-4">Sobre Nós</h1>
          <p className="text-xl text-blue-100 max-w-2xl">
            Conheça a história e os valores da Eletrostart, sua parceira em
            energia.
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-16">
        <div className="flex flex-col md:flex-row gap-12 mb-20">
          <div className="md:w-1/2">
            <div className="bg-gray-200 w-full h-96 rounded-lg flex items-center justify-center text-gray-500 shadow-inner">
              {/* Image Placeholder */}
              <span className="text-lg font-medium">
                Foto da Fachada ou Equipe
              </span>
            </div>
          </div>
          <div className="md:w-1/2 flex flex-col justify-center">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">
              Nossa História
            </h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Fundação
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  A empresa foi fundada em 26 de outubro de 2007, contando com
                  mais de 18 anos de atuação no mercado.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Atividade Principal
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Especializada no comércio varejista de materiais elétricos,
                  oferecendo componentes para instalações residenciais e
                  comerciais.
                </p>
              </div>

              <div>
                <h3 className="text-xl font-bold text-primary mb-2">
                  Serviços e Diferenciais
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Atua com foco em atendimento rápido e preços competitivos,
                  realizando entregas em Londrina e região. Além da venda de
                  produtos, a empresa mantém canais de comunicação para
                  compartilhar dicas sobre segurança e uso correto de aparelhos
                  elétricos.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-20">
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
              <Award className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Qualidade</h3>
            <p className="text-gray-600">
              Produtos certificados e serviços executados com rigor técnico.
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
              <Users className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Equipe Expert</h3>
            <p className="text-gray-600">
              Profissionais treinados e atualizados com o mercado.
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
              <CheckCircle className="w-10 h-10 text-secondary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Confiança</h3>
            <p className="text-gray-600">
              Transparência e honestidade em todas as nossas relações.
            </p>
          </div>
          <div className="text-center p-6 bg-gray-50 rounded-xl">
            <div className="inline-block p-4 bg-white rounded-full shadow-sm mb-4">
              <Clock className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold mb-2">Pontualidade</h3>
            <p className="text-gray-600">
              Compromisso com os prazos de entrega e execução.
            </p>
          </div>
        </div>

        <div className="bg-gray-900 text-white rounded-2xl p-10 md:p-16 text-center">
          <h2 className="text-3xl font-bold mb-6">Missão, Visão e Valores</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-10">
            <div>
              <h3 className="text-xl font-bold text-secondary mb-3">Missão</h3>
              <p className="text-gray-300">
                Prover soluções elétricas e de energia solar com excelência,
                segurança e sustentabilidade.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary mb-3">Visão</h3>
              <p className="text-gray-300">
                Ser referência regional no fornecimento de materiais elétricos e
                projetos de energia renovável.
              </p>
            </div>
            <div>
              <h3 className="text-xl font-bold text-secondary mb-3">Valores</h3>
              <p className="text-gray-300">
                Ética, inovação, responsabilidade socioambiental e foco no
                cliente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
