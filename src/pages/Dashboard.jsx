import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Alert, Tag } from 'antd';
import {
  DatabaseOutlined,
  ShoppingOutlined,
  AppstoreOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined,
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined
} from '@ant-design/icons';
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, LineElement, PointElement, ArcElement, Title, Tooltip, Legend } from 'chart.js';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { useAuth } from '../contexts/AuthContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const { Title } = Typography;

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalSales: 0,
    activeModules: 4,
    systemStatus: 'Online',
    lowStockAlerts: 0
  });
  const [chartData, setChartData] = useState({
    platformSales: null,
    monthlySales: null,
    categoryDistribution: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Fetch Amazon and Flipkart data
      const amazonData = await window.electronAPI.getAmazonInventoryReport().catch(() => []);
      const flipkartData = await window.electronAPI.getFlipkartMergedData().catch(() => []);

      // Calculate statistics
      const totalProducts = (amazonData?.length || 0) + (flipkartData?.length || 0);
      
      const totalSales = 
        (amazonData?.reduce((sum, item) => sum + (parseFloat(item.total_sales || item.amazon_sales || 0)), 0) || 0) +
        (flipkartData?.reduce((sum, item) => sum + (parseFloat(item.total_flipkart_sales || 0)), 0) || 0);

      const lowStockAlerts = 
        (amazonData?.filter(item => {
          const remaining = parseFloat(item.remaining_stock || 0);
          const expected = parseFloat(item.Expected_stock || 0);
          return remaining < expected && expected > 0;
        }).length || 0) +
        (flipkartData?.filter(item => {
          const remaining = parseFloat(item.total_remaining_stock || 0);
          const expected = parseFloat(item.f_expectedstock || 0);
          return remaining < expected && expected > 0;
        }).length || 0);

      setStats({
        totalProducts,
        totalSales: Math.round(totalSales),
        activeModules: 4,
        systemStatus: 'Online',
        lowStockAlerts
      });

      // Prepare chart data
      const amazonSales = amazonData?.reduce((sum, item) => sum + (parseFloat(item.total_sales || item.amazon_sales || 0)), 0) || 0;
      const flipkartSales = flipkartData?.reduce((sum, item) => sum + (parseFloat(item.total_flipkart_sales || 0)), 0) || 0;

      // Platform sales chart
      setChartData(prev => ({
        ...prev,
        platformSales: {
          labels: ['Amazon', 'Flipkart'],
          datasets: [{
            label: 'Total Sales',
            data: [amazonSales, flipkartSales],
            backgroundColor: ['#1890ff', '#52c41a'],
            borderColor: ['#1890ff', '#52c41a'],
            borderWidth: 1
          }]
        },
        monthlySales: {
          labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
          datasets: [{
            label: 'Sales Trend',
            data: [120, 190, 300, 500, 200, 300],
            borderColor: '#1890ff',
            backgroundColor: 'rgba(24, 144, 255, 0.1)',
            tension: 0.4
          }]
        },
        categoryDistribution: {
          labels: ['Electronics', 'Clothing', 'Books', 'Home', 'Other'],
          datasets: [{
            data: [30, 25, 20, 15, 10],
            backgroundColor: [
              '#1890ff',
              '#52c41a',
              '#faad14',
              '#f5222d',
              '#722ed1'
            ]
          }]
        }
      }));
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: ''
      }
    }
  };

  return (
    <div style={{ padding: '24px', minHeight: '100vh' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <div>
          <Title level={2}>Dashboard</Title>
          <Tag color="blue">Welcome, {user?.username} ({user?.role})</Tag>
        </div>

        {/* Statistics Cards */}
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Products"
                value={stats.totalProducts}
                prefix={<DatabaseOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Total Sales Records"
                value={stats.totalSales}
                prefix={<ShoppingOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="Active Modules"
                value={stats.activeModules}
                prefix={<AppstoreOutlined />}
                valueStyle={{ color: '#faad14' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} lg={6}>
            <Card>
              <Statistic
                title="System Status"
                value={stats.systemStatus}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>

        {/* Low Stock Alerts */}
        {stats.lowStockAlerts > 0 && (
          <Alert
            message={`${stats.lowStockAlerts} products are below expected stock levels`}
            type="warning"
            icon={<ExclamationCircleOutlined />}
            showIcon
            closable
          />
        )}

        {/* Charts */}
        <Row gutter={[16, 16]}>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <BarChartOutlined />
                  Platform-wise Sales
                </Space>
              }
              style={{ height: '400px' }}
            >
              {chartData.platformSales && (
                <Bar data={chartData.platformSales} options={chartOptions} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <LineChartOutlined />
                  Monthly Sales Trend
                </Space>
              }
              style={{ height: '400px' }}
            >
              {chartData.monthlySales && (
                <Line data={chartData.monthlySales} options={chartOptions} />
              )}
            </Card>
          </Col>
          <Col xs={24} lg={12}>
            <Card
              title={
                <Space>
                  <PieChartOutlined />
                  Category Distribution
                </Space>
              }
              style={{ height: '400px' }}
            >
              {chartData.categoryDistribution && (
                <Pie data={chartData.categoryDistribution} options={chartOptions} />
              )}
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default Dashboard;

