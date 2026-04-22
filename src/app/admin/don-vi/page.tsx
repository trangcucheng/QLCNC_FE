"use client";

import { useEffect, useState } from "react";
import { Table, Button, Input, Modal, Form, message, Space, Select, Tag } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import axios from "axios";
import IconButton from "@/components/ui/IconButton";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";

const { Option } = Select;

interface XaPhuong {
  id: string;
  ma: string;
  ten: string;
  cap: number;
  loai: string;
  tinhThanhPhoId: string;
  trangThai: boolean;
  ngayTao: string;
}

interface TinhThanhPho {
  id: string;
  ma: string;
  ten: string;
  cap: number;
  loai: string;
  tinhThanhPhoId: string | null;
  trangThai: boolean;
  ngayTao: string;
  xaPhuong?: XaPhuong[];
}

export default function DonViPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<TinhThanhPho[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    document.title = "Đơn vị Hành chính | QLCNC";
  }, []);
  const [editingRecord, setEditingRecord] = useState<any | null>(null);
  const [tinhThanhList, setTinhThanhList] = useState<TinhThanhPho[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchTreeData();
    fetchTinhThanhList();
  }, []);

  const fetchTreeData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get<TinhThanhPho[]>(
        `${process.env.NEXT_PUBLIC_API_URL}/don-vi-hanh-chinh/tree`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 1,
            pageSize: 100,
          },
        }
      );
      setData(response.data || []);
    } catch (error: any) {
      message.error(error.response?.data?.message || "Lỗi khi tải danh sách đơn vị hành chính");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const fetchTinhThanhList = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/don-vi-hanh-chinh/tinh-thanh-pho`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          params: {
            page: 1,
            pageSize: 100,
          },
        }
      );
      setTinhThanhList(response.data?.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách tỉnh/thành phố:", error);
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const token = localStorage.getItem("access_token");
      const payload = {
        ...values,
        cap: values.cap || 1,
        trangThai: true,
      };

      if (editingRecord) {
        // Update
        await axios.put(
          `${process.env.NEXT_PUBLIC_API_URL}/don-vi-hanh-chinh/${editingRecord.id}`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Cập nhật đơn vị hành chính thành công");
      } else {
        // Create
        await axios.post(
          `${process.env.NEXT_PUBLIC_API_URL}/don-vi-hanh-chinh`,
          payload,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        message.success("Thêm đơn vị hành chính thành công");
      }
      setIsModalOpen(false);
      form.resetFields();
      setEditingRecord(null);
      fetchTreeData();
      fetchTinhThanhList();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra");
      console.error(error);
    }
  };

  const handleEdit = (record: any) => {
    setEditingRecord(record);
    form.setFieldsValue({
      ma: record.ma,
      ten: record.ten,
      cap: record.cap,
      loai: record.loai,
      tinhThanhPhoId: record.tinhThanhPhoId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa đơn vị hành chính này?",
      onOk: async () => {
        try {
          const token = localStorage.getItem("access_token");
          await axios.delete(
            `${process.env.NEXT_PUBLIC_API_URL}/don-vi-hanh-chinh/${id}`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          message.success("Xóa đơn vị hành chính thành công");
          fetchTreeData();
          fetchTinhThanhList();
        } catch (error: any) {
          message.error(error.response?.data?.message || "Có lỗi xảy ra khi xóa đơn vị hành chính");
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

  // Expandable table columns - Main table (Tỉnh/TP)
  const columns: ColumnsType<TinhThanhPho> = [
    {
      title: "Mã",
      dataIndex: "ma",
      key: "ma",
      width: 100,
    },
    {
      title: "Tên Tỉnh/Thành phố",
      dataIndex: "ten",
      key: "ten",
      filteredValue: searchText ? [searchText] : null,
      onFilter: (value, record) =>
        record.ten.toLowerCase().includes((value as string).toLowerCase()),
    },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai",
      width: 120,
      render: (loai: string) => (
        <Tag color="blue">{loai}</Tag>
      ),
    },
    {
      title: "Số Xã/Phường",
      key: "count",
      width: 130,
      align: "center",
      render: (_, record) => (
        <Tag color="green">{record.xaPhuong?.length || 0}</Tag>
      ),
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
      width: 120,
      fixed: "right",
      render: (_, record) => (
        <div className="flex gap-2">
          {hasPermission("don-vi:update") && (
            <IconButton
              icon={<PencilIcon />}
              tooltip="Chỉnh sửa"
              variant="edit"
              onClick={() => handleEdit(record)}
            />
          )}
          {hasPermission("don-vi:delete") && (
            <IconButton
              icon={<TrashBinIcon />}
              tooltip="Xóa"
              variant="delete"
              onClick={() => handleDelete(record.id)}
            />
          )}
        </div>
      ),
    },
  ];

  // Expanded row columns (Xã/Phường)
  const expandedRowColumns: ColumnsType<XaPhuong> = [
    {
      title: "Mã",
      dataIndex: "ma",
      key: "ma",
      width: 100,
    },
    {
      title: "Tên Xã/Phường",
      dataIndex: "ten",
      key: "ten",
    },
    {
      title: "Loại",
      dataIndex: "loai",
      key: "loai",
      width: 120,
      render: (loai: string) => (
        <Tag color="orange">{loai}</Tag>
      ),
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      width: 120,
      render: (status: boolean) => (
        <Tag color={status ? "success" : "error"}>
          {status ? "Hoạt động" : "Ngưng"}
        </Tag>
      ),
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
      width: 120,
      render: (_, record) => (
        <div className="flex gap-2">
          {hasPermission("don-vi:update") && (
            <IconButton
              icon={<PencilIcon />}
              tooltip="Chỉnh sửa"
              variant="edit"
              onClick={() => handleEdit(record)}
            />
          )}
          {hasPermission("don-vi:delete") && (
            <IconButton
              icon={<TrashBinIcon />}
              tooltip="Xóa"
              variant="delete"
              onClick={() => handleDelete(record.id)}
            />
          )}
        </div>
      ),
    },
  ];

  const expandedRowRender = (record: TinhThanhPho) => {
    return (
      <Table
        columns={expandedRowColumns}
        dataSource={record.xaPhuong || []}
        pagination={false}
        rowKey="id"
        size="small"
        className="ml-8"
      />
    );
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">Đơn Vị Hành Chính</h5>
          <p className="text-gray-600 mt-1">Quản lý danh sách tỉnh/thành phố và xã/phường</p>
        </div>
        {hasPermission("don-vi:create") && (
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddNew}
            size="large"
          >
            Thêm Đơn Vị
          </Button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="mb-4">
          <Input
            placeholder="Tìm kiếm tỉnh/thành phố..."
            prefix={<SearchOutlined />}
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
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => (record.xaPhuong?.length || 0) > 0,
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Tổng ${total} tỉnh/thành phố`,
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
            name="ma"
            rules={[{ required: true, message: "Vui lòng nhập mã đơn vị" }]}
          >
            <Input placeholder="VD: HCM" />
          </Form.Item>

          <Form.Item
            label="Tên đơn vị"
            name="ten"
            rules={[{ required: true, message: "Vui lòng nhập tên đơn vị" }]}
          >
            <Input placeholder="VD: Thành phố Hồ Chí Minh" />
          </Form.Item>

          <Form.Item
            label="Cấp"
            name="cap"
            rules={[{ required: true, message: "Vui lòng chọn cấp" }]}
          >
            <Select placeholder="Chọn cấp" onChange={(value) => {
              if (value === 1) {
                form.setFieldValue('tinhThanhPhoId', null);
              }
            }}>
              <Option value={1}>Tỉnh/Thành phố (Cấp 1)</Option>
              <Option value={2}>Xã/Phường (Cấp 2)</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Loại"
            name="loai"
            rules={[{ required: true, message: "Vui lòng nhập loại" }]}
          >
            <Input placeholder="VD: Thành phố, Tỉnh, Xã, Phường" />
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prevValues, currentValues) => prevValues.cap !== currentValues.cap}
          >
            {({ getFieldValue }) =>
              getFieldValue('cap') === 2 ? (
                <Form.Item 
                  label="Thuộc Tỉnh/Thành phố" 
                  name="tinhThanhPhoId"
                  rules={[{ required: true, message: "Vui lòng chọn tỉnh/thành phố" }]}
                >
                  <Select placeholder="Chọn tỉnh/thành phố" showSearch optionFilterProp="children">
                    {tinhThanhList.map((tinh) => (
                      <Option key={tinh.id} value={tinh.id}>
                        {tinh.ten} ({tinh.loai})
                      </Option>
                    ))}
                  </Select>
                </Form.Item>
              ) : null
            }
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
