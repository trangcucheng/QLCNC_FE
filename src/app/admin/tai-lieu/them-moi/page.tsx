"use client";

import { useState, useEffect } from "react";
import { Form, Input, Select, Upload, Button, message, Card } from "antd";
import { UploadOutlined, ArrowLeftOutlined } from "@ant-design/icons";
import { useRouter } from "next/navigation";

const { TextArea } = Input;
const { Option } = Select;

export default function ThemTaiLieuPage() {
  const router = useRouter();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Thêm mới Tài liệu | QLCNC";
  }, []);

  const handleSubmit = async (values: any) => {
    try {
      setLoading(true);

      const formData = new FormData();
      formData.append("tenTaiLieu", values.tenTaiLieu);
      formData.append("loaiTaiLieu", values.loaiTaiLieu);
      if (values.moTa) {
        formData.append("moTa", values.moTa);
      }
      if (fileList.length > 0) {
        formData.append("file", fileList[0].originFileObj);
      }

      // TODO: Call API
      // await fetch('/api/tai-lieu', {
      //   method: 'POST',
      //   body: formData,
      // });

      message.success("Tải lên tài liệu thành công!");
      router.push("/admin/tai-lieu");
    } catch (error) {
      message.error("Có lỗi xảy ra khi tải lên tài liệu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <Button
        icon={<ArrowLeftOutlined />}
        onClick={() => router.back()}
        className="mb-4"
      >
        Quay lại
      </Button>

      <Card title="Tải lên Tài liệu Mới">
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          initialValues={{
            loaiTaiLieu: "CHUNG_CU",
          }}
        >
          <Form.Item
            label="Tên tài liệu"
            name="tenTaiLieu"
            rules={[{ required: true, message: "Vui lòng nhập tên tài liệu" }]}
          >
            <Input size="large" placeholder="Nhập tên tài liệu" />
          </Form.Item>

          <Form.Item
            label="Loại tài liệu"
            name="loaiTaiLieu"
            rules={[{ required: true, message: "Vui lòng chọn loại tài liệu" }]}
          >
            <Select size="large" placeholder="Chọn loại tài liệu">
              <Option value="CHUNG_CU">Chứng cứ</Option>
              <Option value="BIEN_BAN">Biên bản</Option>
              <Option value="QUYET_DINH">Quyết định</Option>
              <Option value="BAO_CAO">Báo cáo</Option>
              <Option value="KHAC">Khác</Option>
            </Select>
          </Form.Item>

          <Form.Item label="Mô tả" name="moTa">
            <TextArea
              rows={4}
              placeholder="Nhập mô tả tài liệu (tùy chọn)"
            />
          </Form.Item>

          <Form.Item
            label="Tệp tài liệu"
            required
            help="Hỗ trợ: PDF, DOC, DOCX, XLS, XLSX, JPG, PNG (tối đa 50MB)"
          >
            <Upload
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              beforeUpload={() => false}
              maxCount={1}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
            >
              <Button icon={<UploadOutlined />} size="large">
                Chọn tệp
              </Button>
            </Upload>
          </Form.Item>

          <Form.Item>
            <div className="flex gap-3">
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                size="large"
              >
                Tải lên
              </Button>
              <Button onClick={() => router.back()} size="large">
                Hủy
              </Button>
            </div>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
