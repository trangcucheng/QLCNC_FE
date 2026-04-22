"use client";

import { useEffect, useState } from "react";
import { hoSoVuViecApi, taiLieuApi, getImageUrl } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import {
  HoSoVuViec,
  getTrangThaiHoSoLabel,
  getTrangThaiHoSoColor,
  getMucDoViPhamLabel,
  getMucDoViPhamColor,
  TaiLieuVuViec,
} from "@/types";
import { showSuccess, showError, showWarning, showConfirm } from "@/utils/sweetalert";

export default function ChiTietVuViecPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<HoSoVuViec | null>(null);
  const [documents, setDocuments] = useState<TaiLieuVuViec[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [changingStatus, setChangingStatus] = useState(false);
  
  // Modal state
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [newStatus, setNewStatus] = useState("");
  const [statusReason, setStatusReason] = useState("");

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
    setNewStatus(data?.trangThai || "");
    setStatusReason("");
    setShowStatusModal(true);
  };

  const handleSubmitStatusChange = async () => {
    if (!newStatus) {
      showWarning("Vui lòng chọn trạng thái mới!");
      return;
    }
    if (!statusReason.trim()) {
      showWarning("Vui lòng nhập lý do thay đổi!");
      return;
    }

    try {
      setChangingStatus(true);
      // Backend expects: trangThaiMoi, lyDo
      await hoSoVuViecApi.updateStatus(id, { 
        trangThaiMoi: newStatus, 
        lyDo: statusReason 
      });
      showSuccess("Cập nhật trạng thái thành công!");
      setShowStatusModal(false);
      setStatusReason("");
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
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow hover:border-blue-500"
              >
                <div className="flex items-center gap-4">
                  {vvdt.doiTuong.anhDaiDien ? (
                    <img
                      src={getImageUrl(vvdt.doiTuong.anhDaiDien)}
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

      {/* Lịch sử thay đổi trạng thái - Timeline UI */}
      {data.lichSuXuLy && data.lichSuXuLy.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
            <span className="text-2xl">📊</span>
            Lịch sử xử lý ({data.lichSuXuLy.length})
          </h2>
          
          {/* Timeline */}
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-pink-500"></div>
            
            {/* Timeline items */}
            <div className="space-y-8">
              {data.lichSuXuLy.map((history: any, index: number) => (
                <div key={history.id} className="relative pl-16">
                  {/* Timeline dot */}
                  <div className={`absolute left-3 w-6 h-6 rounded-full border-4 border-white shadow-lg ${
                    index === 0 ? 'bg-gradient-to-br from-blue-500 to-purple-600 animate-pulse' : 
                    'bg-gradient-to-br from-gray-400 to-gray-500'
                  }`}></div>
                  
                  {/* Content card */}
                  <div className={`bg-gradient-to-br ${
                    index === 0 ? 'from-blue-50 to-purple-50 border-blue-300' : 'from-gray-50 to-gray-100 border-gray-300'
                  } border-2 rounded-xl p-5 shadow-md hover:shadow-lg transition-all`}>
                    {/* Header */}
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          {history.trangThaiCu && (
                            <>
                              <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white ${getTrangThaiHoSoColor(history.trangThaiCu)}`}>
                                {getTrangThaiHoSoLabel(history.trangThaiCu)}
                              </span>
                              <span className="text-2xl">→</span>
                            </>
                          )}
                          <span className={`inline-block px-3 py-1 rounded-lg text-sm font-semibold text-white ${getTrangThaiHoSoColor(history.trangThaiMoi)}`}>
                            {getTrangThaiHoSoLabel(history.trangThaiMoi)}
                          </span>
                          {index === 0 && (
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-700 text-xs font-bold rounded-full">
                              Mới nhất
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Date */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-gray-900">
                          {history.ngayThucHien
                            ? new Date(history.ngayThucHien).toLocaleDateString("vi-VN", {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric'
                              })
                            : "N/A"}
                        </p>
                        <p className="text-xs text-gray-600">
                          {history.ngayThucHien
                            ? new Date(history.ngayThucHien).toLocaleTimeString("vi-VN", {
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : ""}
                        </p>
                      </div>
                    </div>
                    
                    {/* Reason */}
                    <div className="bg-white/80 rounded-lg p-3 mb-3">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        <span className="font-semibold text-gray-900">Lý do:</span> {history.lyDo || "Không có mô tả"}
                      </p>
                    </div>
                    
                    {/* Người thực hiện */}
                    {history.nguoiThucHien && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-gray-500">👤 Người thực hiện:</span>
                        <span className="font-medium text-gray-900">{history.nguoiThucHien}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
            Tạo lúc:{" "}
            {data.ngayTao
              ? new Date(data.ngayTao).toLocaleString("vi-VN")
              : "Không rõ"}
          </span>
          <span>
            Cập nhật lúc:{" "}
            {data.ngayCapNhat
              ? new Date(data.ngayCapNhat).toLocaleString("vi-VN")
              : "Không rõ"}
          </span>
        </div>
      </div>

      {/* Modal Cập nhật trạng thái */}
      {showStatusModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h3 className="text-2xl font-bold">🔄 Cập nhật trạng thái vụ việc</h3>
                <button
                  onClick={() => setShowStatusModal(false)}
                  className="text-white hover:bg-white/20 rounded-full p-2 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6">
              {/* Trạng thái hiện tại */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800 font-medium mb-2">Trạng thái hiện tại:</p>
                <span className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${getTrangThaiHoSoColor(data.trangThai)}`}>
                  {getTrangThaiHoSoLabel(data.trangThai)}
                </span>
              </div>

              {/* Chọn trạng thái mới */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Trạng thái mới <span className="text-red-600">*</span>
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    { value: "DANG_XU_LY", label: "Đang xử lý", color: "bg-yellow-500", icon: "⏳" },
                    { value: "TAM_DUNG", label: "Tạm dừng", color: "bg-orange-500", icon: "⏸️" },
                    { value: "HOAN_THANH", label: "Hoàn thành", color: "bg-green-500", icon: "✅" },
                    { value: "CHUYEN_GIAI", label: "Chuyển giải quyết", color: "bg-blue-500", icon: "➡️" },
                    { value: "HUY_BO", label: "Hủy bỏ", color: "bg-red-500", icon: "❌" },
                  ].map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setNewStatus(status.value)}
                      className={`
                        p-4 rounded-lg border-2 transition-all text-left
                        ${newStatus === status.value 
                          ? `${status.color} text-white border-transparent shadow-lg scale-105` 
                          : 'bg-white border-gray-300 hover:border-gray-400 hover:shadow-md'
                        }
                      `}
                    >
                      <div className="flex items-center gap-3">
                        <span className="text-2xl">{status.icon}</span>
                        <div>
                          <p className={`font-semibold ${newStatus === status.value ? 'text-white' : 'text-gray-900'}`}>
                            {status.label}
                          </p>
                          {newStatus === status.value && (
                            <p className="text-xs text-white/90 mt-1">✓ Đã chọn</p>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Lý do thay đổi */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lý do thay đổi trạng thái <span className="text-red-600">*</span>
                </label>
                <textarea
                  value={statusReason}
                  onChange={(e) => setStatusReason(e.target.value)}
                  placeholder="Nhập lý do chi tiết cho việc thay đổi trạng thái..."
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                />
                <p className="text-sm text-gray-500 mt-2">
                  {statusReason.length}/500 ký tự
                </p>
              </div>

              {/* Timeline Preview */}
              {data.lichSuXuLy && data.lichSuXuLy.length > 0 && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm font-medium text-gray-700 mb-3">📋 Lịch sử gần đây:</p>
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {data.lichSuXuLy.slice(0, 3).map((history: any) => (
                      <div key={history.id} className="text-sm text-gray-600 flex items-start gap-2">
                        <span className="text-blue-500 mt-1">•</span>
                        <div>
                          <span className="font-medium">
                            {history.trangThaiCu && `${getTrangThaiHoSoLabel(history.trangThaiCu)} → `}
                            {getTrangThaiHoSoLabel(history.trangThaiMoi)}
                          </span>
                          <span className="text-gray-500 ml-2">
                            ({history.ngayThucHien ? new Date(history.ngayThucHien).toLocaleDateString("vi-VN") : "N/A"})
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 px-6 py-4 rounded-b-2xl border-t border-gray-200">
              <div className="flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setShowStatusModal(false)}
                  disabled={changingStatus}
                  className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors font-medium disabled:opacity-50"
                >
                  Hủy bỏ
                </button>
                <button
                  type="button"
                  onClick={handleSubmitStatusChange}
                  disabled={changingStatus || !newStatus || !statusReason.trim()}
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-medium shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changingStatus ? (
                    <span className="flex items-center gap-2">
                      <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Đang xử lý...
                    </span>
                  ) : (
                    "✓ Xác nhận cập nhật"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
