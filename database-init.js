const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const bcrypt = require('bcryptjs');

const dbPath = path.join(__dirname, 'database.sqlite');

function initializeDatabase() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, (err) => {
      if (err) {
        console.error('Error opening database:', err);
        reject(err);
        return;
      }
    });

    db.serialize(() => {
      // Enable foreign keys
      db.run('PRAGMA foreign_keys = ON');

      // Create users table
      db.run(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password TEXT NOT NULL,
          role TEXT NOT NULL DEFAULT 'staff',
          email TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL
        )
      `, (err) => {
        if (err) {
          console.error('Error creating users table:', err);
          reject(err);
          return;
        }
        console.log('Users table created/verified');
      });

      // Create activity_logs table
      db.run(`
        CREATE TABLE IF NOT EXISTS activity_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER,
          username TEXT,
          action TEXT NOT NULL,
          table_name TEXT,
          record_id INTEGER,
          details TEXT,
          ip_address TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (user_id) REFERENCES users(id)
        )
      `, (err) => {
        if (err) {
          console.error('Error creating activity_logs table:', err);
          reject(err);
          return;
        }
        console.log('Activity logs table created/verified');
      });

      // Create amazon_sales table (if doesn't exist)
      db.run(`
        CREATE TABLE IF NOT EXISTS amazon_sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_name TEXT NOT NULL,
          category TEXT,
          price REAL DEFAULT 0,
          quantity INTEGER DEFAULT 0,
          sold INTEGER DEFAULT 0,
          sale_date DATE,
          asin TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL
        )
      `, (err) => {
        if (err) console.error('Error creating amazon_sales table:', err);
        else console.log('Amazon sales table created/verified');
      });

      // Create flipkart_sales table (if doesn't exist)
      db.run(`
        CREATE TABLE IF NOT EXISTS flipkart_sales (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          product_name TEXT NOT NULL,
          category TEXT,
          price REAL DEFAULT 0,
          quantity INTEGER DEFAULT 0,
          sold INTEGER DEFAULT 0,
          sale_date DATE,
          fnsku TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
          deleted_at DATETIME NULL
        )
      `, (err) => {
        if (err) console.error('Error creating flipkart_sales table:', err);
        else console.log('Flipkart sales table created/verified');
      });

      // Create indexes for better performance
      db.run('CREATE INDEX IF NOT EXISTS idx_users_username ON users(username)', (err) => {
        if (err) console.error('Error creating index:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id)', (err) => {
        if (err) console.error('Error creating index:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at)', (err) => {
        if (err) console.error('Error creating index:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_amazon_sales_date ON amazon_sales(sale_date)', (err) => {
        if (err) console.error('Error creating index:', err);
      });

      db.run('CREATE INDEX IF NOT EXISTS idx_flipkart_sales_date ON flipkart_sales(sale_date)', (err) => {
        if (err) console.error('Error creating index:', err);
      });

      // Create default admin user (password: admin123)
      db.get('SELECT COUNT(*) as count FROM users WHERE username = ?', ['admin'], async (err, row) => {
        if (err) {
          console.error('Error checking admin user:', err);
          db.close();
          reject(err);
          return;
        }

        if (row.count === 0) {
          const hashedPassword = await bcrypt.hash('admin123', 10);
          db.run(
            'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
            ['admin', hashedPassword, 'admin', 'admin@example.com'],
            (err) => {
              if (err) {
                console.error('Error creating admin user:', err);
                db.close();
                reject(err);
                return;
              }
              console.log('Default admin user created (username: admin, password: admin123)');
              
              // Create default staff user (password: staff123)
              const hashedStaffPassword = bcrypt.hashSync('staff123', 10);
              db.run(
                'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
                ['staff', hashedStaffPassword, 'staff', 'staff@example.com'],
                (err) => {
                  if (err) {
                    console.error('Error creating staff user:', err);
                  } else {
                    console.log('Default staff user created (username: staff, password: staff123)');
                  }
                  db.close();
                  resolve();
                }
              );
            }
          );
        } else {
          // Check if staff user exists
          db.get('SELECT COUNT(*) as count FROM users WHERE username = ?', ['staff'], async (err, staffRow) => {
            if (err) {
              console.error('Error checking staff user:', err);
              db.close();
              resolve();
              return;
            }

            if (staffRow.count === 0) {
              const hashedStaffPassword = bcrypt.hashSync('staff123', 10);
              db.run(
                'INSERT INTO users (username, password, role, email) VALUES (?, ?, ?, ?)',
                ['staff', hashedStaffPassword, 'staff', 'staff@example.com'],
                (err) => {
                  if (err) {
                    console.error('Error creating staff user:', err);
                  } else {
                    console.log('Default staff user created (username: staff, password: staff123)');
                  }
                  db.close();
                  resolve();
                }
              );
            } else {
              console.log('Admin and staff users already exist');
              db.close();
              resolve();
            }
          });
        }
      });
    });
  });
}

// Run initialization if called directly
if (require.main === module) {
  initializeDatabase()
    .then(() => {
      console.log('Database initialization completed');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Database initialization failed:', err);
      process.exit(1);
    });
}

module.exports = { initializeDatabase };

