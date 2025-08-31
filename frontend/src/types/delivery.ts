import { useToast } from "@/components/ui/use-toast";
import { Customer } from '@/types/product';

// Importa as interfaces do arquivo centralizado
import { Delivery, DeliveryDriver, DeliveryZone } from '@/types/delivery';

export const useDelivery = () => {
  const { toast } = useToast();

