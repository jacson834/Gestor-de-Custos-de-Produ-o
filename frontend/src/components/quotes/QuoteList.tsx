
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Quote, QuoteStatus, statusColors, statusLabels } from "@/types/quotes";
import { ArrowRightLeft, Edit, FileText, Send, Trash2 } from "lucide-react";

interface QuoteListProps {
  quotes: Quote[];
  onEdit: (quote: Quote) => void;
  onDelete: (id: number) => void;
  onUpdateStatus: (id: number, status: QuoteStatus) => void;
  onSend: (quote: Quote) => void;
  onConvertToOrder: (quote: Quote) => void;
  onGeneratePdf: (quote: Quote) => void;
}

export const QuoteList = ({ quotes, onEdit, onDelete, onUpdateStatus, onSend, onConvertToOrder, onGeneratePdf }: QuoteListProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lista de Orçamentos</CardTitle>
        <CardDescription>
          Gerencie suas propostas comerciais
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Cliente</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Válido até</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((quote) => (
              <TableRow key={quote.id}>
                <TableCell>
                  <div>
                    <div className="font-medium">{quote.customerName}</div>
                    <div className="text-sm text-muted-foreground">{quote.customerEmail}</div>
                  </div>
                </TableCell>
                <TableCell>{new Date(quote.date).toLocaleDateString()}</TableCell>
                <TableCell>{new Date(quote.validUntil).toLocaleDateString()}</TableCell>
                <TableCell className="font-medium">R$ {quote.total.toFixed(2)}</TableCell>
                <TableCell>
                  <Select
                    value={quote.status}
                    onValueChange={(value) => onUpdateStatus(quote.id, value as QuoteStatus)}
                  >
                    <SelectTrigger className="w-36">
                      <Badge className={`${statusColors[quote.status]} text-white`}>
                        {statusLabels[quote.status]}
                      </Badge>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Rascunho</SelectItem>
                      <SelectItem value="sent">Enviado</SelectItem>
                      <SelectItem value="accepted">Aceito</SelectItem>
                      <SelectItem value="rejected">Rejeitado</SelectItem>
                      <SelectItem value="expired">Expirado</SelectItem>
                      <SelectItem value="converted" disabled>Convertido</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onConvertToOrder(quote)}
                      disabled={quote.status !== 'accepted'}
                      title="Converter em Venda"
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onEdit(quote)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSend(quote)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onGeneratePdf(quote)}
                    >
                      <FileText className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDelete(quote.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
