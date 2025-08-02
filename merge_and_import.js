// const fs = require('fs');
// const path = require('path');
// const xlsx = require('xlsx');
// const csv = require('csvtojson');
// const sqlite3 = require('sqlite3').verbose();

// // Directory containing the files
// const DATA_DIR = 'C:/Users/Admin/Desktop/electorn_app/requireddata/Flipkart/inv/M.P Stock';
// // Path to your SQLite database
// const DB_PATH = path.resolve(__dirname, 'database.sqlite');

// // Table name
// const TABLE_NAME = 'flipkart_stock';

// // Helper: Read all Excel and CSV files, return merged array of objects
// async function readAndMergeFiles(dir) {
//     const files = fs.readdirSync(dir);
//     let mergedData = [];
//     for (const file of files) {
//         const ext = path.extname(file).toLowerCase();
//         const filePath = path.join(dir, file);
//         if (ext === '.xlsx' || ext === '.xls') {
//             const workbook = xlsx.readFile(filePath);
//             const sheetName = workbook.SheetNames[0];
//             const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//             mergedData = mergedData.concat(data);
//         } else if (ext === '.csv') {
//             const data = await csv().fromFile(filePath);
//             mergedData = mergedData.concat(data);
//         }
//     }
//     return mergedData;
// }

// // Helper: Create table if not exists
// function createTableIfNotExists(db, columns) {
//     // Build CREATE TABLE statement dynamically
//     const cols = columns.map(col => `"${col}" TEXT`).join(', ');
//     const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (${cols})`;
//     db.run(sql);
// }

// // Helper: Insert data
// function insertData(db, columns, data) {
//     const placeholders = columns.map(() => '?').join(', ');
//     const stmt = db.prepare(`INSERT INTO ${TABLE_NAME} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`);
//     for (const row of data) {
//         const values = columns.map(col => row[col] || '');
//         stmt.run(values);
//     }
//     stmt.finalize();
// }

// // Additional: Import Shipment label print(3).xlsx into its own table
// function importShipmentLabelPrint(dbPath) {
//     const shipmentFile = path.resolve(__dirname, 'Shipment label print(3).xlsx');
//     if (!fs.existsSync(shipmentFile)) {
//         console.log('Shipment label print(3).xlsx not found. Skipping import.');
//         return;
//     }
//     const workbook = xlsx.readFile(shipmentFile);
//     const sheetName = workbook.SheetNames[0];
//     const data = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName]);
//     if (data.length === 0) {
//         console.log('No data found in Shipment label print(3).xlsx.');
//         return;
//     }
//     const columns = Array.from(new Set(data.flatMap(obj => Object.keys(obj))));
//     const TABLE_NAME = 'shipment_label_print_3';
//     const db = new sqlite3.Database(dbPath);
//     db.serialize(() => {
//         // Create table if not exists
//         const cols = columns.map(col => `"${col}" TEXT`).join(', ');
//         const sql = `CREATE TABLE IF NOT EXISTS ${TABLE_NAME} (${cols})`;
//         db.run(sql);
//         // Insert data
//         const placeholders = columns.map(() => '?').join(', ');
//         const stmt = db.prepare(`INSERT INTO ${TABLE_NAME} (${columns.map(c => `"${c}"`).join(', ')}) VALUES (${placeholders})`);
//         for (const row of data) {
//             const values = columns.map(col => row[col] || '');
//             stmt.run(values);
//         }
//         stmt.finalize();
//     });
//     db.close();
//     console.log('Shipment label print(3).xlsx imported into table shipment_label_print_3.');
// }

// (async () => {
//     try {
//         const mergedData = await readAndMergeFiles(DATA_DIR);
//         if (mergedData.length === 0) {
//             console.log('No data found in the files.');
//             return;
//         }
//         // Use all unique keys as columns
//         const columns = Array.from(new Set(mergedData.flatMap(obj => Object.keys(obj))));
//         const db = new sqlite3.Database(DB_PATH);
//         db.serialize(() => {
//             createTableIfNotExists(db, columns);
//             insertData(db, columns, mergedData);
//         });
//         db.close();
//         console.log('Data merged and inserted into SQLite successfully.');
//         // Import shipment label print file
//         importShipmentLabelPrint(DB_PATH);
//     } catch (err) {
//         console.error('Error:', err);
//     }
// })(); 