import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Popconfirm,
  Input,
  Button,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Tooltip,
  theme,
  Grid
} from "antd";
import {
  SearchOutlined,
  FilterOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  DatabaseOutlined,
  ArrowLeftOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const AmazonSales = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState("");
  const [editRow, setEditRow] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [filterMode, setFilterMode] = useState("amazon");
  const [selectedRowKeys, setSelectedRowKeys] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const { token } = theme.useToken();
  const screens = useBreakpoint();

  useEffect(() => {
    setLoading(true);
    
    // Initialize database columns if they don't exist
    const initializeColumns = async () => {
      try {
        await window.electronAPI.addExpectedStockColumn();
        await window.electronAPI.addFExpectedStockColumn();
        await window.electronAPI.addARecommandedColumn();
        await window.electronAPI.addFRecommandedColumn();
      } catch (err) {
        console.error("Error initializing columns:", err);
      }
    };

    initializeColumns().then(() => {
      window.electronAPI
        .getAmazonInventoryReport()
        .then((rows) => {
          console.log("Amazon Inventory Report Data:", rows);
          setData(rows.map((row, idx) => ({ ...row, key: idx })));
          setFilterMode("amazon");
          setLoading(false);
        })
        .catch((err) => {
          setData([]);
          setLoading(false);
          console.error("Error fetching report:", err);
        });
    });
  }, []);

  // Amazon Filter handler
  const handleAmazonFilter = async () => {
    setLoading(true);
    try {
      const amazonRows = await window.electronAPI.getAmazonInventoryReport();
      setData(amazonRows.map((row, idx) => ({ ...row, key: idx })));
      setFilterMode("amazon");
    } catch (err) {
      message.error("Error applying Amazon Filter");
      setLoading(false);
    }
    setLoading(false);
  };

  // Flipkart Filter handler
  const handleFlipkartFilter = async () => {
    setLoading(true);
    try {
      const flipkartRows = await window.electronAPI.getFlipkartFilteredData();
      console.log("Raw Flipkart data:", flipkartRows.slice(0, 2)); // Debug log
      setData(flipkartRows.map((row, idx) => ({ 
        ...row, 
        key: idx, 
        f_expectedstock: row.f_expectedstock || 0 
      })));
      console.log("Processed Flipkart data:", data.slice(0, 2)); // Debug log
      setFilterMode("flipkart");
    } catch (err) {
      message.error("Error applying Flipkart Filter");
      setLoading(false);
    }
    setLoading(false);
  };

  const isEditing = (record) => record.key === editingKey;

  const handleEdit = (record) => {
    setEditingKey(record.key);
    setEditRow({ ...record });
  };

  const handleCancel = () => {
    setEditingKey("");
    setEditRow({});
  };

  const handleSave = async (key) => {
    const newData = [...data];
    const idx = newData.findIndex((item) => item.key === key);
    if (idx > -1) {
      if (filterMode === 'amazon') {
        newData[idx].expected_stock = editRow.expected_stock;
        newData[idx].A_recommanded = editRow.A_recommanded;
        setData(newData);
        const rowId = newData[idx].id;
        if (rowId !== undefined) {
          try {
            await window.electronAPI.updateTableRow('amazon', rowId, { 
              Expected_stock: editRow.expected_stock,
              A_recommanded: editRow.A_recommanded 
            });
            message.success('Expected Stock and A_Recommended updated in database');
          } catch (err) {
            message.error('Failed to update Expected Stock and A_Recommended in database');
          }
        }
      } else if (filterMode === 'flipkart') {
        // Update only the specific row that was edited
        newData[idx].f_expectedstock = editRow.f_expectedstock;
        newData[idx].F_recommanded = editRow.F_recommanded;
        setData(newData);
        
        // Update only the specific FNSKU in the database
        const fnsku = newData[idx].fnsku;
        console.log("Saving Flipkart data:", { fnsku, f_expectedstock: editRow.f_expectedstock, F_recommanded: editRow.F_recommanded }); // Debug log
        if (fnsku) {
          try {
            await window.electronAPI.updateAmazonFExpectedStockByFnsku(fnsku, editRow.f_expectedstock, editRow.F_recommanded);
            message.success(`f_expectedstock and F_Recommended updated for ${fnsku}`);
            // Re-fetch Flipkart data to show the updated value
            handleFlipkartFilter();
          } catch (err) {
            console.error("Error updating Flipkart data:", err); // Debug log
            message.error('Failed to update Flipkart data in database');
          }
        }
      }
    }
    setEditingKey("");
    setEditRow({});
  };

  const handleInputChange = (e, field) => {
    setEditRow({ ...editRow, [field]: e.target.value });
  };

  const filteredData = data.filter((item) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  // Calculate summary statistics
  const summaryStats = {
    totalItems: filteredData.length,
    totalSales: filterMode === "amazon" 
      ? filteredData.reduce((sum, item) => sum + (parseInt(item.amazon_sales) || 0), 0)
      : filteredData.reduce((sum, item) => sum + (parseFloat(item.flipkart_sales) || 0), 0),
    totalStock: filterMode === "amazon"
      ? filteredData.reduce((sum, item) => sum + (parseInt(item.ending_warehouse_stock) || 0), 0)
      : filteredData.reduce((sum, item) => sum + (parseInt(item.stock_quantity) || 0), 0),
    totalRemaining: filterMode === "amazon"
      ? filteredData.reduce((sum, item) => sum + (parseInt(item.remaining) || 0), 0)
      : filteredData.reduce((sum, item) => sum + (parseFloat(item.remaining_stock) || 0), 0),
  };

  // Handle row selection
  const onSelectChange = (newSelectedRowKeys, newSelectedRows) => {
    setSelectedRowKeys(newSelectedRowKeys);
    setSelectedRows(newSelectedRows);
  };

  // Handle download selected rows
  const handleDownloadSelected = async () => {
    if (selectedRows.length === 0) {
      message.warning('Please select at least one row to download');
      return;
    }

    try {
      const result = await window.electronAPI.exportSelectedRowsToExcel(selectedRows, filterMode);
      if (result.success) {
        message.success(`Successfully exported ${selectedRows.length} rows to Excel`);
      } else {
        message.error('Failed to export to Excel');
      }
    } catch (error) {
      console.error('Export error:', error);
      message.error('Error exporting to Excel');
    }
  };

  // Row selection configuration
  const rowSelection = {
    selectedRowKeys,
    onChange: onSelectChange,
    selections: [
      {
        key: 'all-data',
        text: 'Select All Data',
        onSelect: () => {
          const allKeys = filteredData.map(item => item.key);
          const allRows = filteredData;
          setSelectedRowKeys(allKeys);
          setSelectedRows(allRows);
        },
      },
      {
        key: 'clear-all',
        text: 'Clear All',
        onSelect: () => {
          setSelectedRowKeys([]);
          setSelectedRows([]);
        },
      },
    ],
  };

  // Columns for Amazon Filter
  const amazonFilterColumns = [
    {
      title: "Item Name",
      dataIndex: "item_name",
      key: "item_name",
      width: screens.xs ? 120 : 200,
      render: (text) => (
        <Text strong style={{ fontSize: screens.xs ? '12px' : '14px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: "ASIN",
      dataIndex: "asin",
      key: "asin",
      width: screens.xs ? 100 : 150,
      render: (text) => (
        <Tag color="blue" style={{ fontFamily: 'monospace', fontSize: screens.xs ? '10px' : '12px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Amazon Sales",
      dataIndex: "amazon_sales",
      key: "amazon_sales",
      width: screens.xs ? 100 : 120,
      render: (value) => (
        <Text style={{
          color: value > 0 ? token.colorSuccess : token.colorTextSecondary,
          fontWeight: 600,
          fontSize: screens.xs ? '12px' : '14px'
        }}>
          {value?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: "Warehouse Stock",
      dataIndex: "ending_warehouse_stock",
      key: "ending_warehouse_stock",
      width: screens.xs ? 100 : 140,
      render: (value, record) => {
        const stockValue = value || record.warehouse_stock || record.total_stock || 0;
        return (
          <Text style={{
            color: stockValue > 0 ? token.colorPrimary : token.colorTextSecondary,
            fontWeight: 600,
            fontSize: screens.xs ? '12px' : '14px'
          }}>
            {stockValue?.toLocaleString() || 0}
          </Text>
        );
      },
    },
    {
      title: "Remaining",
      dataIndex: "remaining_stock",
      key: "remaining_stock",
      width: screens.xs ? 100 : 120,
      render: (text) => (
        <Text style={{
          color: text < 0 ? token.colorError : token.colorSuccess,
          fontWeight: 600,
          fontSize: screens.xs ? '12px' : '14px'
        }}>
            {text?.toLocaleString() || 0}
          </Text>
        ),
      },
      {
        title: "Expected Stock",
        dataIndex: "Expected_stock",
        key: "expected_stock",
        width: screens.xs ? 100 : 120,
        render: (text, record) =>
          isEditing(record) ? 
            <Input
              value={editRow.expected_stock}
              onChange={(e) => handleInputChange(e, "expected_stock")}
              size={screens.xs ? 'small' : 'middle'}
              style={{ width: '100%' }}
            />
          : (
            <Text style={{
              color: token.colorPrimary,
              fontWeight: 600,
              fontSize: screens.xs ? '12px' : '14px'
            }}>
              {text?.toLocaleString() || 0}
            </Text>
          ),
      },
      {
        title: "A_Recommended",
        dataIndex: "A_recommanded",
        key: "A_recommanded",
        width: screens.xs ? 100 : 120,
        render: (text, record) =>
          isEditing(record) ? 
            <Input
              value={editRow.A_recommanded}
              onChange={(e) => handleInputChange(e, "A_recommanded")}
              size={screens.xs ? 'small' : 'middle'}
              style={{ width: '100%' }}
            />
          : (
            <Text style={{
              color: token.colorWarning,
              fontWeight: 600,
              fontSize: screens.xs ? '12px' : '14px'
            }}>
              {text?.toLocaleString() || 0}
            </Text>
          ),
      },
      {
        title: "Actions",
        key: "actions",
        width: screens.xs ? 80 : 120,
        render: (_, record) => {
          const editable = isEditing(record);
          return editable ? (
            <Space size="small">
            <Tooltip title="Save">
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(record.key)}
                />
            </Tooltip>
            <Tooltip title="Cancel">
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              />
            </Tooltip>
          </Space>
        ) : (
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={filterMode !== "amazon"}
            />
          </Tooltip>
        );
      },
    },
  ];

  // Columns for Flipkart Filter
  const flipkartFilterColumns = [
    {
      title: "Item Name",
      dataIndex: "item_name",
      key: "item_name",
      width: screens.xs ? 120 : 200,
      render: (text) => (
        <Text strong style={{ fontSize: screens.xs ? '12px' : '14px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: "FNSKU",
      dataIndex: "fnsku",
      key: "fnsku",
      width: screens.xs ? 100 : 150,
      render: (text) => (
        <Tag color="purple" style={{ fontFamily: 'monospace', fontSize: screens.xs ? '10px' : '12px' }}>
          {text}
        </Tag>
      ),
    },
    {
      title: "Flipkart Sales",
      dataIndex: "flipkart_sales",
      key: "flipkart_sales",
      width: screens.xs ? 100 : 120,
      render: (value) => (
        <Text style={{
          color: value > 0 ? token.colorSuccess : token.colorTextSecondary,
          fontWeight: 600,
          fontSize: screens.xs ? '12px' : '14px'
        }}>
          {typeof value === 'number' ? value.toFixed(2) : value}
        </Text>
      ),
    },
    {
      title: "Stock Quantity",
      dataIndex: "stock_quantity",
      key: "stock_quantity",
      width: screens.xs ? 100 : 140,
      render: (value) => (
        <Text style={{
          color: value > 0 ? token.colorPrimary : token.colorTextSecondary,
          fontWeight: 600,
          fontSize: screens.xs ? '12px' : '14px'
        }}>
          {value?.toLocaleString() || 0}
        </Text>
      ),
    },
    {
      title: "Remaining",
      dataIndex: "remaining_stock",
      key: "remaining_stock",
      width: screens.xs ? 100 : 120,
      render: (text) => (
        <Text style={{
          color: text < 0 ? token.colorError : token.colorSuccess,
          fontWeight: 600,
          fontSize: screens.xs ? '12px' : '14px'
        }}>
          {typeof text === 'number' ? text.toLocaleString() : text}
          </Text>
        ),
      },
      {
        title: "f_expectedstock",
        dataIndex: "f_expectedstock",
        key: "f_expectedstock",
        width: screens.xs ? 100 : 120,
        render: (text, record) =>
          isEditing(record) ? (
            <Input
              value={editRow.f_expectedstock}
              onChange={(e) => handleInputChange(e, "f_expectedstock")}
              size={screens.xs ? 'small' : 'middle'}
              style={{ width: '100%' }}
            />
          ) : (
            <Text style={{
              color: token.colorPrimary,
              fontWeight: 600,
              fontSize: screens.xs ? '12px' : '14px'
            }}>
              {text?.toLocaleString() || 0}
            </Text>
          ),
      },
      {
        title: "F_Recommended",
        dataIndex: "F_recommanded",
        key: "F_recommanded",
        width: screens.xs ? 100 : 120,
        render: (text, record) =>
          isEditing(record) ? (
            <Input
              value={editRow.F_recommanded}
              onChange={(e) => handleInputChange(e, "F_recommanded")}
              size={screens.xs ? 'small' : 'middle'}
              style={{ width: '100%' }}
            />
          ) : (
            <Text style={{
              color: token.colorWarning,
              fontWeight: 600,
              fontSize: screens.xs ? '12px' : '14px'
            }}>
              {text?.toLocaleString() || 0}
            </Text>
          ),
      },
    {
      title: "Actions",
      key: "actions",
      width: screens.xs ? 80 : 120,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space size="small">
            <Tooltip title="Save">
              <Button
                type="primary"
                size="small"
                icon={<SaveOutlined />}
                onClick={() => handleSave(record.key)}
              />
            </Tooltip>
            <Tooltip title="Cancel">
              <Button
                size="small"
                icon={<CloseOutlined />}
                onClick={handleCancel}
              />
            </Tooltip>
          </Space>
        ) : (
          <Tooltip title="Edit">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={editingKey !== ""}
            />
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div style={{
      padding: screens.xs ? '16px' : '24px',
      background: token.colorBgLayout,
      minHeight: '100vh'
    }}>
      {/* Header Section */}
      <Card
        style={{
          marginBottom: '24px',
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
      >
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: screens.xs ? 'wrap' : 'nowrap',
          gap: '16px'
        }}>
          <div>
            <Title level={screens.xs ? 4 : 3} style={{ margin: 0, color: token.colorTextHeading }}>
              <ShoppingOutlined style={{ marginRight: '8px', color: token.colorPrimary }} />
              Amazon Inventory Report
            </Title>
            <Text style={{ color: token.colorTextSecondary }}>
              {filterMode === 'amazon' ? 'Amazon Sales & Inventory' : 'Flipkart Sales & Stock'}
            </Text>
          </div>

          <Space size="small" wrap>
            <Button
              type={filterMode === "amazon" ? "primary" : "default"}
              icon={<ShoppingOutlined />}
              onClick={handleAmazonFilter}
              size={screens.xs ? 'small' : 'middle'}
            >
              {screens.xs ? 'Amazon' : 'Amazon Filter'}
            </Button>
            <Button
              type={filterMode === "flipkart" ? "primary" : "default"}
              icon={<BarChartOutlined />}
              onClick={handleFlipkartFilter}
              size={screens.xs ? 'small' : 'middle'}
            >
              {screens.xs ? 'Flipkart' : 'Flipkart Filter'}
            </Button>
            <Button
              type="default"
              icon={<ArrowLeftOutlined />}
              onClick={() => window.history.back()}
              size={screens.xs ? 'small' : 'middle'}
            >
              {screens.xs ? '' : 'Back'}
            </Button>
            <Button
              type="primary"
              icon={<DownloadOutlined />}
              onClick={handleDownloadSelected}
              disabled={selectedRows.length === 0}
              size={screens.xs ? 'small' : 'middle'}
            >
              {screens.xs ? 'Export' : 'Export Selected'}
            </Button>
          </Space>
        </div>
      </Card>

                  {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ borderRadius: '8px' }}>
                  <Statistic
                    title="Total Items"
                    value={summaryStats.totalItems}
                    prefix={<DatabaseOutlined />}
                    valueStyle={{ color: token.colorPrimary, fontSize: screens.xs ? '16px' : '20px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ borderRadius: '8px' }}>
                  <Statistic
                    title={filterMode === "amazon" ? "Amazon Sales" : "Flipkart Sales"}
                    value={summaryStats.totalSales}
                    valueStyle={{ color: token.colorSuccess, fontSize: screens.xs ? '16px' : '20px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ borderRadius: '8px' }}>
                  <Statistic
                    title={filterMode === "amazon" ? "Warehouse Stock" : "Stock Quantity"}
                    value={summaryStats.totalStock}
                    valueStyle={{ color: token.colorPrimary, fontSize: screens.xs ? '16px' : '20px' }}
                  />
                </Card>
              </Col>
              <Col xs={12} sm={6}>
                <Card size="small" style={{ borderRadius: '8px' }}>
                  <Statistic
                    title="Total Remaining"
                    value={summaryStats.totalRemaining}
                    valueStyle={{ 
                      color: summaryStats.totalRemaining > 0 ? token.colorSuccess : token.colorError,
                      fontSize: screens.xs ? '16px' : '20px'
                    }}
                  />
                </Card>
              </Col>
            </Row>

      {/* Search and Table */}
      <Card
        style={{
          borderRadius: '12px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
        }}
        bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
      >
        <div style={{ marginBottom: '16px' }}>
          <Input
            placeholder="Search items..."
            prefix={<SearchOutlined />}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              maxWidth: screens.xs ? '100%' : '300px',
              borderRadius: '8px'
            }}
            size={screens.xs ? 'small' : 'middle'}
          />
        </div>

        <Table
          columns={filterMode === "flipkart" ? flipkartFilterColumns : amazonFilterColumns}
          dataSource={filteredData}
          loading={loading}
          bordered
          size={screens.xs ? 'small' : 'middle'}
          pagination={{
            pageSize: screens.xs ? 10 : 20,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} of ${total} items`,
            size: screens.xs ? 'small' : 'default'
          }}
          scroll={{ x: screens.xs ? 800 : 1200 }}
          style={{
            borderRadius: '8px',
            overflow: 'hidden'
          }}
          rowSelection={rowSelection}
        />
      </Card>
    </div>
  );
};

export default AmazonSales;
