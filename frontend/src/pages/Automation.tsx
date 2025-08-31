
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import AutoBackup from "@/components/AutoBackup";
import WhatsAppIntegration from "@/components/WhatsAppIntegration";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bot, Database, MessageCircle } from "lucide-react";

const Automation = () => {
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1">
          <header className="border-b bg-white p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <div className="flex items-center gap-2">
                  <Bot className="h-6 w-6" />
                  <h1 className="text-2xl font-bold">Automação</h1>
                </div>
              </div>
              <ThemeToggle />
            </div>
          </header>
          
          <div className="p-6">
            <Tabs defaultValue="backup" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="backup" className="flex items-center gap-2">
                  <Database className="h-4 w-4" />
                  Backup Automático
                </TabsTrigger>
                <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4" />
                  WhatsApp
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="backup" className="mt-6">
                <AutoBackup />
              </TabsContent>
              
              <TabsContent value="whatsapp" className="mt-6">
                <WhatsAppIntegration />
              </TabsContent>
            </Tabs>
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Automation;
