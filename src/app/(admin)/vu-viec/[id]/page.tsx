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
import { showSuccess, showError, showConfirm } from "@/utils/sweetalert";

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
    document.title = "Chi tiết Vụ việc | QLCNC";
  }, []);

  useEffect(() => {
    if (id) {
      fetchData();
      fetchDocuments();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoVuViecApi.getOne(id);
      setData(response.data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết vụ việc:", error);
      showError("Không tìm thấy vụ việc này!");
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
      // Backend expects: trangThaiMoi, lyDo
      await hoSoVuViecApi.updateStatus(id, { trangThaiMoi: newStatus, lyDo });
      showSuccess("Cập nhật trạng thái thành công!");
      fetchData();
    } catch (error) {
      showError("Có lỗi khi cập nhật trạng thái!");
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
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
            className="text-brand-600 hover:text-brand-700 mb-2 flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <h5 className="text-3xl font-bold text-gray-900">{data.tenVuViec}</h5>
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
      {data.vuViecDoiTuong && data.vuViecDoiTuong.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Đối tượng liên quan ({data.vuViecDoiTuong.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {data.vuViecDoiTuong.map((vvdt: any) => (
              <a
                key={vvdt.id}
                href={`/admin/doi-tuong/${vvdt.doiTuong.id}`}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-brand-500"
              >
                <div className="flex items-center gap-4">
                  {vvdt.doiTuong.anhDaiDien ? (
                    <img
                      src={vvdt.doiTuong.anhDaiDien}
                      alt=""
                      className="w-16 h-16 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold text-xl">
                      {vvdt.doiTuong.hoTen.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <p className="font-semibold text-gray-900">
                      {vvdt.doiTuong.hoTen}
                    </p>
                    <p className="text-sm text-gray-600">
                      CMND/CCCD: {vvdt.doiTuong.soCMND_CCCD}
                    </p>
                    {vvdt.vaiTro && (
                      <p className="text-sm text-brand-600 font-medium">
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
      {data.lichSuXuLy && data.lichSuXuLy.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Lịch sử thay đổi trạng thái
          </h2>
          <div className="space-y-4">
            {data.lichSuXuLy.map((history: any) => (
              <div
                key={history.id}
                className="border-l-4 border-brand-500 pl-4 py-2"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-semibold text-gray-900">
                      {getTrangThaiHoSoLabel(history.trangThaiMoi)}
                    </p>
                    <p className="text-sm text-gray-600 mt-1">
                      {history.lyDo}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500">
                    {new Date(history.ngayThucHien).toLocaleString("vi-VN")}
                  </p>
                </div>
                {history.nguoiThucHien && (
                  <p className="text-sm text-gray-600 mt-2">
                    Người thực hiện: {history.nguoiThucHien}
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
                  className="text-brand-600 hover:text-brand-700 text-sm"
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
            Tạo lúc: {data.ngayTao
              ? new Date(data.ngayTao).toLocaleString("vi-VN")
              : "Không rõ"}
          </span>
          <span>
            Cập nhật lúc: {data.ngayCapNhat
              ? new Date(data.ngayCapNhat).toLocaleString("vi-VN")
              : "Không rõ"}
          </span>
        </div>
      </div>
    </div>
  );
}
