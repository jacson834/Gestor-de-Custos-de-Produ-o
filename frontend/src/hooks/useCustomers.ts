
import { useState, useEffect } from 'react';
import { Customer } from '@/types/customers';

const initialCustomers: Customer[] = [
  { 
    id: 1, 
    name: "Carlos Silva", 
    email: "carlos@email.com", 
    phone: "11999999999", 
    address: "Rua das Flores, 123", 
    city: "São Paulo", 
    state: "SP", 
    zipCode: "01234-567",
    birthDate: "1985-06-15"
  },
  { 
    id: 2, 
    name: "Ana Costa", 
    email: "ana@email.com", 
    phone: "11888888888", 
    address: "Av. Paulista, 456", 
    city: "São Paulo", 
    state: "SP", 
    zipCode: "01311-000",
    birthDate: `1992-${new Date().getMonth() + 1}-${new Date().getDate()}`
  },
];

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>(() => {
    try {
      const storedCustomers = localStorage.getItem('customers');
      return storedCustomers ? JSON.parse(storedCustomers) : initialCustomers;
    } catch (error) {
      console.error("Failed to parse customers from localStorage", error);
      return initialCustomers;
    }
  });

  useEffect(() => {
    localStorage.setItem('customers', JSON.stringify(customers));
  }, [customers]);
  
  const addCustomer = (customerData: Omit<Customer, 'id'>) => {
    const newCustomer: Customer = {
      id: Date.now(),
      ...customerData,
    };
    setCustomers(prev => [...prev, newCustomer]);
  };

  const updateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
  };

  const deleteCustomer = (customerId: number) => {
    setCustomers(prev => prev.filter(c => c.id !== customerId));
  };

  return { customers, addCustomer, updateCustomer, deleteCustomer };
};
