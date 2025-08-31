
import { useState, useEffect } from 'react';
import { CustomField, CustomFieldModule, CustomFieldType } from '@/types/custom-fields';

const useCustomFields = () => {
  const [fields, setFields] = useState<CustomField[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const storedFields = localStorage.getItem('customFields');
      if (storedFields) {
        setFields(JSON.parse(storedFields));
      }
    } catch (error) {
      console.error("Failed to load custom fields from localStorage", error);
    } finally {
      setLoading(false);
    }
  }, []);

  const saveFields = (newFields: CustomField[]) => {
    try {
      localStorage.setItem('customFields', JSON.stringify(newFields));
      setFields(newFields);
    } catch (error) {
      console.error("Failed to save custom fields to localStorage", error);
    }
  };

  const addField = (name: string, module: CustomFieldModule, type: CustomFieldType) => {
    const newField: CustomField = {
      id: crypto.randomUUID(),
      name,
      module,
      type,
    };
    saveFields([...fields, newField]);
  };

  const removeField = (id: string) => {
    const updatedFields = fields.filter(field => field.id !== id);
    saveFields(updatedFields);
  };

  return { fields, addField, removeField, loading };
};

export default useCustomFields;
