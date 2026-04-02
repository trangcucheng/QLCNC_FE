"use client";

import { useState } from "react";

export default function XuatBaoCaoPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    tuNgay: "",
    denNgay: "",
  });
  const [selectedReport, setSelectedReport] = useState("tong-hop");

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      // TODO: Call API to export Excel
      alert("Chức năng xuất Excel đang được phát triển!");
    } catch (error) {
      alert("Có lỗi khi xuất báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  const handleExportPDF = async () => {
    try {
      setLoading(true);
      // TODO: Call API to export PDF
      alert("Chức năng xuất PDF đang được phát triển!");
    } catch (error) {
      alert("Có lỗi khi xuất báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  const handleExportWord = async () => {
    try {
      setLoading(true);
      // TODO: Call API to export Word
      alert("Chức năng xuất Word đang được phát triển!");
    } catch (error) {
      alert("Có lỗi khi xuất báo cáo!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Xuất Báo Cáo</h1>
        <p className="text-gray-600 mt-1">
          Xuất báo cáo dưới nhiều định dạng khác nhau
        </p>
      </div>

      {/* Options */}
      <div className="bg-white rounded-xl shadow-lg p-6 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Loại báo cáo
          </label>
          <select
            value={selectedReport}
            onChange={(e) => setSelectedReport(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="tong-hop">Báo cáo tổng hợp</option>
            <option value="khu-vuc">Báo cáo theo khu vực</option>
            <option value="toim-danh">Báo cáo theo tội danh</option>
            <option value="xu-huong">Báo cáo xu hướng</option>
            <option value="tien-do">Báo cáo tiến độ</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.tuNgay}
              onChange={(e) =>
                setDateRange({ ...dateRange, tuNgay: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.denNgay}
              onChange={(e) =>
                setDateRange({ ...dateRange, denNgay: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Export Buttons */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Định dạng xuất</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={handleExportExcel}
            disabled={loading}
            className="flex flex-col items-center justify-center p-8 bg-green-50 hover:bg-green-100 border-2 border-green-200 hover:border-green-400 rounded-lg transition-all disabled:opacity-50"
          >
            <div className="text-6xl mb-3">📊</div>
            <h3 className="font-bold text-gray-900">Excel (.xlsx)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Phù hợp cho phân tích dữ liệu
            </p>
          </button>

          <button
            onClick={handleExportPDF}
            disabled={loading}
            className="flex flex-col items-center justify-center p-8 bg-red-50 hover:bg-red-100 border-2 border-red-200 hover:border-red-400 rounded-lg transition-all disabled:opacity-50"
          >
            <div className="text-6xl mb-3">📄</div>
            <h3 className="font-bold text-gray-900">PDF (.pdf)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Phù hợp cho in ấn, lưu trữ
            </p>
          </button>

          <button
            onClick={handleExportWord}
            disabled={loading}
            className="flex flex-col items-center justify-center p-8 bg-blue-50 hover:bg-blue-100 border-2 border-blue-200 hover:border-blue-400 rounded-lg transition-all disabled:opacity-50"
          >
            <div className="text-6xl mb-3">📝</div>
            <h3 className="font-bold text-gray-900">Word (.docx)</h3>
            <p className="text-sm text-gray-600 mt-1">
              Phù hợp cho chỉnh sửa nội dung
            </p>
          </button>
        </div>
      </div>

      {/* Note */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Lưu ý:</strong> Chức năng xuất báo cáo sẽ tải file về máy tính
          của bạn. Đảm bảo trình duyệt cho phép tải file từ trang web này.
        </p>
      </div>
    </div>
  );
}
