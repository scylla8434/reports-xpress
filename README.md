most ni self explanatory,,,
kuna hiyo option ya jaspersoft yenye nilkushow, but i think ni "complicated" ju sijawork nayo ikiwa in connectiin na node

## Project Structure

```
.
├── db.js               # MySQL connection helper
├── reportHelpers.js    # PDF/Excel generation and report config
├── server.js           # Express server and API endpoints
├── .env                # Environment variables (MySQL credentials)
└── package.json        # Project dependencies
```

---

## si unaelewa kusetup (the is node), which ushafanya anyway

### 1. Install Dependencies


### 2. Configure Database Connection

change `.env` ikuwe na MySQL credentials zako


### 3. hizo tables unazijua better
refer kwa `.reportshelper.js`


- **General format:**
  - `/report/:format/:type?`  
    - `:format` = `pdf` or `excel`
    - `:type` = `daily`, `monthly`, `by-customer`, `by-room`, or omit for all
    - Query parameters for filtering



## How It Works

1. **API receives a request** for a report with format, type, and filters.
2. **SQL query and columns** are selected based on the report type and filters.
3. **Data is fetched** from the MySQL database.
4. **PDF or Excel file is generated** with professional formatting (headers, tables).
5. **File is sent to the user** for download, then deleted from the server.

---

## Adding or Customizing Report Types

change ama edit `getReportConfig` function kwa `reportHelpers.js` kuongeza type ya report ama column. hii ilikuwa tu example,,,
```js
case 'by-room':
  sql = 'SELECT * FROM reservations WHERE room_number = ?';
  params = [filters.room];
  columns = [
    { header: 'ID', key: 'id' },
    { header: 'Customer', key: 'customer_name' },
    { header: 'Room', key: 'room_number' },
    { header: 'Check In', key: 'check_in' },
    { header: 'Check Out', key: 'check_out' },
  ];
  break;
```


## Dependencies

- [Express](https://expressjs.com/) - Web framework
- [mysql2](https://www.npmjs.com/package/mysql2) - MySQL client
- [pdfkit](https://www.npmjs.com/package/pdfkit) - PDF generation
- [exceljs](https://www.npmjs.com/package/exceljs) - Excel (XLSX) generation
- [dotenv](https://www.npmjs.com/package/dotenv) - Environment variables


