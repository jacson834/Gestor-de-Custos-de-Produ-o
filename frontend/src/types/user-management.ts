
export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: 'active' | 'inactive';
  createdAt: string;
  lastLogin?: string;
  permissions: Permission[];
}

export type UserRole = 'admin' | 'vendedor' | 'estoquista';

export interface Permission {
  id: string;
  name: string;
  description: string;
  module: PermissionModule;
}

export type PermissionModule = 
  | 'products' 
  | 'inventory' 
  | 'orders' 
  | 'customers' 
  | 'reports' 
  | 'settings'
  | 'users';

export interface ActivityLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  module: string;
  details: string;
  timestamp: string;
  ipAddress?: string;
}

export const DEFAULT_PERMISSIONS: Record<UserRole, Permission[]> = {
  admin: [
    { id: 'all', name: 'Acesso Total', description: 'Acesso a todas as funcionalidades', module: 'settings' }
  ],
  vendedor: [
    { id: 'view_products', name: 'Visualizar Produtos', description: 'Pode visualizar produtos', module: 'products' },
    { id: 'create_orders', name: 'Criar Pedidos', description: 'Pode criar novos pedidos', module: 'orders' },
    { id: 'view_customers', name: 'Visualizar Clientes', description: 'Pode visualizar clientes', module: 'customers' },
    { id: 'view_reports', name: 'Relatórios de Vendas', description: 'Pode visualizar relatórios de vendas', module: 'reports' }
  ],
  estoquista: [
    { id: 'manage_inventory', name: 'Gerenciar Estoque', description: 'Pode alterar quantidades em estoque', module: 'inventory' },
    { id: 'view_products', name: 'Visualizar Produtos', description: 'Pode visualizar produtos', module: 'products' },
    { id: 'update_prices', name: 'Alterar Preços', description: 'Pode alterar preços de produtos', module: 'products' }
  ]
};
