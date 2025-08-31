
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import useCustomFields from '@/hooks/useCustomFields';
import { CustomFieldModule, CustomFieldType } from '@/types/custom-fields';

const moduleTranslations: Record<CustomFieldModule, string> = {
  users: 'Usuários',
  products: 'Produtos',
  customers: 'Clientes',
  suppliers: 'Fornecedores',
};

const typeTranslations: Record<CustomFieldType, string> = {
    text: 'Texto',
    number: 'Número',
    date: 'Data',
};

const CustomFieldsManager = () => {
  const { fields, addField, removeField, loading } = useCustomFields();
  const [newFieldName, setNewFieldName] = useState('');
  const [newFieldModule, setNewFieldModule] = useState<CustomFieldModule>('products');
  const [newFieldType, setNewFieldType] = useState<CustomFieldType>('text');

  const handleAddField = () => {
    if (newFieldName.trim()) {
      addField(newFieldName.trim(), newFieldModule, newFieldType);
      setNewFieldName('');
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Campos Personalizados</CardTitle>
          <CardDescription>Gerencie campos adicionais para os módulos do sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <p>Carregando campos personalizados...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Campos Personalizados</CardTitle>
        <CardDescription>
          Adicione e gerencie campos extras para produtos, clientes, e mais, para adaptar o sistema às suas necessidades.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="flex flex-col md:flex-row gap-4 items-end p-4 border rounded-lg">
          <div className="w-full md:w-auto md:flex-1">
            <Label htmlFor="new-field-name">Nome do Campo</Label>
            <Input
              id="new-field-name"
              value={newFieldName}
              onChange={(e) => setNewFieldName(e.target.value)}
              placeholder="Ex: Cor, Tamanho, Voltagem"
            />
          </div>
          <div className="w-full md:w-auto">
            <Label htmlFor="new-field-module">Módulo</Label>
            <Select value={newFieldModule} onValueChange={(v) => setNewFieldModule(v as CustomFieldModule)}>
              <SelectTrigger id="new-field-module" className="w-full md:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="products">Produtos</SelectItem>
                <SelectItem value="users">Usuários</SelectItem>
                <SelectItem value="customers">Clientes</SelectItem>
                <SelectItem value="suppliers">Fornecedores</SelectItem>
              </SelectContent>
            </Select>
          </div>
           <div className="w-full md:w-auto">
            <Label htmlFor="new-field-type">Tipo</Label>
            <Select value={newFieldType} onValueChange={(v) => setNewFieldType(v as CustomFieldType)}>
                <SelectTrigger id="new-field-type" className="w-full md:w-[180px]">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="text">Texto</SelectItem>
                    <SelectItem value="number">Número</SelectItem>
                    <SelectItem value="date">Data</SelectItem>
                </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddField} className="w-full md:w-auto">Adicionar Campo</Button>
        </div>

        <div>
          <h3 className="text-lg font-medium mb-2">Campos Existentes</h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Módulo</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {fields.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center h-24">
                      Nenhum campo personalizado criado ainda.
                    </TableCell>
                  </TableRow>
                ) : (
                  fields.map(field => (
                    <TableRow key={field.id}>
                      <TableCell className="font-medium">{field.name}</TableCell>
                      <TableCell>{moduleTranslations[field.module]}</TableCell>
                      <TableCell>{typeTranslations[field.type]}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeField(field.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CustomFieldsManager;
