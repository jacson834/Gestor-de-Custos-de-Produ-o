
import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityLog } from "@/types/user-management";
import { Search, Filter } from "lucide-react";

const mockActivityLogs: ActivityLog[] = [
  {
    id: "1",
    userId: "1",
    userName: "João Silva",
    action: "Criou produto",
    module: "Produtos",
    details: "Produto: Smartphone Galaxy S24",
    timestamp: "2024-06-15T10:30:00",
    ipAddress: "192.168.1.100"
  },
  {
    id: "2",
    userId: "2",
    userName: "Maria Santos",
    action: "Alterou preço",
    module: "Produtos",
    details: "Produto: iPhone 15 - Preço alterado de R$ 4.999,00 para R$ 4.799,00",
    timestamp: "2024-06-15T09:15:00",
    ipAddress: "192.168.1.101"
  },
  {
    id: "3",
    userId: "3",
    userName: "Pedro Costa",
    action: "Atualizou estoque",
    module: "Estoque",
    details: "Produto: Samsung TV 55\" - Estoque alterado de 10 para 15 unidades",
    timestamp: "2024-06-15T08:45:00",
    ipAddress: "192.168.1.102"
  },
  {
    id: "4",
    userId: "2",
    userName: "Maria Santos",
    action: "Criou pedido",
    module: "Vendas",
    details: "Pedido #1234 - Cliente: Ana Costa - Total: R$ 1.299,99",
    timestamp: "2024-06-14T16:20:00",
    ipAddress: "192.168.1.101"
  },
  {
    id: "5",
    userId: "1",
    userName: "João Silva",
    action: "Criou usuário",
    module: "Usuários",
    details: "Usuário: Carlos Oliveira - Função: Vendedor",
    timestamp: "2024-06-14T14:10:00",
    ipAddress: "192.168.1.100"
  }
];

const getActionColor = (action: string) => {
  if (action.includes('Criou')) return 'default';
  if (action.includes('Alterou') || action.includes('Atualizou')) return 'secondary';
  if (action.includes('Deletou')) return 'destructive';
  return 'outline';
};

const ActivityLogTable = () => {
  const [logs] = useState<ActivityLog[]>(mockActivityLogs);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedModule, setSelectedModule] = useState<string>("all");

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.details.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesModule = selectedModule === "all" || log.module === selectedModule;
    
    return matchesSearch && matchesModule;
  });

  const modules = Array.from(new Set(logs.map(log => log.module)));

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex items-center space-x-2 flex-1">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar atividades..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-sm"
          />
        </div>
        
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select value={selectedModule} onValueChange={setSelectedModule}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filtrar por módulo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os módulos</SelectItem>
              {modules.map(module => (
                <SelectItem key={module} value={module}>{module}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Usuário</TableHead>
            <TableHead>Ação</TableHead>
            <TableHead>Módulo</TableHead>
            <TableHead>Detalhes</TableHead>
            <TableHead>Data/Hora</TableHead>
            <TableHead>IP</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredLogs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="font-medium">{log.userName}</TableCell>
              <TableCell>
                <Badge variant={getActionColor(log.action) as any}>
                  {log.action}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge variant="outline">{log.module}</Badge>
              </TableCell>
              <TableCell className="max-w-xs truncate" title={log.details}>
                {log.details}
              </TableCell>
              <TableCell>
                {new Date(log.timestamp).toLocaleString('pt-BR')}
              </TableCell>
              <TableCell className="text-muted-foreground">
                {log.ipAddress}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ActivityLogTable;
