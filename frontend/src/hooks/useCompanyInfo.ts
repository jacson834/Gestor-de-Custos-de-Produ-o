
import { useState, useEffect } from 'react';

export interface CompanyInfo {
  name: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  taxId: string; // CNPJ/CPF
}

const initialCompanyInfo: CompanyInfo = {
  name: "Matrix Aviamentos",
  address: "Avenoda do Brasil, Nº 789",
  phone: "+55 (69) 9 9988-7655",
  email: "matriaxaviamento@gmail.com",
  website: "matrixaviamento.com.br",
  taxId: "54.144.724/0001-38",
};

const initialLogo = '/lovable-uploads/fc45bf86-8ffa-45ea-a631-a8a4269677d9.png';

export const useCompanyInfo = () => {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(initialCompanyInfo);
  const [logo, setLogo] = useState<string | null>(initialLogo);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const savedInfo = localStorage.getItem('companyInfo');
      const savedLogo = localStorage.getItem('companyLogo');

      if (savedInfo) {
        setCompanyInfo(JSON.parse(savedInfo));
      }
      if (savedLogo) {
        setLogo(savedLogo);
      }
    } catch (error) {
      console.error("Failed to load company info from localStorage", error);
    } finally {
        setLoading(false);
    }
  }, []);

  const saveCompanyInfo = (info: CompanyInfo, newLogo: string | null) => {
    try {
      localStorage.setItem('companyInfo', JSON.stringify(info));
      setCompanyInfo(info);
      if (newLogo) {
        localStorage.setItem('companyLogo', newLogo);
        setLogo(newLogo);
      }
    } catch (error) {
        console.error("Failed to save company info to localStorage", error);
    }
  };

  return { companyInfo, logo, saveCompanyInfo, loading };
};
