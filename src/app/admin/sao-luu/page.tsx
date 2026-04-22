"use client";

import { useState, useEffect } from "react";
import Swal from "sweetalert2";
import { backupApi } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

export default function BackupRestorePage() {
  const { hasPermission } = useAuth();
  const [loading, setLoading] = useState(false);
  const [backupList, setBackupList] = useState<any[]>([]);

  useEffect(() => {
    document.title = "Sao lưu Dữ liệu | QLCNC";
  }, []);

  useEffect(() => {
    fetchBackupList();
  }, []);

  const fetchBackupList = async () => {
    try {
      const response = await backupApi.list();
      setBackupList(response.data || []);
    } catch (error: any) {
      console.error("Lỗi khi tải danh sách backup:", error);
    }
  };

  const handleBackup = async () => {
    const result = await Swal.fire({
      title: "Xác nhận sao lưu dữ liệu",
      text: "Bạn có chắc chắn muốn sao lưu toàn bộ dữ liệu hệ thống?",
      icon: "question",
      showCancelButton: true,
      confirmButtonColor: "#3b82f6",
      cancelButtonColor: "#6b7280",
      confirmButtonText: '<i class="fas fa-check"></i> Đồng ý',
      cancelButtonText: '<i class="fas fa-times"></i> Hủy',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await backupApi.manual();
      
      await Swal.fire({
        title: "Thành công!",
        text: response.message || "Sao lưu dữ liệu thành công!",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "OK",
      });
      
      // Refresh backup list
      fetchBackupList();
    } catch (error: any) {
      await Swal.fire({
        title: "Lỗi!",
        text: error.message || "Có lỗi khi sao lưu dữ liệu!",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Đóng",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupFileName: string) => {
    const result = await Swal.fire({
      title: "⚠️ CẢNH BÁO QUAN TRỌNG",
      html: `
        <div class="text-left">
          <p class="mb-3 font-semibold text-red-600">Khôi phục dữ liệu sẽ thay thế toàn bộ dữ liệu hiện tại!</p>
          <p class="mb-2">Bạn có chắc chắn muốn khôi phục từ:</p>
          <p class="font-mono bg-gray-100 p-2 rounded">${backupFileName}</p>
          <p class="mt-3 text-sm text-gray-600">⚡ Thao tác này không thể hoàn tác!</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6b7280",
      confirmButtonText: '<i class="fas fa-exclamation-triangle"></i> Đồng ý khôi phục',
      cancelButtonText: '<i class="fas fa-times"></i> Hủy',
      reverseButtons: true,
    });

    if (!result.isConfirmed) return;

    try {
      setLoading(true);
      const response = await backupApi.restore(backupFileName);
      
      await Swal.fire({
        title: "Hoàn tất!",
        text: response.message || "Khôi phục dữ liệu thành công!",
        icon: "success",
        confirmButtonColor: "#10b981",
        confirmButtonText: "OK",
      });
      
      fetchBackupList();
    } catch (error: any) {
      await Swal.fire({
        title: "Lỗi!",
        text: error.message || "Có lỗi khi khôi phục dữ liệu!",
        icon: "error",
        confirmButtonColor: "#ef4444",
        confirmButtonText: "Đóng",
      });
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h5 className="text-3xl font-bold text-gray-900">
          Sao lưu & Phục hồi dữ liệu
        </h5>
        <p className="text-gray-600 mt-1">
          Quản lý sao lưu và khôi phục dữ liệu hệ thống
        </p>
      </div>

      {/* Warning */}
      <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6">
        <div className="flex gap-4">
          <div className="text-4xl">⚠️</div>
          <div>
            <h3 className="font-bold text-red-900 mb-2">CẢNH BÁO QUAN TRỌNG</h3>
            <ul className="text-sm text-red-800 space-y-1">
              <li>
                • Sao lưu dữ liệu thường xuyên để tránh mất mát thông tin
              </li>
              <li>
                • Khôi phục dữ liệu sẽ THAY THẾ toàn bộ dữ liệu hiện tại
              </li>
              <li>
                • Chỉ người có quyền Quản trị viên mới được thực hiện thao tác
                này
              </li>
              <li>
                • Nên sao lưu dữ liệu hiện tại trước khi khôi phục
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Backup Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Sao lưu dữ liệu
        </h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4">
            <div className="text-5xl">💾</div>
            <div className="flex-1">
              <h3 className="font-bold text-gray-900 mb-2">
                Sao lưu thủ công
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                Tạo bản sao lưu toàn bộ cơ sở dữ liệu hiện tại. File sao lưu sẽ
                được lưu trên máy chủ với tên bao gồm ngày giờ tạo.
              </p>
              {hasPermission("backup:create") && (
                <button
                  onClick={handleBackup}
                  disabled={loading}
                  className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                    loading ? "opacity-50 cursor-not-allowed" : ""
                  }`}
                >
                  {loading ? "Đang sao lưu..." : "🔄 Sao lưu ngay"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Restore Section */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Khôi phục dữ liệu
        </h2>

        {backupList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-6xl mb-4">📦</div>
            <p className="font-medium">Chưa có bản sao lưu nào</p>
            <p className="text-sm mt-2">
              Tạo bản sao lưu đầu tiên để có thể khôi phục dữ liệu
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {backupList.map((backup, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <h3 className="font-bold text-gray-900">{backup.fileName}</h3>
                  <div className="flex gap-4 mt-1 text-sm text-gray-600">
                    <span>📅 {backup.createdAt}</span>
                    <span>📏 {backup.fileSize}</span>
                  </div>
                </div>
                <div className="flex gap-2">
                  {hasPermission("backup:restore") && (
                    <button
                      onClick={() => handleRestore(backup.fileName)}
                      disabled={loading}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                    >
                      🔄 Khôi phục
                    </button>
                  )}
                  <button
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    ⬇️ Tải xuống
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">Thông tin</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>
            • File sao lưu được lưu tại: <code className="bg-blue-100 px-2 py-1 rounded">/backup/</code> trên máy chủ
          </li>
          <li>
            • Định dạng file: MySQL dump (.sql)
          </li>
          <li>
            • Nên thiết lập sao lưu tự động hàng ngày
          </li>
          <li>
            • Bạn cũng có thể tải file sao lưu về máy để lưu trữ ngoại tuyến
          </li>
        </ul>
      </div>
    </div>
  );
}
