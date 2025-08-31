
import { useState, useMemo } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Plus, Target, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useToast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

interface Budget {
  id: number;
  category: string;
  budgetAmount: number;
  spentAmount: number;
  month: string;
  year: number;
  percentage: number;
  status: 'dentro' | 'proximo' | 'excedido';
}

interface BudgetGoal {
  category: string;
  monthlyBudget: number;
  yearlyBudget: number;
}

const BudgetPlanning = () => {
  const { toast } = useToast();
  const [selectedMonth, setSelectedMonth] = useState("6");
  const [selectedYear, setSelectedYear] = useState("2024");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    budgetAmount: "",
    month: selectedMonth,
    year: selectedYear
  });

  const [budgets, setBudgets] = useState<Budget[]>([
    {
      id: 1,
      category: "Compras",
      budgetAmount: 15000,
      spentAmount: 12500,
      month: "6",
      year: 2024,
      percentage: 83.33,
      status: 'proximo'
    },
    {
      id: 2,
      category: "Marketing",
      budgetAmount: 3000,
      spentAmount: 2100,
      month: "6",
      year: 2024,
      percentage: 70,
      status: 'dentro'
    },
    {
      id: 3,
      category: "Infraestrutura",
      budgetAmount: 5000,
      spentAmount: 5200,
      month: "6",
      year: 2024,
      percentage: 104,
      status: 'excedido'
    },
    {
      id: 4,
      category: "Salários",
      budgetAmount: 25000,
      spentAmount: 25000,
      month: "6",
      year: 2024,
      percentage: 100,
      status: 'proximo'
    },
    {
      id: 5,
      category: "Utilidades",
      budgetAmount: 2000,
      spentAmount: 1650,
      month: "6",
      year: 2024,
      percentage: 82.5,
      status: 'proximo'
    }
  ]);

  const [budgetGoals, setBudgetGoals] = useState<BudgetGoal[]>([
    { category: "Compras", monthlyBudget: 15000, yearlyBudget: 180000 },
    { category: "Marketing", monthlyBudget: 3000, yearlyBudget: 36000 },
    { category: "Infraestrutura", monthlyBudget: 5000, yearlyBudget: 60000 },
    { category: "Salários", monthlyBudget: 25000, yearlyBudget: 300000 },
    { category: "Utilidades", monthlyBudget: 2000, yearlyBudget: 24000 }
  ]);

  const categories = ["Compras", "Marketing", "Infraestrutura", "Salários", "Utilidades", "Manutenção", "Outros"];
  const months = [
    { value: "1", label: "Janeiro" },
    { value: "2", label: "Fevereiro" },
    { value: "3", label: "Março" },
    { value: "4", label: "Abril" },
    { value: "5", label: "Maio" },
    { value: "6", label: "Junho" },
    { value: "7", label: "Julho" },
    { value: "8", label: "Agosto" },
    { value: "9", label: "Setembro" },
    { value: "10", label: "Outubro" },
    { value: "11", label: "Novembro" },
    { value: "12", label: "Dezembro" }
  ];

  const filteredBudgets = useMemo(() => {
    return budgets.filter(budget => 
      budget.month === selectedMonth && budget.year.toString() === selectedYear
    );
  }, [budgets, selectedMonth, selectedYear]);

  const getBudgetStats = () => {
    const totalBudget = filteredBudgets.reduce((acc, b) => acc + b.budgetAmount, 0);
    const totalSpent = filteredBudgets.reduce((acc, b) => acc + b.spentAmount, 0);
    const exceedingBudgets = filteredBudgets.filter(b => b.status === 'excedido').length;
    const withinBudgets = filteredBudgets.filter(b => b.status === 'dentro').length;
    const overallPercentage = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    return {
      totalBudget,
      totalSpent,
      remaining: totalBudget - totalSpent,
      exceedingBudgets,
      withinBudgets,
      overallPercentage
    };
  };

  const stats = getBudgetStats();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'dentro': return 'text-green-600';
      case 'proximo': return 'text-yellow-600';
      case 'excedido': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'dentro': return 'Dentro do Orçamento';
      case 'proximo': return 'Próximo do Limite';
      case 'excedido': return 'Orçamento Excedido';
      default: return 'Indefinido';
    }
  };

  const getProgressColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newBudget: Budget = {
      id: Date.now(),
      category: formData.category,
      budgetAmount: parseFloat(formData.budgetAmount),
      spentAmount: 0,
      month: formData.month,
      year: parseInt(formData.year),
      percentage: 0,
      status: 'dentro'
    };

    setBudgets([...budgets, newBudget]);
    toast({
      title: "Orçamento criado",
      description: "Novo orçamento foi adicionado ao planejamento.",
    });

    setFormData({ category: "", budgetAmount: "", month: selectedMonth, year: selectedYear });
    setIsDialogOpen(false);
  };

  // Dados para gráfico de evolução (simulado)
  const evolutionData = [
    { month: 'Jan', orcado: 50000, gasto: 45000 },
    { month: 'Fev', orcado: 52000, gasto: 48000 },
    { month: 'Mar', orcado: 55000, gasto: 53000 },
    { month: 'Abr', orcado: 53000, gasto: 51000 },
    { month: 'Mai', orcado: 58000, gasto: 55000 },
    { month: 'Jun', orcado: 60000, gasto: 57500 },
  ];

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Planejamento Orçamentário</h1>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <div className="p-6 space-y-6">
            {/* Controles de Período */}
            <div className="flex items-center gap-4">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Selecione o mês" />
                </SelectTrigger>
                <SelectContent>
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={selectedYear} onValueChange={setSelectedYear}>
                <SelectTrigger className="w-32">
                  <SelectValue placeholder="Ano" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2024">2024</SelectItem>
                  <SelectItem value="2025">2025</SelectItem>
                </SelectContent>
              </Select>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Orçamento
              </Button>
            </div>

            {/* Cards de Resumo */}
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Orçamento Total</CardTitle>
                  <Target className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {stats.totalBudget.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {months.find(m => m.value === selectedMonth)?.label} {selectedYear}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total Gasto</CardTitle>
                  <TrendingUp className="h-4 w-4 text-orange-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    R$ {stats.totalSpent.toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.overallPercentage.toFixed(1)}% do orçamento
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Saldo Restante</CardTitle>
                  <TrendingDown className={`h-4 w-4 ${stats.remaining >= 0 ? 'text-green-500' : 'text-red-500'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    R$ {Math.abs(stats.remaining).toLocaleString('pt-BR')}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {stats.remaining >= 0 ? 'Disponível' : 'Excedido'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Alertas</CardTitle>
                  <AlertCircle className="h-4 w-4 text-red-500" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {stats.exceedingBudgets}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Orçamentos excedidos
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Gráfico de Evolução */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução Orçamentária</CardTitle>
                <CardDescription>
                  Comparação entre orçado e gasto ao longo dos meses
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={evolutionData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, '']} />
                    <Line type="monotone" dataKey="orcado" stroke="#8884d8" name="Orçado" />
                    <Line type="monotone" dataKey="gasto" stroke="#82ca9d" name="Gasto" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Tabela de Orçamentos */}
            <Card>
              <CardHeader>
                <CardTitle>Orçamentos por Categoria</CardTitle>
                <CardDescription>
                  Controle detalhado do orçamento por categoria
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Orçado</TableHead>
                      <TableHead>Gasto</TableHead>
                      <TableHead>Restante</TableHead>
                      <TableHead>Progresso</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredBudgets.map((budget) => (
                      <TableRow key={budget.id}>
                        <TableCell className="font-medium">{budget.category}</TableCell>
                        <TableCell>
                          R$ {budget.budgetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          R$ {budget.spentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className={budget.budgetAmount - budget.spentAmount >= 0 ? 'text-green-600' : 'text-red-600'}>
                          R$ {Math.abs(budget.budgetAmount - budget.spentAmount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Progress 
                              value={Math.min(budget.percentage, 100)} 
                              className="w-20"
                            />
                            <span className="text-sm font-medium">
                              {budget.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <span className={`text-sm font-medium ${getStatusColor(budget.status)}`}>
                            {getStatusLabel(budget.status)}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Dialog para Novo Orçamento */}
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Novo Orçamento</DialogTitle>
                  <DialogDescription>
                    Defina um novo orçamento para uma categoria específica.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Label htmlFor="budgetAmount">Valor do Orçamento</Label>
                    <Input
                      id="budgetAmount"
                      type="number"
                      step="0.01"
                      value={formData.budgetAmount}
                      onChange={(e) => setFormData({...formData, budgetAmount: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="month">Mês</Label>
                    <Select value={formData.month} onValueChange={(value) => setFormData({...formData, month: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {months.map(month => (
                          <SelectItem key={month.value} value={month.value}>{month.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="year">Ano</Label>
                    <Select value={formData.year} onValueChange={(value) => setFormData({...formData, year: value})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="2024">2024</SelectItem>
                        <SelectItem value="2025">2025</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button type="submit" className="w-full">
                    Criar Orçamento
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

export default BudgetPlanning;
