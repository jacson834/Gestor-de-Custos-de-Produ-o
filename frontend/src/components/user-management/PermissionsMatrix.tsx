
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { UserRole } from "@/types/user-management";
import { Shield, User, Activity } from "lucide-react";

const permissions = [
  { id: 'view_products', name: 'Visualizar Produtos', module: 'Produtos' },
  { id: 'edit_products', name: 'Editar Produtos', module: 'Produtos' },
  { id: 'update_prices', name: 'Alterar Preços', module: 'Produtos' },
  { id: 'manage_inventory', name: 'Gerenciar Estoque', module: 'Estoque' },
  { id: 'view_inventory', name: 'Visualizar Estoque', module: 'Estoque' },
  { id: 'create_orders', name: 'Criar Pedidos', module: 'Vendas' },
  { id: 'view_orders', name: 'Visualizar Pedidos', module: 'Vendas' },
  { id: 'manage_customers', name: 'Gerenciar Clientes', module: 'Clientes' },
  { id: 'view_reports', name: 'Relatórios de Vendas', module: 'Relatórios' },
  { id: 'view_financial', name: 'Relatórios Financeiros', module: 'Relatórios' },
  { id: 'manage_users', name: 'Gerenciar Usuários', module: 'Sistema' },
  { id: 'system_settings', name: 'Configurações', module: 'Sistema' }
];

const getRoleIcon = (role: string) => {
  switch (role) {
    case 'admin':
      return <Shield className="h-4 w-4" />;
    case 'vendedor':
      return <User className="h-4 w-4" />;
    case 'estoquista':
      return <Activity className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

interface PermissionsMatrixProps {
  rolePermissions: Record<UserRole, string[]>;
  onPermissionChange: (role: UserRole, permissionId: string, checked: boolean) => void;
}

const PermissionsMatrix = ({ rolePermissions, onPermissionChange }: PermissionsMatrixProps) => {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <Badge variant="destructive" className="flex items-center gap-1 justify-center">
            <Shield className="h-4 w-4" />
            Administrador
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            Acesso total ao sistema
          </p>
        </div>
        <div className="text-center">
          <Badge variant="default" className="flex items-center gap-1 justify-center">
            <User className="h-4 w-4" />
            Vendedor
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            Foco em vendas e clientes
          </p>
        </div>
        <div className="text-center">
          <Badge variant="secondary" className="flex items-center gap-1 justify-center">
            <Activity className="h-4 w-4" />
            Estoquista
          </Badge>
          <p className="text-sm text-muted-foreground mt-1">
            Controle de estoque e produtos
          </p>
        </div>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Permissão</TableHead>
            <TableHead className="hidden sm:table-cell">Módulo</TableHead>
            <TableHead className="text-center">Admin</TableHead>
            <TableHead className="text-center">Vendedor</TableHead>
            <TableHead className="text-center">Estoquista</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {permissions.map((permission) => (
            <TableRow key={permission.id}>
              <TableCell className="font-medium">{permission.name}</TableCell>
              <TableCell className="hidden sm:table-cell">
                <Badge variant="outline">{permission.module}</Badge>
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={rolePermissions.admin.includes(permission.id)}
                  disabled
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={rolePermissions.vendedor.includes(permission.id)}
                  onCheckedChange={(checked) => onPermissionChange('vendedor', permission.id, !!checked)}
                />
              </TableCell>
              <TableCell className="text-center">
                <Checkbox 
                  checked={rolePermissions.estoquista.includes(permission.id)}
                  onCheckedChange={(checked) => onPermissionChange('estoquista', permission.id, !!checked)}
                />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PermissionsMatrix;
