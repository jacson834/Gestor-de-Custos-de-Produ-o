// frontend/src/utils/pdfUtils.ts (VERSÃO CORRIGIDA)

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { CompanyInfo } from '@/hooks/useCompanyInfo';
import { SaleItem } from '@/types/pos';

// Recomendo mover estas interfaces para um arquivo de tipos, como 'src/types/pos.ts'
interface Customer {
  name: string;
}
interface PdfOptions {
  docType: 'quote' | 'sale';
  companyInfo: CompanyInfo;
  logo: string | null;
  customer: Customer | null | undefined;
  items: SaleItem[];
  subtotal: number;
  discountAmount: number;
  discountPercentage: number;
  total: number;
  paymentMethod?: string;
  notes?: string;
  validity?: number;
}

export const generateDocumentPDF = (options: PdfOptions) => {
  const {
    docType, companyInfo, logo, customer, items,
    subtotal, discountAmount, discountPercentage, total,
    paymentMethod, notes, validity,
  } = options;

  // A variável foi criada com o nome 'doc'
  const doc = new jsPDF(); 
  const pageHeight = doc.internal.pageSize.getHeight();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // --- Header ---
  if (logo) {
    try {
      doc.addImage(logo, 'PNG', 15, y, 30, 30);
    } catch (e) {
      console.error("Erro ao adicionar imagem do logo no PDF:", e);
    }
  }
  
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  const rightAlignCompany = pageWidth - 15;
  doc.text(companyInfo.name, rightAlignCompany, y, { align: 'right' });
  doc.text(companyInfo.address, rightAlignCompany, y + 5, { align: 'right' });
  doc.text(`Tel: ${companyInfo.phone}`, rightAlignCompany, y + 10, { align: 'right' });
  if(companyInfo.website) doc.text(companyInfo.website, rightAlignCompany, y + 15, { align: 'right' });
  
  y += 35;
  doc.setDrawColor(200);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;
  
  // --- Doc Info ---
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  const docTitle = docType === 'quote' ? 'ORÇAMENTO' : 'COMPROVANTE DE VENDA';
  doc.text(docTitle, 15, y);

  // Corrigido de 'pdf' para 'doc'
  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");
  const docNumber = `#${Date.now().toString().slice(-6)}`;
  doc.text(`Nº: ${docNumber}`, rightAlignCompany, y, { align: 'right' });
  doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, rightAlignCompany, y + 5, { align: 'right' });
  
  y += 15;

  // --- Customer Info ---
  if (customer?.name) {
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.text('CLIENTE:', 15, y);
      doc.setFont("helvetica", "normal");
      doc.text(customer.name, 35, y);
      y += 10;
  }

  // --- Items Table ---
  autoTable(doc, {
    startY: y,
    head: [['DESCRIÇÃO', 'QTD', 'V. UN', 'SUBTOTAL']],
    body: items.map(item => [
      item.name,
      item.quantity,
      `R$ ${Number(item.price).toFixed(2)}`,
      `R$ ${Number(item.total).toFixed(2)}`
    ]),
    theme: 'striped',
    headStyles: { fillColor: [38, 38, 38], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
    columnStyles: {
      1: { halign: 'center' },
      2: { halign: 'right' },
      3: { halign: 'right' },
    },
    margin: { left: 15, right: 15 },
  });
  
  let finalY = (doc as any).lastAutoTable.finalY;
  y = finalY + 10;
  
  // --- Totals ---
  const rightAlignTotals = pageWidth - 15;
  const leftAlignTotals = pageWidth - 65;
  doc.setFontSize(10);

  doc.text('Subtotal:', leftAlignTotals, y);
  doc.text(`R$ ${subtotal.toFixed(2)}`, rightAlignTotals, y, { align: 'right' });
  y += 7;
  
  if (discountPercentage > 0) {
    doc.text(`Desconto (${discountPercentage}%):`, leftAlignTotals, y);
    doc.setTextColor(220, 53, 69); // red
    doc.text(`- R$ ${discountAmount.toFixed(2)}`, rightAlignTotals, y, { align: 'right' });
    doc.setTextColor(0);
    y += 7;
  }
  
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('TOTAL:', leftAlignTotals, y);
  doc.text(`R$ ${total.toFixed(2)}`, rightAlignTotals, y, { align: 'right' });

  // --- Footer ---
  y = pageHeight - 35;
  doc.setDrawColor(200);
  doc.line(15, y, pageWidth - 15, y);
  y += 10;
  
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");

  if(paymentMethod){
      doc.text(`Forma de Pagamento: ${paymentMethod}`, 15, y);
  }
  if (validity) {
      doc.text(`Validade da Proposta: ${validity} dias`, 15, y);
  }
  if(notes) {
      y += 5;
      doc.text(`Observações: ${notes}`, 15, y);
  }
  
  doc.setFontSize(8);
  doc.setTextColor(150);
  doc.text('Obrigado!', pageWidth/2 , pageHeight - 10, { align: 'center' });
  
  const fileName = docType === 'quote' ? `orcamento-${docNumber}.pdf` : `venda-${docNumber}.pdf`;
  doc.save(fileName);
}