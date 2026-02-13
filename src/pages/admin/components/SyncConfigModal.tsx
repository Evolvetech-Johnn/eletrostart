import React, { useState } from 'react';
import { Button } from '../../../components/ui/Button';
import { RefreshCw, X, Check, Loader2 } from 'lucide-react';
import { productService } from '../../../services/productService';
import { toast } from 'react-hot-toast';
import { Input } from '../../../components/ui/Input';

interface SyncConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const SyncConfigModal: React.FC<SyncConfigModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [stats, setStats] = useState<any>(null);

  if (!isOpen) return null;

  const handleSync = async () => {
    if (!url) return;

    setIsLoading(true);
    try {
      const response = await productService.syncSheet(url);
      setStats(response.stats);
      toast.success('Sincronização concluída!');
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error('Erro na sincronização: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md shadow-xl">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Sincronizar Google Sheets</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        {!stats ? (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Insira a URL pública da sua planilha do Google Sheets (ou link de exportação CSV).
              Certifique-se que a planilha está compartilhada como "Qualquer pessoa com o link".
            </p>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">URL da Planilha</label>
              <Input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://docs.google.com/spreadsheets/d/..."
              />
            </div>

            <div className="flex justify-end gap-2 mt-4">
              <Button variant="outline" onClick={onClose}>Cancelar</Button>
              <Button onClick={handleSync} disabled={!url || isLoading}>
                {isLoading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : <RefreshCw className="w-4 h-4 mr-2" />}
                Sincronizar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <div className="flex items-center gap-2 text-blue-700 font-bold mb-2">
                <Check size={20} /> Sincronização Concluída
              </div>
              <ul className="text-sm text-blue-800 space-y-1">
                <li>Produtos criados: <strong>{stats.created}</strong></li>
                <li>Produtos atualizados: <strong>{stats.updated}</strong></li>
              </ul>
            </div>
            <Button className="w-full" onClick={onClose}>Fechar</Button>
          </div>
        )}
      </div>
    </div>
  );
};
