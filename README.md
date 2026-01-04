# 📊 Data Inventory Application

A comprehensive desktop application built with **Electron** and **React** for managing e-commerce inventory data from multiple platforms (Amazon and Flipkart). The application provides real-time data tracking, analysis, and conversion capabilities with a modern, user-friendly interface.

---

## 🎯 Features

### 📈 Core Functionality

- **Multi-Platform Inventory Management**
  - Amazon Sales & Inventory Tracking
  - Flipkart Merged Data Management
  - Unified inventory dashboard

- **Data Import & Conversion**
  - Convert CSV/XLSX files to database tables
  - Automatic data validation and import
  - Support for multiple file formats
  - Drag & drop file upload interface

- **Database Operations**
  - SQLite database with optimized query operations
  - Real-time data synchronization
  - Advanced search and filtering capabilities
  - Automatic column initialization for new fields

- **Data Analysis & Reporting**
  - Real-time statistics and summaries
  - Stock level tracking (Current & Expected)
  - Sales data analysis
  - Recommended stock calculations

- **User Interface**
  - Responsive design (Desktop optimized)
  - Dark/Light theme support
  - Ant Design component library integration
  - Interactive data tables with editing capabilities

- **Data Management**
  - Add/Edit/Delete inventory records
  - Bulk row selection and operations
  - Advanced search filtering
  - Data export and reload functionality

---

## 🛠️ Technology Stack

| Category | Technology |
|----------|-----------|
| **Desktop Framework** | Electron 36.4.0 |
| **Frontend Library** | React 19.1.0 |
| **UI Components** | Ant Design 5.25.4 |
| **Routing** | React Router DOM 7.6.2 |
| **Database** | SQLite3 5.1.7 |
| **File Processing** | XLSX 0.18.5, CSV Parser 3.2.0, csvtojson 2.0.10 |
| **Build Tool** | Vite 6.3.5 |
| **Styling** | Tailwind CSS with PostCSS |
| **Linting** | ESLint 9.25.0 |

---

## 📁 Project Structure

```
Data-Inventory-application/
├── src/
│   ├── components/
│   │   ├── AllData.jsx              # Complete inventory management
│   │   ├── amazonSales.jsx          # Amazon inventory module
│   │   ├── FlipkartMergedData.jsx   # Flipkart inventory module
│   │   ├── fileConverter/
│   │   │   └── FileConverter.jsx    # File upload & conversion
│   │   ├── layout.jsx               # Application layout
│   │   └── button.jsx               # Custom button components
│   ├── assets/
│   │   └── react.svg
│   ├── App.jsx                      # Main application component
│   ├── App.css                      # Application styles
│   ├── index.css                    # Global styles
│   └── main.jsx                     # Entry point
├── main.js                          # Electron main process
├── preload.js                       # Preload script for IPC
├── database-operations.js           # Database operations class
├── converter.js                     # File converter utility
├── database.sqlite                  # SQLite database file
├── convert.html                     # Conversion page HTML
├── index.html                       # Main HTML template
├── package.json                     # Project dependencies
├── vite.config.js                   # Vite configuration
├── tailwind.config.js               # Tailwind CSS config
├── postcss.config.js                # PostCSS config
├── eslint.config.js                 # ESLint configuration
└── README.md                        # This file

```

---

## 🚀 Installation & Setup

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn** package manager
- **Git** (for cloning repository)

### Step 1: Clone the Repository

```bash
git clone https://github.com/mohammad11-hub/Data-Inventory-application.git
cd Data-Inventory-application
```

### Step 2: Install Dependencies

```bash
npm install
```

or

```bash
yarn install
```

### Step 3: Start Development Server

```bash
# Start Vite dev server (for hot reload)
npm run dev

# In another terminal, start Electron
npm start
```

### Step 4: Build for Production

```bash
# Build the React app
npm run build

# Start Electron with built files
npm start
```

---

## 📖 Usage Guide

### 1️⃣ Home Screen

When you launch the application, you'll see the main dashboard with quick access to:
- **All Data**: Browse complete inventory
- **Amazon Sales**: Manage Amazon inventory
- **Flipkart Data**: Manage Flipkart inventory
- **File Converter**: Import data from CSV/XLSX files

### 2️⃣ Managing Amazon Inventory

```
Navigation: Home → Amazon Sales
```

- **View Inventory**: Displays all Amazon products with details
- **Edit Records**: Click edit icon to modify product information
- **Search**: Use search bar to find products by name/SKU
- **Filter**: Toggle between Amazon and Flipkart data views
- **Download**: Export data to Excel format
- **Statistics**: View real-time sales and stock metrics

**Key Columns:**
- ASIN (Amazon Standard Identification Number)
- Product Name
- Current Stock
- Sales Data
- Expected Stock
- Recommended Stock

### 3️⃣ Managing Flipkart Inventory

```
Navigation: Home → Flipkart Data
```

- Similar functionality to Amazon module
- Flipkart-specific product identifiers
- Merged data view combining multiple sources
- Sort and filter by various criteria

### 4️⃣ Viewing All Data

```
Navigation: Home → All Data
```

- Complete database overview
- Search across all fields
- Edit/delete functionality
- Pagination support
- Bulk operations

### 5️⃣ Importing Files

```
Navigation: Home → File Converter
```

**Supported Formats:**
- `.csv` - Comma-separated values
- `.xlsx` - Excel spreadsheets

**Steps:**
1. Select file by clicking "Browse" or drag & drop
2. Enter table name for the data
3. Click "Convert" to import
4. View progress and confirmation message
5. Data automatically saves to database

---

## 🔧 Configuration

### Database Configuration

Edit `database-operations.js` to configure database path:

```javascript
constructor(dbPath) {
    this.db = new sqlite3.Database(
        dbPath || path.join(__dirname, 'database.sqlite'),
        (err) => { /* ... */ }
    );
}
```

### Theme Configuration

Modify theme settings in `src/App.jsx`:

```javascript
// Toggle light/dark theme
const [isDarkMode, setIsDarkMode] = useState(false);
```

### Tailwind CSS

Customize styles in `tailwind.config.js`:

```javascript
module.exports = {
  content: ['./src/**/*.{js,jsx}'],
  theme: {
    extend: {
      // Add custom colors, fonts, etc.
    }
  }
}
```

---

## 🗄️ Database Schema

### Key Tables

#### `amazon_inventory`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| asin | TEXT | Product ASIN |
| name | TEXT | Product name |
| current_stock | INTEGER | Current stock quantity |
| sales | INTEGER | Sales count |
| expected_stock | INTEGER | Expected stock level |
| recommended_stock | INTEGER | AI-recommended stock |

#### `flipkart_inventory`
| Column | Type | Description |
|--------|------|-------------|
| id | INTEGER | Primary key |
| product_id | TEXT | Flipkart product ID |
| name | TEXT | Product name |
| current_stock | INTEGER | Current stock |
| sales | INTEGER | Sales count |
| f_expected_stock | INTEGER | Expected stock |
| f_recommended_stock | INTEGER | Recommended stock |

---

## 💻 Available Scripts

```bash
# Development
npm run dev          # Start Vite development server
npm start            # Start Electron app

# Production
npm run build        # Build React app for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint

# Testing (if configured)
npm test             # Run test suite
```

---

## 🔌 IPC Communication

The application uses **Electron IPC** for main-renderer process communication:

### Available API Methods

```javascript
// File operations
await window.electronAPI.convertFile(config)

// Database operations
await window.electronAPI.getAmazonInventoryReport()
await window.electronAPI.getFlipkartMergedData()
await window.electronAPI.addExpectedStockColumn()
await window.electronAPI.addFExpectedStockColumn()
await window.electronAPI.addARecommandedColumn()
await window.electronAPI.addFRecommandedColumn()

// Data modifications
await window.electronAPI.updateRecord(table, id, data)
await window.electronAPI.deleteRecord(table, id)
```

---

## 🐛 Troubleshooting

### Issue: Database locked error

**Solution:** Ensure the database operation queue is properly handling concurrent requests. The application uses a queue system to prevent concurrent database access.

### Issue: File import fails

**Solutions:**
- Verify file format (CSV/XLSX)
- Check file encoding (UTF-8 recommended)
- Ensure column headers are present
- Try with sample data first

### Issue: Performance slow with large datasets

**Solutions:**
- Increase pagination limit in `AllData.jsx`
- Add database indices for frequently searched columns
- Consider archiving old data
- Check system resources (RAM, CPU)

### Issue: IPC communication errors

**Solution:** Ensure preload script is properly loaded in `main.js`. Verify IPC handler registration.

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** changes (`git commit -m 'Add amazing feature'`)
4. **Push** to branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Code Standards

- Follow ESLint rules configured in the project
- Use React functional components and hooks
- Add comments for complex logic
- Test changes before submitting PR

---

## 📝 Database Auto-Insert Feature

### Photo-Based Automatic Data Insertion

The application can automatically insert data based on product photos when enabled:

**Features:**
- Reads image metadata and file information
- Extracts product details from image names/properties
- Auto-populates fields: Product Name, ASIN/Product ID, Category
- Processes batch images for bulk import
- Validates data before insertion
- Maintains data integrity with error logging

**How to Use:**

1. Navigate to File Converter
2. Select image files (JPG, PNG supported)
3. System automatically extracts metadata
4. Review extracted data
5. Click "Auto-Insert" to save to database

**Example:**
```
Image: amazon_ASIN123_productname.jpg
↓
Auto-extracts:
- ASIN: ASIN123
- Name: productname
- Source: amazon
- Status: Complete
```

---

## 📊 Dashboard Statistics

### Real-Time Metrics Displayed

- **Total Items**: Count of all products
- **Total Sales**: Sum of all sales figures
- **Total Stock**: Current stock across all items
- **Total Remaining**: Expected vs. Current stock difference
- **Stock Health**: Visual indicators for stock status
- **Sales Trend**: Performance analysis

---

## 🔐 Security Considerations

- Database operations use parameterized queries to prevent SQL injection
- IPC communication is restricted to main process
- File uploads are validated before processing
- Sensitive data handling with proper error messages

---

## 📄 License

This project is licensed under the **MIT License** - see the LICENSE file for details.

---

## 👤 Author

- **Mohammad** - [GitHub](https://github.com/mohammad11-hub)

---

## 📞 Support

For issues, questions, or suggestions:

1. **GitHub Issues**: [Open an issue](https://github.com/mohammad11-hub/Data-Inventory-application/issues)
2. **Email**: [Contact support]
3. **Documentation**: Check the docs folder for detailed guides

---

## 🙏 Acknowledgments

- **Ant Design** - Beautiful UI components
- **Electron** - Desktop application framework
- **React** - UI library
- **Vite** - Build tool and dev server
- **SQLite** - Embedded database
- **Tailwind CSS** - Utility-first CSS framework

---

## 📈 Roadmap

### Upcoming Features

- [ ] Cloud backup and synchronization
- [ ] Advanced analytics dashboard
- [ ] Multi-user support with authentication
- [ ] Real-time stock alerts
- [ ] API integration with e-commerce platforms
- [ ] Mobile app (React Native)
- [ ] Automated reporting and scheduling
- [ ] Machine learning stock recommendations
- [ ] Barcode scanning support
- [ ] Advanced filtering and custom views

---

## ⚡ Performance Tips

1. **Database Optimization**
   - Regular database cleanup and optimization
   - Add indices for frequently searched fields
   - Archive old data periodically

2. **UI Performance**
   - Use pagination for large datasets
   - Lazy load components when possible
   - Optimize image sizes

3. **Memory Management**
   - Close unused database connections
   - Clear old logs periodically
   - Monitor system resources

---

**Last Updated:** December 8, 2025  
**Version:** 0.0.0  
**Status:** Active Development

---

**For the latest updates and information, visit the [GitHub Repository](https://github.com/mohammad11-hub/Data-Inventory-application)**
