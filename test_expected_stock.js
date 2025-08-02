const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Test script to verify Expected_stock functionality
async function testExpectedStock() {
  const db = new sqlite3.Database(
    path.join(__dirname, "database.sqlite"),
    sqlite3.OPEN_READWRITE,
    (err) => {
      if (err) {
        console.error("Error opening database:", err.message);
        return;
      }
      console.log("Database opened successfully");
    }
  );

  try {
    // Test 1: Check if Expected_stock column exists
    console.log("\n=== Test 1: Checking Expected_stock column ===");
    const columns = await new Promise((resolve, reject) => {
      db.all("PRAGMA table_info(amazon)", [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    const expectedStockColumn = columns.find(col => col.name === 'Expected_stock');
    if (expectedStockColumn) {
      console.log("✅ Expected_stock column exists");
    } else {
      console.log("❌ Expected_stock column does not exist");
      // Add the column if it doesn't exist
      await new Promise((resolve, reject) => {
        db.run("ALTER TABLE amazon ADD COLUMN Expected_stock INTEGER DEFAULT 0", [], (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
      console.log("✅ Added Expected_stock column");
    }

    // Test 2: Test updating Expected_stock by ASIN
    console.log("\n=== Test 2: Testing update by ASIN ===");
    const testAsin = "B08N5WRWNW"; // Replace with a real ASIN from your database
    const testValue = 100;
    
    await new Promise((resolve, reject) => {
      db.run("UPDATE amazon SET Expected_stock = ? WHERE ASIN = ?", [testValue, testAsin], function(err) {
        if (err) reject(err);
        else {
          console.log(`✅ Updated Expected_stock for ASIN ${testAsin}: ${this.changes} rows affected`);
          resolve();
        }
      });
    });

    // Test 3: Test updating Expected_stock by FNSKU
    console.log("\n=== Test 3: Testing update by FNSKU ===");
    const testFnsku = "X001ABC123"; // Replace with a real FNSKU from your database
    const testValue2 = 200;
    
    await new Promise((resolve, reject) => {
      db.run("UPDATE amazon SET Expected_stock = ? WHERE FNSKU = ?", [testValue2, testFnsku], function(err) {
        if (err) reject(err);
        else {
          console.log(`✅ Updated Expected_stock for FNSKU ${testFnsku}: ${this.changes} rows affected`);
          resolve();
        }
      });
    });

    // Test 4: Test the Amazon inventory report query
    console.log("\n=== Test 4: Testing Amazon inventory report query ===");
    const amazonReport = await new Promise((resolve, reject) => {
      db.all(`
        SELECT
          a.id,
          a.[Item Name] as item_name,
          a.ASIN as asin,
          a.amazon_sales,
          COALESCE(a.Expected_stock,0) as Expected_stock
        FROM amazon a
        WHERE a.ASIN IS NOT NULL
        LIMIT 5
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("✅ Amazon inventory report query works");
    console.log("Sample data:", amazonReport.slice(0, 2));

    // Test 5: Test the Flipkart filtered data query
    console.log("\n=== Test 5: Testing Flipkart filtered data query ===");
    const flipkartData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.[Item Name] as item_name,
          a.FNSKU as fnsku,
          a.[Flipkart Sales] as flipkart_sales,
          COALESCE(a.Expected_stock, 0) as Expected_stock
        FROM amazon a
        WHERE a.FNSKU IS NOT NULL AND a.FNSKU != ''
        LIMIT 5
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("✅ Flipkart filtered data query works");
    console.log("Sample data:", flipkartData.slice(0, 2));

  } catch (error) {
    console.error("❌ Test failed:", error.message);
  } finally {
    db.close((err) => {
      if (err) {
        console.error("Error closing database:", err.message);
      } else {
        console.log("\n✅ Database closed successfully");
      }
    });
  }
}

// Run the test
testExpectedStock().catch(console.error); 