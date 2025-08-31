import { useState, useEffect } from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { ThemeToggle } from "@/components/ThemeToggle";
import { useCompanyInfo, CompanyInfo } from "@/hooks/useCompanyInfo";
import { Upload } from "lucide-react";
import DatabaseBackup from "@/components/DatabaseBackup";
import AutoBackup from "@/components/AutoBackup";
import CloudBackup from "@/components/CloudBackup";
import CustomFieldsManager from "@/components/settings/CustomFieldsManager";

const Settings = () => {
  const { toast } = useToast();
  const { companyInfo: initialInfo, logo: initialLogo, saveCompanyInfo, loading } = useCompanyInfo();
  
  const [info, setInfo] = useState<CompanyInfo>(initialInfo);
  const [logoPreview, setLogoPreview] = useState<string | null>(initialLogo);
  const [newLogoFile, setNewLogoFile] = useState<string | null>(null);

  useEffect(() => {
    if (!loading) {
      setInfo(initialInfo);
      setLogoPreview(initialLogo);
    }
  }, [loading, initialInfo, initialLogo]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setNewLogoFile(base64String);
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    saveCompanyInfo(info, newLogoFile);
    toast({
      title: "Sucesso!",
      description: "Informações da empresa salvas.",
    });
  };

  if (loading) {
      return (
        <div className="flex items-center justify-center h-screen">
          Carregando...
        </div>
      );
  }

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="border-b bg-background p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold">Configurações</h1>
              </div>
              <ThemeToggle />
            </div>
          </header>
          
          <div className="p-6 space-y-6">
            <form onSubmit={handleSubmit}>
              <Card>
                <CardHeader>
                  <CardTitle>Informações da Empresa</CardTitle>
                  <p className="text-sm text-muted-foreground">
                    Essas informações serão usadas nos orçamentos e comprovantes de venda.
                  </p>
                </CardHeader>
                <CardContent className="space-y-6 pt-6">
                  <div className="space-y-2">
                      <Label>Logo da Empresa</Label>
                      <div className="flex items-center gap-4">
                          {logoPreview && <img src={logoPreview} alt="Logo" className="w-24 h-24 object-contain border p-1 rounded-md" />}
                          <Input id="logo" type="file" accept="image/*" onChange={handleLogoChange} className="hidden" />
                          <Button type="button" variant="outline" onClick={() => document.getElementById('logo')?.click()}>
                              <Upload className="mr-2 h-4 w-4" />
                              Carregar Logo
                          </Button>
                      </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                     <div className="space-y-2">
                        <Label htmlFor="name">Nome da Empresa</Label>
                        <Input id="name" name="name" value={info.name} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="taxId">CNPJ / CPF</Label>
                        <Input id="taxId" name="taxId" value={info.taxId} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="address">Endereço</Label>
                        <Input id="address" name="address" value={info.address} onChange={handleInputChange} />
                      </div>
                       <div className="space-y-2">
                        <Label htmlFor="phone">Telefone</Label>
                        <Input id="phone" name="phone" value={info.phone} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input id="email" name="email" value={info.email} onChange={handleInputChange} />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="website">Website</Label>
                        <Input id="website" name="website" value={info.website} onChange={handleInputChange} />
                      </div>
                  </div>
                  <div className="flex justify-end">
                    <Button type="submit">Salvar Alterações</Button>
                  </div>
                </CardContent>
              </Card>
            </form>
            
            <CustomFieldsManager />

            <DatabaseBackup />
            <AutoBackup />
            <CloudBackup />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Settings;
