// FILE CONVERTER MODULE
// Converts .xlsx and .csv files into database.sqlite

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const xlsx = require('xlsx');
const csv = require('csv-parser');

const DB_PATH = path.resolve(__dirname, '../../database.sqlite');

function importXlsxToDb(xlsxFilePath, tableName) {
  const workbook = xlsx.readFile(xlsxFilePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet);
  return insertDataToDb(data, tableName);
}

function importCsvToDb(csvFilePath, tableName) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(csvFilePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        insertDataToDb(results, tableName).then(resolve).catch(reject);
      })
      .on('error', reject);
  });
}

function insertDataToDb(data, tableName) {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH);
    if (!data.length) {
      db.close();
      return resolve('No data to import');
    }
    // Create table if not exists
    const columns = Object.keys(data[0]);
    const createTableSql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columns.map(col => `${col} TEXT`).join(', ')})`;
    db.run(createTableSql, (err) => {
      if (err) {
        db.close();
        return reject(err);
      }
      // Insert data
      const placeholders = columns.map(() => '?').join(', ');
      const insertSql = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
      const stmt = db.prepare(insertSql);
      data.forEach(row => {
        stmt.run(columns.map(col => row[col]));
      });
      stmt.finalize((err) => {
        db.close();
        if (err) return reject(err);
        resolve('Import successful');
      });
    });
  });
}

module.exports = {
  importXlsxToDb,
  importCsvToDb
};
