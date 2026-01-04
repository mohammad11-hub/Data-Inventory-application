import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Input,
  Button,
  message,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  theme,
  Grid
} from "antd";
import {
  SearchOutlined,
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  CloseOutlined,
  BarChartOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title } = Typography;
const { useBreakpoint } = Grid;

const FlipkartSales = () => {
  const { user, logActivity } = useAuth();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingKey, setEditingKey] = useState("");
  const [editRow, setEditRow] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = theme.useToken();
  const screens = useBreakpoint();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const flipkartRows = await window.electronAPI.getFlipkartMergedData();
      setData(flipkartRows.map((row, idx) => ({ ...row, key: idx })));
    } catch (err) {
      message.error("Error loading Flipkart data");
      console.error(err);
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
    try {
      setLoading(true);
      const row = data.find(item => item.key === key);
      if (!row) return;

      const identifier = row.fnsku || row.item_name;
      const fExpectedStock = parseInt(editRow.f_expectedstock) || 0;
      const fRecommended = parseInt(editRow.F_recommanded) || 0;

      await window.electronAPI.updateAmazonFExpectedStockByFnsku(
        identifier,
        fExpectedStock,
        fRecommended
      );

      await logActivity('UPDATE', 'flipkart_sales', row.id, `Updated Flipkart sales for ${identifier}`);
      message.success("Data updated successfully");
      await loadData();
      setEditingKey("");
      setEditRow({});
    } catch (error) {
      message.error("Failed to update data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredData = data.filter((item) => {
    return Object.values(item).some((value) =>
      String(value).toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const summaryStats = {
    totalProducts: filteredData.length,
    totalSales: filteredData.reduce((sum, item) => sum + (parseFloat(item.total_flipkart_sales || 0)), 0),
    totalStock: filteredData.reduce((sum, item) => sum + (parseFloat(item.total_stock_quantity || 0)), 0)
  };

  const columns = [
    {
      title: 'FNSKU',
      dataIndex: 'fnsku',
      key: 'fnsku',
      width: 150,
    },
    {
      title: 'Product Name',
      dataIndex: 'item_name',
      key: 'item_name',
      width: 200,
    },
    {
      title: 'Total Sales',
      dataIndex: 'total_flipkart_sales',
      key: 'total_flipkart_sales',
      width: 120,
      render: (value) => parseFloat(value || 0).toFixed(0),
    },
    {
      title: 'Stock Quantity',
      dataIndex: 'total_stock_quantity',
      key: 'total_stock_quantity',
      width: 120,
      render: (value) => parseFloat(value || 0).toFixed(0),
    },
    {
      title: 'Remaining Stock',
      dataIndex: 'total_remaining_stock',
      key: 'total_remaining_stock',
      width: 120,
      render: (value) => {
        const val = parseFloat(value || 0);
        return <Tag color={val < 0 ? 'red' : val < 50 ? 'orange' : 'green'}>{val.toFixed(0)}</Tag>;
      },
    },
    {
      title: 'Expected Stock',
      dataIndex: 'f_expectedstock',
      key: 'f_expectedstock',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Input
              value={editRow.f_expectedstock}
              onChange={(e) => setEditRow({ ...editRow, f_expectedstock: e.target.value })}
              type="number"
            />
          );
        }
        return text || 0;
      },
    },
    {
      title: 'Recommended',
      dataIndex: 'F_recommanded',
      key: 'F_recommanded',
      width: 120,
      render: (text, record) => {
        if (isEditing(record)) {
          return (
            <Input
              value={editRow.F_recommanded}
              onChange={(e) => setEditRow({ ...editRow, F_recommanded: e.target.value })}
              type="number"
            />
          );
        }
        return text || 0;
      },
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 150,
      render: (_, record) => {
        const editable = isEditing(record);
        return editable ? (
          <Space>
            <Button
              type="primary"
              icon={<SaveOutlined />}
              onClick={() => handleSave(record.key)}
              size="small"
            >
              Save
            </Button>
            <Button
              icon={<CloseOutlined />}
              onClick={handleCancel}
              size="small"
            >
              Cancel
            </Button>
          </Space>
        ) : (
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Edit
          </Button>
        );
      },
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>
            <BarChartOutlined /> Flipkart Sales
          </Title>
          <Space>
            <Input
              placeholder="Search..."
              prefix={<SearchOutlined />}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ width: 200 }}
            />
            <Button
              icon={<ReloadOutlined />}
              onClick={loadData}
              loading={loading}
            >
              Refresh
            </Button>
          </Space>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Products"
                value={summaryStats.totalProducts}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Sales"
                value={summaryStats.totalSales.toFixed(0)}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Stock"
                value={summaryStats.totalStock.toFixed(0)}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Card>
          <Table
            columns={columns}
            dataSource={filteredData}
            loading={loading}
            scroll={{ x: 'max-content' }}
            pagination={{
              pageSize: 20,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} items`,
            }}
          />
        </Card>
      </Space>
    </div>
  );
};

export default FlipkartSales;

