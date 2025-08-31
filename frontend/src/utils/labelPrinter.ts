
import jsPDF from 'jspdf';
import QRCode from 'qrcode';

export interface LabelSettings {
  width: number;
  height: number;
  fontSize: number;
  includePrice: boolean;
  includeQR: boolean;
  margin: number;
  copies: number;
}

export interface ProductLabel {
  name: string;
  barcode: string;
  price?: number;
  variation?: string;
  additionalInfo?: string;
}

export class LabelPrinter {
  private settings: LabelSettings;

  constructor(settings: LabelSettings) {
    this.settings = settings;
  }

  async generatePDF(labels: ProductLabel[]): Promise<jsPDF> {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = 210; // A4 width in mm
    const pageHeight = 297; // A4 height in mm
    const labelsPerRow = Math.floor((pageWidth - 20) / (this.settings.width + this.settings.margin));
    const labelsPerColumn = Math.floor((pageHeight - 20) / (this.settings.height + this.settings.margin));

    let currentLabel = 0;
    let currentPage = 0;

    for (const label of labels) {
      for (let copy = 0; copy < this.settings.copies; copy++) {
        const row = Math.floor(currentLabel / labelsPerRow);
        const col = currentLabel % labelsPerRow;

        // Check if we need a new page
        if (row >= labelsPerColumn) {
          pdf.addPage();
          currentLabel = 0;
          currentPage++;
        }

        const x = 10 + col * (this.settings.width + this.settings.margin);
        const y = 10 + (currentLabel % (labelsPerRow * labelsPerColumn)) / labelsPerRow * (this.settings.height + this.settings.margin);

        await this.drawLabel(pdf, label, x, y);
        currentLabel++;
      }
    }

    return pdf;
  }

  private async drawLabel(pdf: jsPDF, label: ProductLabel, x: number, y: number): Promise<void> {
    // Draw border
    pdf.rect(x, y, this.settings.width, this.settings.height);

    let currentY = y + 5;

    // Product name
    pdf.setFontSize(this.settings.fontSize);
    const nameLines = this.splitText(pdf, label.name, this.settings.width - 10);
    nameLines.forEach(line => {
      pdf.text(line, x + 3, currentY);
      currentY += 4;
    });

    currentY += 2;

    // Barcode
    pdf.setFontSize(this.settings.fontSize - 1);
    pdf.text(label.barcode, x + 3, currentY);
    currentY += 5;

    // Variation if exists
    if (label.variation) {
      pdf.setFontSize(this.settings.fontSize - 2);
      pdf.text(label.variation, x + 3, currentY);
      currentY += 4;
    }

    // Price if enabled
    if (this.settings.includePrice && label.price) {
      pdf.setFontSize(this.settings.fontSize + 2);
      pdf.text(`R$ ${label.price.toFixed(2)}`, x + 3, currentY);
      currentY += 6;
    }

    // QR Code if enabled
    if (this.settings.includeQR) {
      try {
        const qrCode = await QRCode.toDataURL(label.barcode, {
          width: 60,
          margin: 1,
        });
        const qrSize = Math.min(this.settings.width / 4, this.settings.height / 3);
        pdf.addImage(qrCode, 'PNG', x + this.settings.width - qrSize - 3, y + 3, qrSize, qrSize);
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    }

    // Additional info
    if (label.additionalInfo) {
      pdf.setFontSize(this.settings.fontSize - 3);
      pdf.text(label.additionalInfo, x + 3, y + this.settings.height - 3);
    }
  }

  private splitText(pdf: jsPDF, text: string, maxWidth: number): string[] {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const width = pdf.getTextWidth(testLine);

      if (width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines;
  }

  static getPresetSettings(): Record<string, LabelSettings> {
    return {
      small: {
        width: 40,
        height: 25,
        fontSize: 7,
        includePrice: true,
        includeQR: false,
        margin: 2,
        copies: 1
      },
      standard: {
        width: 50,
        height: 30,
        fontSize: 8,
        includePrice: true,
        includeQR: false,
        margin: 3,
        copies: 1
      },
      large: {
        width: 70,
        height: 42,
        fontSize: 10,
        includePrice: true,
        includeQR: true,
        margin: 4,
        copies: 1
      }
    };
  }
}

export const printLabels = async (labels: ProductLabel[], settings: LabelSettings): Promise<void> => {
  const printer = new LabelPrinter(settings);
  const pdf = await printer.generatePDF(labels);
  pdf.save(`etiquetas-${Date.now()}.pdf`);
};
