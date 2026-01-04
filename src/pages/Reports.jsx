import React, { useState } from "react";
import {
  Card,
  Button,
  Typography,
  Space,
  Select,
  DatePicker,
  Row,
  Col,
  message,
  Radio
} from "antd";
import {
  FileTextOutlined,
  DownloadOutlined,
  FileExcelOutlined,
  FilePdfOutlined
} from '@ant-design/icons';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const { Title } = Typography;
const { RangePicker } = DatePicker;

const Reports = () => {
  const [reportType, setReportType] = useState('sales');
  const [platform, setPlatform] = useState('all');
  const [loading, setLoading] = useState(false);

  const exportToPDF = async () => {
    setLoading(true);
    try {
      let data = [];
      
      if (platform === 'amazon' || platform === 'all') {
        const amazonData = await window.electronAPI.getAmazonInventoryReport().catch(() => []);
        data = [...data, ...amazonData.map(item => ({
          platform: 'Amazon',
          product: item.item_name,
          sales: item.total_sales || item.amazon_sales || 0,
          stock: item.ending_warehouse_stock || 0
        }))];
      }

      if (platform === 'flipkart' || platform === 'all') {
        const flipkartData = await window.electronAPI.getFlipkartMergedData().catch(() => []);
        data = [...data, ...flipkartData.map(item => ({
          platform: 'Flipkart',
          product: item.item_name,
          sales: item.total_flipkart_sales || 0,
          stock: item.total_stock_quantity || 0
        }))];
      }

      const doc = new jsPDF();
      doc.text('Sales Report', 14, 15);
      doc.autoTable({
        head: [['Platform', 'Product', 'Sales', 'Stock']],
        body: data.map(item => [item.platform, item.product, item.sales, item.stock]),
        startY: 20
      });
      doc.save(`sales-report-${new Date().toISOString().split('T')[0]}.pdf`);
      message.success('PDF exported successfully');
    } catch (error) {
      message.error('Error exporting PDF');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = async () => {
    setLoading(true);
    try {
      let data = [];
      let filterMode = 'amazon';

      if (platform === 'amazon') {
        const amazonData = await window.electronAPI.getAmazonInventoryReport().catch(() => []);
        data = amazonData;
        filterMode = 'amazon';
      } else if (platform === 'flipkart') {
        const flipkartData = await window.electronAPI.getFlipkartMergedData().catch(() => []);
        data = flipkartData;
        filterMode = 'flipkart_merged';
      } else {
        message.info('Please select a specific platform for Excel export');
        setLoading(false);
        return;
      }

      const result = await window.electronAPI.exportSelectedRowsToExcel(data, filterMode);
      if (result.success) {
        message.success(`Excel file exported to ${result.filePath}`);
      } else {
        message.error(result.error || 'Export failed');
      }
    } catch (error) {
      message.error('Error exporting Excel');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <Title level={2}>
          <FileTextOutlined /> Reports
        </Title>

        <Card>
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div>
              <Typography.Text strong>Report Type:</Typography.Text>
              <Radio.Group
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                style={{ marginLeft: 16 }}
              >
                <Radio value="sales">Sales Report</Radio>
                <Radio value="inventory">Inventory Report</Radio>
              </Radio.Group>
            </div>

            <div>
              <Typography.Text strong>Platform:</Typography.Text>
              <Select
                value={platform}
                onChange={setPlatform}
                style={{ width: 200, marginLeft: 16 }}
              >
                <Select.Option value="all">All Platforms</Select.Option>
                <Select.Option value="amazon">Amazon</Select.Option>
                <Select.Option value="flipkart">Flipkart</Select.Option>
              </Select>
            </div>

            <div>
              <Typography.Text strong>Date Range:</Typography.Text>
              <RangePicker style={{ marginLeft: 16 }} />
            </div>

            <Row gutter={16}>
              <Col>
                <Button
                  type="primary"
                  icon={<FilePdfOutlined />}
                  onClick={exportToPDF}
                  loading={loading}
                  size="large"
                >
                  Export to PDF
                </Button>
              </Col>
              <Col>
                <Button
                  type="primary"
                  icon={<FileExcelOutlined />}
                  onClick={exportToExcel}
                  loading={loading}
                  size="large"
                >
                  Export to Excel
                </Button>
              </Col>
            </Row>
          </Space>
        </Card>
      </Space>
    </div>
  );
};

export default Reports;

