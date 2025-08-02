// electron.js
const { app, BrowserWindow, ipcMain, dialog } = require("electron");
const path = require("path");
const sqlite3 = require("sqlite3").verbose();
const fs = require('fs');
const xlsx = require('xlsx');
const FileConverter = require('./converter.js');
const os = require('os');

function createWindow() {
  const win = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, "preload.js"),
    },
  });

  // Load local HTML (for production)
  //   win.loadFile(path.join(__dirname, 'dist', 'index.html'));

  // OR: Load Vite dev server (for development)
  win.loadURL("http://localhost:5173");
}

app.whenReady().then(() => {
  createWindow();

  // IPC handler to add Expected Stock column to Amazon table
  ipcMain.handle("add-expected-stock-column", async () => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      // Check if the column already exists
      db.all("PRAGMA table_info(amazon)", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Check if Expected_stock column already exists
        const columnExists = rows.some(row => row.name === 'Expected_stock');
        
        if (!columnExists) {
          // Add the Expected Stock column if it doesn't exist
          const sql = `ALTER TABLE amazon ADD COLUMN Expected_stock INTEGER DEFAULT 0`;
          
          db.run(sql, [], function (err) {
            if (err) {
              console.error("Error adding column:", err.message);
              reject(err);
            } else {
              resolve({
                success: true,
                message: "Expected Stock column added successfully",
              });
            }
          });
        } else {
          resolve({
            success: true,
            message: "Expected Stock column already exists",
          });
        }
      });

      db.close();
    });
  });

  // IPC handler to add f_expectedstock column to Amazon table
  ipcMain.handle("add-f-expectedstock-column", async () => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      // Check if the column already exists
      db.all("PRAGMA table_info(amazon)", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Check if f_expectedstock column already exists
        const columnExists = rows.some(row => row.name === 'f_expectedstock');
        
        if (!columnExists) {
          // Add the f_expectedstock column if it doesn't exist
          const sql = `ALTER TABLE amazon ADD COLUMN f_expectedstock INTEGER DEFAULT 0`;
          
          db.run(sql, [], function (err) {
            if (err) {
              console.error("Error adding column:", err.message);
              reject(err);
            } else {
              resolve({
                success: true,
                message: "f_expectedstock column added successfully",
              });
            }
          });
        } else {
          resolve({
            success: true,
            message: "f_expectedstock column already exists",
          });
        }
      });

      db.close();
    });
  });

  // IPC handler to add A_recommanded column to Amazon table
  ipcMain.handle("add-a-recommanded-column", async () => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      // Check if the column already exists
      db.all("PRAGMA table_info(amazon)", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Check if A_recommanded column already exists
        const columnExists = rows.some(row => row.name === 'A_recommanded');
        
        if (!columnExists) {
          // Add the A_recommanded column if it doesn't exist
          const sql = `ALTER TABLE amazon ADD COLUMN A_recommanded INTEGER DEFAULT 0`;
          
          db.run(sql, [], function (err) {
            if (err) {
              console.error("Error adding column:", err.message);
              reject(err);
            } else {
              resolve({
                success: true,
                message: "A_recommanded column added successfully",
              });
            }
          });
        } else {
          resolve({
            success: true,
            message: "A_recommanded column already exists",
          });
        }
      });

      db.close();
    });
  });

  // IPC handler to add F_recommanded column to Amazon table
  ipcMain.handle("add-f-recommanded-column", async () => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      // Check if the column already exists
      db.all("PRAGMA table_info(amazon)", [], (err, rows) => {
        if (err) {
          reject(err);
          return;
        }

        // Check if F_recommanded column already exists
        const columnExists = rows.some(row => row.name === 'F_recommanded');
        
        if (!columnExists) {
          // Add the F_recommanded column if it doesn't exist
          const sql = `ALTER TABLE amazon ADD COLUMN F_recommanded INTEGER DEFAULT 0`;
          
          db.run(sql, [], function (err) {
            if (err) {
              console.error("Error adding column:", err.message);
              reject(err);
            } else {
              resolve({
                success: true,
                message: "F_recommanded column added successfully",
              });
            }
          });
        } else {
          resolve({
            success: true,
            message: "F_recommanded column already exists",
          });
        }
      });

      db.close();
    });
  });

  // IPC handler to get data from a specific table
  ipcMain.handle("get-table-data", async (event, tableName) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READONLY,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
        if (err) {
          reject(err);
        }
        resolve(rows);
      });

      db.close();
    });
  });

  // IPC handler to get all table names
  ipcMain.handle("get-table-names", async () => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READONLY,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      db.all(
        "SELECT name FROM sqlite_master WHERE type='table'",
        [],
        (err, rows) => {
          if (err) {
            reject(err);
          }
          resolve(rows.map((row) => row.name));
        }
      );

      db.close();
    });
  });

  // IPC handler to update a row in a specific table
  ipcMain.handle("update-table-row", async (event, tableName, id, data) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );

      const columns = Object.keys(data).filter((key) => key !== "key"); // Exclude the 'key' added by Ant Design
      const setClauses = columns.map((col) => `\`${col}\` = ?`).join(", ");
      const values = columns.map((col) => data[col]);
      values.push(id); // The last value is for the WHERE clause

      const sql = `UPDATE ${tableName} SET ${setClauses} WHERE \`id\` = ?`;

      console.log("Executing SQL:", sql);
      console.log("With values:", values);

      db.run(sql, values, function (err) {
        if (err) {
          console.error(err.message);
          reject(err);
        }
        resolve({ changes: this.changes });
      });

      db.close();
    });
  });

  // IPC handler to get Amazon inventory report (join amazon and inventory)
  ipcMain.handle("get-amazon-inventory-report", async () => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READONLY,
        (err) => {
          if (err) {
            console.error(err.message);
            reject(err);
          }
        }
      );
      // Join amazon, inventory, and sales (summed by ASIN) with Expected Stock and A_recommanded
      const sql = `
        SELECT
          a.id,
          a.[Item Name] as item_name,
          a.ASIN as asin,
          a.amazon_sales,
          i.total_stock as ending_warehouse_stock,
          COALESCE(NULLIF(a.Expected_stock, ''), 0) as Expected_stock,
          COALESCE(NULLIF(a.A_recommanded, ''), 0) as A_recommanded,
          (i.total_stock - CAST(COALESCE(a.amazon_sales, '0') AS INTEGER)) as remaining_stock,
          s.total_sales as total_sales
        FROM
          (SELECT * FROM amazon GROUP BY ASIN) a
        LEFT JOIN
          (SELECT ASIN, SUM(CAST([Ending_Warehouse_Balance] AS INTEGER)) as total_stock FROM inventory GROUP BY ASIN) i
        ON a.ASIN = i.ASIN
        LEFT JOIN
          (SELECT Asin, SUM(CAST(Quantity AS INTEGER)) as total_sales FROM sales GROUP BY Asin) s
        ON a.ASIN = s.Asin
      `;
      db.all(sql, [], (err, rows) => {
        if (err) {
          reject(err);  
        }
        resolve(rows);
      });
      db.close();
    });
  });

  ipcMain.handle('get-flipkart-filtered-data', async () => {
    try {
      const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), sqlite3.OPEN_READONLY);
      
      // Join amazon and flipkart_stock tables and sum stock quantities by FNSKU
      const sql = `
        SELECT 
          a.[Item Name] as item_name,
          a.FNSKU as fnsku,
          a.[Flipkart Sales] as flipkart_sales,
          COALESCE(SUM(fs.stock_quantity), 0) as stock_quantity,
          (COALESCE(SUM(fs.stock_quantity), 0) - CAST(COALESCE(a.[Flipkart Sales], '0') AS REAL)) as remaining_stock,
          COALESCE(NULLIF(a.f_expectedstock, ''), 0) as f_expectedstock,
          COALESCE(NULLIF(a.F_recommanded, ''), 0) as F_recommanded
        FROM amazon a
        LEFT JOIN (
          SELECT fsn, SUM(stock_quantity) as stock_quantity
          FROM flipkart_stock 
          GROUP BY fsn
        ) fs ON a.FSN = fs.fsn
        WHERE a.FNSKU IS NOT NULL AND a.FNSKU != ''
        GROUP BY a.FNSKU, a.[Item Name], a.[Flipkart Sales], a.f_expectedstock, a.F_recommanded
      `;
      
      const result = await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const formattedResult = rows.map((row, idx) => ({
              key: idx.toString(),
              item_name: row.item_name || '',
              fnsku: row.fnsku || '',
              flipkart_sales: parseFloat(row.flipkart_sales || '0'),
              stock_quantity: parseInt(row.stock_quantity || '0', 10),
              remaining_stock: parseFloat(row.remaining_stock || '0'),
              f_expectedstock: parseInt(row.f_expectedstock || '0', 10),
              F_recommanded: parseInt(row.F_recommanded || '0', 10)
            }));
            resolve(formattedResult);
          }
        });
      });

      db.close();
      return result;
    } catch (err) {
      console.error('Error in get-flipkart-filtered-data:', err);
      throw err;
    }
  });

  // IPC handler to get Flipkart data with merged items by FNSKU
  ipcMain.handle('get-flipkart-merged-data', async () => {
    try {
      const db = new sqlite3.Database(path.join(__dirname, 'database.sqlite'), sqlite3.OPEN_READONLY);
      
      // Query to merge items with same FNSKU and sum their quantities
      const sql = `
        SELECT 
          a.FNSKU as fnsku,
          a.[Item Name] as item_name,
          SUM(CAST(COALESCE(a.[Flipkart Sales], '0') AS REAL)) as total_flipkart_sales,
          COALESCE(SUM(fs.stock_quantity), 0) as total_stock_quantity,
          (COALESCE(SUM(fs.stock_quantity), 0) - SUM(CAST(COALESCE(a.[Flipkart Sales], '0') AS REAL))) as total_remaining_stock,
          COALESCE(NULLIF(a.f_expectedstock, ''), 0) as f_expectedstock,
          COALESCE(NULLIF(a.F_recommanded, ''), 0) as F_recommanded
        FROM amazon a
        LEFT JOIN (
          SELECT fsn, SUM(stock_quantity) as stock_quantity
          FROM flipkart_stock 
          GROUP BY fsn
        ) fs ON a.FSN = fs.fsn
        WHERE a.FNSKU IS NOT NULL AND a.FNSKU != ''
        GROUP BY a.FNSKU, a.[Item Name], a.f_expectedstock, a.F_recommanded
        ORDER BY total_flipkart_sales DESC
      `;
      
      const result = await new Promise((resolve, reject) => {
        db.all(sql, [], (err, rows) => {
          if (err) {
            reject(err);
          } else {
            const formattedResult = rows.map((row, idx) => ({
              key: idx.toString(),
              fnsku: row.fnsku || '',
              item_name: row.item_name || '',
              total_flipkart_sales: parseFloat(row.total_flipkart_sales || '0'),
              total_stock_quantity: parseInt(row.total_stock_quantity || '0', 10),
              total_remaining_stock: parseFloat(row.total_remaining_stock || '0'),
              f_expectedstock: parseInt(row.f_expectedstock || '0', 10),
              F_recommanded: parseInt(row.F_recommanded || '0', 10)
            }));
            resolve(formattedResult);
          }
        });
      });

      db.close();
      return result;
    } catch (err) {
      console.error('Error in get-flipkart-merged-data:', err);
      throw err;
    }
  });

  ipcMain.handle("update-amazon-expected-stock-by-fnsku", async (event, fnsku, expectedStock) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => { if (err) reject(err); }
      );
      const sql = "UPDATE amazon SET `Expected_stock` = ? WHERE `FNSKU` = ?";
      db.run(sql, [expectedStock, fnsku], function (err) {
        if (err) reject(err);
        resolve({ changes: this.changes });
      });
      db.close();
    });
  });

  ipcMain.handle("update-amazon-f-expectedstock-by-fnsku", async (event, fnsku, fExpectedStock, fRecommended) => {
    return new Promise((resolve, reject) => {
      const db = new sqlite3.Database(
        path.join(__dirname, "database.sqlite"),
        sqlite3.OPEN_READWRITE,
        (err) => { if (err) reject(err); }
      );
      const sql = "UPDATE amazon SET `f_expectedstock` = ?, `F_recommanded` = ? WHERE `FNSKU` = ?";
      db.run(sql, [fExpectedStock, fRecommended, fnsku], function (err) {
        if (err) reject(err);
        resolve({ changes: this.changes });
      });
      db.close();
    });
  });

  // IPC handler to convert XLSX to DB
  ipcMain.handle('convert-xlsx-to-db', async (event, filePath, tableName) => {
    try {
      const { importXlsxToDb } = require('./src/fileConverter/index.js');
      const result = await importXlsxToDb(filePath, tableName);
      return result;
    } catch (err) {
      return 'Error: ' + err.message;
    }
  });

  // IPC handler to convert CSV to DB
  ipcMain.handle('convert-csv-to-db', async (event, filePath, tableName) => {
    try {
      const { importCsvToDb } = require('./src/fileConverter/index.js');
      const result = await importCsvToDb(filePath, tableName);
      return result;
    } catch (err) {
      return 'Error: ' + err.message;
    }
  });

  ipcMain.handle('convert-file', async (event, fileObj) => {
    try {
      // Write file data to a temp file
      const tempDir = os.tmpdir();
      const tempFilePath = path.join(tempDir, `${Date.now()}_${fileObj.fileName}`);
      fs.writeFileSync(tempFilePath, Buffer.from(fileObj.fileData));

      const converter = new FileConverter();
      await converter.init(path.join(__dirname, 'database.sqlite'));
      let result;
      if (fileObj.fileType === 'csv') {
        result = await converter.convertCSVToSQLite(tempFilePath, fileObj.tableName);
      } else {
        result = await converter.convertXLSXToSQLite(tempFilePath, fileObj.tableName);
      }
      await converter.close();
      fs.unlinkSync(tempFilePath); // Clean up temp file
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  });

  // IPC handler to export selected rows to Excel
  ipcMain.handle('export-selected-rows-to-excel', async (event, selectedRows, filterMode) => {
    try {
      if (!selectedRows || selectedRows.length === 0) {
        return { success: false, error: 'No rows selected' };
      }

      // Create workbook and worksheet
      const workbook = xlsx.utils.book_new();
      
      // Prepare data for Excel
      const excelData = selectedRows.map(row => {
        if (filterMode === 'amazon') {
          return {
            'Item Name': row.item_name || '',
            'ASIN': row.asin || '',
            'Amazon Sales': row.amazon_sales || 0,
            'Warehouse Stock': row.ending_warehouse_stock || row.warehouse_stock || row.total_stock || 0,
            'Remaining Stock': row.remaining_stock || 0,
            'Expected Stock': row.Expected_stock || 0,
            'A_Recommended': row.A_recommanded || 0
          };
        } else if (filterMode === 'flipkart') {
          return {
            'Item Name': row.item_name || '',
            'FNSKU': row.fnsku || '',
            'Flipkart Sales': row.flipkart_sales || 0,
            'Stock Quantity': row.stock_quantity || 0,
            'Remaining Stock': row.remaining_stock || 0,
            'f_expectedstock': row.f_expectedstock || 0,
            'F_Recommended': row.F_recommanded || 0
          };
        } else if (filterMode === 'flipkart_merged') {
          return {
            'FNSKU': row.fnsku || '',
            'Item Name': row.item_name || '',
            'Total Sales': row.total_flipkart_sales || 0,
            'Total Stock': row.total_stock_quantity || 0,
            'Remaining Stock': row.total_remaining_stock || 0,
            'f_expectedstock': row.f_expectedstock || 0,
            'F_Recommended': row.F_recommanded || 0
          };
        }
        return row;
      });

      // Create worksheet
      const worksheet = xlsx.utils.json_to_sheet(excelData);
      
      // Set column widths
      let columnWidths;
      if (filterMode === 'amazon') {
        columnWidths = [
          { wch: 30 }, // Item Name
          { wch: 15 }, // ASIN
          { wch: 15 }, // Amazon Sales
          { wch: 18 }, // Warehouse Stock
          { wch: 18 }, // Remaining Stock
          { wch: 15 }, // Expected Stock
          { wch: 15 }  // A_Recommended
        ];
      } else if (filterMode === 'flipkart') {
        columnWidths = [
          { wch: 30 }, // Item Name
          { wch: 15 }, // FNSKU
          { wch: 15 }, // Flipkart Sales
          { wch: 15 }, // Stock Quantity
          { wch: 18 }, // Remaining Stock
          { wch: 15 }, // f_expectedstock
          { wch: 15 }  // F_Recommended
        ];
      } else if (filterMode === 'flipkart_merged') {
        columnWidths = [
          { wch: 15 }, // FNSKU
          { wch: 30 }, // Item Name
          { wch: 15 }, // Total Sales
          { wch: 15 }, // Total Stock
          { wch: 18 }, // Remaining Stock
          { wch: 15 }, // f_expectedstock
          { wch: 15 }  // F_Recommended
        ];
      }
      
      worksheet['!cols'] = columnWidths;

      // Add worksheet to workbook
      let sheetName;
      if (filterMode === 'amazon') {
        sheetName = 'Amazon_Data';
      } else if (filterMode === 'flipkart') {
        sheetName = 'Flipkart_Data';
      } else if (filterMode === 'flipkart_merged') {
        sheetName = 'Flipkart_Merged_Data';
      }
      xlsx.utils.book_append_sheet(workbook, worksheet, sheetName);

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
      const fileName = `${filterMode}_selected_data_${timestamp}.xlsx`;
      
      // Get downloads folder path
      const downloadsPath = path.join(os.homedir(), 'Downloads');
      const filePath = path.join(downloadsPath, fileName);

      // Write file
      xlsx.writeFile(workbook, filePath);

      return { 
        success: true, 
        filePath: filePath,
        fileName: fileName,
        rowCount: selectedRows.length
      };
    } catch (error) {
      console.error('Error exporting to Excel:', error);
      return { success: false, error: error.message };
    }
  });

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
