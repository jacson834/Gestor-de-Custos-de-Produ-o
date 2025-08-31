import { useRef, useCallback } from 'react';
import { useToast } from './use-toast';
import { RawMaterial } from '@/types/product';
import { Recipe } from '@/types/production';

interface ProductionBackupData {
  productionOrders: any[];
  recipes: Recipe[];
  rawMaterials: RawMaterial[];
  timestamp: string;
  version: string;
}

export const useDatabaseBackup = () => {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateBackup = useCallback(() => {
    try {
      const recipes = JSON.parse(localStorage.getItem('recipes') || '[]');
      const rawMaterials = JSON.parse(localStorage.getItem('raw_materials') || '[]');
      const productionOrders = JSON.parse(localStorage.getItem('production_orders') || '[]');

      const backupData: ProductionBackupData = {
        productionOrders,
        recipes,
        rawMaterials,
        timestamp: new Date().toISOString(),
        version: "1.0-production"
      };

      const dataStr = JSON.stringify(backupData, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      
      const url = URL.createObjectURL(dataBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `backup_producao_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast({
        title: "Backup realizado com sucesso",
        description: "O arquivo de backup foi baixado.",
      });
    } catch (error) {
      console.error("Backup failed", error);
      toast({
        title: "Erro no backup",
        description: "Não foi possível gerar o backup dos dados.",
        variant: "destructive",
      });
    }
  }, [toast]);

  const handleRestoreFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        if (typeof e.target?.result !== 'string') {
            throw new Error("Não foi possível ler o conteúdo do arquivo.");
        }
        const backupData = JSON.parse(e.target.result) as ProductionBackupData;

        const requiredKeys: (keyof ProductionBackupData)[] = ['recipes', 'rawMaterials', 'timestamp', 'version'];
        const hasAllKeys = requiredKeys.every(key => key in backupData);

        if (!hasAllKeys) {
          throw new Error("O arquivo de backup não contém a estrutura de dados esperada.");
        }
        
        localStorage.setItem('recipes', JSON.stringify(backupData.recipes || []));
        localStorage.setItem('raw_materials', JSON.stringify(backupData.rawMaterials || []));
        localStorage.setItem('production_orders', JSON.stringify(backupData.productionOrders || []));

        toast({
          title: "Backup restaurado com sucesso",
          description: "Os dados foram restaurados. A página será recarregada.",
        });

        setTimeout(() => {
          window.location.reload();
        }, 2000);

      } catch (error) {
        console.error("Restore failed", error);
        toast({
          title: "Erro na restauração",
          description: error instanceof Error ? error.message : "Arquivo de backup inválido ou corrompido.",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
  }, [toast]);

  const triggerRestore = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  return { generateBackup, triggerRestore, handleRestoreFileChange, fileInputRef };
};