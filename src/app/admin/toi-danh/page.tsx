"use client";

import { useEffect, useState } from "react";
import { Table, Button, Input, Modal, Form, message, Space, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { toimDanhApi } from "@/lib/api";

interface ToiDanh {
  id: string;
  maToiDanh: string;
  tenToiDanh: string;
  dieuLuat?: string;
  khoan?: string;
  mucPhat?: string;
  moTa?: string;
  ngayTao: string;
}

export default function ToiDanhPage() {
  const [data, setData] = useState<ToiDanh[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<ToiDanh | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await toimDanhApi.getAll({ page: 1, pageSize: 100 });
      setData(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách tội danh");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        // Update
        await toimDanhApi.update(editingRecord.id, values);
        message.success("Cập nhật tội danh thành công");
      } else {
        // Create
        await toimDanhApi.create(values);
        message.success("Thêm tội danh thành công");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchData();
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra");
      console.error(error);
    }
  };

  const handleEdit = (record: ToiDanh) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa tội danh này?",
      onOk: async () => {
        try {
          await toimDanhApi.delete(id);
          message.success("Xóa tội danh thành công");
          fetchData();
        } catch (error: any) {
          message.error(error.message || "Có lỗi xảy ra khi xóa tội danh");
          console.error(error);
        }
      },
    });
  };

  const handleAddNew = () => {
    setEditingRecord(null);
    form.resetFields();
    setIsModalOpen(true);
  };

  const columns: ColumnsType<ToiDanh> = [
    {
      title: "Mã tội danh",
      dataIndex: "maToiDanh",
      key: "maToiDanh",
      width: 120,
    },
    {
      title: "Tên tội danh",
      dataIndex: "tenToiDanh",
      key: "tenToiDanh",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.tenToiDanh.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: "Điều luật",
      dataIndex: "dieuLuat",
      key: "dieuLuat",
      width: 100,
    },
    {
      title: "Khoản",
      dataIndex: "khoan",
      key: "khoan",
      width: 80,
    },
    {
      title: "Mức phạt",
      dataIndex: "mucPhat",
      key: "mucPhat",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      ellipsis: true,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 150,
      render: (_, record) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Button
            type="link"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Xóa
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Danh Mục Tội Danh</h1>
          <p className="text-gray-600 mt-1">Quản lý danh mục các tội danh vi phạm pháp luật</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          size="large"
        >
          Thêm Tội Danh
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <Input.Search
            placeholder="Tìm kiếm tội danh..."
            onChange={(e) => setSearchText(e.target.value)}
            size="large"
            allowClear
            style={{ maxWidth: 400 }}
          />
        </div>

        <Table
          columns={columns}
          dataSource={data}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tội danh`,
          }}
        />
      </div>

      <Modal
        title={editingRecord ? "Sửa Tội Danh" : "Thêm Tội Danh Mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingRecord(null);
        }}
        footer={null}
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Mã tội danh"
            name="maToiDanh"
            rules={[{ required: true, message: "Vui lòng nhập mã tội danh" }]}
          >
            <Input placeholder="VD: M141" />
          </Form.Item>

          <Form.Item
            label="Tên tội danh"
            name="tenToiDanh"
            rules={[{ required: true, message: "Vui lòng nhập tên tội danh" }]}
          >
            <Input placeholder="Nhập tên tội danh" />
          </Form.Item>

          <div className="grid grid-cols-2 gap-4">
            <Form.Item label="Điều luật" name="dieuLuat">
              <Input placeholder="VD: 141" />
            </Form.Item>

            <Form.Item label="Khoản" name="khoan">
              <Input placeholder="VD: 1" />
            </Form.Item>
          </div>

          <Form.Item label="Mức phạt" name="mucPhat">
            <Input placeholder="VD: 5-10 năm tù" />
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={3} placeholder="Mô tả chi tiết về tội danh" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setIsModalOpen(false)}>
                Hủy
              </Button>
              <Button type="primary" htmlType="submit">
                {editingRecord ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
