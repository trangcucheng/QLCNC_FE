"use client";

import { useEffect, useState } from "react";
import { hoSoDoiTuongApi, taiLieuApi } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import {
  HoSoDoiTuong,
  getTrangThaiDoiTuongLabel,
  getTrangThaiDoiTuongColor,
  getGioiTinhLabel,
  TaiLieuDoiTuong,
} from "@/types";
import { showSuccess, showError, showConfirm } from "@/utils/sweetalert";

export default function ChiTietDoiTuongPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<HoSoDoiTuong | null>(null);
  const [documents, setDocuments] = useState<TaiLieuDoiTuong[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    document.title = "Chi tiết Đối tượng | QLCNC";
  }, []);

  useEffect(() => {
    if (id) {
      fetchData();
      fetchDocuments();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoDoiTuongApi.getOne(id);
      setData(response.data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết đối tượng:", error);
      showError("Không tìm thấy đối tượng này!");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await taiLieuApi.getByDoiTuong(id);
      setDocuments(response.data);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loaiTaiLieu = prompt(
      "Nhập loại tài liệu (VD: Ảnh chân dung, CMND, Bản khai,...)",
      "Tài liệu"
    );
    if (!loaiTaiLieu) return;

    try {
      setUploading(true);
      await taiLieuApi.uploadDoiTuong(id, file, loaiTaiLieu);
      showSuccess("Upload tài liệu thành công!");
      fetchDocuments();
    } catch (error) {
      showError("Có lỗi khi upload tài liệu!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn xóa tài liệu này?");
    if (!confirmed) return;

    try {
      await taiLieuApi.delete(docId);
      showSuccess("Xóa tài liệu thành công!");
      fetchDocuments();
    } catch (error) {
      showError("Có lỗi khi xóa tài liệu!");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <h5 className="text-3xl font-bold text-gray-900">{data.hoTen}</h5>
          {data.tenGoiKhac && (
            <p className="text-gray-600 mt-1">Aka: {data.tenGoiKhac}</p>
          )}
        </div>
        <div className="flex gap-3">
          <a
            href={`/admin/doi-tuong/${id}/chinh-sua`}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            ✏️ Chỉnh sửa
          </a>
          <span
            className={`px-6 py-3 rounded-lg font-semibold text-white ${getTrangThaiDoiTuongColor(
              data.trangThai
            )}`}
          >
            {getTrangThaiDoiTuongLabel(data.trangThai)}
          </span>
        </div>
      </div>

      {/* Thông tin cá nhân */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Thông tin cá nhân
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {data.anhDaiDien && (
            <div className="md:col-span-3 flex justify-center">
              <img
                src={data.anhDaiDien}
                alt={data.hoTen}
                className="w-40 h-40 rounded-full object-cover border-4 border-gray-200"
              />
            </div>
          )}

          <div>
            <p className="text-sm text-gray-600">Giới tính</p>
            <p className="text-base font-semibold text-gray-900">
              {getGioiTinhLabel(data.gioiTinh)}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Ngày sinh</p>
            <p className="text-base font-semibold text-gray-900">
              {new Date(data.ngaySinh).toLocaleDateString("vi-VN")}
            </p>
          </div>
          <div>
            <p className="text-sm text-gray-600">CMND/CCCD</p>
            <p className="text-base font-semibold text-gray-900">
              {data.soCMND_CCCD}
            </p>
          </div>
          {data.ngayCapCMND_CCCD && (
            <div>
              <p className="text-sm text-gray-600">Ngày cấp</p>
              <p className="text-base font-semibold text-gray-900">
                {new Date(data.ngayCapCMND_CCCD).toLocaleDateString("vi-VN")}
              </p>
            </div>
          )}
          {data.noiCapCMND_CCCD && (
            <div>
              <p className="text-sm text-gray-600">Nơi cấp</p>
              <p className="text-base font-semibold text-gray-900">
                {data.noiCapCMND_CCCD}
              </p>
            </div>
          )}
          {data.soDienThoai && (
            <div>
              <p className="text-sm text-gray-600">Số điện thoại</p>
              <p className="text-base font-semibold text-gray-900">
                {data.soDienThoai}
              </p>
            </div>
          )}
          {data.email && (
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="text-base font-semibold text-gray-900">
                {data.email}
              </p>
            </div>
          )}
          {data.ngheNghiep && (
            <div>
              <p className="text-sm text-gray-600">Nghề nghiệp</p>
              <p className="text-base font-semibold text-gray-900">
                {data.ngheNghiep}
              </p>
            </div>
          )}
          {data.noiLamViec && (
            <div>
              <p className="text-sm text-gray-600">Nơi làm việc</p>
              <p className="text-base font-semibold text-gray-900">
                {data.noiLamViec}
              </p>
            </div>
          )}
          {data.trinhDoHocVan && (
            <div>
              <p className="text-sm text-gray-600">Trình độ học vấn</p>
              <p className="text-base font-semibold text-gray-900">
                {data.trinhDoHocVan}
              </p>
            </div>
          )}
          {data.danToc && (
            <div>
              <p className="text-sm text-gray-600">Dân tộc</p>
              <p className="text-base font-semibold text-gray-900">
                {data.danToc}
              </p>
            </div>
          )}
          {data.tonGiao && (
            <div>
              <p className="text-sm text-gray-600">Tôn giáo</p>
              <p className="text-base font-semibold text-gray-900">
                {data.tonGiao}
              </p>
            </div>
          )}
          {data.quocTich && (
            <div>
              <p className="text-sm text-gray-600">Quốc tịch</p>
              <p className="text-base font-semibold text-gray-900">
                {data.quocTich}
              </p>
            </div>
          )}
          {data.tienAn && (
            <div className="md:col-span-3">
              <p className="text-sm text-gray-600">Tiền án</p>
              <p className="text-base font-semibold text-red-600">
                {data.tienAn}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Địa chỉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Thường trú */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Địa chỉ thường trú
          </h2>
          <div className="space-y-3">
            {data.diaChiThuongTru && (
              <p className="text-gray-900">{data.diaChiThuongTru}</p>
            )}
            <div className="text-sm text-gray-600">
              {[
                data.xaPhuongThuongTru,
                data.quanHuyenThuongTru,
                data.tinhThanhThuongTru,
              ]
                .filter(Boolean)
                .join(", ")}
            </div>
          </div>
        </div>

        {/* Tạm trú */}
        {(data.diaChiTamTru ||
          data.xaPhuongTamTru ||
          data.quanHuyenTamTru ||
          data.tinhThanhTamTru) && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Địa chỉ tạm trú
            </h2>
            <div className="space-y-3">
              {data.diaChiTamTru && (
                <p className="text-gray-900">{data.diaChiTamTru}</p>
              )}
              <div className="text-sm text-gray-600">
                {[
                  data.xaPhuongTamTru,
                  data.quanHuyenTamTru,
                  data.tinhThanhTamTru,
                ]
                  .filter(Boolean)
                  .join(", ")}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Đặc điểm & Ghi chú */}
      {(data.dacDiemNhanDang || data.ghiChu) && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông tin bổ sung
          </h2>
          <div className="space-y-4">
            {data.dacDiemNhanDang && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Đặc điểm nhận dạng:
                </p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {data.dacDiemNhanDang}
                </p>
              </div>
            )}
            {data.ghiChu && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">
                  Ghi chú:
                </p>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {data.ghiChu}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tài liệu đính kèm */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Tài liệu đính kèm ({documents.length})
          </h2>
          <label className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium cursor-pointer">
            {uploading ? "Đang upload..." : "📎 Upload tài liệu"}
            <input
              type="file"
              onChange={handleFileUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
        </div>
        
        {documents.length === 0 ? (
          <p className="text-center text-gray-500 py-8">
            Chưa có tài liệu nào
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900">{doc.loaiTaiLieu}</p>
                  <button
                    onClick={() => handleDeleteDocument(doc.id)}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    ✕
                  </button>
                </div>
                <p className="text-sm text-gray-600 mb-2">{doc.tenFile}</p>
                <a
                  href={doc.duongDanFile}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:text-blue-700 text-sm"
                >
                  Tải xuống
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Thời gian */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Tạo lúc: {new Date(data.createdAt).toLocaleString("vi-VN")}
          </span>
          <span>
            Cập nhật lúc: {new Date(data.updatedAt).toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </div>
  );
}
