const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');

// Generate PDF from data (with company profile and table formatting)
async function generatePDF(data, filePath, columns) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 40, size: 'A4' });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    // Company Profile Section
    doc
      .fontSize(22)
      .font('Helvetica-Bold')
      .text('denno', { align: 'center' })
      .moveDown(0.2)
      .fontSize(12)
      .font('Helvetica')
      .text('123 Main Street, Nairobi, Kenya', { align: 'center' })
      .text('Phone: +254 746711570 | Email: info@denno.co.ke', { align: 'center' })
      .moveDown(1.5);

    // Report Title and Date
    doc
      .fontSize(16)
      .font('Helvetica-Bold')
      .text('Reservation Report', { align: 'center' })
      .moveDown(0.5)
      .fontSize(10)
      .font('Helvetica')
      .text(`Generated: ${new Date().toLocaleString()}`, { align: 'center' })
      .moveDown(1.5);

    // Table Header
    const tableTop = doc.y;
    const colWidths = columns.map(() => 110 / columns.length * 5); // auto width
    let x = doc.page.margins.left;
    doc.font('Helvetica-Bold').fontSize(11);
    columns.forEach((col, i) => {
      doc.text(col.header, x, tableTop, { width: colWidths[i], align: 'left' });
      x += colWidths[i];
    });
    doc.moveDown(0.5);
    doc.font('Helvetica').fontSize(10);

    // Table Rows
    let rowY = tableTop + 20;
    data.forEach(row => {
      let x = doc.page.margins.left;
      columns.forEach((col, i) => {
        let value = row[col.key] ?? '';
        // Format date columns for better readability
        if ((col.key === 'check_in' || col.key === 'check_out') && value) {
          try {
            value = new Date(value).toLocaleDateString('en-KE', {
              year: 'numeric', month: 'short', day: '2-digit'
            });
          } catch (e) {}
        }
        doc.text(String(value), x, rowY, { width: colWidths[i], align: 'left' });
        x += colWidths[i];
      });
      rowY += 18;
      if (rowY > doc.page.height - doc.page.margins.bottom - 40) {
        doc.addPage();
        rowY = doc.page.margins.top;
      }
    });

    doc.end();
    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
}

// Generate Excel from data (with headers)
async function generateExcel(data, filePath, columns) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet('Report');
  worksheet.columns = columns;
  data.forEach(row => worksheet.addRow(row));
  await workbook.xlsx.writeFile(filePath);
  return filePath;
}

// Helper to build SQL and columns based on report type and filters
function getReportConfig(type, filters) {
  let sql = '';
  let params = [];
  let columns = [];
  switch (type) {
    case 'daily':
      sql = 'SELECT * FROM reservations WHERE DATE(check_in) = ?';
      params = [filters.date];
      columns = [
        { header: 'ID', key: 'id' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Room', key: 'room_number' },
        { header: 'Check In', key: 'check_in' },
        { header: 'Check Out', key: 'check_out' },
      ];
      break;
    case 'monthly':
      sql = 'SELECT * FROM reservations WHERE MONTH(check_in) = ? AND YEAR(check_in) = ?';
      params = [filters.month, filters.year];
      columns = [
        { header: 'ID', key: 'id' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Room', key: 'room_number' },
        { header: 'Check In', key: 'check_in' },
        { header: 'Check Out', key: 'check_out' },
      ];
      break;
    case 'by-customer':
      sql = 'SELECT * FROM reservations WHERE customer_name LIKE ?';
      params = [`%${filters.customer}%`];
      columns = [
        { header: 'ID', key: 'id' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Room', key: 'room_number' },
        { header: 'Check In', key: 'check_in' },
        { header: 'Check Out', key: 'check_out' },
      ];
      break;
    default:
      sql = 'SELECT * FROM reservations';
      columns = [
        { header: 'ID', key: 'id' },
        { header: 'Customer', key: 'customer_name' },
        { header: 'Room', key: 'room_number' },
        { header: 'Check In', key: 'check_in' },
        { header: 'Check Out', key: 'check_out' },
      ];
  }
  return { sql, params, columns };
}

module.exports = { generatePDF, generateExcel, getReportConfig };
