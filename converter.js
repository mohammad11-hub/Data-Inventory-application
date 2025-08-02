const XLSX = require('xlsx');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

class FileConverter {
    constructor() {
        this.db = null;
        // List of SQLite reserved keywords that need escaping
        this.sqliteKeywords = [
            'ABORT', 'ACTION', 'ADD', 'AFTER', 'ALL', 'ALTER', 'ANALYZE', 'AND', 'AS', 'ASC',
            'ATTACH', 'AUTOINCREMENT', 'BEFORE', 'BEGIN', 'BETWEEN', 'BY', 'CASCADE', 'CASE',
            'CAST', 'CHECK', 'COLLATE', 'COLUMN', 'COMMIT', 'CONFLICT', 'CONSTRAINT', 'CREATE',
            'CROSS', 'CURRENT_DATE', 'CURRENT_TIME', 'CURRENT_TIMESTAMP', 'DATABASE', 'DEFAULT',
            'DEFERRABLE', 'DEFERRED', 'DELETE', 'DESC', 'DETACH', 'DISTINCT', 'DROP', 'EACH',
            'ELSE', 'END', 'ESCAPE', 'EXCEPT', 'EXCLUSIVE', 'EXISTS', 'EXPLAIN', 'FAIL',
            'FOR', 'FOREIGN', 'FROM', 'FULL', 'GLOB', 'GROUP', 'HAVING', 'IF', 'IGNORE',
            'IMMEDIATE', 'IN', 'INDEX', 'INDEXED', 'INITIALLY', 'INNER', 'INSERT', 'INSTEAD',
            'INTERSECT', 'INTO', 'IS', 'ISNULL', 'JOIN', 'KEY', 'LEFT', 'LIKE', 'LIMIT',
            'MATCH', 'NATURAL', 'NO', 'NOT', 'NOTNULL', 'NULL', 'OF', 'OFFSET', 'ON',
            'OR', 'ORDER', 'OUTER', 'PLAN', 'PRAGMA', 'PRIMARY', 'QUERY', 'RAISE',
            'RECURSIVE', 'REFERENCES', 'REGEXP', 'REINDEX', 'RELEASE', 'RENAME', 'REPLACE',
            'RESTRICT', 'RIGHT', 'ROLLBACK', 'ROW', 'SAVEPOINT', 'SELECT', 'SET',
            'TABLE', 'TEMP', 'TEMPORARY', 'THEN', 'TO', 'TRANSACTION', 'TRIGGER', 'UNION',
            'UNIQUE', 'UPDATE', 'USING', 'VACUUM', 'VALUES', 'VIEW', 'VIRTUAL', 'WHEN',
            'WHERE', 'WITH', 'WITHOUT'
        ];
    }

    escapeColumnName(columnName) {
        // Convert column name to uppercase for case-insensitive comparison
        const upperColumnName = columnName.toUpperCase();
        // Check if it's a reserved keyword or contains special characters
        if (this.sqliteKeywords.includes(upperColumnName) || /[^a-zA-Z0-9_]/.test(columnName)) {
            return `[${columnName}]`; // Wrap in square brackets for SQLite escaping
        }
        return columnName;
    }

    async init(dbPath) {
        await this.openDatabase(dbPath);
    }

    openDatabase(dbPath) {
        return new Promise((resolve, reject) => {
            this.db = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    console.error('Error opening database:', err);
                    reject(err);
                } else {
                    resolve(true);
                }
            });
        });
    }

    closeDatabase() {
        return new Promise((resolve, reject) => {
            if (this.db) {
                this.db.close((err) => {
                    if (err) {
                        reject(err);
                    } else {
                        this.db = null;
                        resolve();
                    }
                });
            } else {
                resolve();
            }
        });
    }

    async convertCSVToSQLite(csvPath, tableName) {
        try {
            // Read CSV file using XLSX
            const workbook = XLSX.readFile(csvPath, { raw: true });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                throw new Error('No data found in CSV file');
            }

            // Create table with escaped column names
            const columns = Object.keys(data[0]);
            const escapedColumns = columns.map(col => this.escapeColumnName(col));
            const createTableSql = `CREATE TABLE IF NOT EXISTS [${tableName}] (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ${escapedColumns.map(col => `${col} TEXT`).join(', ')}
            )`;

            await this.runQuery(createTableSql);

            // Insert data with escaped column names
            const insertSql = `INSERT INTO [${tableName}] (${escapedColumns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
            const stmt = this.db.prepare(insertSql);

            return new Promise((resolve, reject) => {
                this.db.serialize(() => {
                    this.db.run('BEGIN TRANSACTION');
                    
                    let rowsProcessed = 0;
                    data.forEach(row => {
                        stmt.run(...columns.map(col => row[col]));
                        rowsProcessed++;
                    });

                    this.db.run('COMMIT', (err) => {
                        stmt.finalize();
                        
                        if (err) {
                            console.error('Error committing transaction:', err);
                            reject(err);
                        } else {
                            resolve({
                                success: true,
                                rowsProcessed,
                                message: `Successfully imported ${rowsProcessed} rows into ${tableName}`
                            });
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error converting CSV to SQLite:', error);
            throw error;
        }
    }

    async convertXLSXToSQLite(excelPath, tableName) {
        try {
            // Read Excel file
            const workbook = XLSX.readFile(excelPath);
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);

            if (data.length === 0) {
                throw new Error('No data found in Excel file');
            }

            // Create table with escaped column names
            const columns = Object.keys(data[0]);
            const escapedColumns = columns.map(col => this.escapeColumnName(col));
            const createTableSql = `CREATE TABLE IF NOT EXISTS [${tableName}] (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                ${escapedColumns.map(col => `${col} TEXT`).join(', ')}
            )`;

            await this.runQuery(createTableSql);

            // Insert data with escaped column names
            const insertSql = `INSERT INTO [${tableName}] (${escapedColumns.join(', ')}) VALUES (${columns.map(() => '?').join(', ')})`;
            const stmt = this.db.prepare(insertSql);

            return new Promise((resolve, reject) => {
                this.db.serialize(() => {
                    this.db.run('BEGIN TRANSACTION');
                    
                    let rowsProcessed = 0;
                    data.forEach(row => {
                        stmt.run(...columns.map(col => row[col]));
                        rowsProcessed++;
                    });

                    this.db.run('COMMIT', (err) => {
                        stmt.finalize();
                        
                        if (err) {
                            console.error('Error committing transaction:', err);
                            reject(err);
                        } else {
                            resolve({
                                success: true,
                                rowsProcessed,
                                message: `Successfully imported ${rowsProcessed} rows into ${tableName}`
                            });
                        }
                    });
                });
            });
        } catch (error) {
            console.error('Error converting Excel to SQLite:', error);
            throw error;
        }
    }

    runQuery(sql, params = []) {
        return new Promise((resolve, reject) => {
            this.db.run(sql, params, function(err) {
                if (err) {
                    console.error('Error running query:', err);
                    reject(err);
                } else {
                    resolve(this);
                }
            });
        });
    }

    async close() {
        await this.closeDatabase();
    }
}

module.exports = FileConverter;