
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Plus, Search, DollarSign, Calendar, AlertTriangle, CheckCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";

interface AccountPayable {
  id: number;
  description: string;
  supplier: string;
  amount: number;
  dueDate: string;
  status: 'pendente' | 'pago' | 'vencido';
  category: string;
  paymentDate?: string;
  notes?: string;
}

const AccountsPayable = () => {
  const { toast } = useToast();
  const [accounts, setAccounts] = useState<AccountPayable[]>([
    {
      id: 1,
      description: "Fornecimento de produtos",
      supplier: "Fornecedor ABC",
      amount: 5500.00,
      dueDate: "2024-06-15",
      status: "pendente",
      category: "Compras"
    },
    {
      id: 2,
      description: "Aluguel do galpão",
      supplier: "Imobiliária Central",
      amount: 2500.00,
      dueDate: "2024-06-13",
      status: "vencido",
      category: "Infraestrutura"
    },
    {
      id: 3,
      description: "Energia elétrica",
      supplier: "Companhia Elétrica",
      amount: 450.00,
      dueDate: "2024-06-20",
      status: "pago",
      category: "Utilidades",
      paymentDate: "2024-06-10"
    }
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("todos");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    description: "",
    supplier: "",
    amount: "",
    dueDate: "",
    category: "",
    notes: ""
  });

  const categories = ["Compras", "Infraestrutura", "Utilidades", "Salários", "Marketing", "Manutenção", "Outros"];

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = account.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         account.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "todos" || account.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getOverdueBills = () => {
    const today = new Date();
    return accounts.filter(account => 
      account.status === 'pendente' && new Date(account.dueDate) < today
    );
  };

  const overdueBills = getOverdueBills();

  // Atualizar status automaticamente
  const updateOverdueStatus = () => {
    const today = new Date();
    setAccounts(prev => prev.map(account => ({
      ...account,
      status: account.status === 'pendente' && new Date(account.dueDate) < today ? 'vencido' : account.status
    })));
  };

  useState(() => {
    updateOverdueStatus();
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newAccount: AccountPayable = {
      id: Date.now(),
      description: formData.description,
      supplier: formData.supplier,
      amount: parseFloat(formData.amount),
      dueDate: formData.dueDate,
      status: 'pendente',
      category: formData.category,
      notes: formData.notes
    };

    setAccounts([...accounts, newAccount]);
    toast({
      title: "Conta a pagar cadastrada",
      description: "Nova conta foi adicionada ao sistema.",
    });

    setFormData({ description: "", supplier: "", amount: "", dueDate: "", category: "", notes: "" });
    setIsDialogOpen(false);
  };

  const markAsPaid = (id: number) => {
    setAccounts(prev => prev.map(account => 
      account.id === id 
        ? { ...account, status: 'pago' as const, paymentDate: new Date().toISOString().split('T')[0] }
        : account
    ));
    toast({
      title: "Conta marcada como paga",
      description: "O status da conta foi atualizado.",
    });
  };

  const getAccountStats = () => {
    const pending = accounts.filter(a => a.status === 'pendente');
    const overdue = accounts.filter(a => a.status === 'vencido');
    const paid = accounts.filter(a => a.status === 'pago');
    
    return {
      totalPending: pending.reduce((acc, a) => acc + a.amount, 0),
      totalOverdue: overdue.reduce((acc, a) => acc + a.amount, 0),
      totalPaid: paid.reduce((acc, a) => acc + a.amount, 0),
      countPending: pending.length,
      countOverdue: overdue.length
    };
  };

  const stats = getAccountStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pago': return 'text-green-600';
      case 'vencido': return 'text-red-600';
      default: return 'text-yellow-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pago': return 'Pago';
      case 'vencido': return 'Vencido';
      default: return 'Pendente';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Contas a Pagar</h1>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Alertas de Vencimento */}
            {overdueBills.length > 0 && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Atenção! Contas Vencidas</AlertTitle>
                <AlertDescription>
                  <div className="mt-2 space-y-1">
                    {overdueBills.map(bill => (
                      <div key={bill.id} className="flex justify-between items-center">
                        <span className="font-medium">{bill.description} - {bill.supplier}</span>
                        <span className="text-sm">
                          R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    ))}
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">A Pagar (Pendente)</CardTitle>
                  <Calendar className="h-4 w-4 text-yellow-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    R$ {stats.totalPending.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.countPending} contas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Vencidas</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    R$ {stats.totalOverdue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">{stats.countOverdue} contas</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pagas</CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    R$ {stats.totalPaid.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                  <p className="text-xs text-muted-foreground">Este mês</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Geral</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    R$ {(stats.totalPending + stats.totalOverdue + stats.totalPaid).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controles */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    placeholder="Buscar contas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Filtrar por status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos os Status</SelectItem>
                    <SelectItem value="pendente">Pendente</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="pago">Pago</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Conta
              </Button>
            </div>

            {/* Tabela */}
            <Card>
              <CardHeader>
                <CardTitle>Contas a Pagar</CardTitle>
                <CardDescription>
                  Gerencie todas as contas a pagar do seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Fornecedor</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Vencimento</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAccounts.map((account) => {
                      const isOverdue = account.status === 'vencido';
                      
                      return (
                        <TableRow key={account.id} className={isOverdue ? "bg-red-50" : ""}>
                          <TableCell className="font-medium">{account.description}</TableCell>
                          <TableCell>{account.supplier}</TableCell>
                          <TableCell>{account.category}</TableCell>
                          <TableCell className="font-medium">
                            R$ {account.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </TableCell>
                          <TableCell className={isOverdue ? "font-bold text-red-600" : ""}>
                            {new Date(account.dueDate).toLocaleDateString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <span className={`font-medium ${getStatusColor(account.status)}`}>
                              {getStatusLabel(account.status)}
                            </span>
                          </TableCell>
                          <TableCell>
                            {account.status !== 'pago' && (
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => markAsPaid(account.id)}
                              >
                                Marcar como Pago
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Dialog para Nova Conta */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Nova Conta a Pagar</DialogTitle>
                  <DialogDescription>
                    Cadastre uma nova conta a pagar no sistema.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="supplier">Fornecedor</Label>
                    <Input
                      id="supplier"
                      value={formData.supplier}
                      onChange={(e) => setFormData({...formData, supplier: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoria</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({...formData, category: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category} value={category}>{category}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={formData.amount}
                      onChange={(e) => setFormData({...formData, amount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="dueDate">Data de Vencimento</Label>
                    <Input
                      id="dueDate"
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    Cadastrar Conta
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default AccountsPayable;
