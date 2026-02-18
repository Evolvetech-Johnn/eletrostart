import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { productService } from '../../../services/productService';
import { toast } from 'react-hot-toast';

interface ImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const ImportModal: React.FC<ImportModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStats(null); // Reset stats on new file
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    setIsLoading(true);
    try {
      const response = await productService.importProducts(file);
      setStats(response.stats);
      toast.success('Importação concluída com sucesso!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Erro na importação: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Importar Produtos</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {!stats ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Selecione um arquivo CSV ou Excel (.xlsx) para atualizar ou criar produtos em massa.
              A coluna <strong>SKU</strong> é obrigatória.
            </p>

            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
              <input
                type="file"
                accept=".csv, .xlsx, .xls"
                onChange={handleFileChange}
                className="hidden"
                id="file-upload"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
                <Upload size={40} className="text-gray-400 mb-2" />
                <span className="text-blue-600 font-medium">Clique para selecionar</span>
                <span className="text-xs text-gray-400 mt-1">
                  {file ? file.name : 'Nenhum arquivo selecionado'}
                </span>
              </label>
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleUpload} disabled={!file || isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                Importar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <div className="flex items-center gap-2 text-green-700 font-bold mb-2">
                <Check size={20} /> Importação Concluída
              </div>
              <ul className="text-sm text-green-800 space-y-1">
                <li>Novos produtos: <strong>{stats.created}</strong></li>
                <li>Atualizados: <strong>{stats.updated}</strong></li>
                {stats.errors && stats.errors.length > 0 && (
                  <li className="text-red-600 mt-2">
                    Erros: <strong>{stats.errors.length}</strong>
                    <div className="max-h-32 overflow-y-auto mt-1 text-xs bg-white p-2 rounded border border-red-100">
                      {stats.errors.map((e: any, i: number) => (
                        <div key={i}>{e.sku}: {e.error}</div>
                      ))}
                    </div>
                  </li>
                )}
              </ul>
            </div>
            <Button className="w-full" onClick={onClose}>Fechar</Button>
          </div>
        )}
      </div>
    </div>
  );
};
