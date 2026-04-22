"use client";

import { useEffect, useState } from "react";
import { hoSoDoiTuongApi } from "@/lib/api";
import {
  HoSoDoiTuong,
  getTrangThaiDoiTuongLabel,
  getTrangThaiDoiTuongColor,
  getGioiTinhLabel,
} from "@/types";
import IconButton from "@/components/ui/IconButton";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { showSuccess, showError, showConfirm } from "@/utils/sweetalert";

export default function DoiTuongPage() {
  const [data, setData] = useState<HoSoDoiTuong[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const [searchParams, setSearchParams] = useState({
    hoTen: "",
    soCMND_CCCD: "",
    trangThai: "",
    page: 1,
    limit: 10,
  });

  useEffect(() => {
    document.title = "Quản lý Đối tượng | QLCNC";
  }, []);

  useEffect(() => {
    fetchData();
  }, [searchParams]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoDoiTuongApi.getAll(searchParams);
      setData(response.data.items);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đối tượng:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setSearchParams({ ...searchParams, page: 1 });
  };

  const handlePageChange = (newPage: number) => {
    setSearchParams({ ...searchParams, page: newPage });
  };

  const handleDelete = async (id: string) => {
    const confirmed = await showConfirm("Bạn có chắc chắn muốn xóa đối tượng này?");
    if (!confirmed) return;

    try {
      await hoSoDoiTuongApi.delete(id);
      showSuccess("Xóa thành công!");
      fetchData();
    } catch (error) {
      showError("Có lỗi xảy ra khi xóa!");
      console.error(error);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">Quản Lý Đối Tượng</h5>
          <p className="text-gray-600 mt-1">
            Quản lý thông tin các đối tượng vi phạm pháp luật
          </p>
        </div>
        <a
          href="/admin/doi-tuong/them-moi"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          ➕ Thêm Đối Tượng Mới
        </a>
      </div>

      {/* Search & Filter */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Tìm Kiếm</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <input
            type="text"
            placeholder="Họ và tên..."
            value={searchParams.hoTen}
            onChange={(e) =>
              setSearchParams({ ...searchParams, hoTen: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <input
            type="text"
            placeholder="Số CMND/CCCD..."
            value={searchParams.soCMND_CCCD}
            onChange={(e) =>
              setSearchParams({ ...searchParams, soCMND_CCCD: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <select
            value={searchParams.trangThai}
            onChange={(e) =>
              setSearchParams({ ...searchParams, trangThai: e.target.value })
            }
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="DANG_THEO_DOI">Đang theo dõi</option>
            <option value="TAM_GIAM">Tạm giam</option>
            <option value="DA_XU_LY">Đã xử lý</option>
            <option value="CHUYEN_NOI_KHAC">Chuyển nơi khác</option>
          </select>
          <button
            onClick={handleSearch}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            🔍 Tìm Kiếm
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Họ và Tên
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CMND/CCCD
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Giới Tính
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ngày Sinh
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nghề Nghiệp
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Trạng Thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Thao Tác
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    <div className="flex justify-center items-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="ml-3">Đang tải dữ liệu...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không có dữ liệu
                  </td>
                </tr>
              ) : (
                data.map((item) => (
                  <tr key={item.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10">
                          {item.anhDaiDien ? (
                            <img
                              className="h-10 w-10 rounded-full object-cover"
                              src={item.anhDaiDien}
                              alt=""
                            />
                          ) : (
                            <div className="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-bold">
                              {item.hoTen.charAt(0).toUpperCase()}
                            </div>
                          )}
                        </div>
                        <div className="ml-4">
                          <a
                            href={`/admin/doi-tuong/${item.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-800 hover:underline"
                          >
                            {item.hoTen}
                          </a>
                          {item.tenGoiKhac && (
                            <div className="text-sm text-gray-500">
                              aka: {item.tenGoiKhac}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.soCMND_CCCD || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {getGioiTinhLabel(item.gioiTinh)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(item.ngaySinh).toLocaleDateString("vi-VN")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {item.ngheNghiep || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getTrangThaiDoiTuongColor(
                          item.trangThai
                        )}`}
                      >
                        {getTrangThaiDoiTuongLabel(item.trangThai)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <IconButton
                          icon={<EyeIcon />}
                          tooltip="Xem chi tiết"
                          variant="view"
                          href={`/admin/doi-tuong/${item.id}`}
                        />
                        <IconButton
                          icon={<PencilIcon />}
                          tooltip="Chỉnh sửa"
                          variant="edit"
                          href={`/admin/doi-tuong/${item.id}/chinh-sua`}
                        />
                        <IconButton
                          icon={<TrashBinIcon />}
                          tooltip="Xóa đối tượng"
                          variant="delete"
                          onClick={() => handleDelete(item.id)}
                        />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Trước
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Sau
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  Hiển thị{" "}
                  <span className="font-medium">
                    {(pagination.page - 1) * pagination.limit + 1}
                  </span>{" "}
                  đến{" "}
                  <span className="font-medium">
                    {Math.min(pagination.page * pagination.limit, pagination.total)}
                  </span>{" "}
                  trong tổng số <span className="font-medium">{pagination.total}</span>{" "}
                  kết quả
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={pagination.page === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ‹
                  </button>
                  {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
                    (pageNum) => (
                      <button
                        key={pageNum}
                        onClick={() => handlePageChange(pageNum)}
                        className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                          pageNum === pagination.page
                            ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                            : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                        }`}
                      >
                        {pageNum}
                      </button>
                    )
                  )}
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={pagination.page === pagination.totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    ›
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
