// src/components/SidebarMenuGroup.tsx (Arquivo Corrigido)

import { useNavigate, useLocation, NavLink } from "react-router-dom";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

interface SidebarMenuGroupProps {
  label: string;
  items: MenuItem[];
  theme: {
    icon: string;
    button: string;
  };
}

export function SidebarMenuGroup({ label, items, theme }: SidebarMenuGroupProps) {
  const location = useLocation();

  return (
    <SidebarGroup>
      <SidebarGroupLabel>{label}</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              {/*
                // AJUSTE FEITO AQUI
                // Nome do Ajuste: Troca para NavLink e Lógica de Ativação
                // Objetivo: Usamos o componente NavLink, que é inteligente. Ele nos diz quando está ativo.
                // A nossa lógica agora é: se a URL atual "começa com" a URL do item, ele é considerado ativo.
                // Também tratamos o caso especial do Dashboard na página inicial.
              */}
              <NavLink to={item.url} className="w-full">
                {({ isActive }) => {
                  // A lógica para determinar se o link está ativo.
                  const isLinkActive = 
                    // Caso especial: Ativa o "Dashboard" se estivermos na página inicial.
                    (item.url === "/dashboard" && location.pathname === "/") ||
                    // Para todos os outros links, verifica se a URL da página começa com a URL do link.
                    isActive;

                  return (
                    <SidebarMenuButton
                      isActive={isLinkActive}
                      className={cn(theme.button)} // Aplica o tema de cores
                    >
                      <item.icon className={cn("h-4 w-4", theme.icon)} />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  );
                }}
              </NavLink>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}