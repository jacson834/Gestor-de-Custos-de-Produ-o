
import { useState } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Plus, Search, Edit, Trash2, CreditCard } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface PaymentMethod {
  id: number;
  name: string;
  description: string;
  active: boolean;
}

const PaymentMethods = () => {
  const { toast } = useToast();
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: 1, name: "Dinheiro", description: "Pagamento em espécie", active: true },
    { id: 2, name: "Cartão de Crédito", description: "Pagamento com cartão de crédito", active: true },
    { id: 3, name: "Cartão de Débito", description: "Pagamento com cartão de débito", active: true },
    { id: 4, name: "PIX", description: "Pagamento via PIX", active: true },
    { id: 5, name: "Transferência Bancária", description: "Transferência entre contas", active: true },
  ]);

  const [searchTerm, setSearchTerm] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    method.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (editingMethod) {
      setPaymentMethods(paymentMethods.map(method =>
        method.id === editingMethod.id
          ? { ...method, name: formData.name, description: formData.description }
          : method
      ));
      toast({
        title: "Forma de pagamento atualizada",
        description: "A forma de pagamento foi atualizada com sucesso.",
      });
    } else {
      const newMethod: PaymentMethod = {
        id: Date.now(),
        name: formData.name,
        description: formData.description,
        active: true
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      toast({
        title: "Forma de pagamento cadastrada",
        description: "Nova forma de pagamento foi adicionada ao sistema.",
      });
    }

    setFormData({ name: "", description: "" });
    setEditingMethod(null);
    setIsDialogOpen(false);
  };

  const handleEdit = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormData({
      name: method.name,
      description: method.description
    });
    setIsDialogOpen(true);
  };

  const toggleActive = (id: number) => {
    setPaymentMethods(paymentMethods.map(method =>
      method.id === id ? { ...method, active: !method.active } : method
    ));
    toast({
      title: "Status atualizado",
      description: "O status da forma de pagamento foi atualizado.",
    });
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
                <h1 className="text-2xl font-bold">Formas de Pagamento</h1>
              </div>
              <ThemeToggle />
            </div>
          </header>

          <div className="p-6 space-y-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div>
                  <CardTitle className="text-sm font-medium">Formas de Pagamento Ativas</CardTitle>
                  <div className="text-2xl font-bold">
                    {paymentMethods.filter(m => m.active).length}
                  </div>
                </div>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
            </Card>

            <div className="flex justify-between items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar formas de pagamento..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              <Button onClick={() => {
                setEditingMethod(null);
                setFormData({ name: "", description: "" });
                setIsDialogOpen(true);
              }}>
                <Plus className="h-4 w-4 mr-2" />
                Nova Forma de Pagamento
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Lista de Formas de Pagamento</CardTitle>
                <CardDescription>
                  Gerencie as formas de pagamento aceitas pelo seu negócio
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Descrição</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredMethods.map((method) => (
                      <TableRow key={method.id}>
                        <TableCell className="font-medium">{method.name}</TableCell>
                        <TableCell>{method.description}</TableCell>
                        <TableCell>
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            method.active 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {method.active ? 'Ativo' : 'Inativo'}
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEdit(method)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => toggleActive(method.id)}
                            >
                              {method.active ? 'Desativar' : 'Ativar'}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingMethod ? "Editar Forma de Pagamento" : "Nova Forma de Pagamento"}
                  </DialogTitle>
                  <DialogDescription>
                    {editingMethod 
                      ? "Edite as informações da forma de pagamento." 
                      : "Cadastre uma nova forma de pagamento."}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="description">Descrição</Label>
                    <Input
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full">
                    {editingMethod ? "Atualizar" : "Cadastrar"}
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

export default PaymentMethods;
