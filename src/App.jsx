import React, { useEffect, useState } from "react";
// import allData from './AllData';
import { BrowserRouter as Router, Routes, Route, useNavigate } from "react-router-dom";
import { 
  Button, 
  Layout, 
  Space, 
  Typography, 
  Card, 
  Row, 
  Col, 
  Statistic,
  Avatar,
  Divider,
  theme,
  Grid,
  Switch,
  Modal,
  List,
  Tooltip,
  ConfigProvider,
  Drawer
} from "antd";
import { 
  DatabaseOutlined, 
  ShoppingOutlined, 
  BarChartOutlined,
  HomeOutlined,
  AppstoreOutlined,
  SettingOutlined,
  UserOutlined,
  MenuOutlined,
  BulbOutlined,
  BulbFilled
} from '@ant-design/icons';
import AllData from './AllData';
import AmazonSales from './amazonSales';
import FlipkartMergedData from './FlipkartMergedData';
import FileConverter from './fileConverter/FileConverter';

const { Header, Content, Sider } = Layout;
const { Title, Text } = Typography;
const { useBreakpoint } = Grid;

// Theme Context
const ThemeContext = React.createContext();

const NavigationButtons = () => {
  const navigate = useNavigate();
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const { isDarkMode, toggleTheme } = React.useContext(ThemeContext);

  const menuItems = [
    {
      key: 'all-data',
      icon: <DatabaseOutlined style={{ fontSize: screens.xs ? '16px' : '20px' }} />,
      title: 'All Data',
      description: 'View and manage all database tables',
      color: '#1890ff',
      onClick: () => navigate('/all-data')
    },
    {
      key: 'amazon-sales',
      icon: <ShoppingOutlined style={{ fontSize: screens.xs ? '16px' : '20px' }} />,
      title: 'Amazon Sales',
      description: 'Amazon inventory and sales management',
      color: '#52c41a',
      onClick: () => navigate('/amazon-sales')
    },
    {
      key: 'flipkart-merged',
      icon: <BarChartOutlined style={{ fontSize: screens.xs ? '16px' : '20px' }} />,
      title: 'Flipkart Merged',
      description: 'Flipkart data analysis and reporting',
      color: '#722ed1',
      onClick: () => navigate('/flipkart-merged')
    },
    {
      key: 'file-converter',
      icon: <AppstoreOutlined style={{ fontSize: screens.xs ? '16px' : '20px' }} />,
      title: 'File Converter',
      description: 'Convert .xlsx/.csv to database',
      color: '#faad14',
      onClick: () => navigate('/file-converter')
    },
  ];

  return (
    <div style={{ 
      padding: screens.xs ? '20px 16px' : screens.sm ? '32px 24px' : '40px 24px',
      minHeight: '100vh',
      background: `linear-gradient(135deg, ${token.colorBgContainer} 0%, ${token.colorBgLayout} 100%)`
    }}>
      {/* Header Section */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: screens.xs ? '32px' : '48px',
        padding: screens.xs ? '24px 0' : '32px 0'
      }}>
        <div style={{ marginBottom: screens.xs ? '12px' : '16px' }}>
          <Avatar 
            size={screens.xs ? 60 : screens.sm ? 70 : 80} 
            icon={<AppstoreOutlined />}
            style={{ 
              backgroundColor: token.colorPrimary,
              marginBottom: screens.xs ? '12px' : '16px'
            }}
          />
        </div>
        <Title 
          level={screens.xs ? 2 : screens.sm ? 1 : 1} 
          style={{ 
            margin: 0, 
            color: token.colorTextHeading,
            fontWeight: 600,
            fontSize: screens.xs ? '1.5rem' : screens.sm ? '2rem' : '2.5rem',
            lineHeight: screens.xs ? '1.3' : '1.2'
          }}
        >
          Data Management System
        </Title>
        <Text style={{ 
          fontSize: screens.xs ? '14px' : '16px', 
          color: token.colorTextSecondary,
          marginTop: '8px',
          display: 'block',
          padding: screens.xs ? '0 16px' : '0'
        }}>
          Comprehensive inventory and sales management platform
        </Text>
      </div>

      {/* Statistics Cards */}
      <Row gutter={[screens.xs ? 16 : 24, screens.xs ? 16 : 24]} style={{ marginBottom: screens.xs ? '32px' : '48px' }}>
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            style={{ 
              borderRadius: screens.xs ? '8px' : '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: screens.xs ? '12px' : '14px' }}>Total Tables</span>}
              value={3}
              prefix={<DatabaseOutlined style={{ fontSize: screens.xs ? '14px' : '16px' }} />}
              valueStyle={{ 
                color: token.colorPrimary,
                fontSize: screens.xs ? '18px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            style={{ 
              borderRadius: screens.xs ? '8px' : '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: screens.xs ? '12px' : '14px' }}>Active Modules</span>}
              value={4}
              prefix={<AppstoreOutlined style={{ fontSize: screens.xs ? '14px' : '16px' }} />}
              valueStyle={{ 
                color: '#52c41a',
                fontSize: screens.xs ? '18px' : '24px'
              }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card 
            hoverable
            style={{ 
              borderRadius: screens.xs ? '8px' : '12px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
            }}
          >
            <Statistic
              title={<span style={{ fontSize: screens.xs ? '12px' : '14px' }}>System Status</span>}
              value="Online"
              prefix={<UserOutlined style={{ fontSize: screens.xs ? '14px' : '16px' }} />}
              valueStyle={{ 
                color: '#52c41a',
                fontSize: screens.xs ? '18px' : '24px'
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Navigation Cards */}
      <Row gutter={[screens.xs ? 16 : 24, screens.xs ? 16 : 24]} justify="center">
        {menuItems.map((item) => (
          <Col xs={24} sm={12} lg={8} key={item.key}>
            <Card
              hoverable
              onClick={item.onClick}
              style={{
                borderRadius: screens.xs ? '12px' : '16px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                border: `2px solid transparent`,
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                height: screens.xs ? '160px' : screens.sm ? '180px' : '200px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                textAlign: 'center'
              }}
              bodyStyle={{
                padding: screens.xs ? '20px 16px' : screens.sm ? '24px 20px' : '32px 24px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center'
              }}
              onMouseEnter={(e) => {
                if (!screens.xs) {
                  e.currentTarget.style.transform = 'translateY(-8px)';
                  e.currentTarget.style.borderColor = item.color;
                  e.currentTarget.style.boxShadow = `0 12px 32px rgba(0,0,0,0.12)`;
                }
              }}
              onMouseLeave={(e) => {
                if (!screens.xs) {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.borderColor = 'transparent';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.08)';
                }
              }}
            >
              <div style={{ 
                marginBottom: screens.xs ? '12px' : '16px',
                color: item.color,
                fontSize: screens.xs ? '32px' : screens.sm ? '40px' : '48px'
              }}>
                {item.icon}
              </div>
              <Title 
                level={screens.xs ? 4 : screens.sm ? 3 : 3} 
                style={{ 
                  margin: '0 0 8px 0',
                  color: token.colorTextHeading,
                  fontWeight: 600,
                  fontSize: screens.xs ? '16px' : screens.sm ? '18px' : '20px'
                }}
              >
                {item.title}
              </Title>
              <Text style={{ 
                color: token.colorTextSecondary,
                fontSize: screens.xs ? '12px' : '14px',
                lineHeight: '1.5',
                textAlign: 'center'
              }}>
                {item.description}
              </Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* Footer */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: screens.xs ? '32px' : '48px',
        padding: screens.xs ? '16px 0' : '24px 0',
        borderTop: `1px solid ${token.colorBorder}`
      }}>
        <Text style={{ 
          color: token.colorTextSecondary,
          fontSize: screens.xs ? '12px' : '14px'
        }}>
          © 2024 Data Management System. All rights reserved.
        </Text>
      </div>
    </div>
  );
};

const App = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState([]);
  const { token } = theme.useToken();
  const screens = useBreakpoint();
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);

  useEffect(() => {
    setLoading(true);
    window.electronAPI.getAmazonInventoryReport()
      .then((rows) => {
        console.log('Fetched rows:', rows);
        setData(rows.map(row => ({ ...row, key: row.id || row.asin })));
        setLoading(false);
      })
      .catch((err) => {
        setData([]);
        setLoading(false);
      });
  }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const showSettings = () => {
    setSettingsVisible(true);
  };

  const handleSettingsCancel = () => {
    setSettingsVisible(false);
  };

  const showMobileMenu = () => {
    setMobileMenuVisible(true);
  };

  const hideMobileMenu = () => {
    setMobileMenuVisible(false);
  };

  const mobileMenuItems = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: 'Home',
      onClick: () => {
        window.location.href = '/';
        hideMobileMenu();
      }
    },
    {
      key: 'all-data',
      icon: <DatabaseOutlined />,
      label: 'All Data',
      onClick: () => {
        window.location.href = '/all-data';
        hideMobileMenu();
      }
    },
    {
      key: 'amazon-sales',
      icon: <ShoppingOutlined />,
      label: 'Amazon Sales',
      onClick: () => {
        window.location.href = '/amazon-sales';
        hideMobileMenu();
      }
    },
    {
      key: 'flipkart-merged',
      icon: <BarChartOutlined />,
      label: 'Flipkart Merged',
      onClick: () => {
        window.location.href = '/flipkart-merged';
        hideMobileMenu();
      }
    },
    {
      key: 'file-converter',
      icon: <AppstoreOutlined />,
      label: 'File Converter',
      onClick: () => {
        window.location.href = '/file-converter';
        hideMobileMenu();
      }
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Settings',
      onClick: () => {
        showSettings();
        hideMobileMenu();
      }
    }
  ];

  const settingsItems = [
    {
      title: 'Dark Mode',
      description: 'Switch between light and dark theme',
      action: (
        <Switch
          checked={isDarkMode}
          onChange={toggleTheme}
          checkedChildren={<BulbFilled />}
          unCheckedChildren={<BulbOutlined />}
        />
      )
    },
    {
      title: 'System Information',
      description: 'Version 1.0.0 - Electron React App',
      action: null
    }
  ];

  // Theme configuration
  const themeConfig = {
    algorithm: isDarkMode ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 6,
    },
  };

  return (
    <ThemeContext.Provider value={{ isDarkMode, toggleTheme }}>
      <ConfigProvider theme={themeConfig}>
        <Router>
          <Layout style={{ minHeight: '100vh' }}>
            <Header style={{ 
              background: token.colorBgContainer,
              padding: screens.xs ? '0 16px' : '0 24px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
              borderBottom: `1px solid ${token.colorBorder}`,
              position: 'sticky',
              top: 0,
              zIndex: 1000,
              height: screens.xs ? '56px' : '64px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: screens.xs ? '8px' : '12px' }}>
                <Avatar 
                  icon={<AppstoreOutlined />}
                  style={{ 
                    backgroundColor: token.colorPrimary,
                    fontSize: screens.xs ? '14px' : '16px'
                  }}
                  size={screens.xs ? 32 : 40}
                />
                <Title 
                  level={screens.xs ? 5 : 4} 
                  style={{ 
                    margin: 0, 
                    color: token.colorTextHeading,
                    fontWeight: 600,
                    fontSize: screens.xs ? '14px' : '16px',
                    display: screens.xs ? 'none' : 'block'
                  }}
                >
                  Data Management App
                </Title>
                {screens.xs && (
                  <Text style={{ 
                    color: token.colorTextHeading,
                    fontWeight: 600,
                    fontSize: '14px'
                  }}>
                    DMS
                  </Text>
                )}
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: screens.xs ? '8px' : '16px' }}>
                {!screens.xs && (
                  <>
                    <Button 
                      type="text" 
                      icon={<HomeOutlined />}
                      onClick={() => window.location.href = '/'}
                      size={screens.sm ? 'small' : 'middle'}
                    >
                      Home
                    </Button>
                    <Tooltip title="Settings">
                      <Button 
                        type="text" 
                        icon={<SettingOutlined />}
                        size={screens.sm ? 'small' : 'middle'}
                        onClick={showSettings}
                      >
                        Settings
                      </Button>
                    </Tooltip>
                  </>
                )}
                {screens.xs && (
                  <Space size="small">
                    <Tooltip title="Settings">
                      <Button 
                        type="text" 
                        icon={<SettingOutlined />}
                        size="small"
                        onClick={showSettings}
                      />
                    </Tooltip>
                    <Button 
                      type="text" 
                      icon={<MenuOutlined />}
                      size="small"
                      onClick={showMobileMenu}
                    />
                  </Space>
                )}
              </div>
            </Header>
            
            <Content style={{ 
              background: token.colorBgLayout,
              minHeight: `calc(100vh - ${screens.xs ? '56px' : '64px'})`
            }}>
              <Routes>
                <Route path="/" element={<NavigationButtons />} />
                <Route path="/all-data" element={<AllData />} />
                <Route path="/amazon-sales" element={<AmazonSales />} />
                <Route path="/flipkart-merged" element={<FlipkartMergedData />} />
                <Route path="/file-converter" element={<FileConverter />} />
              </Routes>
            </Content>
          </Layout>

          {/* Mobile Navigation Drawer */}
          <Drawer
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <AppstoreOutlined />
                <span>Navigation</span>
              </div>
            }
            placement="left"
            onClose={hideMobileMenu}
            open={mobileMenuVisible}
            width={280}
            bodyStyle={{ padding: 0 }}
          >
            <div style={{ padding: '16px 0' }}>
              {mobileMenuItems.map((item) => (
                <div
                  key={item.key}
                  onClick={item.onClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '16px 24px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    borderBottom: `1px solid ${token.colorBorder}`,
                    fontSize: '16px',
                    fontWeight: 500,
                    color: token.colorText
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = token.colorBgTextHover;
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  <span style={{ marginRight: '12px', fontSize: '18px' }}>
                    {item.icon}
                  </span>
                  {item.label}
                </div>
              ))}
            </div>
          </Drawer>

          {/* Settings Modal */}
          <Modal
            title={
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SettingOutlined />
                Settings
              </div>
            }
            open={settingsVisible}
            onCancel={handleSettingsCancel}
            footer={null}
            width={400}
          >
            <List
              dataSource={settingsItems}
              renderItem={(item) => (
                <List.Item
                  style={{ 
                    padding: '16px 0',
                    borderBottom: `1px solid ${token.colorBorder}`
                  }}
                >
                  <List.Item.Meta
                    title={item.title}
                    description={item.description}
                  />
                  {item.action}
                </List.Item>
              )}
            />
          </Modal>
        </Router>
      </ConfigProvider>
    </ThemeContext.Provider>
  );
};

export default App;
