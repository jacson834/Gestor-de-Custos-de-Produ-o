
import jsPDF from 'jspdf';
import { Quote } from '@/types/quotes';

export const companyInfo = {
  name: "Nome da Sua Empresa",
  address: "Rua das Flores, 123, São Paulo, SP",
  phone: "(11) 5555-4444",
  email: "contato@suaempresa.com",
};

export const generateQuotePDF = (quote: Quote) => {
  const pdf = new jsPDF();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const pageWidth = pdf.internal.pageSize.getWidth();
  let y = 0;

  // --- Header ---
  pdf.setFillColor(24, 82, 133); // Dark blue
  pdf.rect(0, 0, pageWidth, 25, 'F');
  pdf.setFillColor(0, 150, 200); // Lighter blue accent
  pdf.rect(0, 0, 40, 25, 'F');
  
  y = 15;
  pdf.setFontSize(22);
  pdf.setFont("helvetica", "bold");
  pdf.setTextColor(255, 255, 255);
  pdf.text('ORÇAMENTO', 15, y);

  pdf.setFontSize(10);
  pdf.setFont("helvetica", "normal");
  pdf.text(`DATA: ${new Date(quote.date).toLocaleDateString('pt-BR')}`, pageWidth - 15, y, { align: 'right' });

  // --- Customer Info ---
  y = 35;
  pdf.setTextColor(0, 0, 0);
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);

  const field = (label: string, value: string, yPos: number, xPos = 15) => {
      pdf.text(label, xPos, yPos);
      pdf.setFont("helvetica", "normal");
      const labelWidth = pdf.getStringUnitWidth(label) * pdf.getFontSize() / pdf.internal.scaleFactor;
      pdf.text(value || 'N/A', xPos + labelWidth + 2, yPos);
      pdf.setFont("helvetica", "bold");
  }
  
  field('Cliente:', quote.customerName, y);
  field('CNPJ:', quote.customerCnpj, y + 6);
  field('Endereço:', quote.customerAddress, y + 12);
  field('Cidade:', quote.customerCity, y + 18);
  field('Telefone:', quote.customerPhone, y + 24);
  field('E-mail:', quote.customerEmail, y + 30);
  
  y += 42;

  // --- Items Table Header ---
  pdf.setFillColor(230, 230, 230);
  pdf.rect(15, y, pageWidth - 30, 8, 'F');
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(10);
  pdf.text('DESCRIÇÃO', 20, y + 6);
  pdf.text('QUANTIDADE', 140, y + 6);
  pdf.text('VALOR', 175, y + 6);
  y += 8;

  // --- Items Table Body ---
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(9);
  quote.items.forEach(item => {
      if (y > pageHeight - 80) { // page break check
          pdf.addPage();
          y = 15;
      }
      const productNameLines = pdf.splitTextToSize(item.productName, 110);
      const itemLineHeight = (productNameLines.length * 4) + 6;
      
      pdf.line(15, y, pageWidth - 15, y); // top line
      pdf.text(productNameLines, 20, y + 5);
      pdf.text(item.quantity.toString(), 145, y + 5, {align: 'center'});
      pdf.text(`R$ ${item.total.toFixed(2)}`, 185, y + 5, {align: 'right'});
      y += itemLineHeight;
  });
  pdf.line(15, y, pageWidth - 15, y); // final line of table

  // --- Totals on the right side ---
  let totalsY = y + 10;
  const rightAlignTotals = pageWidth - 15;
  pdf.setFontSize(10);

  const drawTotalLine = (label: string, value: string, isBold = false, isNegative = false) => {
      if (totalsY > pageHeight - 35) {
          pdf.addPage();
          totalsY = 20;
      }
      if (isBold) pdf.setFont("helvetica", "bold");
      if (isNegative) pdf.setTextColor(220, 53, 69);

      pdf.text(label, 130, totalsY, {align: 'left'});
      pdf.text(value, rightAlignTotals, totalsY, { align: 'right' });
      
      if (isBold) pdf.setFont("helvetica", "normal");
      if (isNegative) pdf.setTextColor(0);

      totalsY += 6;
  }

  drawTotalLine('Subtotal:', `R$ ${quote.subtotal.toFixed(2)}`);

  if (quote.discount > 0) {
      const discountAmount = (quote.subtotal * quote.discount) / 100;
      drawTotalLine(`Desconto (${quote.discount}%):`, `- R$ ${discountAmount.toFixed(2)}`, false, true);
  }

  pdf.setFontSize(12);
  drawTotalLine('Total:', `R$ ${quote.total.toFixed(2)}`, true);


  // --- Notes ---
  let notesY = Math.max(y, totalsY) + 5;
  if (quote.notes) {
      if (notesY > pageHeight - 50) {
          pdf.addPage();
          notesY = 20;
      }
      
      const notesLines = pdf.splitTextToSize(quote.notes, pageWidth - 40);
      const notesHeight = (notesLines.length * 4) + 10;
      
      pdf.setFillColor(243, 244, 246); // light gray
      pdf.rect(15, notesY, pageWidth - 30, notesHeight, 'F');
      
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "bold");
      pdf.text('Observações:', 20, notesY + 7);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(9);
      pdf.text(notesLines, 20, notesY + 13);
  }
  
  // --- Footer ---
  const footerY = pageHeight - 25;
  pdf.setFillColor(24, 82, 133); // Dark blue footer
  pdf.rect(0, footerY, pageWidth, 25, 'F');

  pdf.setFontSize(9);
  pdf.setTextColor(255, 255, 255);
  
  const companyDetails = `${companyInfo.name} | ${companyInfo.phone} | ${companyInfo.email}`;
  pdf.text("Espaço para sua logo", 15, footerY + 15);
  pdf.text(companyDetails, pageWidth - 15, footerY + 15, { align: 'right' });

  pdf.save(`orcamento-${quote.id}.pdf`);
};
