"use client";

import { useEffect, useState } from "react";
import { Table, Button, Input, Modal, Upload, message, Tag, Space, Card, Statistic, Row, Col } from "antd";
import { useAuth } from "@/context/AuthContext";
import { UploadOutlined, EyeOutlined, DeleteOutlined, DownloadOutlined, FileOutlined, FolderOutlined } from "@ant-design/icons";
import type { ColumnsType } from "antd/es/table";
import { taiLieuApi } from "@/lib/api";

interface TaiLieu {
  id: string;
  tenTaiLieu: string;
  loaiTaiLieu: string;
  duongDan: string;
  dungLuong?: number;
  moTa?: string;
  ngayTao: string;
  doiTuongId?: string;
  vuViecId?: string;
}

export default function TaiLieuPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<TaiLieu[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [thongKe, setThongKe] = useState<any>(null);

  useEffect(() => {
    document.title = "Tài liệu & Chứng cứ | QLCNC";
  }, []);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const stats = await taiLieuApi.thongKe();
      setThongKe(stats);
      // Note: Backend doesn't have list-all endpoint for documents
      // Documents are accessed via doi-tuong/:id or vu-viec/:id
      setData([]);
    } catch (error) {
      message.error("Lỗi khi tải thống kê tài liệu");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, type: 'doi-tuong' | 'vu-viec') => {
    Modal.confirm({
      title: "Xác nhận xóa",
      content: "Bạn có chắc chắn muốn xóa tài liệu này?",
      onOk: async () => {
        try {
          if (type === 'doi-tuong') {
            await taiLieuApi.deleteDoiTuong(id);
          } else {
            await taiLieuApi.deleteVuViec(id);
          }
          message.success("Xóa tài liệu thành công");
          fetchData();
        } catch (error: any) {
          message.error(error.message || "Có lỗi xảy ra khi xóa tài liệu");
          console.error(error);
        }
      },
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">Quản Lý Tài Liệu</h5>
          <p className="text-gray-600 mt-1">Quản lý tài liệu và chứng cứ pháp lý</p>
        </div>
        {hasPermission("tai-lieu:create") && (
          <Button
            type="primary"
            icon={<UploadOutlined />}
            href="/admin/tai-lieu/them-moi"
            size="large"
          >
            Tải lên Tài liệu
          </Button>
        )}
      </div>

      {/* Thống kê tài liệu */}
      {thongKe && (
        <Row gutter={16}>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tổng số tài liệu"
                value={thongKe.tongSoTaiLieu || 0}
                prefix={<FileOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tài liệu đối tượng"
                value={thongKe.soTaiLieuDoiTuong || 0}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
          <Col span={8}>
            <Card>
              <Statistic
                title="Tài liệu vụ việc"
                value={thongKe.soTaiLieuVuViec || 0}
                prefix={<FolderOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}

      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="text-center py-12">
          <FileOutlined style={{ fontSize: 64, color: '#ccc' }} />
          <h3 className="text-xl font-semibold mt-4">Quản lý tài liệu</h3>
          <p className="text-gray-500 mt-2">
            Tài liệu được quản lý theo từng đối tượng và vụ việc.
            <br />
            Vui lòng truy cập trang chi tiết đối tượng hoặc vụ việc để xem và quản lý tài liệu.
          </p>
          <div className="mt-6 space-x-3">
            <Button type="primary" href="/admin/doi-tuong">
              Xem Đối Tượng
            </Button>
            <Button href="/admin/vu-viec">
              Xem Vụ Việc
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
