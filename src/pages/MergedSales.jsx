import React, { useEffect, useState } from "react";
import {
  Table,
  Typography,
  Card,
  Row,
  Col,
  Statistic,
  Space,
  Tag,
  Input,
  Button,
  message,
  theme
} from "antd";
import {
  AppstoreOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  ReloadOutlined,
  SearchOutlined
} from '@ant-design/icons';

const { Title } = Typography;

const MergedSales = () => {
  const [amazonData, setAmazonData] = useState([]);
  const [flipkartData, setFlipkartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const { token } = theme.useToken();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [amazon, flipkart] = await Promise.all([
        window.electronAPI.getAmazonInventoryReport().catch(() => []),
        window.electronAPI.getFlipkartMergedData().catch(() => [])
      ]);
      setAmazonData(amazon);
      setFlipkartData(flipkart);
    } catch (error) {
      message.error("Error loading data");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const amazonSales = amazonData.reduce((sum, item) => sum + (parseFloat(item.total_sales || item.amazon_sales || 0)), 0);
  const flipkartSales = flipkartData.reduce((sum, item) => sum + (parseFloat(item.total_flipkart_sales || 0)), 0);
  const totalSales = amazonSales + flipkartSales;

  const amazonRevenue = amazonData.reduce((sum, item) => {
    const price = parseFloat(item.price || 0);
    const sales = parseFloat(item.total_sales || item.amazon_sales || 0);
    return sum + (price * sales);
  }, 0);

  const flipkartRevenue = flipkartData.reduce((sum, item) => {
    const price = parseFloat(item.price || 0);
    const sales = parseFloat(item.total_flipkart_sales || 0);
    return sum + (price * sales);
  }, 0);
  const totalRevenue = amazonRevenue + flipkartRevenue;

  const amazonStock = amazonData.reduce((sum, item) => sum + (parseFloat(item.ending_warehouse_stock || 0)), 0);
  const flipkartStock = flipkartData.reduce((sum, item) => sum + (parseFloat(item.total_stock_quantity || 0)), 0);
  const totalStock = amazonStock + flipkartStock;

  const amazonGrowth = amazonSales > 0 ? ((amazonSales / totalSales) * 100).toFixed(1) : 0;
  const flipkartGrowth = flipkartSales > 0 ? ((flipkartSales / totalSales) * 100).toFixed(1) : 0;

  const comparisonData = [
    {
      key: '1',
      platform: 'Amazon',
      totalSales: amazonSales.toFixed(0),
      revenue: `₹${amazonRevenue.toFixed(2)}`,
      stockUsage: amazonStock.toFixed(0),
      growth: `${amazonGrowth}%`,
      color: '#1890ff'
    },
    {
      key: '2',
      platform: 'Flipkart',
      totalSales: flipkartSales.toFixed(0),
      revenue: `₹${flipkartRevenue.toFixed(2)}`,
      stockUsage: flipkartStock.toFixed(0),
      growth: `${flipkartGrowth}%`,
      color: '#52c41a'
    },
    {
      key: '3',
      platform: 'Total',
      totalSales: totalSales.toFixed(0),
      revenue: `₹${totalRevenue.toFixed(2)}`,
      stockUsage: totalStock.toFixed(0),
      growth: '100%',
      color: '#722ed1'
    }
  ];

  const columns = [
    {
      title: 'Platform',
      dataIndex: 'platform',
      key: 'platform',
      render: (text, record) => (
        <Tag color={record.color}>{text}</Tag>
      )
    },
    {
      title: 'Total Sales',
      dataIndex: 'totalSales',
      key: 'totalSales',
    },
    {
      title: 'Revenue',
      dataIndex: 'revenue',
      key: 'revenue',
    },
    {
      title: 'Stock Usage',
      dataIndex: 'stockUsage',
      key: 'stockUsage',
    },
    {
      title: 'Growth %',
      dataIndex: 'growth',
      key: 'growth',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={2}>
            <AppstoreOutlined /> Merged Sales Analysis
          </Title>
          <Button
            icon={<ReloadOutlined />}
            onClick={loadData}
            loading={loading}
          >
            Refresh
          </Button>
        </div>

        <Row gutter={16}>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Sales"
                value={totalSales.toFixed(0)}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Revenue"
                value={`₹${totalRevenue.toFixed(2)}`}
                prefix={<BarChartOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card>
              <Statistic
                title="Total Stock"
                value={totalStock.toFixed(0)}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
        </Row>

        <Card title="Platform Comparison">
          <Table
            columns={columns}
            dataSource={comparisonData}
            pagination={false}
            loading={loading}
          />
        </Card>

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card title="Amazon Statistics">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic title="Total Sales" value={amazonSales.toFixed(0)} />
                <Statistic title="Revenue" value={`₹${amazonRevenue.toFixed(2)}`} />
                <Statistic title="Stock" value={amazonStock.toFixed(0)} />
                <Statistic title="Growth" value={`${amazonGrowth}%`} />
              </Space>
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card title="Flipkart Statistics">
              <Space direction="vertical" style={{ width: '100%' }}>
                <Statistic title="Total Sales" value={flipkartSales.toFixed(0)} />
                <Statistic title="Revenue" value={`₹${flipkartRevenue.toFixed(2)}`} />
                <Statistic title="Stock" value={flipkartStock.toFixed(0)} />
                <Statistic title="Growth" value={`${flipkartGrowth}%`} />
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default MergedSales;

