// src/pages/Production.tsx (Módulo de Produção Unificado)

import React from 'react';
import UnifiedProductionModule from '@/components/production/UnifiedProductionModule';
import { ThemeToggle } from '@/components/ThemeToggle';
import { Factory, Settings, Download, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDatabaseBackup } from '@/hooks/useDatabaseBackup';

const Production = () => {
  const { generateBackup, triggerRestore, handleRestoreFileChange, fileInputRef } = useDatabaseBackup();

  return (
    <div className="flex flex-col h-screen">
      <header className="border-b bg-background p-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Factory className="h-6 w-6" /> Gestor de Custos de Produção
          </h1>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Settings className="h-[1.2rem] w-[1.2rem]" />
                  <span className="sr-only">Configurações</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Configurações</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={generateBackup}>
                  <Download className="mr-2 h-4 w-4" />
                  <span>Fazer Backup</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={triggerRestore}>
                  <Upload className="mr-2 h-4 w-4" />
                  <span>Restaurar Backup</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleRestoreFileChange}
              accept=".json"
              className="hidden"
            />
          </div>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-6">
        <UnifiedProductionModule />
      </main>
    </div>
  );
};

export default Production;