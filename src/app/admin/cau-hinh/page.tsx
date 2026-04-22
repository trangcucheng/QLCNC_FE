"use client";

import { useEffect, useState } from "react";
import { Card, Form, Input, InputNumber, Switch, Button, message, Tabs, Select, Divider } from "antd";
import { SaveOutlined } from "@ant-design/icons";
import { cauHinhApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const { TabPane } = Tabs;
const { Option } = Select;
const { TextArea } = Input;

interface CauHinh {
  tenHeThong: string;
  moTa: string;
  email: string;
  soDienThoai: string;
  diaChi: string;
  logoPath?: string;
  thoiGianSessionPhut: number;
  soLanDangNhapToiDa: number;
  batBuocXacThuc2Buoc: boolean;
  batBuocDoiMatKhauDinhKy: boolean;
  soNgayDoiMatKhau: number;
  kichHoatBackupTuDong: boolean;
  tanSuatBackupGio: number;
}

export default function CauHinhPage() {
  const { hasPermission } = useAuth();
  const [form] = Form.useForm<CauHinh>();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = "Cấu hình Hệ thống | QLCNC";
  }, []);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchCauHinh();
  }, []);

  const fetchCauHinh = async () => {
    try {
      setLoading(true);
      const config = await cauHinhApi.getAsObject();
      
      form.setFieldsValue({
        tenHeThong: config.tenHeThong || "Hệ Thống Quản Lý Công Nghiệp Cơ Sở Việt Nam",
        moTa: config.moTa || "Hệ thống quản lý hồ sơ đối tượng và vụ việc vi phạm pháp luật",
        email: config.email || "contact@qlcnc.gov.vn",
        soDienThoai: config.soDienThoai || "0123456789",
        diaChi: config.diaChi || "Hà Nội, Việt Nam",
        logoPath: config.logoPath || "",
        thoiGianSessionPhut: config.thoiGianSessionPhut || 60,
        soLanDangNhapToiDa: config.soLanDangNhapToiDa || 5,
        batBuocXacThuc2Buoc: config.batBuocXacThuc2Buoc || false,
        batBuocDoiMatKhauDinhKy: config.batBuocDoiMatKhauDinhKy || true,
        soNgayDoiMatKhau: config.soNgayDoiMatKhau || 90,
        kichHoatBackupTuDong: config.kichHoatBackupTuDong || true,
        tanSuatBackupGio: config.tanSuatBackupGio || 24,
      });
    } catch (error: any) {
      console.error("Lỗi khi tải cấu hình:", error);
      message.error(error.message || "Lỗi khi tải cấu hình");
      
      // Nếu chưa có dữ liệu, có thể khởi tạo mặc định
      if (error.message?.includes("404") || error.message?.includes("không tìm thấy")) {
        try {
          await cauHinhApi.initialize();
          message.success("Đã khởi tạo cấu hình mặc định");
          fetchCauHinh(); // Reload
        } catch (initError) {
          console.error("Lỗi khởi tạo:", initError);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (values: CauHinh) => {
    try {
      setSaving(true);
      await cauHinhApi.updateMultiple(values);
      message.success("Lưu cấu hình thành công");
      fetchCauHinh(); // Reload để đảm bảo đồng bộ
    } catch (error: any) {
      console.error("Lỗi khi lưu cấu hình:", error);
      message.error(error.message || "Có lỗi xảy ra khi lưu cấu hình");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">Cấu Hình Hệ Thống</h5>
          <p className="text-gray-600 mt-1">Quản lý các thiết lập và cấu hình hệ thống</p>
        </div>
        {hasPermission("UPDATE_CAU_HINH") && (
          <Button
            type="primary"
            icon={<SaveOutlined />}
            onClick={() => form.submit()}
            loading={saving}
            size="large"
          >
            Lưu Cấu Hình
          </Button>
        )}
      </div>

      <Form
        form={form}
        layout="vertical"
        onFinish={handleSubmit}
      >
        <Tabs defaultActiveKey="thong-tin-chung">
          <TabPane tab="Thông Tin Chung" key="thong-tin-chung">
            <Card loading={loading}>
              <Form.Item
                label="Tên hệ thống"
                name="tenHeThong"
                rules={[{ required: true, message: "Vui lòng nhập tên hệ thống" }]}
              >
                <Input size="large" placeholder="Tên hệ thống" />
              </Form.Item>

              <Form.Item label="Mô tả" name="moTa">
                <TextArea rows={3} placeholder="Mô tả hệ thống" />
              </Form.Item>

              <Divider />

              <div className="grid grid-cols-2 gap-4">
                <Form.Item
                  label="Email liên hệ"
                  name="email"
                  rules={[
                    { required: true, message: "Vui lòng nhập email" },
                    { type: "email", message: "Email không hợp lệ" },
                  ]}
                >
                  <Input size="large" placeholder="contact@example.com" />
                </Form.Item>

                <Form.Item
                  label="Số điện thoại"
                  name="soDienThoai"
                  rules={[{ required: true, message: "Vui lòng nhập số điện thoại" }]}
                >
                  <Input size="large" placeholder="0123456789" />
                </Form.Item>
              </div>

              <Form.Item label="Địa chỉ" name="diaChi">
                <TextArea rows={2} placeholder="Địa chỉ trụ sở" />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="Bảo Mật" key="bao-mat">
            <Card loading={loading}>
              <Form.Item
                label="Thời gian session (phút)"
                name="thoiGianSessionPhut"
                help="Thời gian tự động đăng xuất khi không hoạt động"
              >
                <InputNumber
                  min={5}
                  max={240}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Form.Item
                label="Số lần đăng nhập tối đa"
                name="soLanDangNhapToiDa"
                help="Số lần thử đăng nhập sai trước khi khóa tài khoản"
              >
                <InputNumber
                  min={3}
                  max={10}
                  size="large"
                  style={{ width: "100%" }}
                />
              </Form.Item>

              <Divider />

              <Form.Item
                label="Xác thực 2 bước"
                name="batBuocXacThuc2Buoc"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                label="Bắt buộc đổi mật khẩu định kỳ"
                name="batBuocDoiMatKhauDinhKy"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                label="Số ngày đổi mật khẩu"
                name="soNgayDoiMatKhau"
                help="Yêu cầu đổi mật khẩu sau số ngày này"
              >
                <InputNumber
                  min={30}
                  max={365}
                  size="large"
                  style={{ width: "100%" }}
                  disabled={!form.getFieldValue("batBuocDoiMatKhauDinhKy")}
                />
              </Form.Item>
            </Card>
          </TabPane>

          <TabPane tab="Sao Lưu Dữ Liệu" key="sao-luu">
            <Card loading={loading}>
              <Form.Item
                label="Kích hoạt sao lưu tự động"
                name="kichHoatBackupTuDong"
                valuePropName="checked"
              >
                <Switch checkedChildren="Bật" unCheckedChildren="Tắt" />
              </Form.Item>

              <Form.Item
                label="Tần suất sao lưu (giờ)"
                name="tanSuatBackupGio"
                help="Hệ thống sẽ tự động sao lưu sau mỗi khoảng thời gian này"
              >
                <Select
                  size="large"
                  disabled={!form.getFieldValue("kichHoatBackupTuDong")}
                >
                  <Option value={6}>Mỗi 6 giờ</Option>
                  <Option value={12}>Mỗi 12 giờ</Option>
                  <Option value={24}>Mỗi ngày</Option>
                  <Option value={168}>Mỗi tuần</Option>
                </Select>
              </Form.Item>

              <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Lưu ý:</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Sao lưu tự động sẽ chạy vào lúc 02:00 sáng hàng ngày</li>
                  <li>• Dữ liệu sao lưu được lưu trữ trong thư mục backups/</li>
                  <li>• Hệ thống giữ lại tối đa 30 bản sao lưu gần nhất</li>
                </ul>
              </div>
            </Card>
          </TabPane>
        </Tabs>
      </Form>
    </div>
  );
}
