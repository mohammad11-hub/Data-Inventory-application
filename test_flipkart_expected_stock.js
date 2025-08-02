const sqlite3 = require("sqlite3").verbose();
const path = require("path");

// Test script specifically for Flipkart Expected Stock functionality
async function testFlipkartExpectedStock() {
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
    // Test 1: Check current Expected_stock values for Flipkart items
    console.log("\n=== Test 1: Current Expected_stock values for Flipkart items ===");
    const currentValues = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.[Item Name] as item_name,
          a.FNSKU as fnsku,
          a.[Flipkart Sales] as flipkart_sales,
          COALESCE(a.Expected_stock, 0) as Expected_stock
        FROM amazon a
        WHERE a.FNSKU IS NOT NULL AND a.FNSKU != ''
        LIMIT 10
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("Current Flipkart items with Expected_stock:");
    currentValues.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.item_name} (FNSKU: ${row.fnsku}) - Expected_stock: ${row.Expected_stock}`);
    });

    // Test 2: Update Expected_stock for a specific FNSKU
    console.log("\n=== Test 2: Updating Expected_stock for a specific FNSKU ===");
    if (currentValues.length > 0) {
      const testFnsku = currentValues[0].fnsku;
      const testValue = 150;
      
      await new Promise((resolve, reject) => {
        db.run("UPDATE amazon SET Expected_stock = ? WHERE FNSKU = ?", [testValue, testFnsku], function(err) {
          if (err) reject(err);
          else {
            console.log(`✅ Updated Expected_stock for FNSKU ${testFnsku}: ${this.changes} rows affected`);
            resolve();
          }
        });
      });

      // Verify the update
      const verifyUpdate = await new Promise((resolve, reject) => {
        db.get("SELECT Expected_stock FROM amazon WHERE FNSKU = ?", [testFnsku], (err, row) => {
          if (err) reject(err);
          else resolve(row);
        });
      });
      
      console.log(`✅ Verification: Expected_stock is now ${verifyUpdate.Expected_stock}`);
    }

    // Test 3: Test the exact query used by get-flipkart-filtered-data
    console.log("\n=== Test 3: Testing get-flipkart-filtered-data query ===");
    const flipkartFilteredData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.[Item Name] as item_name,
          a.FNSKU as fnsku,
          a.[Flipkart Sales] as flipkart_sales,
          COALESCE(SUM(fs.stock_quantity), 0) as stock_quantity,
          (COALESCE(SUM(fs.stock_quantity), 0) - CAST(COALESCE(a.[Flipkart Sales], '0') AS REAL)) as remaining_stock,
          COALESCE(a.Expected_stock, 0) as Expected_stock
        FROM amazon a
        LEFT JOIN (
          SELECT fsn, SUM(stock_quantity) as stock_quantity
          FROM flipkart_stock 
          GROUP BY fsn
        ) fs ON a.FSN = fs.fsn
        WHERE a.FNSKU IS NOT NULL AND a.FNSKU != ''
        GROUP BY a.FNSKU, a.[Item Name], a.[Flipkart Sales], a.Expected_stock
        LIMIT 5
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("✅ Flipkart filtered data query works");
    console.log("Sample data with Expected_stock:");
    flipkartFilteredData.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.item_name} (FNSKU: ${row.fnsku}) - Expected_stock: ${row.Expected_stock}`);
    });

    // Test 4: Test the exact query used by get-flipkart-merged-data
    console.log("\n=== Test 4: Testing get-flipkart-merged-data query ===");
    const flipkartMergedData = await new Promise((resolve, reject) => {
      db.all(`
        SELECT 
          a.FNSKU as fnsku,
          a.[Item Name] as item_name,
          SUM(CAST(COALESCE(a.[Flipkart Sales], '0') AS REAL)) as total_flipkart_sales,
          COALESCE(SUM(fs.stock_quantity), 0) as total_stock_quantity,
          (COALESCE(SUM(fs.stock_quantity), 0) - SUM(CAST(COALESCE(a.[Flipkart Sales], '0') AS REAL))) as total_remaining_stock,
          COALESCE(a.Expected_stock, 0) as Expected_stock
        FROM amazon a
        LEFT JOIN (
          SELECT fsn, SUM(stock_quantity) as stock_quantity
          FROM flipkart_stock 
          GROUP BY fsn
        ) fs ON a.FSN = fs.fsn
        WHERE a.FNSKU IS NOT NULL AND a.FNSKU != ''
        GROUP BY a.FNSKU, a.[Item Name], a.Expected_stock
        ORDER BY total_flipkart_sales DESC
        LIMIT 5
      `, [], (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
    
    console.log("✅ Flipkart merged data query works");
    console.log("Sample data with Expected_stock:");
    flipkartMergedData.forEach((row, idx) => {
      console.log(`${idx + 1}. ${row.item_name} (FNSKU: ${row.fnsku}) - Expected_stock: ${row.Expected_stock}`);
    });

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
testFlipkartExpectedStock().catch(console.error); 