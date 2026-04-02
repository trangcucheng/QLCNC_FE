"use client";

import { useEffect, useState } from "react";
import { hoSoVuViecApi, taiLieuApi } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import {
  HoSoVuViec,
  getTrangThaiHoSoLabel,
  getTrangThaiHoSoColor,
  getMucDoViPhamLabel,
  getMucDoViPhamColor,
  TaiLieuVuViec,
} from "@/types";

export default function ChiTietVuViecPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<HoSoVuViec | null>(null);
  const [documents, setDocuments] = useState<TaiLieuVuViec[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
      fetchDocuments();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoVuViecApi.getOne(id);
      setData(response.data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết vụ việc:", error);
      alert("Không tìm thấy vụ việc này!");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async () => {
    try {
      const response = await taiLieuApi.getByVuViec(id);
      setDocuments(response.data);
    } catch (error) {
      console.error("Lỗi khi tải tài liệu:", error);
    }
  };

  const handleChangeStatus = async () => {
    const newStatus = prompt(
      "Nhập trạng thái mới (DANG_XU_LY, TAM_DUNG, HOAN_THANH, CHUYEN_GIAI, HUY_BO):",
      data?.trangThai
    );
    if (!newStatus) return;

    const lyDo = prompt("Nhập lý do thay đổi trạng thái:");
    if (!lyDo) return;

    try {
      setChangingStatus(true);
      await hoSoVuViecApi.updateStatus(id, { trangThai: newStatus, lyDoThayDoi: lyDo });
      alert("Cập nhật trạng thái thành công!");
      fetchData();
    } catch (error) {
      alert("Có lỗi khi cập nhật trạng thái!");
      console.error(error);
    } finally {
      setChangingStatus(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const loaiTaiLieu = prompt(
      "Nhập loại tài liệu (VD: Biên bản, Ảnh hiện trường, Bằng chứng,...)",
      "Tài liệu"
    );
    if (!loaiTaiLieu) return;

    try {
      setUploading(true);
      await taiLieuApi.uploadVuViec(id, file, loaiTaiLieu);
      alert("Upload tài liệu thành công!");
      fetchDocuments();
    } catch (error) {
      alert("Có lỗi khi upload tài liệu!");
      console.error(error);
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteDocument = async (docId: string) => {
    if (!confirm("Bạn có chắc chắn muốn xóa tài liệu này?")) return;

    try {
      await taiLieuApi.delete(docId);
      alert("Xóa tài liệu thành công!");
      fetchDocuments();
    } catch (error) {
      alert("Có lỗi khi xóa tài liệu!");
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
          <h1 className="text-3xl font-bold text-gray-900">{data.tenVuViec}</h1>
          <p className="text-gray-600 mt-1">Số hồ sơ: {data.soHoSo}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleChangeStatus}
            disabled={changingStatus}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50"
          >
            {changingStatus ? "Đang xử lý..." : "🔄 Đổi trạng thái"}
          </button>
          <a
            href={`/admin/vu-viec/${id}/chinh-sua`}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            ✏️ Chỉnh sửa
          </a>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Mức độ vi phạm</p>
          <span
            className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${getMucDoViPhamColor(
              data.mucDoViPham
            )}`}
          >
            {getMucDoViPhamLabel(data.mucDoViPham)}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Trạng thái</p>
          <span
            className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${getTrangThaiHoSoColor(
              data.trangThai
            )}`}
          >
            {getTrangThaiHoSoLabel(data.trangThai)}
          </span>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <p className="text-sm text-gray-600 mb-2">Ngày xảy ra</p>
          <p className="text-xl font-bold text-gray-900">
            {new Date(data.ngayXayRa).toLocaleDateString("vi-VN")}
          </p>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Địa điểm xảy ra
        </h2>
        <div className="space-y-2">
          <p className="text-gray-900 font-semibold">{data.diaDiemXayRa}</p>
          <p className="text-sm text-gray-600">
            {[data.xaPhuong, data.quanHuyen, data.tinhThanh]
              .filter(Boolean)
              .join(", ")}
          </p>
        </div>
      </div>

      {/* Nội dung vụ việc */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Tóm tắt nội dung
        </h2>
        <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
          {data.tomTatNoiDung}
        </p>
      </div>

      {/* Kết quả xử lý */}
      {data.ketQuaXuLy && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Kết quả xử lý
          </h2>
          <p className="text-gray-900 whitespace-pre-wrap leading-relaxed">
            {data.ketQuaXuLy}
          </p>
        </div>
      )}

      {/* Đối tượng liên quan */}
      {data.VuViecDoiTuong && data.VuViecDoiTuong.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Đối tượng liên quan ({data.VuViecDoiTuong.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.VuViecDoiTuong.map((vvdt: any) => (
              <a
                key={vvdt.id}
                href={`/admin/doi-tuong/${vvdt.hoSoDoiTuong.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-500"
              >
                <div className="flex items-center gap-4">
                  {vvdt.hoSoDoiTuong.anhDaiDien ? (
                    <img
                      src={vvdt.hoSoDoiTuong.anhDaiDien}
                      alt=""
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
                      {vvdt.hoSoDoiTuong.hoTen.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {vvdt.hoSoDoiTuong.hoTen}
                    </p>
                    <p className="text-sm text-gray-600">
                      CMND/CCCD: {vvdt.hoSoDoiTuong.soCMND_CCCD}
                    </p>
                    {vvdt.vaiTro && (
                      <p className="text-sm text-blue-600 font-medium">
                        Vai trò: {vvdt.vaiTro}
                      </p>
                    )}
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      {/* Lịch sử thay đổi trạng thái */}
      {data.LichSuTrangThai && data.LichSuTrangThai.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Lịch sử thay đổi trạng thái
          </h2>
          <div className="space-y-4">
            {data.LichSuTrangThai.map((history: any) => (
              <div
                key={history.id}
                className="border-l-4 border-blue-500 pl-4 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getTrangThaiHoSoLabel(history.trangThai)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {history.lyDoThayDoi}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(history.createdAt).toLocaleString("vi-VN")}
                  </p>
                </div>
                {history.nguoiThayDoi && (
                  <p className="text-sm text-gray-600 mt-2">
                    Người thay đổi: {history.nguoiThayDoi.hoTen}
                  </p>
                )}
              </div>
            ))}
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

      {/* Ghi chú */}
      {data.ghiChu && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ghi chú</h2>
          <p className="text-gray-900 whitespace-pre-wrap">{data.ghiChu}</p>
        </div>
      )}

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
