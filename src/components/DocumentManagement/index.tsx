'use client';

import React, { useState, useEffect, useCallback, FC } from 'react';
import {
  Table,
  Button,
  Modal,
  Form,
  Input,
  Upload,
  Space,
  Popconfirm,
  Progress,
  message,
  Tag,
  Tooltip,
  Drawer,
  UploadFile,
} from 'antd';
import type { ColumnsType, TablePaginationConfig } from 'antd/es/table';
import type { UploadChangeParam } from 'antd/es/upload';
import {
  PlusOutlined,
  DeleteOutlined,
  EditOutlined,
  DownloadOutlined,
  FileOutlined,
} from '@ant-design/icons';
import { Container, Row, Col } from 'reactstrap';
import {
  getChatbotDocuments,
  createChatbotDocument,
  deleteChatbotDocument,
  updateChatbotDocument,
  processChatbotDocument,
  downloadChatbotDocument,
  validateDocumentData,
  uploadWithProgress,
} from '../../api/chatbotDocuments';
import styles from './DocumentManagement.module.css';

// Types
interface Document {
  id: string;
  name: string;
  fileName?: string;
  fileSize?: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalPages?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface FormValues {
  name: string;
  file?: any;
}

const DocumentManagement: FC = () => {
  // State
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form] = Form.useForm<FormValues>();
  const [file, setFile] = useState<any>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [detailsVisible, setDetailsVisible] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  // Fetch documents
  const fetchDocuments = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getChatbotDocuments({ limit: 100 });
      setDocuments(Array.isArray(data) ? data : data.data || []);
    } catch (error) {
      message.error('Không thể tải danh sách tài liệu');
      console.error('Fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Create/Update document
  const handleSave = useCallback(async () => {
    console.log('=== handleSave triggered ===');
    console.log('Form values before validation:', form.getFieldsValue());
    console.log('File state:', file);
    
    try {
      const values = await form.validateFields();
      console.log('Form validated successfully:', values);

      // Validate
      const errors = validateDocumentData({ ...values, file }, !!editingId);
      console.log('Validation errors:', errors);

      if (errors.length > 0) {
        message.error(errors[0]);
        return;
      }

      setUploading(true);
      setUploadProgress(0);

      if (editingId) {
        // Update
        console.log('Updating document:', editingId);
        await updateChatbotDocument(editingId, {
          name: values.name,
        });
        message.success('Cập nhật tài liệu thành công');
      } else {
        // Create
        console.log('Creating new document...');
        const formData = new FormData();
        formData.append('name', values.name);
        if (file) {
          formData.append('file', file);
          console.log('File appended to FormData:', file.name, file.type, file.size);
        }

        console.log('Calling uploadWithProgress API...');
        const result = await uploadWithProgress('/documents', formData, (percent: number) => {
          console.log('Upload progress:', percent);
          setUploadProgress(percent);
        });
        console.log('Upload result:', result);

        message.success('Tạo tài liệu thành công');
      }

      setModalVisible(false);
      setEditingId(null);
      setFile(null);
      form.resetFields();
      setUploadProgress(0);
      await fetchDocuments();
    } catch (error: any) {
      console.error('=== handleSave error ===', error);
      if (error.message) {
        message.error(error.message);
      } else {
        message.error('Có lỗi xảy ra');
      }
      console.error('Save error:', error);
    } finally {
      setUploading(false);
    }
  }, [editingId, file, form, fetchDocuments]);

  // Delete document
  const handleDelete = useCallback(
    async (id: string) => {
      try {
        await deleteChatbotDocument(id);
        message.success('Xóa tài liệu thành công');
        await fetchDocuments();
      } catch (error) {
        message.error('Không thể xóa tài liệu');
        console.error('Delete error:', error);
      }
    },
    [fetchDocuments]
  );

  // Edit document
  const handleEdit = useCallback(
    (record: Document) => {
      setEditingId(record.id);
      form.setFieldsValue({
        name: record.name,
      });
      setModalVisible(true);
    },
    [form]
  );

  // Download document
  const handleDownload = useCallback(async (record: Document) => {
    try {
      await downloadChatbotDocument(
        record.id,
        record.fileName || `${record.name}.pdf`
      );
      message.success('Tải xuống thành công');
    } catch (error) {
      message.error('Không thể tải xuống tài liệu');
      console.error('Download error:', error);
    }
  }, []);

  // Process document
  const handleProcess = useCallback(
    async (id: string) => {
      try {
        setProcessingId(id);
        await processChatbotDocument(id, {
          document_id: id,
        });
        message.success('Xử lý tài liệu thành công');
        await fetchDocuments();
      } catch (error) {
        message.error('Không thể xử lý tài liệu');
        console.error('Process error:', error);
      } finally {
        setProcessingId(null);
      }
    },
    [fetchDocuments]
  );

  // View details
  const handleViewDetails = useCallback((record: Document) => {
    setSelectedDoc(record);
    setDetailsVisible(true);
  }, []);

  // Modal handlers
  const handleModalOk = handleSave;
  const handleModalCancel = useCallback(() => {
    setModalVisible(false);
    setEditingId(null);
    setFile(null);
    form.resetFields();
    setUploadProgress(0);
  }, [form]);

  // File upload handler
  const handleFileChange = useCallback((info: UploadChangeParam) => {
    console.log('=== handleFileChange triggered ===');
    console.log('Upload info:', info);
    console.log('File object:', info.file);
    console.log('File originFileObj:', info.file.originFileObj);
    
    if (info.file) {
      // Ant Design Upload returns file.originFileObj for the actual File object
      const actualFile = info.file.originFileObj || info.file;
      console.log('Setting file state to:', actualFile);
      setFile(actualFile);
      
      // Manually set form value to pass validation
      form.setFieldValue('file', actualFile);
    }
  }, [form]);

  // Open create modal
  const handleOpenCreate = useCallback(() => {
    setEditingId(null);
    setFile(null);
    form.resetFields();
    setUploadProgress(0);
    setModalVisible(true);
  }, [form]);

  // Columns
  const columns: ColumnsType<Document> = [
    {
      title: 'Tên tài liệu',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (text: string) => (
        <Space>
          <FileOutlined />
          <span>{text}</span>
        </Space>
      ),
    },
    {
      title: 'Kích thước',
      dataIndex: 'fileSize',
      key: 'fileSize',
      width: 100,
      render: (size?: number) => {
        if (!size) return '-';
        if (size > 1024 * 1024) {
          return `${(size / (1024 * 1024)).toFixed(2)} MB`;
        }
        return `${(size / 1024).toFixed(2)} KB`;
      },
    },
    {
      title: 'Trạng thái',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: Document['status']) => {
        const statusMap: Record<
          Document['status'],
          { color: string; text: string }
        > = {
          pending: { color: 'warning', text: 'Chờ xử lý' },
          processing: { color: 'processing', text: 'Đang xử lý' },
          completed: { color: 'success', text: 'Hoàn tất' },
          failed: { color: 'error', text: 'Thất bại' },
        };
        const config = statusMap[status] || statusMap.pending;
        return <Tag color={config.color}>{config.text}</Tag>;
      },
    },
    {
      title: 'Ngày tạo',
      dataIndex: 'createdAt',
      key: 'createdAt',
      width: 150,
      render: (date?: string) => {
        if (!date) return '-';
        return new Date(date).toLocaleDateString('vi-VN', {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
        });
      },
    },
    {
      title: 'Trang',
      dataIndex: 'totalPages',
      key: 'totalPages',
      width: 80,
      align: 'center',
      render: (pages?: number) => pages || '-',
    },
    {
      title: 'Hành động',
      key: 'action',
      width: 180,
      fixed: 'right',
      render: (_: any, record: Document) => (
        <Space size="small" wrap>
          <Tooltip title="Xem chi tiết">
            <Button
              type="text"
              size="small"
              onClick={() => handleViewDetails(record)}>
              Xem
            </Button>
          </Tooltip>

          <Tooltip title="Sửa">
            <Button
              type="text"
              size="small"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
              disabled={editingId === record.id || uploading}
            />
          </Tooltip>

          <Tooltip title="Tải xuống">
            <Button
              type="text"
              size="small"
              icon={<DownloadOutlined />}
              onClick={() => handleDownload(record)}
            />
          </Tooltip>

          {record.status !== 'processing' && record.status !== 'completed' && (
            <Tooltip title="Xử lý">
              <Button
                type="text"
                size="small"
                loading={processingId === record.id}
                onClick={() => handleProcess(record.id)}>
                Xử lý
              </Button>
            </Tooltip>
          )}

          <Popconfirm
            title="Xóa tài liệu?"
            description="Hành động này không thể hoàn tác."
            onConfirm={() => handleDelete(record.id)}
            okText="Xóa"
            cancelText="Hủy"
            okButtonProps={{ danger: true }}>
            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <Container fluid className={styles.documentManagement}>
      <Row>
        <Col xs="12">
          <div className={styles.header}>
            <h1>Quản lý tài liệu Chatbot</h1>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleOpenCreate}>
              Thêm tài liệu
            </Button>
          </div>
        </Col>
      </Row>

      <Row>
        <Col xs="12">
          <div className={styles.tableWrapper}>
            <Table
              columns={columns}
              dataSource={documents}
              loading={loading}
              rowKey="id"
              pagination={{
                pageSize: 10,
                total: documents.length,
                showSizeChanger: true,
                pageSizeOptions: ['10', '20', '50'],
              }}
              scroll={{ x: 1200 }}
            />
          </div>
        </Col>
      </Row>

      {/* Create/Edit Modal */}
      <Modal
        title={editingId ? 'Sửa tài liệu' : 'Thêm tài liệu mới'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        confirmLoading={uploading}
        width={500}>
        <Form form={form} layout="vertical" autoComplete="off">
          <Form.Item
            label="Tên tài liệu"
            name="name"
            rules={[{ required: true, message: 'Vui lòng nhập tên tài liệu' }]}>
            <Input
              placeholder="Ví dụ: Hướng dẫn công đoàn 2024"
              disabled={uploading}
            />
          </Form.Item>

          {!editingId && (
            <Form.Item
              label="Tệp PDF"
              name="file"
              rules={[{ required: true, message: 'Vui lòng chọn tệp PDF' }]}>
              <Upload
                accept=".pdf"
                maxCount={1}
                beforeUpload={() => false}
                onChange={handleFileChange}
                disabled={uploading}>
                <Button>Chọn tệp</Button>
              </Upload>
            </Form.Item>
          )}

          {uploading && uploadProgress > 0 && (
            <div style={{ marginTop: '16px' }}>
              <Progress
                percent={uploadProgress}
                status={uploadProgress === 100 ? 'success' : 'active'}
              />
            </div>
          )}
        </Form>
      </Modal>

      {/* Details Drawer */}
      <Drawer
        title="Chi tiết tài liệu"
        onClose={() => {
          setDetailsVisible(false);
          setSelectedDoc(null);
        }}
        open={detailsVisible}>
        {selectedDoc && (
          <div className={styles.detailsContent}>
            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Tên tài liệu:</span>
              <span>{selectedDoc.name}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Kích thước:</span>
              <span>
                {selectedDoc.fileSize
                  ? selectedDoc.fileSize > 1024 * 1024
                    ? `${(selectedDoc.fileSize / (1024 * 1024)).toFixed(2)} MB`
                    : `${(selectedDoc.fileSize / 1024).toFixed(2)} KB`
                  : '-'}
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Trạng thái:</span>
              <span>
                <Tag
                  color={
                    selectedDoc.status === 'completed' ? 'success' : 'warning'
                  }>
                  {selectedDoc.status === 'completed' ? 'Hoàn tất' : 'Chờ xử lý'}
                </Tag>
              </span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Số trang:</span>
              <span>{selectedDoc.totalPages || '-'}</span>
            </div>

            <div className={styles.detailItem}>
              <span className={styles.detailLabel}>Ngày tạo:</span>
              <span>
                {selectedDoc.createdAt
                  ? new Date(selectedDoc.createdAt).toLocaleString('vi-VN')
                  : '-'}
              </span>
            </div>

            {selectedDoc.updatedAt && (
              <div className={styles.detailItem}>
                <span className={styles.detailLabel}>Cập nhật lần cuối:</span>
                <span>
                  {new Date(selectedDoc.updatedAt).toLocaleString('vi-VN')}
                </span>
              </div>
            )}
          </div>
        )}
      </Drawer>
    </Container>
  );
};

export default DocumentManagement;
