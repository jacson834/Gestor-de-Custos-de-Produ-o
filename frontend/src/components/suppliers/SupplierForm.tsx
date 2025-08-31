// src/components/suppliers/SupplierForm.tsx (Arquivo Corrigido)

import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Supplier } from '@/types/product';

// AJUSTE FEITO AQUI: O nome do tipo foi corrigido para refletir "Supplier"
export type SupplierFormData = Omit<Supplier, 'id'>;

interface SupplierFormProps {
  formData: Partial<SupplierFormData>;
  setFormData: (data: Partial<SupplierFormData>) => void;
  handleSubmit: (e: React.FormEvent) => void;
  isEditing: boolean;
}

interface IBGEUF { id: number; sigla: string; nome: string; }
interface IBGECity { id: number; nome: string; }

// AJUSTE FEITO AQUI: O nome do componente foi corrigido de 'CustomerForm' para 'SupplierForm'
export const SupplierForm = ({ formData, setFormData, handleSubmit, isEditing }: SupplierFormProps) => {
  const [ufs, setUfs] = useState<IBGEUF[]>([]);
  const [cities, setCities] = useState<IBGECity[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  useEffect(() => {
    fetch('https://servicodados.ibge.gov.br/api/v1/localidades/estados?orderBy=nome')
      .then(res => res.json())
      .then(data => setUfs(data));
  }, []);

  useEffect(() => {
    const selectedState = formData.state;
    if (selectedState) {
      setIsLoadingCities(true);
      fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedState}/municipios`)
        .then(res => res.json())
        .then(data => {
          const sortedCities = data.sort((a: IBGECity, b: IBGECity) => a.nome.localeCompare(b.nome));
          setCities(sortedCities);
          setIsLoadingCities(false);
        });
    } else {
      setCities([]);
    }
  }, [formData.state]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData({ ...formData, [id]: value });
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label htmlFor="name">Nome do Fornecedor</Label><Input id="name" value={formData.name || ''} onChange={handleChange} required /></div>
        <div><Label htmlFor="cnpj">CNPJ</Label><Input id="cnpj" value={formData.cnpj || ''} onChange={handleChange} /></div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div><Label htmlFor="email">Email</Label><Input id="email" type="email" value={formData.email || ''} onChange={handleChange} /></div>
        <div><Label htmlFor="phone">Telefone</Label><Input id="phone" value={formData.phone || ''} onChange={handleChange} /></div>
      </div>
      <div><Label htmlFor="contactPerson">Pessoa de Contato</Label><Input id="contactPerson" value={formData.contactPerson || ''} onChange={handleChange} /></div>
      <div><Label htmlFor="address">Endereço (Rua, Número, Bairro)</Label><Input id="address" value={formData.address || ''} onChange={handleChange} /></div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="state">Estado</Label>
          <Select 
            value={formData.state || ''} 
            onValueChange={(value) => {
              setFormData({ ...formData, state: value, city: '' });
            }}
          >
            <SelectTrigger><SelectValue placeholder="Selecione o estado" /></SelectTrigger>
            <SelectContent>
              {ufs.map(uf => (<SelectItem key={uf.id} value={uf.sigla}>{uf.nome}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="city">Cidade</Label>
          <Select 
            value={formData.city || ''} 
            onValueChange={(value) => {
              setFormData({ ...formData, city: value });
            }} 
            disabled={!formData.state || isLoadingCities}
          >
            <SelectTrigger><SelectValue placeholder={isLoadingCities ? "Carregando..." : "Selecione a cidade"} /></SelectTrigger>
            <SelectContent>
              {cities.map(city => (<SelectItem key={city.id} value={city.nome}>{city.nome}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div><Label htmlFor="zipCode">CEP</Label><Input id="zipCode" value={formData.zipCode || ''} onChange={handleChange} /></div>
      <Button type="submit" className="w-full">{isEditing ? "Atualizar Fornecedor" : "Cadastrar Fornecedor"}</Button>
    </form>
  );
};