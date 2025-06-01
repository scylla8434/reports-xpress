const express = require('express');
const { query } = require('./db');
const { generatePDF, generateExcel, getReportConfig } = require('./reportHelpers');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Enhanced: /report/:format/:type? (e.g. /report/pdf/daily?date=2025-06-01)
app.get('/report/:format/:type?', async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
