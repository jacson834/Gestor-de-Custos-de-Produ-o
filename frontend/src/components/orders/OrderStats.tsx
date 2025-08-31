
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Order } from "@/types/orders";
import { ShoppingCart, Package } from "lucide-react";

interface OrderStatsProps {
  orders: Order[];
}

export const OrderStats = ({ orders }: OrderStatsProps) => (
  <div className="grid gap-4 md:grid-cols-3">
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
        <ShoppingCart className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{orders.length}</div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Pedidos Pendentes</CardTitle>
        <Package className="h-4 w-4 text-yellow-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-yellow-500">
          {orders.filter(o => o.status === "pending" || o.status === "processing").length}
        </div>
      </CardContent>
    </Card>

    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Valor Total</CardTitle>
        <Package className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-green-500">
          R$ {orders.reduce((acc, order) => acc + order.total, 0).toFixed(2)}
        </div>
      </CardContent>
    </Card>
  </div>
);
