
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Edit2, Trash2, Shield, User, Activity } from "lucide-react";
import { User as UserType } from "@/types/user-management";

interface UserTableProps {
  users: UserType[];
  onEditUser: (user: UserType) => void;
}

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

const getRoleColor = (role: string) => {
  switch (role) {
    case 'admin':
      return 'destructive';
    case 'vendedor':
      return 'default';
    case 'estoquista':
      return 'secondary';
    default:
      return 'default';
  }
};

const UserTable = ({ users, onEditUser }: UserTableProps) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Nome</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Função</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Último Login</TableHead>
          <TableHead>Ações</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {users.map((user) => (
          <TableRow key={user.id}>
            <TableCell className="font-medium">{user.name}</TableCell>
            <TableCell>{user.email}</TableCell>
            <TableCell>
              <Badge variant={getRoleColor(user.role) as any} className="flex items-center gap-1 w-fit">
                {getRoleIcon(user.role)}
                {user.role}
              </Badge>
            </TableCell>
            <TableCell>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status === 'active' ? 'Ativo' : 'Inativo'}
              </Badge>
            </TableCell>
            <TableCell>
              {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString('pt-BR') : 'Nunca'}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEditUser(user)}
                >
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default UserTable;
