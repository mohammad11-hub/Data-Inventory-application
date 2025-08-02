import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Typography, 
  Button, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Space,
  Tag,
  Tooltip,
  Input,
  theme,
  Grid,
  message
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingOutlined, 
  BarChartOutlined, 
  DatabaseOutlined,
  ArrowLeftOutlined,
  SearchOutlined,
  SortAscendingOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  DownloadOutlined
} from '@ant-design/icons';

const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

const FlipkartMergedData = () => {
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const screens = useBreakpoint();
    const [loading, setLoading] = useState(true);
    const [data, setData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [editingKey, setEditingKey] = useState("");
    const [editRow, setEditRow] = useState({});
    const [selectedRowKeys, setSelectedRowKeys] = useState([]);
    const [selectedRows, setSelectedRows] = useState([]);
    const [summary, setSummary] = useState({
        totalItems: 0,
        totalSales: 0,
        totalStock: 0,
        totalRemaining: 0
    });

    useEffect(() => {
        // Initialize database columns if they don't exist
        const initializeColumns = async () => {
            try {
                await window.electronAPI.addFExpectedStockColumn();
                await window.electronAPI.addFRecommandedColumn();
            } catch (err) {
                console.error("Error initializing columns:", err);
            }
        };

        initializeColumns().then(() => {
            fetchData();
        });
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const result = await window.electronAPI.getFlipkartMergedData();
            setData(result);
            
            // Calculate summary statistics
            const totalSales = result.reduce((sum, item) => sum + item.total_flipkart_sales, 0);
            const totalStock = result.reduce((sum, item) => sum + item.total_stock_quantity, 0);
            const totalRemaining = result.reduce((sum, item) => sum + item.total_remaining_stock, 0);
            
            setSummary({
                totalItems: result.length,
                totalSales,
                totalStock,
                totalRemaining
            });
        } catch (error) {
            console.error('Error fetching Flipkart merged data:', error);
            setData([]);
        } finally {
            setLoading(false);
        }
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
                    // Update only the specific row that was edited
        newData[idx].f_expectedstock = editRow.f_expectedstock;
        newData[idx].F_recommanded = editRow.F_recommanded;
        setData(newData);
        
        // Update only the specific FNSKU in the database
        const fnsku = newData[idx].fnsku;
        if (fnsku) {
            try {
                await window.electronAPI.updateAmazonFExpectedStockByFnsku(fnsku, editRow.f_expectedstock, editRow.F_recommanded);
                message.success(`f_expectedstock and F_Recommended updated for ${fnsku}`);
                // Refresh data to show updated values
                fetchData();
            } catch (err) {
                message.error('Failed to update Flipkart data in database');
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
            const result = await window.electronAPI.exportSelectedRowsToExcel(selectedRows, 'flipkart_merged');
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

    const columns = [
        {
            title: 'FNSKU',
            dataIndex: 'fnsku',
            key: 'fnsku',
            width: screens.xs ? 120 : 150,
            render: (text) => (
                <Tag color="purple" style={{ 
                    fontFamily: 'monospace', 
                    fontSize: screens.xs ? '10px' : '12px',
                    fontWeight: 'bold'
                }}>
                    {text}
                </Tag>
            ),
            sorter: (a, b) => a.fnsku.localeCompare(b.fnsku),
            sortDirections: ['ascend', 'descend']
        },
        {
            title: 'Item Name',
            dataIndex: 'item_name',
            key: 'item_name',
            width: screens.xs ? 150 : 300,
            render: (text) => (
                <Text strong style={{ 
                    fontSize: screens.xs ? '12px' : '14px',
                    color: token.colorTextHeading
                }}>
                    {text}
                </Text>
            ),
            sorter: (a, b) => a.item_name.localeCompare(b.item_name),
            sortDirections: ['ascend', 'descend']
        },
        {
            title: 'Total Sales',
            dataIndex: 'total_flipkart_sales',
            key: 'total_flipkart_sales',
            width: screens.xs ? 100 : 150,
            render: (value) => (
                <Text style={{ 
                    color: value > 0 ? token.colorSuccess : token.colorTextSecondary,
                    fontWeight: 600,
                    fontSize: screens.xs ? '12px' : '14px'
                }}>
                    {value.toLocaleString()}
                </Text>
            ),
            sorter: (a, b) => a.total_flipkart_sales - b.total_flipkart_sales,
            defaultSortOrder: 'descend'
        },
        {
            title: 'Total Stock',
            dataIndex: 'total_stock_quantity',
            key: 'total_stock_quantity',
            width: screens.xs ? 100 : 150,
            render: (value) => (
                <Text style={{ 
                    color: value > 0 ? token.colorPrimary : token.colorTextSecondary,
                    fontWeight: 600,
                    fontSize: screens.xs ? '12px' : '14px'
                }}>
                    {value.toLocaleString()}
                </Text>
            ),
            sorter: (a, b) => a.total_stock_quantity - b.total_stock_quantity
        },
        {
            title: 'Remaining Stock',
            dataIndex: 'total_remaining_stock',
            key: 'total_remaining_stock',
            width: screens.xs ? 120 : 150,
            render: (value) => (
                <Text style={{ 
                    color: value > 0 ? token.colorSuccess : value < 0 ? token.colorError : token.colorTextSecondary,
                    fontWeight: 600,
                    fontSize: screens.xs ? '12px' : '14px'
                }}>
                    {value.toLocaleString()}
                </Text>
            ),
            sorter: (a, b) => a.total_remaining_stock - b.total_remaining_stock
        },
        {
            title: 'f_expectedstock',
            dataIndex: 'f_expectedstock',
            key: 'f_expectedstock',
            width: screens.xs ? 120 : 150,
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
            title: 'F_Recommended',
            dataIndex: 'F_recommanded',
            key: 'F_recommanded',
            width: screens.xs ? 120 : 150,
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
            title: 'Actions',
            key: 'actions',
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
        }
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
                            <BarChartOutlined style={{ marginRight: '8px', color: token.colorPrimary }} />
                            Flipkart Data - Merged by FNSKU
                        </Title>
                        <Text style={{ color: token.colorTextSecondary }}>
                            Comprehensive Flipkart inventory and sales analysis
                        </Text>
                    </div>
                    
                    <Space size="small">
                        <Button 
                            type="primary" 
                            onClick={() => navigate('/')}
                            icon={<ArrowLeftOutlined />}
                            size={screens.xs ? 'small' : 'middle'}
                        >
                            {screens.xs ? '' : 'Back to Home'}
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

            {/* Summary Statistics */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Total FNSKUs"
                            value={summary.totalItems}
                            prefix={<DatabaseOutlined />}
                            valueStyle={{ 
                                color: token.colorPrimary, 
                                fontSize: screens.xs ? '16px' : '20px' 
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Total Sales"
                            value={summary.totalSales}
                            valueStyle={{ 
                                color: token.colorSuccess, 
                                fontSize: screens.xs ? '16px' : '20px' 
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Total Stock"
                            value={summary.totalStock}
                            valueStyle={{ 
                                color: token.colorPrimary, 
                                fontSize: screens.xs ? '16px' : '20px' 
                            }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Total Remaining"
                            value={summary.totalRemaining}
                            valueStyle={{ 
                                color: summary.totalRemaining > 0 ? token.colorSuccess : token.colorError,
                                fontSize: screens.xs ? '16px' : '20px' 
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Data Table */}
            <Card 
                style={{
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
            >
                <div style={{ marginBottom: '16px' }}>
                    <Input
                        placeholder="Search FNSKUs or items..."
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
                    columns={columns}
                    dataSource={filteredData}
                    loading={loading}
                    size={screens.xs ? 'small' : 'middle'}
                    pagination={{
                        pageSize: screens.xs ? 10 : 20,
                        showSizeChanger: true,
                        showQuickJumper: true,
                        showTotal: (total, range) => 
                            `${range[0]}-${range[1]} of ${total} FNSKUs`,
                        size: screens.xs ? 'small' : 'default'
                    }}
                    scroll={{ x: screens.xs ? 800 : 1200 }}
                    style={{
                        borderRadius: '8px',
                        overflow: 'hidden'
                    }}
                    rowKey="key"
                    rowSelection={rowSelection}
                />
            </Card>
        </div>
    );
};

export default FlipkartMergedData; 