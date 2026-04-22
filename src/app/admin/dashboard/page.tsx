"use client";

import { useEffect, useState } from "react";
import { baoCaoApi } from "@/lib/api";
import { DashboardData, getMucDoViPhamLabel, getTrangThaiHoSoLabel } from "@/types";

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({
    tuNgay: "",
    denNgay: "",
  });

  useEffect(() => {
    document.title = "Dashboard - Tổng quan | QLCNC";
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      setLoading(true);
      const response = await baoCaoApi.getDashboard(dateRange);
      setData(response.data);
    } catch (error) {
      console.error("Lỗi khi tải dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = () => {
    fetchDashboard();
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Đang tải dữ liệu...</p>
        </div>
      </div>
    );
  }

  const { tongQuan, vuViecTheoMucDo, vuViecTheoTrangThai } = data;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">Thống kê tổng quan</h5>
          <p className="text-gray-600 mt-1">
            Thống kê và báo cáo tình hình vi phạm pháp luật
          </p>
        </div>

        {/* Date Filter */}
        <div className="flex gap-3 items-center">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Từ ngày
            </label>
            <input
              type="date"
              value={dateRange.tuNgay}
              onChange={(e) =>
                setDateRange({ ...dateRange, tuNgay: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Đến ngày
            </label>
            <input
              type="date"
              value={dateRange.denNgay}
              onChange={(e) =>
                setDateRange({ ...dateRange, denNgay: e.target.value })
              }
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <button
            onClick={handleFilter}
            className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Lọc
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <StatsCard
          title="Tổng Đối Tượng"
          value={tongQuan.tongDoiTuong}
          icon="👤"
          color="bg-blue-500"
          subtitle={`Đang theo dõi: ${tongQuan.doiTuongDangTheoDoi}`}
        />
        <StatsCard
          title="Tổng Vụ Việc"
          value={tongQuan.tongVuViec}
          icon="📋"
          color="bg-purple-500"
          subtitle={`Đang xử lý: ${tongQuan.vuViecDangXuLy}`}
        />
        <StatsCard
          title="Vụ Việc Hoàn Thành"
          value={tongQuan.vuViecHoanThanh}
          icon="✅"
          color="bg-green-500"
          subtitle={`${tongQuan.tongVuViec > 0 ? Math.round((tongQuan.vuViecHoanThanh / tongQuan.tongVuViec) * 100) : 0}% tổng số`}
        />
        <StatsCard
          title="Đối Tượng Tạm Giam"
          value={tongQuan.doiTuongTamGiam}
          icon="🔒"
          color="bg-red-500"
          subtitle={`${tongQuan.tongDoiTuong > 0 ? Math.round((tongQuan.doiTuongTamGiam / tongQuan.tongDoiTuong) * 100) : 0}% tổng số`}
        />
        <StatsCard
          title="Vụ Việc Đang Xử Lý"
          value={tongQuan.vuViecDangXuLy}
          icon="⚙️"
          color="bg-yellow-500"
          subtitle="Cần theo dõi"
        />
        <StatsCard
          title="Đối Tượng Đang Theo Dõi"
          value={tongQuan.doiTuongDangTheoDoi}
          icon="👁️"
          color="bg-indigo-500"
          subtitle="Hoạt động"
        />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Vụ Việc Theo Mức Độ */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h6 className="text-xl font-bold text-gray-900 mb-4">
            Vụ Việc Theo Mức Độ Vi Phạm
          </h6>
          <div className="space-y-3">
            {vuViecTheoMucDo.map((item) => {
              const total = vuViecTheoMucDo.reduce((sum, i) => sum + i.soLuong, 0);
              const percentage = total > 0 ? Math.round((item.soLuong / total) * 100) : 0;
              return (
                <div key={item.mucDo}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {getMucDoViPhamLabel(item.mucDo)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.soLuong} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.mucDo === "NONG"
                          ? "bg-yellow-500"
                          : item.mucDo === "RAT_NONG"
                          ? "bg-orange-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Vụ Việc Theo Trạng Thái */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h6 className="text-xl font-bold text-gray-900 mb-4">
            Vụ Việc Theo Trạng Thái
          </h6>
          <div className="space-y-3">
            {vuViecTheoTrangThai.map((item) => {
              const total = vuViecTheoTrangThai.reduce((sum, i) => sum + i.soLuong, 0);
              const percentage = total > 0 ? Math.round((item.soLuong / total) * 100) : 0;
              return (
                <div key={item.trangThai}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">
                      {getTrangThaiHoSoLabel(item.trangThai)}
                    </span>
                    <span className="text-sm font-bold text-gray-900">
                      {item.soLuong} ({percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className={`h-2.5 rounded-full ${
                        item.trangThai === "DANG_XU_LY"
                          ? "bg-yellow-500"
                          : item.trangThai === "HOAN_THANH"
                          ? "bg-green-500"
                          : item.trangThai === "TAM_DUNG"
                          ? "bg-orange-500"
                          : item.trangThai === "HUY_BO"
                          ? "bg-red-500"
                          : "bg-blue-500"
                      }`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Truy Cập Nhanh</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <QuickActionButton href="/admin/doi-tuong" label="Quản lý Đối tượng" icon="👤" />
          <QuickActionButton href="/admin/vu-viec" label="Quản lý Vụ việc" icon="📋" />
          <QuickActionButton href="/admin/bao-cao" label="Báo cáo chi tiết" icon="📊" />
          <QuickActionButton href="/admin/tai-lieu" label="Tài liệu" icon="📁" />
        </div>
      </div>
    </div>
  );
}

// Stats Card Component
function StatsCard({
  title,
  value,
  icon,
  color,
  subtitle,
}: {
  title: string;
  value: number;
  icon: string;
  color: string;
  subtitle: string;
}) {
  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <p className="text-sm text-gray-600 font-medium">{title}</p>
            <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
            <p className="text-xs text-gray-500 mt-1">{subtitle}</p>
          </div>
          <div className={`${color} rounded-full p-4 text-3xl`}>{icon}</div>
        </div>
      </div>
    </div>
  );
}

// Quick Action Button
function QuickActionButton({ href, label, icon }: { href: string; label: string; icon: string }) {
  return (
    <a
      href={href}
      className="flex flex-col items-center justify-center p-6 bg-gray-50 hover:bg-gray-100 rounded-lg border-2 border-gray-200 hover:border-blue-500 transition-all"
    >
      <span className="text-4xl mb-2">{icon}</span>
      <span className="text-sm font-medium text-gray-700 text-center">{label}</span>
    </a>
  );
}
