const express = require('express');
const { query } = require('./db');
const { generatePDF, generateExcel, getReportConfig } = require('./reportHelpers');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced: /report/:format/:type (e.g. /report/pdf/daily?date=2025-06-01)
app.get('/report/:format/:type', async (req, res) => {
  const { format, type } = req.params; // format: pdf or excel, type: daily, monthly, by-customer, etc.
  const filters = req.query;
  try {
    const { sql, params, columns } = getReportConfig(type, filters);
    const data = await query(sql, params);
    const fileName = `report_${type || 'all'}_${Date.now()}.${format === 'pdf' ? 'pdf' : 'xlsx'}`;
    const filePath = path.join(__dirname, fileName);
    if (format === 'pdf') {
      await generatePDF(data, filePath, columns);
      res.download(filePath, fileName, () => fs.unlinkSync(filePath));
    } else if (format === 'excel') {
      await generateExcel(data, filePath, columns);
      res.download(filePath, fileName, () => fs.unlinkSync(filePath));
    } else {
      res.status(400).send('Invalid report format. Use pdf or excel.');
    }
  } catch (err) {
    res.status(500).send('Error generating report: ' + err.message);
  }
});

// Preview PDF in browser 
app.get('/preview-sample-pdf', async (req, res) => {
  // Sample data
  const columns = [
    { header: 'ID', key: 'id' },
    { header: 'Customer', key: 'customer_name' },
    { header: 'Room', key: 'room_number' },
    { header: 'Check In', key: 'check_in' },
    { header: 'Check Out', key: 'check_out' },
  ];
  const data = [
    { id: 1, customer_name: 'John Doe', room_number: '101', check_in: '2025-06-01', check_out: '2025-06-03' },
    { id: 2, customer_name: 'Jane Smith', room_number: '102', check_in: '2025-06-02', check_out: '2025-06-04' },
    { id: 3, customer_name: 'Alice Brown', room_number: '103', check_in: '2025-06-03', check_out: '2025-06-05' },
  ];
  const filePath = path.join(__dirname, 'sample_report.pdf');
  await generatePDF(data, filePath, columns);
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'inline; filename=sample_report.pdf');
  const stream = fs.createReadStream(filePath);
  stream.pipe(res);
  stream.on('end', () => fs.unlinkSync(filePath));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
