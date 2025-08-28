
import { Parser } from 'json2csv';
import ExcelJS from 'exceljs';
import { Document, Packer, Paragraph, Table, TableRow, TableCell, TextRun, HeadingLevel } from 'docx';
const PDFDocument = require('pdfkit-table');
import type { Form, FormResponse } from './types';

function prepareDataForExport(form: Form, responses: FormResponse[]) {
  const headers = form.fields.map(field => field.label);
  const data = responses.map(response => {
    const row: Record<string, any> = {};
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
    })),
  });

  const tableRows = data.map(row => new TableRow({
    children: headers.map(header => new TableCell({
      children: [new Paragraph(String(row[header] ?? ''))],
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
            type: 'pct',
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

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    const buffers: Buffer[] = [];

    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', () => {
      const pdfData = Buffer.concat(buffers).toString('base64');
      resolve(pdfData);
    });
    doc.on('error', (err) => {
        reject(err)
    });

    doc.fontSize(20).text(form.title, { align: 'center' });
    doc.moveDown();

    const table = {
      title: "Responses",
      headers: headers,
      rows: data.map(row => headers.map(header => String(row[header] ?? ''))),
    };

    doc.table(table, {
        prepareHeader: () => doc.font('Helvetica-Bold').fontSize(8),
        prepareRow: () => doc.font('Helvetica').fontSize(8),
    });

    doc.end();
  });
}
