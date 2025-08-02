const sqlite3 = require('sqlite3').verbose();
const path = require('path');

class DatabaseOperations {
    constructor(dbPath) {
        this.db = new sqlite3.Database(dbPath || path.join(__dirname, 'database.sqlite'), (err) => {
            if (err) {
                console.error('Error opening database:', err);
            } else {
                console.log('Connected to SQLite database');
            }
        });
    }

    executeQuery(query, params = []) {
        return new Promise((resolve, reject) => {
            this.db.all(query, params, (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getTables() {
        return new Promise((resolve, reject) => {
            const query = "SELECT name FROM sqlite_master WHERE type='table'";
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows.map(row => row.name));
                }
            });
        });
    }

    getTableInfo(tableName) {
        return new Promise((resolve, reject) => {
            const query = `PRAGMA table_info(${tableName})`;
            this.db.all(query, [], (err, rows) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(rows);
                }
            });
        });
    }

    getById(tableName, id) {
        return new Promise((resolve, reject) => {
            const query = `SELECT * FROM ${tableName} WHERE id = ?`;
            this.db.get(query, [id], (err, row) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(row);
                }
            });
        });
    }

    getAll(tableName, page = 1, limit = 10, searchQuery = '') {
        return new Promise(async (resolve, reject) => {
            try {
                const offset = (page - 1) * limit;
                let whereClause = '';
                let countWhereClause = '';

                if (searchQuery) {
                    const columns = await this.getTableInfo(tableName);
                    const searchConditions = columns
                        .map(col => `${col.name} LIKE '%${searchQuery}%'`)
                        .join(' OR ');
                    whereClause = `WHERE ${searchConditions}`;
                    countWhereClause = whereClause;
                }

                const countQuery = `SELECT COUNT(*) as count FROM ${tableName} ${countWhereClause}`;
                const dataQuery = `SELECT * FROM ${tableName} ${whereClause} LIMIT ${limit} OFFSET ${offset}`;

                this.db.get(countQuery, [], (err, countRow) => {
                    if (err) {
                        reject(err);
                        return;
                    }

                    this.db.all(dataQuery, [], (err, rows) => {
                        if (err) {
                            reject(err);
                            return;
                        }

                        resolve({
                            total: countRow.count,
                            data: rows
                        });
                    });
                });
            } catch (error) {
                reject(error);
            }
        });
    }

    insert(tableName, data) {
        return new Promise((resolve, reject) => {
            const columns = Object.keys(data);
            const values = Object.values(data);
            const placeholders = new Array(values.length).fill('?').join(',');

            const query = `INSERT INTO ${tableName} (${columns.join(',')}) VALUES (${placeholders})`;

            this.db.run(query, values, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.lastID);
                }
            });
        });
    }

    update(tableName, id, data) {
        return new Promise((resolve, reject) => {
            const setClause = Object.keys(data)
                .map(key => `"${key}" = ?`)
                .join(',');
            const values = [...Object.values(data), id];

            const query = `UPDATE ${tableName} SET ${setClause} WHERE id = ?`;

            console.log('[DB Update Debug] Query:', query);
            console.log('[DB Update Debug] Values:', values);

            this.db.run(query, values, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    delete(tableName, id) {
        return new Promise((resolve, reject) => {
            const query = `DELETE FROM ${tableName} WHERE id = ?`;

            this.db.run(query, [id], function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve(this.changes);
                }
            });
        });
    }

    close() {
        return new Promise((resolve, reject) => {
            this.db.close((err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve();
                }
            });
        });
    }
}

module.exports = DatabaseOperations; 