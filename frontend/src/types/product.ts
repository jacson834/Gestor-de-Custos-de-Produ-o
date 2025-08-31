// Tipos de dados para o módulo de produção.

export interface RawMaterial {
  id: number | string;
  name: string;
  unit: 'kg' | 'g' | 'l' | 'ml' | 'un'; // Unidade de medida (quilo, grama, litro, mililitro, unidade)
  cost: number; // Custo por unidade (ex: R$ por kg, R$ por litro)
  supplierId?: number | string;
}