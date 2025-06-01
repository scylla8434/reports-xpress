const PDFDocument = require('pdfkit');
const ExcelJS = require('exceljs');
const fs = require('fs');

// Generate PDF from data (with table formatting)
async function generatePDF(data, filePath, columns) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 30 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);
    doc.fontSize(18).text('Hotel Report', { align: 'center' });
    doc.moveDown();
    // Table header
    doc.fontSize(12).font('Helvetica-Bold');
    columns.forEach(col => doc.text(col.header, { continued: true, width: 100, align: 'left' }));
    doc.text('');
    doc.font('Helvetica');
    // Table rows
    data.forEach(row => {
      columns.forEach(col => doc.text(String(row[col.key] ?? ''), { continued: true, width: 100, align: 'left' }));
      doc.text('');
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
