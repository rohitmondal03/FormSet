
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel, WidthType } from 'docx';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import type { Form, FormResponse } from './types';

function prepareDataForExport(form: Form, responses: FormResponse[]) {
  const headers = form.fields.map(field => field.label);
  const data = responses.map(response => {
    const row: Record<string, [] | string | number | boolean | null> = {};
    form.fields.forEach(field => {
      const value = response.data[field.id];
      if (Array.isArray(value)) {
        row[field.label] = value.join(', ');
      } else if (typeof value === 'object' && value !== null) {
        row[field.label] = JSON.stringify(value);
      } else {
        row[field.label] = value ?? '';
      }
    });
    return row;
  });
  return { headers, data };
}

export function generateCsv(form: Form, responses: FormResponse[]): string {
  const { headers, data } = prepareDataForExport(form, responses);
  const parser = new Parser({ fields: headers });
  return parser.parse(data);
}

export async function generateXlsx(form: Form, responses: FormResponse[]): Promise<string> {
  const { headers, data } = prepareDataForExport(form, responses);
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(form.title);

  worksheet.columns = headers.map(header => ({ header, key: header, width: 30 }));
  worksheet.addRows(data);
  
  worksheet.getRow(1).font = { bold: true };

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer).toString('base64');
}

export async function generateDocx(form: Form, responses: FormResponse[]): Promise<string> {
  const { headers, data } = prepareDataForExport(form, responses);
  
  const tableHeader = new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph({ children: [new TextRun({ text: header, bold: true })] })],
      width: {
        size: 100 / headers.length,
        type: WidthType.PERCENTAGE,
      },
    })),
  });

  const tableRows = data.map(row => new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph(String(row[header] ?? ''))],
      width: {
        size: 100 / headers.length,
        type: WidthType.PERCENTAGE,
      },
    })),
  }));

  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: form.title, heading: HeadingLevel.HEADING_1 }),
        new Paragraph({ text: `Total Responses: ${responses.length}`, heading: HeadingLevel.HEADING_3 }),
        new Paragraph(" "),
        new Table({
          rows: [tableHeader, ...tableRows],
          width: {
            size: 100,
            type: WidthType.PERCENTAGE,
          },
        }),
      ],
    }],
  });

  const buffer = await Packer.toBase64String(doc);
  return buffer;
}


export async function generatePdf(form: Form, responses: FormResponse[]): Promise<string> {
  const { headers, data } = prepareDataForExport(form, responses);

  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const fontSize = 10;
  const margin = 50;
  let y = height - margin;

  // Title
  page.drawText(form.title, {
    x: margin,
    y,
    font: boldFont,
    size: 24,
    color: rgb(0, 0, 0),
  });
  y -= 40;

  // Table rendering
  // const tableTop = y;
  const tableLeft = margin;
  const rowHeight = 20;
  const colWidth = (width - 2 * margin) / headers.length;

  // Draw header
  headers.forEach((header, i) => {
    page.drawText(header, {
      x: tableLeft + i * colWidth + 5,
      y: y - 15,
      font: boldFont,
      size: fontSize,
    });
  });
  y -= rowHeight;
  page.drawLine({
    start: { x: margin, y: y + 5 },
    end: { x: width - margin, y: y + 5 },
    thickness: 1,
  });

  // Draw rows
  let currentPage = page;
  data.forEach((row) => {
    if (y < margin + rowHeight) {
        // Add new page if content overflows
        currentPage = pdfDoc.addPage();
        y = currentPage.getSize().height - margin;
    }
    y -= rowHeight;
    headers.forEach((header, colIndex) => {
      const cellText = String(row[header] ?? '');
      currentPage.drawText(cellText, {
        x: tableLeft + colIndex * colWidth + 5,
        y: y,
        font: font,
        size: fontSize,
        maxWidth: colWidth - 10,
      });
    });
    currentPage.drawLine({
        start: { x: margin, y: y - 5 },
        end: { x: width - margin, y: y - 5 },
        thickness: 0.5,
        color: rgb(0.8, 0.8, 0.8)
    });
  });

  const pdfBytes = await pdfDoc.save();
  return Buffer.from(pdfBytes).toString('base64');
}
