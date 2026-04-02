"use client";

import { useEffect, useState } from "react";
import { baoCaoApi } from "@/lib/api";

export default function BaoCaoPage() {
  const [loading, setLoading] = useState(false);
  const [dateRange, setDateRange] = useState({
    tuNgay: "",
    denNgay: "",
  });
  const [baoCaoKhuVuc, setBaoCaoKhuVuc] = useState<any[]>([]);
  const [baoCaoToimDanh, setBaoCaoToimDanh] = useState<any[]>([]);
  const [baoCaoXuHuong, setBaoCaoXuHuong] = useState<any[]>([]);
  const [baoCaoTienDo, setBaoCaoTienDo] = useState<any>(null);

  useEffect(() => {
    fetchAllReports();
  }, []);

  const fetchAllReports = async () => {
    try {
      setLoading(true);
      const [khuVuc, toimDanh, xuHuong, tienDo] = await Promise.all([
        baoCaoApi.baoCaoKhuVuc(dateRange),
        baoCaoApi.baoCaoToimDanh(dateRange),
        baoCaoApi.baoCaoXuHuong(dateRange),
        baoCaoApi.baoCaoTienDo(dateRange),
      ]);

      setBaoCaoKhuVuc(khuVuc.data);
      setBaoCaoToimDanh(toimDanh.data);
      setBaoCaoXuHuong(xuHuong.data);
      setBaoCaoTienDo(tienDo.data);
    } catch (error) {
      console.error("Lỗi khi tải báo cáo:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchAllReports();
  };

  const handleExportTongHop = async () => {
    try {
      const response = await baoCaoApi.baoCaoTongHop(dateRange);
      // Có thể xử lý để xuất file Excel, PDF...
      console.log("Dữ liệu báo cáo tổng hợp:", response.data);
      alert("Đã tải dữ liệu báo cáo! (Cần tích hợp xuất file)");
    } catch (error) {
      console.error("Lỗi khi xuất báo cáo:", error);
      alert("Có lỗi khi xuất báo cáo!");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải báo cáo...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Báo Cáo Chi Tiết</h1>
          <p className="text-gray-600 mt-1">
            Báo cáo phân tích theo nhiều tiêu chí khác nhau
          </p>
        </div>

        <button
          onClick={handleExportTongHop}
          className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
        >
          📥 Xuất Báo Cáo Tổng Hợp
        </button>
      </div>

      {/* Date Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.tuNgay}
              onChange={(e) =>
                setDateRange({ ...dateRange, tuNgay: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.denNgay}
              onChange={(e) =>
                setDateRange({ ...dateRange, denNgay: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleFilter}
            className="px-8 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔍 Lọc
          </button>
        </div>
      </div>

      {/* Báo cáo theo Khu Vực */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📍 Báo Cáo Theo Khu Vực/ Địa Bàn
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Khu Vực
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Số Vụ Việc
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Số Đối Tượng
                </th>
                <th className="px-6 py-3 text-right text-sm font-semibold text-gray-700">
                  Tỷ Lệ
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {baoCaoKhuVuc.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    Chưa có dữ liệu báo cáo theo khu vực
                  </td>
                </tr>
              ) : (
                baoCaoKhuVuc.map((item, index) => {
                  const total = baoCaoKhuVuc.reduce((sum, i) => sum + (i.soVuViec || 0), 0);
                  const percentage = total > 0 ? ((item.soVuViec || 0) / total * 100).toFixed(1) : 0;
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">
                        {item.khuVuc || item.ten || "Chưa xác định"}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {item.soVuViec || 0}
                      </td>
                      <td className="px-6 py-4 text-center text-sm text-gray-900">
                        {item.soDoiTuong || 0}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium text-gray-900 w-12 text-right">
                            {percentage}%
                          </span>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Báo cáo theo Tội Danh */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          ⚖️ Báo Cáo Theo Tội Danh
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b-2 border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Mã
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Tên Tội Danh
                </th>
                <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                  Số Vụ Việc
                </th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                  Khung Hình Phạt
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {baoCaoToimDanh.slice(0, 10).map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-mono text-gray-600">
                    {item.maToimDanh}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {item.tenToimDanh}
                  </td>
                  <td className="px-6 py-4 text-center text-sm">
                    <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                      {item.soLuongVuViec}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {item.khungHinhPhat || "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Báo cáo Xu Hướng */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          📈 Xu Hướng Theo Thời Gian
        </h2>
        <div className="space-y-3">
          {baoCaoXuHuong.slice(-12).map((item, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="w-24 font-medium text-gray-700">{item.thang}</div>
              <div className="flex-1 grid grid-cols-4 gap-2">
                <div className="bg-blue-50 px-3 py-2 rounded">
                  <span className="text-xs text-gray-600">Tổng:</span>
                  <span className="ml-2 font-bold text-blue-600">{item.tongSo}</span>
                </div>
                <div className="bg-yellow-50 px-3 py-2 rounded">
                  <span className="text-xs text-gray-600">Nóng:</span>
                  <span className="ml-2 font-bold text-yellow-600">{item.nong}</span>
                </div>
                <div className="bg-orange-50 px-3 py-2 rounded">
                  <span className="text-xs text-gray-600">Rất nóng:</span>
                  <span className="ml-2 font-bold text-orange-600">{item.ratNong}</span>
                </div>
                <div className="bg-red-50 px-3 py-2 rounded">
                  <span className="text-xs text-gray-600">Đặc biệt:</span>
                  <span className="ml-2 font-bold text-red-600">{item.dacBietNong}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Báo cáo Tiến Độ */}
      {baoCaoTienDo && (
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            ⏱️ Vụ Việc Quá Hạn Xử Lý (&gt; 30 ngày)
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-red-50 border-b-2 border-red-200">
                <tr>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Số Hồ Sơ
                  </th>
                  <th className="px-6 py-3 text-left text-sm font-semibold text-gray-700">
                    Tên Vụ Việc
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Mức Độ
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Cán Bộ
                  </th>
                  <th className="px-6 py-3 text-center text-sm font-semibold text-gray-700">
                    Số Ngày
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {baoCaoTienDo.vuViecQuaHan.map((item: any, index: number) => (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-blue-600">
                      {item.soHoSo}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {item.tenVuViec}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          item.mucDoViPham === "DAC_BIET_NONG"
                            ? "bg-red-100 text-red-800"
                            : item.mucDoViPham === "RAT_NONG"
                            ? "bg-orange-100 text-orange-800"
                            : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.mucDoViPham}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center text-sm text-gray-700">
                      {item.canBoXuLy || "-"}
                    </td>
                    <td className="px-6 py-4 text-center text-sm">
                      <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full font-bold">
                        {item.soNgayXuLy} ngày
                      </span>
                    </td>
                  </tr>
                ))}
                {baoCaoTienDo.vuViecQuaHan.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                      ✅ Không có vụ việc quá hạn
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
