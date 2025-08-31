
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Quote } from "@/types/quotes";
import { FileText } from "lucide-react";

interface QuoteStatsProps {
  quotes: Quote[];
}

export const QuoteStats = ({ quotes }: QuoteStatsProps) => {
  const acceptedQuotes = quotes.filter(q => q.status === "accepted");
  const acceptedValue = acceptedQuotes.reduce((acc, quote) => acc + quote.total, 0);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total de Orçamentos</CardTitle>
          <FileText className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{quotes.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Aceitos</CardTitle>
          <FileText className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            {acceptedQuotes.length}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Valor Total Aceitos</CardTitle>
          <FileText className="h-4 w-4 text-green-500" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-500">
            R$ {acceptedValue.toFixed(2)}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
