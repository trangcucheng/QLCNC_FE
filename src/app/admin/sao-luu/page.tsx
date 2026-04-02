"use client";

import { useState } from "react";

export default function BackupRestorePage() {
  const [loading, setLoading] = useState(false);
  const [backupList, setBackupList] = useState<any[]>([]);

  const handleBackup = async () => {
    if (!confirm("Bạn có chắc chắn muốn sao lưu dữ liệu hệ thống?")) return;

    try {
      setLoading(true);
      // TODO: Call API to backup
      // await backupApi.manual();
      alert("Sao lưu dữ liệu thành công! (Cần tích hợp API)");
      // Refresh backup list
    } catch (error) {
      alert("Có lỗi khi sao lưu dữ liệu!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (backupFileName: string) => {
    if (
      !confirm(
        `CẢNH BÁO: Khôi phục dữ liệu sẽ thay thế toàn bộ dữ liệu hiện tại!\n\nBạn có chắc chắn muốn khôi phục từ: ${backupFileName}?`
      )
    )
      return;

    try {
      setLoading(true);
      // TODO: Call API to restore
      // await backupApi.restore({ backupFileName });
      alert("Khôi phục dữ liệu thành công! (Cần tích hợp API)");
    } catch (error) {
      alert("Có lỗi khi khôi phục dữ liệu!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">
          Sao lưu & Phục hồi dữ liệu
        </h1>
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
              <button
                onClick={handleBackup}
                disabled={loading}
                className={`px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                  loading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {loading ? "Đang sao lưu..." : "🔄 Sao lưu ngay"}
              </button>
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
                  <button
                    onClick={() => handleRestore(backup.fileName)}
                    disabled={loading}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    🔄 Khôi phục
                  </button>
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

      {/* Development Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý phát triển:</strong> Chức năng này cần tích hợp với API
          backend tại <code>/backup/manual</code> và{" "}
          <code>/backup/restore</code>. Hiện tại đang ở chế độ demo.
        </p>
      </div>
    </div>
  );
}
