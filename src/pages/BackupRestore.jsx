import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  message,
  Upload,
  Alert,
  Row,
  Col
} from "antd";
import {
  CloudUploadOutlined,
  CloudDownloadOutlined,
  InboxOutlined
} from '@ant-design/icons';
import { useAuth } from '../contexts/AuthContext';

const { Title, Paragraph } = Typography;
const { Dragger } = Upload;

const BackupRestore = () => {
  const { isAdmin } = useAuth();
  const [loading, setLoading] = useState(false);

  if (!isAdmin()) {
    return (
      <Alert
        message="Access Denied"
        description="Only administrators can access backup and restore functionality."
        type="error"
        showIcon
      />
    );
  }

  const handleBackup = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.backupDatabase();
      if (result.success) {
        message.success(`Database backed up to ${result.filePath}`);
      } else {
        message.error(result.error || 'Backup failed');
      }
    } catch (error) {
      message.error('Error creating backup');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (file) => {
    setLoading(true);
    try {
      // For Electron, we need to get the file path differently
      const filePath = file.path || file.name;
      const result = await window.electronAPI.restoreDatabase(filePath);
      if (result.success) {
        message.success('Database restored successfully');
        // Optionally reload the app
        setTimeout(() => window.location.reload(), 2000);
      } else {
        message.error(result.error || 'Restore failed');
      }
    } catch (error) {
      message.error('Error restoring database');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    accept: '.sqlite,.db',
    beforeUpload: (file) => {
      handleRestore(file);
      return false;
    },
    showUploadList: false
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>
          <CloudUploadOutlined /> Backup & Restore
        </Title>

        <Alert
          message="Important"
          description="Backing up your database is recommended before performing any restore operation. Restoring will replace your current database with the backup file."
          type="warning"
          showIcon
          style={{ marginBottom: 24 }}
        />

        <Row gutter={16}>
          <Col xs={24} lg={12}>
            <Card
              title="Backup Database"
              extra={<CloudDownloadOutlined />}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Paragraph>
                  Create a backup of your current database. The backup will be saved to your Downloads folder.
                </Paragraph>
                <Button
                  type="primary"
                  icon={<CloudDownloadOutlined />}
                  onClick={handleBackup}
                  loading={loading}
                  block
                  size="large"
                >
                  Create Backup
                </Button>
              </Space>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card
              title="Restore Database"
              extra={<CloudUploadOutlined />}
            >
              <Space direction="vertical" style={{ width: '100%' }}>
                <Paragraph>
                  Restore your database from a backup file. Select a .sqlite or .db file to restore.
                </Paragraph>
                <Dragger {...uploadProps}>
                  <p className="ant-upload-drag-icon">
                    <InboxOutlined />
                  </p>
                  <p className="ant-upload-text">Click or drag file to this area to upload</p>
                  <p className="ant-upload-hint">
                    Support for .sqlite and .db files
                  </p>
                </Dragger>
              </Space>
            </Card>
          </Col>
        </Row>
      </Space>
    </div>
  );
};

export default BackupRestore;

