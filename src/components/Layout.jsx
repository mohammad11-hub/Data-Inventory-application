import React, { useState } from 'react';
import { Layout as AntLayout, Menu, Avatar, Button, Typography, Space, Drawer, theme, Grid } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  DatabaseOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  AppstoreOutlined,
  FileAddOutlined,
  LogoutOutlined,
  MenuOutlined,
  UserOutlined,
  FileTextOutlined,
  CloudUploadOutlined,
  CloudDownloadOutlined,
  SettingOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Header, Sider, Content } = AntLayout;
const { Text } = Typography;
const { useBreakpoint } = Grid;

const Layout = ({ children }) => {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false);
  const { token } = theme.useToken();
  const screens = useBreakpoint();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: 'Dashboard',
      onClick: () => navigate('/dashboard')
    },
    {
      key: '/all-data',
      icon: <DatabaseOutlined />,
      label: 'All Data',
      onClick: () => navigate('/all-data')
    },
    {
      key: '/amazon-sales',
      icon: <ShoppingOutlined />,
      label: 'Amazon Sales',
      onClick: () => navigate('/amazon-sales')
    },
    {
      key: '/flipkart-sales',
      icon: <BarChartOutlined />,
      label: 'Flipkart Sales',
      onClick: () => navigate('/flipkart-sales')
    },
    {
      key: '/merged-sales',
      icon: <AppstoreOutlined />,
      label: 'Merged Sales',
      onClick: () => navigate('/merged-sales')
    },
    {
      key: '/file-import',
      icon: <FileAddOutlined />,
      label: 'File Import',
      onClick: () => navigate('/file-import')
    },
    {
      key: '/reports',
      icon: <FileTextOutlined />,
      label: 'Reports',
      onClick: () => navigate('/reports')
    },
    ...(isAdmin() ? [{
      key: '/backup-restore',
      icon: <CloudUploadOutlined />,
      label: 'Backup & Restore',
      onClick: () => navigate('/backup-restore')
    }] : [])
  ];

  const selectedKey = location.pathname;

  return (
    <AntLayout style={{ minHeight: '100vh' }}>
      {!screens.xs && (
        <Sider
          collapsible
          collapsed={collapsed}
          onCollapse={setCollapsed}
          width={250}
          style={{
            overflow: 'auto',
            height: '100vh',
            position: 'fixed',
            left: 0,
            top: 0,
            bottom: 0,
          }}
        >
          <div style={{
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            fontSize: '18px',
            fontWeight: 'bold',
            borderBottom: '1px solid rgba(255,255,255,0.1)'
          }}>
            {collapsed ? 'DMS' : 'Data Inventory System'}
          </div>
          <Menu
            theme="dark"
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: item.onClick
            }))}
          />
        </Sider>
      )}

      <AntLayout style={{ marginLeft: screens.xs ? 0 : (collapsed ? 80 : 250) }}>
        <Header style={{
          background: token.colorBgContainer,
          padding: '0 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          position: 'sticky',
          top: 0,
          zIndex: 1000
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {screens.xs && (
              <Button
                type="text"
                icon={<MenuOutlined />}
                onClick={() => setMobileMenuVisible(true)}
              />
            )}
            <Text strong style={{ fontSize: '18px' }}>Craloft Inventory Application</Text>
          </div>
          <Space>
            <Space>
              <Avatar icon={<UserOutlined />} />
              <div>
                <Text strong>{user?.username}</Text>
                <br />
                {/* <Text type="secondary" style={{ fontSize: '12px' }}>
                  {user?.role?.toUpperCase()}
                </Text> */}
              </div>
            </Space>
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Space>
        </Header>
        <Content style={{
          margin: '24px',
          padding: '24px',
          background: token.colorBgContainer,
          borderRadius: '8px',
          minHeight: 'calc(100vh - 112px)'
        }}>
          {children}
        </Content>
      </AntLayout>

      {screens.xs && (
        <Drawer
          title="Navigation"
          placement="left"
          onClose={() => setMobileMenuVisible(false)}
          open={mobileMenuVisible}
          bodyStyle={{ padding: 0 }}
        >
          <Menu
            mode="inline"
            selectedKeys={[selectedKey]}
            items={menuItems.map(item => ({
              key: item.key,
              icon: item.icon,
              label: item.label,
              onClick: () => {
                item.onClick();
                setMobileMenuVisible(false);
              }
            }))}
          />
        </Drawer>
      )}
    </AntLayout>
  );
};

export default Layout;

