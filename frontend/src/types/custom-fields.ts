
export type CustomFieldModule = 'users' | 'products' | 'customers' | 'suppliers';
export type CustomFieldType = 'text' | 'number' | 'date';

export interface CustomField {
  id: string;
  name: string;
  module: CustomFieldModule;
  type: CustomFieldType;
}
