import { Factory, LucideIcon } from "lucide-react";

interface MenuItem {
  title: string;
  url: string;
  icon: LucideIcon;
}

export const productionMenuItems: MenuItem[] = [
  {
    title: "Produção",
    url: "/production",
    icon: Factory,
  },
];

export const themes = {
  main: {
    icon: "text-sky-500",
    button: "hover:bg-sky-500/10 text-sky-500",
  },
};