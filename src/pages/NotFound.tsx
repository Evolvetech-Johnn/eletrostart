import { Link } from "react-router-dom";
import { FileQuestion } from "lucide-react";
import SEO from "../components/SEO";

const NotFound = () => {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4 py-16">
      <SEO title="Página Não Encontrada" />
      <FileQuestion size={120} className="text-primary/20 mb-6" />
      <h1 className="text-4xl font-black text-gray-900 mb-2">
        Página não encontrada
      </h1>
      <p className="text-gray-500 mb-8 max-w-md">
        Desculpe, o endereço que você tentou acessar não existe.
      </p>
      <Link
        to="/"
        className="bg-primary text-white px-8 py-3 rounded-xl font-bold uppercase tracking-widest hover:bg-blue-800 transition-colors shadow-lg shadow-primary/20"
      >
        Voltar para o Início
      </Link>
    </div>
  );
};

export default NotFound;
