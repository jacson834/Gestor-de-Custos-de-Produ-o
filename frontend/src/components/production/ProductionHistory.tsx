// frontend/src/components/production/ProductionHistory.tsx
// Componente para visualização do histórico de produção

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Search, 
  Eye, 
  Calendar,
  History,
  DollarSign,
  Scale,
  ChefHat,
  TrendingUp,
  Filter,
  Download
} from 'lucide-react';
import { useProductionBatches } from '@/hooks/useProductionBatches';
import ProductionBatchForm from './ProductionBatchForm';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const ProductionHistory: React.FC = () => {
  const { batches, isLoading } = useProductionBatches();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [isNewBatchDialogOpen, setIsNewBatchDialogOpen] = useState(false);

  const filteredBatches = batches.filter(batch => {
    const matchesSearch = batch.recipe_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         batch.notes?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchesSearch) return false;

    const batchDate = new Date(batch.production_date);
    const now = new Date();
    
    switch (dateFilter) {
      case 'today':
        return batchDate.toDateString() === now.toDateString();
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return batchDate >= weekAgo;
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        return batchDate >= monthAgo;
      default:
        return true;
    }
  });

  const formatCurrency = (value: number) => {
    return `R$ ${value.toFixed(2).replace('.', ',')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString('pt-BR'),
      time: date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
  };

  const getTotalStats = () => {
    return {
      totalBatches: filteredBatches.length,
      totalUnits: filteredBatches.reduce((sum, batch) => sum + batch.batch_size, 0),
      totalCost: filteredBatches.reduce((sum, batch) => sum + batch.total_cost, 0),
      averageCostPerUnit: filteredBatches.length > 0 
        ? filteredBatches.reduce((sum, batch) => sum + batch.cost_per_unit, 0) / filteredBatches.length 
        : 0
    };
  };

  const stats = getTotalStats();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <History className="h-8 w-8 text-gray-400 mx-auto mb-2 animate-pulse" />
          <p className="text-muted-foreground">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Buscar produções..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-80"
            />
          </div>
          
          <Select value={dateFilter} onValueChange={setDateFilter}>
            <SelectTrigger className="w-40">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os períodos</SelectItem>
              <SelectItem value="today">Hoje</SelectItem>
              <SelectItem value="week">Última semana</SelectItem>
              <SelectItem value="month">Último mês</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Exportar
          </Button>
          
          <Dialog open={isNewBatchDialogOpen} onOpenChange={setIsNewBatchDialogOpen}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Nova Produção
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Registrar Nova Produção</DialogTitle>
                <DialogDescription>
                  Registre um novo lote de produção baseado em uma receita existente
                </DialogDescription>
              </DialogHeader>
              <ProductionBatchForm 
                onSuccess={() => setIsNewBatchDialogOpen(false)}
                onCancel={() => setIsNewBatchDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-blue-500" />
            <div>
              <p className="text-sm text-muted-foreground">Total de Lotes</p>
              <p className="text-2xl font-bold">{stats.totalBatches}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <Scale className="h-5 w-5 text-green-500" />
            <div>
              <p className="text-sm text-muted-foreground">Unidades Produzidas</p>
              <p className="text-2xl font-bold">{stats.totalUnits}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-purple-500" />
            <div>
              <p className="text-sm text-muted-foreground">Custo Total</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.totalCost)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-orange-500" />
            <div>
              <p className="text-sm text-muted-foreground">Custo Médio/Un.</p>
              <p className="text-2xl font-bold">{formatCurrency(stats.averageCostPerUnit)}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Production History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Produção
          </CardTitle>
          <CardDescription>
            {filteredBatches.length} produções encontradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Receita</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Custo Total</TableHead>
                <TableHead>Custo/Unidade</TableHead>
                <TableHead>Data/Hora</TableHead>
                <TableHead>Observações</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBatches.map((batch) => {
                const dateTime = formatDateTime(batch.production_date);
                return (
                  <TableRow key={batch.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ChefHat className="h-4 w-4 text-blue-500" />
                        <div>
                          <p className="font-medium">{batch.recipe_name}</p>
                          <p className="text-sm text-muted-foreground">ID: {batch.recipe_id}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        <Scale className="h-3 w-3" />
                        {batch.batch_size} {batch.yield_unit}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-4 w-4 text-green-500" />
                        <span className="font-medium text-green-600">
                          {formatCurrency(batch.total_cost)}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">
                        {formatCurrency(batch.cost_per_unit)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <div>
                          <p className="text-sm font-medium">{dateTime.date}</p>
                          <p className="text-xs text-muted-foreground">{dateTime.time}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {batch.notes ? (
                        <p className="text-sm text-muted-foreground max-w-40 truncate">
                          {batch.notes}
                        </p>
                      ) : (
                        <span className="text-muted-foreground text-sm">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-2xl">
                          <DialogHeader>
                            <DialogTitle>Detalhes da Produção #{batch.id}</DialogTitle>
                            <DialogDescription>
                              Informações completas do lote de produção
                            </DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <label className="text-sm font-medium">Receita</label>
                                <p className="text-sm text-muted-foreground">{batch.recipe_name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Quantidade Produzida</label>
                                <p className="text-sm text-muted-foreground">
                                  {batch.batch_size} {batch.yield_unit}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Custo Total</label>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(batch.total_cost)}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Custo por Unidade</label>
                                <p className="text-sm text-muted-foreground">
                                  {formatCurrency(batch.cost_per_unit)}
                                </p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Data de Produção</label>
                                <p className="text-sm text-muted-foreground">
                                  {dateTime.date} às {dateTime.time}
                                </p>
                              </div>
                            </div>
                            {batch.notes && (
                              <div>
                                <label className="text-sm font-medium">Observações</label>
                                <p className="text-sm text-muted-foreground mt-1">{batch.notes}</p>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Empty State */}
      {filteredBatches.length === 0 && (
        <Card className="p-12 text-center">
          <History className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || dateFilter !== 'all' 
              ? 'Nenhuma produção encontrada' 
              : 'Nenhuma produção registrada'
            }
          </h3>
          <p className="text-gray-500 mb-6">
            {searchTerm || dateFilter !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece registrando sua primeira produção'
            }
          </p>
          {!searchTerm && dateFilter === 'all' && (
            <Button onClick={() => setIsNewBatchDialogOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Registrar Primeira Produção
            </Button>
          )}
        </Card>
      )}
    </div>
  );
};

export default ProductionHistory;