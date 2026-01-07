# 📊 Craloft Data Inventory Application - Project Overview

## 🎯 Project Introduction

**Craloft Data Inventory Application** is a comprehensive desktop application built with **Electron** and **React** for managing e-commerce inventory data from multiple platforms (Amazon and Flipkart). The application provides real-time data tracking, analysis, conversion capabilities, and a modern, user-friendly interface with role-based access control.

### Purpose
- Centralized inventory management for multi-platform e-commerce operations
- Real-time sales and stock tracking
- Data import/export capabilities
- Advanced reporting and analytics
- Secure user authentication and role-based access

---

## 🏗️ Architecture Overview

### Application Type
- **Desktop Application** using Electron framework
- **Frontend**: React 19.1.0 with modern hooks and functional components
- **Backend**: Electron main process with Node.js
- **Database**: SQLite3 (embedded database)

### Architecture Pattern
- **Main-Renderer Process Architecture** (Electron)
- **Component-Based Architecture** (React)
- **Context API** for state management (Authentication)
- **IPC (Inter-Process Communication)** for secure main-renderer communication

### Key Architectural Components

```
┌─────────────────────────────────────────────────────────┐
│                    Electron Main Process                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Database   │  │  File System │  │   IPC Handlers│ │
│  │  Operations  │  │   Operations  │  │              │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
                        ↕ IPC Communication
┌─────────────────────────────────────────────────────────┐
│                  React Renderer Process                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │   Components │  │   Pages      │  │   Contexts   │ │
│  │   (UI)       │  │   (Modules)  │  │   (State)    │ │
│  └──────────────┘  └──────────────┘  └──────────────┘ │
└─────────────────────────────────────────────────────────┘
```

---

## 🛠️ Technology Stack

### Core Technologies

| Category | Technology | Version | Purpose |
|----------|-----------|---------|---------|
| **Desktop Framework** | Electron | 36.4.0 | Cross-platform desktop app framework |
| **Frontend Library** | React | 19.1.0 | UI component library |
| **UI Components** | Ant Design | 5.25.4 | Enterprise UI component library |
| **Routing** | React Router DOM | 7.6.2 | Client-side routing |
| **Database** | SQLite3 | 5.1.7 | Embedded relational database |
| **Build Tool** | Vite | 6.3.5 | Fast build tool and dev server |
| **Styling** | Tailwind CSS | Latest | Utility-first CSS framework |

### Supporting Libraries

| Library | Purpose |
|---------|---------|
| **bcryptjs** | Password hashing for authentication |
| **chart.js** | Data visualization and charts |
| **react-chartjs-2** | React wrapper for Chart.js |
| **jspdf** | PDF generation |
| **jspdf-autotable** | Table generation in PDF |
| **xlsx** | Excel file processing |
| **csv-parser** | CSV file parsing |
| **csvtojson** | CSV to JSON conversion |
| **canvg** | SVG rendering for PDF |

---

## 📁 Project Structure

```
Data-Inventory-application/
├── src/                          # React source code
│   ├── components/               # Reusable UI components
│   │   ├── Layout.jsx           # Main application layout with sidebar
│   │   ├── Login.jsx            # Login page component
│   │   └── ProtectedRoute.jsx   # Route protection component
│   ├── contexts/                 # React Context providers
│   │   └── AuthContext.jsx      # Authentication context
│   ├── pages/                   # Page components
│   │   ├── Dashboard.jsx        # Main dashboard with charts
│   │   ├── FlipkartSales.jsx   # Flipkart sales module
│   │   ├── MergedSales.jsx     # Merged sales analysis
│   │   ├── Reports.jsx         # Reports and exports
│   │   └── BackupRestore.jsx   # Backup & restore (Admin only)
│   ├── fileConverter/           # File import functionality
│   │   ├── FileConverter.jsx   # File converter UI
│   │   └── index.js            # File converter logic
│   ├── AllData.jsx             # All data viewer module
│   ├── amazonSales.jsx         # Amazon sales module
│   ├── FlipkartMergedData.jsx  # Flipkart merged data view
│   ├── App.jsx                 # Main app component with routing
│   ├── main.jsx                # React entry point
│   └── index.css               # Global styles
│
├── main.js                      # Electron main process
├── preload.js                   # Preload script (IPC bridge)
├── database-init.js             # Database initialization
├── database-operations.js       # Database operations class
├── converter.js                 # File converter utility
├── database.sqlite              # SQLite database file
├── package.json                 # Project dependencies
├── vite.config.js              # Vite configuration
├── tailwind.config.js           # Tailwind CSS config
├── eslint.config.js             # ESLint configuration
└── README.md                    # Project documentation
```

---

## 🔑 Core Features & Modules

### 1. Authentication & Authorization System

**Features:**
- Secure login with password hashing (bcrypt)
- Session management with localStorage
- Role-based access control (Admin/Staff)
- Protected routes
- Activity logging

**User Roles:**
- **Admin**: Full access (CRUD, reports, users, backup/restore)
- **Staff**: View data, limited edit access

**Default Credentials:**
- Admin: `admin` / `admin123`
- Staff: `staff` / `staff123`

**Files:**
- `src/components/Login.jsx` - Login interface
- `src/components/ProtectedRoute.jsx` - Route protection
- `src/contexts/AuthContext.jsx` - Authentication state management
- `database-init.js` - User table initialization

---

### 2. Dashboard Module

**Location:** `src/pages/Dashboard.jsx`

**Features:**
- Real-time statistics cards:
  - Total Products
  - Total Sales Records
  - Active Modules
  - System Status
- Low Stock Alerts
- Interactive Charts (Chart.js):
  - **Platform-wise Sales** (Bar Chart)
  - **Monthly Sales Trend** (Line Chart)
  - **Category Distribution** (Pie Chart)

**Data Sources:**
- Amazon inventory data
- Flipkart inventory data
- Real-time calculations

---

### 3. All Data Module

**Location:** `src/AllData.jsx`

**Features:**
- View all database tables
- Global search across all fields
- Add/Edit/Delete records
- Pagination support
- Table selection dropdown
- Real-time data updates
- Error handling and validation

**Access:** Available to both Admin and Staff

---

### 4. Amazon Sales Module

**Location:** `src/amazonSales.jsx`

**Features:**
- Amazon inventory and sales management
- Key Fields:
  - `product_name`
  - `category`
  - `price`
  - `quantity`
  - `sold`
  - `sale_date`
  - `asin`
- Auto stock update logic
- Expected stock and recommended stock tracking
- Search and filter functionality
- Excel export capability

---

### 5. Flipkart Sales Module

**Location:** `src/pages/FlipkartSales.jsx`

**Features:**
- Independent Flipkart sales management
- Same schema as Amazon module
- Flipkart-specific fields:
  - `fnsku` (Flipkart SKU)
  - `f_expectedstock`
  - `F_recommanded`
- CRUD operations
- Real-time statistics
- Search and filter

---

### 6. Merged Sales Module

**Location:** `src/pages/MergedSales.jsx`

**Features:**
- Combines Amazon + Flipkart data
- Platform comparison metrics:
  - Total sales comparison
  - Revenue comparison
  - Stock usage comparison
  - Growth percentage calculation
- Side-by-side statistics
- Comparison table

---

### 7. File Import Module

**Location:** `src/fileConverter/FileConverter.jsx`

**Features:**
- Upload CSV/Excel files
- Data validation
- Insert into SQLite database
- Error & success notifications
- Drag & drop support
- Progress tracking

**Supported Formats:**
- `.csv` (Comma-separated values)
- `.xlsx` (Excel spreadsheets)

---

### 8. Reports Module

**Location:** `src/pages/Reports.jsx`

**Features:**
- Export sales data to PDF (jsPDF)
- Export to Excel (enhanced)
- Platform-wise reports
- Date-wise filtering
- Report type selection
- Custom date range selection

---

### 9. Backup & Restore Module

**Location:** `src/pages/BackupRestore.jsx`

**Features:**
- Manual SQLite database backup
- Restore database from backup
- Automatic backup before restore
- Admin-only access
- File selection dialog

---

## 🗄️ Database Schema

### Tables

#### 1. `users` Table
```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  password TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'staff',
  email TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL
)
```

#### 2. `activity_logs` Table
```sql
CREATE TABLE activity_logs (
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
```

#### 3. `amazon_sales` Table
```sql
CREATE TABLE amazon_sales (
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
```

#### 4. `flipkart_sales` Table
```sql
CREATE TABLE flipkart_sales (
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
```

#### 5. Existing Tables (Legacy)
- `amazon` - Main Amazon inventory table
- `inventory` - Warehouse inventory
- `sales` - Sales records
- `flipkart_stock` - Flipkart stock data

### Indexes
- `idx_users_username` - Fast user lookup
- `idx_activity_logs_user` - User activity queries
- `idx_activity_logs_created` - Time-based activity queries
- `idx_amazon_sales_date` - Date-based sales queries
- `idx_flipkart_sales_date` - Date-based sales queries

---

## 🔐 Security Features

### Authentication
- Password hashing with bcrypt (10 rounds)
- Session management via localStorage
- Secure IPC communication
- Context isolation enabled

### Authorization
- Role-based access control (RBAC)
- Protected routes
- Admin-only features (Backup & Restore)
- Activity logging for audit trail

### Data Security
- Parameterized SQL queries (SQL injection prevention)
- Input validation
- File upload validation
- Error handling without exposing sensitive data

---

## 🔌 IPC Communication

### IPC Handlers (Main Process)

**Authentication:**
- `login` - User authentication
- `logout` - User logout with activity logging
- `log-activity` - Log user actions
- `get-activity-logs` - Retrieve activity logs

**Database Operations:**
- `get-table-data` - Get data from specific table
- `get-table-names` - Get all table names
- `update-table-row` - Update database record
- `get-amazon-inventory-report` - Amazon inventory report
- `get-flipkart-filtered-data` - Flipkart filtered data
- `get-flipkart-merged-data` - Flipkart merged data

**Data Modifications:**
- `update-amazon-expected-stock-and-recommended` - Update Amazon stock
- `update-amazon-f-expectedstock-by-fnsku` - Update Flipkart stock

**File Operations:**
- `convert-file` - Convert CSV/XLSX to database
- `export-selected-rows-to-excel` - Export to Excel

**Backup & Restore:**
- `backup-database` - Create database backup
- `restore-database` - Restore from backup

### Preload Script (`preload.js`)
- Exposes secure API to renderer process
- Bridges IPC communication
- Prevents direct Node.js access from renderer

---

## 🎨 UI/UX Features

### Design System
- **Ant Design** component library
- Consistent color scheme
- Responsive layout
- Dark/Light mode support (theme system in place)

### Layout Components
- **Sidebar Navigation** - Collapsible menu
- **Header** - User info and logout
- **Content Area** - Main application content
- **Mobile Drawer** - Mobile navigation

### User Experience
- Loading states
- Error messages
- Success notifications
- Form validation
- Search functionality
- Pagination
- Real-time updates

---

## 🚀 Development Workflow

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start Electron (in another terminal)
npm start
```

### Build Process
```bash
# Build React app
npm run build

# Start Electron with production build
npm start
```

### Code Quality
```bash
# Run ESLint
npm run lint
```

### Database Initialization
- Automatic on app startup
- Creates tables if not exist
- Creates default admin and staff users
- Sets up indexes

---

## 📊 Key Components Breakdown

### 1. App.jsx
- Main application component
- Router configuration
- Theme provider
- Authentication provider
- Route definitions

### 2. Layout.jsx
- Application layout wrapper
- Sidebar navigation
- Header with user info
- Mobile responsive design
- Role-based menu items

### 3. AuthContext.jsx
- Authentication state management
- Login/logout functions
- Role checking utilities
- Activity logging

### 4. ProtectedRoute.jsx
- Route protection logic
- Admin-only route support
- Loading states
- Redirect handling

---

## 🔄 Data Flow

### Authentication Flow
```
User Login → IPC Call → Main Process → Database Query → 
Password Verification → Session Creation → Context Update → 
Route Access
```

### Data Update Flow
```
User Action → Component → IPC Call → Main Process → 
Database Queue → SQL Execution → Activity Log → 
Response → UI Update
```

### File Import Flow
```
File Selection → File Reading → Data Parsing → 
Validation → Database Insert → Success/Error → 
UI Notification
```

---

## 📈 Performance Optimizations

### Database
- Operation queue to prevent concurrent access
- Indexed columns for fast queries
- WAL mode for better concurrency
- Connection pooling

### Frontend
- React component optimization
- Lazy loading (where applicable)
- Pagination for large datasets
- Memoization for expensive calculations

### IPC
- Batch operations where possible
- Error handling and retries
- Queue system for database operations

---

## 🧪 Testing & Quality Assurance

### Code Quality
- ESLint configuration
- React hooks rules
- Consistent code style

### Error Handling
- Try-catch blocks
- User-friendly error messages
- Console logging for debugging
- Graceful degradation

---

## 🚧 Future Enhancements

### Planned Features
- [ ] Advanced filtering (date range, price, platform)
- [ ] Enhanced activity logs viewer
- [ ] User management interface (Admin)
- [ ] Soft delete implementation
- [ ] Real-time notifications
- [ ] Cloud backup integration
- [ ] API integration with e-commerce platforms
- [ ] Mobile app version
- [ ] Advanced analytics dashboard
- [ ] Automated reporting

---

## 📝 Development Notes

### Important Files
- `main.js` - Electron main process (1000+ lines)
- `preload.js` - IPC bridge
- `database-init.js` - Database initialization
- `src/App.jsx` - Main React component

### Key Dependencies
- All dependencies listed in `package.json`
- Ensure Node.js 16+ for compatibility
- Electron requires native module rebuilding

### Database Notes
- SQLite database file: `database.sqlite`
- WAL mode enabled for better performance
- Foreign keys enabled
- Automatic table creation on first run

---

## 🎯 Project Goals

1. **Centralized Management**: Single application for multi-platform inventory
2. **User-Friendly**: Intuitive interface with modern design
3. **Secure**: Role-based access and activity logging
4. **Scalable**: Modular architecture for easy extension
5. **Reliable**: Error handling and data validation
6. **Efficient**: Optimized database queries and UI rendering

---

## 📞 Support & Documentation

- **README.md** - Basic usage guide
- **This Overview** - Comprehensive project documentation
- **Code Comments** - Inline documentation
- **GitHub Repository** - Issue tracking and version control

---

## ✅ Project Status

**Current Version:** 0.0.0  
**Status:** Active Development  
**Last Updated:** December 2024

### Completed Features
✅ Authentication & Authorization  
✅ Dashboard with Charts  
✅ All Data Module  
✅ Amazon Sales Module  
✅ Flipkart Sales Module  
✅ Merged Sales Module  
✅ File Import Module  
✅ Reports Module (PDF/Excel)  
✅ Backup & Restore  
✅ Activity Logging Infrastructure  
✅ Role-Based Access Control  
✅ Responsive UI  

### In Progress
🔄 Advanced Filters  
🔄 Activity Logs Viewer  
🔄 Soft Delete Enhancement  

---

## 🎓 Learning Resources

### Technologies Used
- [Electron Documentation](https://www.electronjs.org/docs)
- [React Documentation](https://react.dev)
- [Ant Design Components](https://ant.design/components/overview/)
- [Chart.js Documentation](https://www.chartjs.org/docs/)
- [SQLite Documentation](https://www.sqlite.org/docs.html)

---

**This overview provides a comprehensive understanding of the Data Inventory Application project structure, features, and architecture.**

