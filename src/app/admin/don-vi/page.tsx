"use client";

import { useEffect, useState } from "react";
import { Table, Button, Input, Modal, Form, message, Space, Select, TreeSelect } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { donViHanhChinhApi } from "@/lib/api";

const { Option } = Select;

interface DonViHanhChinh {
  id: string;
  maDonVi: string;
  tenDonVi: string;
  cap: string;
  donViChaId?: string;
  tenDonViCha?: string;
  ngayTao: string;
}

export default function DonViPage() {
  const [data, setData] = useState<DonViHanhChinh[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<DonViHanhChinh | null>(null);
  const [parentUnits, setParentUnits] = useState<DonViHanhChinh[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchParentUnits();
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await donViHanhChinhApi.getAll({ page: 1, pageSize: 100 });
      setData(response.data || []);
    } catch (error) {
      message.error("Lỗi khi tải danh sách đơn vị hành chính");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchParentUnits = async () => {
    try {
      const response = await donViHanhChinhApi.getAll({ page: 1, pageSize: 1000 });
      setParentUnits(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn vị cha:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingRecord) {
        // Update
        await donViHanhChinhApi.update(editingRecord.id, values);
        message.success("Cập nhật đơn vị hành chính thành công");
      } else {
        // Create
        await donViHanhChinhApi.create(values);
        message.success("Thêm đơn vị hành chính thành công");
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

  const handleEdit = (record: DonViHanhChinh) => {
    setEditingRecord(record);
    form.setFieldsValue(record);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đơn vị hành chính này?",
      onOk: async () => {
        try {
          await donViHanhChinhApi.delete(id);
          message.success("Xóa đơn vị hành chính thành công");
          fetchData();
        } catch (error: any) {
          message.error(error.message || "Có lỗi xảy ra khi xóa đơn vị hành chính");
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

  const getCapLabel = (cap: string) => {
    const labels: Record<string, { text: string; color: string }> = {
      TINH: { text: "Tỉnh/TP", color: "blue" },
      HUYEN: { text: "Quận/Huyện", color: "green" },
      XA: { text: "Xã/Phường/TT", color: "orange" },
    };
    return labels[cap] || { text: cap, color: "default" };
  };

  const columns: ColumnsType<DonViHanhChinh> = [
    {
      title: "Mã đơn vị",
      dataIndex: "maDonVi",
      key: "maDonVi",
      width: 120,
    },
    {
      title: "Tên đơn vị",
      dataIndex: "tenDonVi",
      key: "tenDonVi",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.tenDonVi.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: "Cấp",
      dataIndex: "cap",
      key: "cap",
      width: 150,
      render: (cap: string) => {
        const { text, color } = getCapLabel(cap);
        return <span className={`px-3 py-1 rounded-full bg-${color}-100 text-${color}-700 text-sm font-medium`}>{text}</span>;
      },
    },
    {
      title: "Trực thuộc",
      dataIndex: "tenDonViCha",
      key: "tenDonViCha",
      render: (text) => text || "-",
    },
    {
      title: "Ngày tạo",
      dataIndex: "ngayTao",
      key: "ngayTao",
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString("vi-VN"),
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
          <h1 className="text-3xl font-bold text-gray-900">Đơn Vị Hành Chính</h1>
          <p className="text-gray-600 mt-1">Quản lý danh sách đơn vị hành chính</p>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleAddNew}
          size="large"
        >
          Thêm Đơn Vị
        </Button>
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <Input.Search
            placeholder="Tìm kiếm đơn vị hành chính..."
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
            showTotal: (total) => `Tổng ${total} đơn vị`,
          }}
        />
      </div>

      <Modal
        title={editingRecord ? "Sửa Đơn Vị Hành Chính" : "Thêm Đơn Vị Hành Chính Mới"}
        open={isModalOpen}
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
          setEditingRecord(null);
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          className="mt-4"
        >
          <Form.Item
            label="Mã đơn vị"
            name="maDonVi"
            rules={[{ required: true, message: "Vui lòng nhập mã đơn vị" }]}
          >
            <Input placeholder="VD: 79" />
          </Form.Item>

          <Form.Item
            label="Tên đơn vị"
            name="tenDonVi"
            rules={[{ required: true, message: "Vui lòng nhập tên đơn vị" }]}
          >
            <Input placeholder="VD: Thành phố Hồ Chí Minh" />
          </Form.Item>

          <Form.Item
            label="Cấp"
            name="cap"
            rules={[{ required: true, message: "Vui lòng chọn cấp" }]}
          >
            <Select placeholder="Chọn cấp">
              <Option value="TINH">Tỉnh/Thành phố</Option>
              <Option value="HUYEN">Quận/Huyện</Option>
              <Option value="XA">Xã/Phường/Thị trấn</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Trực thuộc" name="donViChaId">
            <Select placeholder="Chọn đơn vị cấp trên (nếu có)" allowClear>
              {parentUnits.map((unit) => (
                <Option key={unit.id} value={unit.id}>
                  {unit.tenDonVi} ({getCapLabel(unit.cap).text})
                </Option>
              ))}
            </Select>
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
