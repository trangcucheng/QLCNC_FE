"use client";

import { useState, useEffect } from "react";
import { hoSoDoiTuongApi, hoSoVuViecApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import {
  getTrangThaiDoiTuongLabel,
  getTrangThaiDoiTuongColor,
  getTrangThaiHoSoLabel,
  getTrangThaiHoSoColor,
  getMucDoViPhamLabel,
  getMucDoViPhamColor,
} from "@/types";
import { showWarning, showError } from "@/utils/sweetalert";

interface SearchResult {
  doiTuong: any[];
  vuViec: any[];
}

export default function TimKiemPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [searchType, setSearchType] = useState("all"); // all, doituong, vuviec
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<SearchResult>({
    doiTuong: [],
    vuViec: [],
  });

  useEffect(() => {
    document.title = "Tìm kiếm | QLCNC";
  }, []);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) {
      showWarning("Vui lòng nhập từ khóa tìm kiếm!");
      return;
    }

    try {
      setLoading(true);
      setHasSearched(true);

      let doiTuongResults: any[] = [];
      let vuViecResults: any[] = [];

      // Tìm kiếm đối tượng
      if (searchType === "all" || searchType === "doituong") {
        try {
          const response = await hoSoDoiTuongApi.getAll({
            search: searchQuery,
          });
          doiTuongResults = response.data || [];
        } catch (error) {
          console.error("Lỗi tìm kiếm đối tượng:", error);
        }
      }

      // Tìm kiếm vụ việc
      if (searchType === "all" || searchType === "vuviec") {
        try {
          const response = await hoSoVuViecApi.getAll({
            search: searchQuery,
          });
          vuViecResults = response.data || [];
        } catch (error) {
          console.error("Lỗi tìm kiếm vụ việc:", error);
        }
      }

      setResults({
        doiTuong: doiTuongResults,
        vuViec: vuViecResults,
      });
    } catch (error) {
      console.error("Lỗi khi tìm kiếm:", error);
      showError("Có lỗi xảy ra khi tìm kiếm!");
    } finally {
      setLoading(false);
    }
  };

  const totalResults = results.doiTuong.length + results.vuViec.length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h5 className="text-3xl font-bold text-gray-900 mb-4">
          Tìm kiếm thông tin
        </h5>

        {/* Search Form */}
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nhập tên, CMND/CCCD, số hồ sơ, nội dung..."
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              />
            </div>
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">Tất cả</option>
              <option value="doituong">Đối tượng</option>
              <option value="vuviec">Vụ việc</option>
            </select>
            <button
              type="submit"
              disabled={loading}
              className={`px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {loading ? "Đang tìm..." : "🔍 Tìm kiếm"}
            </button>
          </div>
        </form>

        {/* Quick Filters */}
        <div className="mt-4 flex gap-2 flex-wrap">
          <span className="text-sm text-gray-600">Gợi ý:</span>
          <button
            onClick={() => {
              setSearchQuery("Đang xử lý");
              setSearchType("vuviec");
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            Vụ việc đang xử lý
          </button>
          <button
            onClick={() => {
              setSearchQuery("Tạm giam");
              setSearchType("doituong");
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            Đối tượng tạm giam
          </button>
          <button
            onClick={() => {
              setSearchQuery("Đặc biệt nóng");
              setSearchType("vuviec");
            }}
            className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200"
          >
            Vụ đặc biệt nóng
          </button>
        </div>
      </div>

      {/* Results */}
      {hasSearched && (
        <div className="space-y-6">
          {/* Summary */}
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-xl font-bold text-gray-900">
              Kết quả tìm kiếm: <span className="text-blue-600">{totalResults}</span>{" "}
              {totalResults === 1 ? "kết quả" : "kết quả"}
            </h2>
            <p className="text-gray-600 mt-1">
              {results.doiTuong.length} đối tượng, {results.vuViec.length} vụ việc
            </p>
          </div>

          {totalResults === 0 && (
            <div className="bg-white rounded-xl shadow-lg p-12 text-center">
              <div className="text-6xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Không tìm thấy kết quả
              </h3>
              <p className="text-gray-600">
                Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc
              </p>
            </div>
          )}

          {/* Đối tượng Results */}
          {results.doiTuong.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Đối tượng ({results.doiTuong.length})
              </h2>
              <div className="space-y-4">
                {results.doiTuong.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/admin/doi-tuong/${item.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900">
                          {item.hoTen}
                          {item.tenGoiKhac && (
                            <span className="text-sm font-normal text-gray-600 ml-2">
                              ({item.tenGoiKhac})
                            </span>
                          )}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {item.soCMND_CCCD && (
                            <p>📇 CMND/CCCD: {item.soCMND_CCCD}</p>
                          )}
                          {item.ngaySinh && (
                            <p>
                              🎂 Ngày sinh:{" "}
                              {new Date(item.ngaySinh).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                          {item.diaChiThuongTru && (
                            <p>📍 {item.diaChiThuongTru}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg font-semibold text-white text-sm ${getTrangThaiDoiTuongColor(
                          item.trangThai
                        )}`}
                      >
                        {getTrangThaiDoiTuongLabel(item.trangThai)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Vụ việc Results */}
          {results.vuViec.length > 0 && (
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Vụ việc ({results.vuViec.length})
              </h2>
              <div className="space-y-4">
                {results.vuViec.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => router.push(`/admin/vu-viec/${item.id}`)}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-600">
                            {item.soHoSo}
                          </span>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-semibold ${getMucDoViPhamColor(
                              item.mucDoViPham
                            )}`}
                          >
                            {getMucDoViPhamLabel(item.mucDoViPham)}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mt-1">
                          {item.tenVuViec}
                        </h3>
                        <div className="mt-2 space-y-1 text-sm text-gray-600">
                          {item.ngayXayRa && (
                            <p>
                              📅 Ngày xảy ra:{" "}
                              {new Date(item.ngayXayRa).toLocaleDateString("vi-VN")}
                            </p>
                          )}
                          {item.diaChiXayRa && <p>📍 {item.diaChiXayRa}</p>}
                          {item.tomTatNoiDung && (
                            <p className="line-clamp-2">💬 {item.tomTatNoiDung}</p>
                          )}
                        </div>
                      </div>
                      <span
                        className={`px-4 py-2 rounded-lg font-semibold text-white text-sm ${getTrangThaiHoSoColor(
                          item.trangThai
                        )}`}
                      >
                        {getTrangThaiHoSoLabel(item.trangThai)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
