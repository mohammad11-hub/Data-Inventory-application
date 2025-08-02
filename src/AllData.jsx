import React, { useState, useEffect } from 'react';
import { 
  Form, 
  Input, 
  InputNumber, 
  Popconfirm, 
  Table, 
  Typography, 
  Button, 
  Card,
  Row,
  Col,
  Space,
  Tag,
  Tooltip,
  Select,
  theme,
  Grid,
  Statistic,
  Alert,
  Empty,
  Spin
} from 'antd';
import { useNavigate } from 'react-router-dom';
import { 
  DatabaseOutlined, 
  EditOutlined, 
  SaveOutlined, 
  CloseOutlined,
  SearchOutlined,
  ArrowLeftOutlined,
  TableOutlined,
  ReloadOutlined,
  InfoCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';

const { Title, Text, Paragraph } = Typography;
const { useBreakpoint } = Grid;

function EditableCell({
    editing, dataIndex, title, inputType, record, index, children, ...restProps
}) {
    const inputNode = inputType === 'number' ? <InputNumber /> : <Input />;

    return (
        <td {...restProps}>
            {editing ? (
                <Form.Item
                    name={dataIndex}
                    style={{ margin: 0 }}
                    rules={[{ required: true, message: `Please Input ${title}!` }]}
                >
                    {inputNode}
                </Form.Item>
            ) : (
                children
            )}
        </td>
    );
}

const AllData = () => {
    const navigate = useNavigate();
    const { token } = theme.useToken();
    const screens = useBreakpoint();
    const [form] = Form.useForm();
    const [editingKey, setEditingKey] = useState('');
    const [tableNames, setTableNames] = useState([]);
    const [selectedTableName, setSelectedTableName] = useState(null);
    const [selectedTableData, setSelectedTableData] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [tableLoading, setTableLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchTableNames();
    }, []);

    useEffect(() => {
        if (selectedTableName) {
            fetchTableData(selectedTableName);
        }
    }, [selectedTableName]);

    const fetchTableNames = async () => {
        setLoading(true);
        setError(null);
        try {
            const names = await window.electronAPI.getTableNames();
            setTableNames(names);
            if (names.length > 0) {
                setSelectedTableName(names[0]);
            }
        } catch (error) {
            console.error("Failed to get table names:", error);
            setError("Failed to load database tables. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const fetchTableData = async (tableName) => {
        setTableLoading(true);
        setError(null);
        try {
            const data = await window.electronAPI.getTableData(tableName);
            const dataWithKeys = data.map((row, index) => ({ ...row, key: index.toString() }));
            setSelectedTableData(dataWithKeys);
            setEditingKey('');
            console.log("Fetched data:", dataWithKeys);
        } catch (error) {
            console.error(`Failed to get data for table ${tableName}:`, error);
            setSelectedTableData([]);
            setError(`Failed to load data for table '${tableName}'. Please try again.`);
        } finally {
            setTableLoading(false);
        }
    };

    const isEditing = (record) => record.key === editingKey;

    const edit = (record) => {
        form.setFieldsValue({ ...record });
        setEditingKey(record.key);
    };

    const cancel = () => {
        setEditingKey('');
    };

    const save = async (key) => {
        try {
            const row = await form.validateFields();
            const oldRow = selectedTableData.find((item) => item.key === key);
            if (!oldRow || !selectedTableName) {
                console.error("Could not find row or table name for saving.");
                return;
            }

            const rowId = oldRow.id;

            if (rowId === undefined || rowId === null) {
                console.error("Row ID is missing, cannot update the database.", oldRow);
                return;
            }

            await window.electronAPI.updateTableRow(selectedTableName, rowId, row);
            
            // Refresh the data after successful update
            await fetchTableData(selectedTableName);
            
        } catch (errInfo) {
            console.log('Validate Failed:', errInfo);
        }
    };

    const filteredData = selectedTableData.filter((item) => {
        return Object.values(item).some((value) =>
            String(value).toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    // Calculate summary statistics
    const summaryStats = {
        totalRecords: filteredData.length,
        totalTables: tableNames.length,
        editingRecords: editingKey ? 1 : 0,
        hasData: selectedTableData.length > 0
    };

    // Dynamic columns for database tables
    const dbTableColumns = selectedTableData.length > 0
        ? Object.keys(selectedTableData[0]).filter(key => key !== 'key').map(key => ({
            title: key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1),
            dataIndex: key,
            key: key,
            width: screens.xs ? 120 : 150,
            render: (text, record) => {
                const editing = isEditing(record);
                if (editing) {
                    return null; // Let EditableCell handle the input
                }
                
                // Handle null/undefined values
                if (text === null || text === undefined || text === '') {
                    return (
                        <Text style={{ 
                            fontSize: screens.xs ? '12px' : '14px',
                            color: token.colorTextSecondary,
                            fontStyle: 'italic'
                        }}>
                            -
                        </Text>
                    );
                }
                
                // Special rendering for different data types and field names
                if (typeof text === 'number') {
                    // Format numbers with proper separators
                    return (
                        <Text style={{ 
                            fontWeight: 600,
                            fontSize: screens.xs ? '12px' : '14px',
                            color: text > 0 ? token.colorSuccess : token.colorTextSecondary,
                            fontFamily: 'monospace'
                        }}>
                            {text.toLocaleString()}
                        </Text>
                    );
                }
                
                // Handle ID fields (ASIN, FNSKU, etc.)
                if (key.toLowerCase().includes('id') || key.toLowerCase().includes('asin') || key.toLowerCase().includes('fnsku') || key.toLowerCase().includes('fsn')) {
                    return (
                        <Tag color="blue" style={{ 
                            fontFamily: 'monospace', 
                            fontSize: screens.xs ? '10px' : '12px',
                            fontWeight: 'bold'
                        }}>
                            {text}
                        </Tag>
                    );
                }
                
                // Handle date fields
                if (key.toLowerCase().includes('date') || key.toLowerCase().includes('time')) {
                    const date = new Date(text);
                    if (!isNaN(date.getTime())) {
                        return (
                            <Text style={{ 
                                fontSize: screens.xs ? '12px' : '14px',
                                color: token.colorText,
                                fontFamily: 'monospace'
                            }}>
                                {date.toLocaleDateString()}
                            </Text>
                        );
                    }
                }
                
                // Handle boolean values
                if (typeof text === 'boolean') {
                    return (
                        <Tag color={text ? 'green' : 'red'} style={{ 
                            fontSize: screens.xs ? '10px' : '12px'
                        }}>
                            {text ? 'Yes' : 'No'}
                        </Tag>
                    );
                }
                
                // Handle sales/quantity fields
                if (key.toLowerCase().includes('sales') || key.toLowerCase().includes('quantity') || key.toLowerCase().includes('stock') || key.toLowerCase().includes('balance')) {
                    const numValue = parseFloat(text);
                    if (!isNaN(numValue)) {
                        return (
                            <Text style={{ 
                                fontWeight: 600,
                                fontSize: screens.xs ? '12px' : '14px',
                                color: numValue > 0 ? token.colorSuccess : numValue < 0 ? token.colorError : token.colorTextSecondary,
                                fontFamily: 'monospace'
                            }}>
                            {numValue.toLocaleString()}
                            </Text>
                        );
                    }
                }
                
                // Handle price/amount fields
                if (key.toLowerCase().includes('price') || key.toLowerCase().includes('amount') || key.toLowerCase().includes('cost')) {
                    const numValue = parseFloat(text);
                    if (!isNaN(numValue)) {
                        return (
                            <Text style={{ 
                                fontWeight: 600,
                                fontSize: screens.xs ? '12px' : '14px',
                                color: token.colorSuccess,
                                fontFamily: 'monospace'
                            }}>
                            ${numValue.toFixed(2)}
                            </Text>
                        );
                    }
                }
                
                // Handle percentage fields
                if (key.toLowerCase().includes('percent') || key.toLowerCase().includes('rate')) {
                    const numValue = parseFloat(text);
                    if (!isNaN(numValue)) {
                        return (
                            <Text style={{ 
                                fontWeight: 600,
                                fontSize: screens.xs ? '12px' : '14px',
                                color: numValue > 0 ? token.colorSuccess : token.colorTextSecondary
                            }}>
                            {numValue.toFixed(2)}%
                            </Text>
                        );
                    }
                }
                
                // Handle status fields
                if (key.toLowerCase().includes('status') || key.toLowerCase().includes('state')) {
                    const statusText = String(text).toLowerCase();
                    let color = 'default';
                    if (statusText.includes('active') || statusText.includes('success') || statusText.includes('completed')) {
                        color = 'green';
                    } else if (statusText.includes('pending') || statusText.includes('waiting')) {
                        color = 'orange';
                    } else if (statusText.includes('error') || statusText.includes('failed') || statusText.includes('cancelled')) {
                        color = 'red';
                    }
                    return (
                        <Tag color={color} style={{ 
                            fontSize: screens.xs ? '10px' : '12px',
                            textTransform: 'capitalize'
                        }}>
                            {text}
                        </Tag>
                    );
                }
                
                // Handle long text (item names, descriptions)
                if (key.toLowerCase().includes('name') || key.toLowerCase().includes('description') || key.toLowerCase().includes('title')) {
                    return (
                        <Tooltip title={text} placement="topLeft">
                            <Text style={{ 
                                fontSize: screens.xs ? '12px' : '14px',
                                color: token.colorText,
                                fontWeight: 500,
                                display: 'block',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                                maxWidth: screens.xs ? '100px' : '150px'
                            }}>
                                {text}
                            </Text>
                        </Tooltip>
                    );
                }
                
                // Default rendering for other text fields
                return (
                    <Text style={{ 
                        fontSize: screens.xs ? '12px' : '14px',
                        color: token.colorText,
                        wordBreak: 'break-word'
                    }}>
                        {text}
                    </Text>
                );
            },
            onCell: (record) => ({
                record,
                inputType: 'text',
                dataIndex: key,
                title: key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.replace(/_/g, ' ').slice(1),
                editing: isEditing(record),
            }),
        })).concat({
            title: 'Actions',
            key: 'actions',
            width: screens.xs ? 80 : 120,
            fixed: 'right',
            render: (_, record) => {
                const editable = isEditing(record);
                return editable ? (
                    <Space size="small">
                        <Tooltip title="Save Changes">
                            <Button
                                type="primary"
                                size="small"
                                icon={<SaveOutlined />}
                                onClick={() => save(record.key)}
                            />
                        </Tooltip>
                        <Tooltip title="Cancel">
                            <Button
                                size="small"
                                icon={<CloseOutlined />}
                                onClick={cancel}
                            />
                        </Tooltip>
                    </Space>
                ) : (
                    <Tooltip title="Edit Record">
                        <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            disabled={editingKey !== ''}
                            onClick={() => edit(record)}
                        />
                    </Tooltip>
                );
            },
        })
        : [];

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
                            <DatabaseOutlined style={{ marginRight: '8px', color: token.colorPrimary }} />
                            Database Tables
                        </Title>
                        <Text style={{ color: token.colorTextSecondary }}>
                            View and manage all database tables and records
                        </Text>
                    </div>
                    
                    <Space size="small">
                        <Button 
                            type="default"
                            icon={<ReloadOutlined />}
                            onClick={fetchTableNames}
                            loading={loading}
                            size={screens.xs ? 'small' : 'middle'}
                        >
                            {screens.xs ? '' : 'Refresh'}
                        </Button>
                        <Button 
                            type="primary" 
                            onClick={() => navigate('/')}
                            icon={<ArrowLeftOutlined />}
                            size={screens.xs ? 'small' : 'middle'}
                        >
                            {screens.xs ? '' : 'Back to Home'}
                        </Button>
                    </Space>
                </div>
            </Card>

            {/* Error Alert */}
            {error && (
                <Alert
                    message="Error"
                    description={error}
                    type="error"
                    showIcon
                    closable
                    style={{ marginBottom: '24px' }}
                    onClose={() => setError(null)}
                />
            )}

            {/* Statistics Cards */}
            <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Available Tables"
                            value={summaryStats.totalTables}
                            prefix={<TableOutlined />}
                            valueStyle={{ color: token.colorPrimary, fontSize: screens.xs ? '16px' : '20px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Total Records"
                            value={summaryStats.totalRecords}
                            prefix={<DatabaseOutlined />}
                            valueStyle={{ color: token.colorSuccess, fontSize: screens.xs ? '16px' : '20px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Editing"
                            value={summaryStats.editingRecords}
                            prefix={<EditOutlined />}
                            valueStyle={{ color: token.colorWarning, fontSize: screens.xs ? '16px' : '20px' }}
                        />
                    </Card>
                </Col>
                <Col xs={12} sm={6}>
                    <Card size="small" style={{ borderRadius: '8px' }}>
                        <Statistic
                            title="Status"
                            value={summaryStats.hasData ? "Active" : "No Data"}
                            prefix={summaryStats.hasData ? <CheckCircleOutlined /> : <ExclamationCircleOutlined />}
                            valueStyle={{ 
                                color: summaryStats.hasData ? token.colorSuccess : token.colorError,
                                fontSize: screens.xs ? '16px' : '20px'
                            }}
                        />
                    </Card>
                </Col>
            </Row>

            {/* Table Selection and Search */}
            <Card
                style={{
                    marginBottom: '24px',
                    borderRadius: '12px',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                }}
                bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
            >
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} sm={12} md={8}>
                        <div style={{ marginBottom: screens.xs ? '8px' : '0' }}>
                            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                Select Table:
                            </Text>
                            <Select
                                value={selectedTableName || ''}
                                onChange={setSelectedTableName}
                                style={{ width: '100%' }}
                                size={screens.xs ? 'small' : 'middle'}
                                placeholder="--Select a table--"
                                loading={loading}
                                notFoundContent={loading ? <Spin size="small" /> : "No tables found"}
                            >
                                {tableNames.map(name => (
                                    <Select.Option key={name} value={name}>
                                        <TableOutlined style={{ marginRight: '8px' }} />
                                        {name}
                                    </Select.Option>
                                ))}
                            </Select>
                        </div>
                    </Col>
                    <Col xs={24} sm={12} md={16}>
                        <div style={{ marginBottom: screens.xs ? '8px' : '0' }}>
                            <Text strong style={{ display: 'block', marginBottom: '8px' }}>
                                Search Records:
                            </Text>
                            <Input
                                placeholder="Search in table data..."
                                prefix={<SearchOutlined />}
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                style={{ 
                                    width: '100%',
                                    borderRadius: '8px'
                                }}
                                size={screens.xs ? 'small' : 'middle'}
                                allowClear
                            />
                        </div>
                    </Col>
                </Row>
            </Card>

            {/* Data Table */}
            {selectedTableName && selectedTableData.length > 0 ? (
                <Card
                    style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
                    }}
                    bodyStyle={{ padding: screens.xs ? '16px' : '24px' }}
                >
                    <div style={{ marginBottom: '16px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                            <div>
                                <Text strong style={{ fontSize: screens.xs ? '14px' : '16px' }}>
                                    Table: {selectedTableName}
                                </Text>
                                <br />
                                <Text type="secondary" style={{ fontSize: screens.xs ? '12px' : '14px' }}>
                                    {filteredData.length} of {selectedTableData.length} records
                                    {searchTerm && ` (filtered by "${searchTerm}")`}
                                </Text>
                            </div>
                            {editingKey && (
                                <Alert
                                    message="Editing Mode"
                                    description="You are currently editing a record. Save or cancel your changes."
                                    type="info"
                                    showIcon
                                    style={{ maxWidth: '300px' }}
                                />
                            )}
                        </div>
                    </div>
                    
                    <Form form={form} component={false}>
                        <Table
                            components={{ body: { cell: EditableCell } }}
                            bordered
                            dataSource={filteredData}
                            columns={dbTableColumns}
                            rowClassName="editable-row"
                            size={screens.xs ? 'small' : 'middle'}
                            loading={tableLoading}
                            pagination={{
                                pageSize: screens.xs ? 10 : 20,
                                showSizeChanger: true,
                                showQuickJumper: true,
                                showTotal: (total, range) => 
                                    `${range[0]}-${range[1]} of ${total} records`,
                                size: screens.xs ? 'small' : 'default',
                                onChange: cancel
                            }}
                            scroll={{ x: screens.xs ? 800 : 1200 }}
                            style={{
                                borderRadius: '8px',
                                overflow: 'hidden'
                            }}
                        />
                    </Form>
                </Card>
            ) : selectedTableName ? (
                <Card
                    style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        textAlign: 'center',
                        padding: '48px 24px'
                    }}
                >
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <Title level={4} style={{ color: token.colorTextSecondary }}>
                                    No data found for table '{selectedTableName}'
                                </Title>
                                <Paragraph style={{ color: token.colorTextSecondary }}>
                                    This table appears to be empty or there was an error loading the data.
                                </Paragraph>
                            </div>
                        }
                    >
                        <Button type="primary" onClick={() => fetchTableData(selectedTableName)}>
                            Try Again
                        </Button>
                    </Empty>
                </Card>
            ) : (
                <Card
                    style={{
                        borderRadius: '12px',
                        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                        textAlign: 'center',
                        padding: '48px 24px'
                    }}
                >
                    <Empty
                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                        description={
                            <div>
                                <Title level={4} style={{ color: token.colorTextSecondary }}>
                                    Please select a table to view its data
                                </Title>
                                <Paragraph style={{ color: token.colorTextSecondary }}>
                                    Choose a table from the dropdown above to start viewing and editing data.
                                </Paragraph>
                            </div>
                        }
                    />
                </Card>
            )}
        </div>
    );
};

export default AllData; 