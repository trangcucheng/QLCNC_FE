"use client";

import { useEffect, useState } from "react";
import { Tabs, Table, Button, Input, Modal, Form, message, Space, Transfer, Card } from "antd";
import { PlusOutlined, EditOutlined, DeleteOutlined, KeyOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { rolesApi, permissionsApi } from "@/lib/api";
import IconButton from "@/components/ui/IconButton";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";

const { TabPane } = Tabs;

interface VaiTro {
  id: string;
  mavaVaiTro: string;
  tenVaiTro: string;
  moTa?: string;
  soLuongNguoiDung?: number;
}

interface Quyen {
  id: string;
  maQuyen: string;
  tenQuyen: string;
  moTa?: string;
  nhomQuyen?: string;
}

export default function VaiTroPage() {
  const { hasPermission } = useAuth();
  const [vaiTroData, setVaiTroData] = useState<VaiTro[]>([]);
  const [quyenData, setQuyenData] = useState<Quyen[]>([]);
  const [loading, setLoading] = useState(false);
  const [isVaiTroModalOpen, setIsVaiTroModalOpen] = useState(false);
  const [isQuyenModalOpen, setIsQuyenModalOpen] = useState(false);
  const [isPhanQuyenModalOpen, setIsPhanQuyenModalOpen] = useState(false);
  const [editingVaiTro, setEditingVaiTro] = useState<VaiTro | null>(null);
  const [selectedVaiTro, setSelectedVaiTro] = useState<VaiTro | null>(null);
  const [targetKeys, setTargetKeys] = useState<string[]>([]);
  const [form] = Form.useForm();

  useEffect(() => {
    document.title = "Vai trò & Quyền hạn | QLCNC";
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [rolesResponse, permissionsResponse] = await Promise.all([
        rolesApi.getAll({ page: 1, pageSize: 100 }),
        permissionsApi.getAll({ page: 1, pageSize: 1000 }),
      ]);
      setVaiTroData(rolesResponse || []);
      setQuyenData(permissionsResponse || []);
    } catch (error) {
      message.error("Lỗi khi tải dữ liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleVaiTroSubmit = async (values: any) => {
    try {
      if (editingVaiTro) {
        await rolesApi.update(editingVaiTro.id, values);
        message.success("Cập nhật vai trò thành công");
      } else {
        await rolesApi.create(values);
        message.success("Thêm vai trò thành công");
      }
      setIsVaiTroModalOpen(false);
      form.resetFields();
      setEditingVaiTro(null);
      fetchData();
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra");
      console.error(error);
    }
  };

  const handleDeleteVaiTro = async (id: string) => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa vai trò này?",
      onOk: async () => {
        try {
          await rolesApi.delete(id);
          message.success("Xóa vai trò thành công");
          fetchData();
        } catch (error: any) {
          message.error(error.message || "Có lỗi xảy ra");
          console.error(error);
        }
      },
    });
  };

  const handlePhanQuyen = async (record: VaiTro) => {
    setSelectedVaiTro(record);
    try {
      const permissions = await rolesApi.getPermissions(record.id);
      const permissionIds = permissions.map((p: any) => p.id);
      setTargetKeys(permissionIds);
      setIsPhanQuyenModalOpen(true);
    } catch (error) {
      console.error("Lỗi khi tải quyền của vai trò:", error);
      message.error("Không thể tải quyền của vai trò");
      setTargetKeys([]);
      setIsPhanQuyenModalOpen(true);
    }
  };

  const handleSavePhanQuyen = async () => {
    if (!selectedVaiTro) return;
    
    try {
      await rolesApi.assignPermissions(selectedVaiTro.id, targetKeys);
      message.success("Phân quyền thành công");
      setIsPhanQuyenModalOpen(false);
      fetchData(); // Refresh data
    } catch (error: any) {
      message.error(error.message || "Có lỗi xảy ra");
      console.error(error);
    }
  };

  const vaiTroColumns: ColumnsType<VaiTro> = [
    {
      title: "Mã vai trò",
      dataIndex: "maVaiTro",
      key: "maVaiTro",
      width: 120,
    },
    {
      title: "Tên vai trò",
      dataIndex: "tenVaiTro",
      key: "tenVaiTro",
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      ellipsis: true,
    },
    {
      title: "Số người dùng",
      dataIndex: "soLuongNguoiDung",
      key: "soLuongNguoiDung",
      width: 120,
      render: (count) => count || 0,
    },
    {
      title: "Thao tác",
      key: "actions",
      width: 160,
      render: (_, record) => (
        <div className="flex gap-2">
          {hasPermission("ASSIGN_ROLE") && (
            <IconButton
              icon={
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4"/>
                </svg>
              }
              tooltip="Phân quyền"
              variant="primary"
              onClick={() => handlePhanQuyen(record)}
            />
          )}
          {hasPermission("UPDATE_ROLE") && (
            <IconButton
              icon={<PencilIcon />}
              tooltip="Chỉnh sửa"
              variant="edit"
              onClick={() => {
                setEditingVaiTro(record);
                form.setFieldsValue(record);
                setIsVaiTroModalOpen(true);
              }}
            />
          )}
          {hasPermission("DELETE_ROLE") && (
            <IconButton
              icon={<TrashBinIcon />}
              tooltip="Xóa vai trò"
              variant="delete"
              onClick={() => handleDeleteVaiTro(record.id)}
            />
          )}
        </div>
      ),
    },
  ];

  const quyenColumns: ColumnsType<Quyen> = [
    {
      title: "Mã quyền",
      dataIndex: "maQuyen",
      key: "maQuyen",
      width: 150,
    },
    {
      title: "Tên quyền",
      dataIndex: "tenQuyen",
      key: "tenQuyen",
    },
    {
      title: "Nhóm quyền",
      dataIndex: "nhomQuyen",
      key: "nhomQuyen",
      width: 150,
    },
    {
      title: "Mô tả",
      dataIndex: "moTa",
      key: "moTa",
      ellipsis: true,
    },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">Vai Trò & Quyền Hạn</h5>
          <p className="text-gray-600 mt-1">Quản lý vai trò và phân quyền hệ thống</p>
        </div>
      </div>

      <Tabs defaultActiveKey="vai-tro">
        <TabPane tab="Vai Trò" key="vai-tro">
          <Card
            extra={
              hasPermission("CREATE_ROLE") && (
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingVaiTro(null);
                    form.resetFields();
                    setIsVaiTroModalOpen(true);
                  }}
                >
                  Thêm Vai Trò
                </Button>
              )
            }
          >
            <Table
              columns={vaiTroColumns}
              dataSource={vaiTroData}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>

        <TabPane tab="Quyền Hạn" key="quyen-han">
          <Card>
            <Table
              columns={quyenColumns}
              dataSource={quyenData}
              rowKey="id"
              loading={loading}
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </TabPane>
      </Tabs>

      {/* Modal Thêm/Sửa Vai Trò */}
      <Modal
        title={editingVaiTro ? "Sửa Vai Trò" : "Thêm Vai Trò Mới"}
        open={isVaiTroModalOpen}
        onCancel={() => {
          setIsVaiTroModalOpen(false);
          form.resetFields();
          setEditingVaiTro(null);
        }}
        footer={null}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleVaiTroSubmit} className="mt-4">
          <Form.Item
            label="Mã vai trò"
            name="maVaiTro"
            rules={[{ required: true, message: "Vui lòng nhập mã vai trò" }]}
          >
            <Input placeholder="VD: ADMIN" />
          </Form.Item>

          <Form.Item
            label="Tên vai trò"
            name="tenVaiTro"
            rules={[{ required: true, message: "Vui lòng nhập tên vai trò" }]}
          >
            <Input placeholder="VD: Quản trị viên" />
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <Input.TextArea rows={3} placeholder="Mô tả vai trò" />
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3 justify-end">
              <Button onClick={() => setIsVaiTroModalOpen(false)}>Hủy</Button>
              <Button type="primary" htmlType="submit">
                {editingVaiTro ? "Cập nhật" : "Thêm mới"}
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal Phân Quyền */}
      <Modal
        title={`Phân quyền cho vai trò: ${selectedVaiTro?.tenVaiTro}`}
        open={isPhanQuyenModalOpen}
        onCancel={() => setIsPhanQuyenModalOpen(false)}
        onOk={handleSavePhanQuyen}
        width={800}
      >
        <Transfer
          dataSource={quyenData.map((q) => ({
            key: q.id,
            title: q.tenQuyen,
            description: q.moTa,
          }))}
          titles={["Quyền khả dụng", "Quyền đã gán"]}
          targetKeys={targetKeys}
          onChange={(newTargetKeys) => setTargetKeys(newTargetKeys as string[])}
          render={(item) => item.title || ""}
          listStyle={{ width: 350, height: 400 }}
        />
      </Modal>
    </div>
  );
}
