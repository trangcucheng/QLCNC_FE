"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { bieuMauApi } from "@/lib/api";
import Swal from "sweetalert2";
import IconButton from "@/components/ui/IconButton";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";

interface BieuMau {
  id: string;
  ten: string;
  moTa?: string;
  duongDan: string;
  phienBan?: string;
  ngayTao: string;
  ngayCapNhat: string;
}

export default function BieuMauPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<BieuMau[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.title = "Danh mục Biểu mẫu | QLCNC";
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      };
      
      const response = await bieuMauApi.getAll(params);
      
      if (response && response.data) {
        setData(response.data);
        setTotal(response.total || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách biểu mẫu:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể tải danh sách biểu mẫu",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, ten: string) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa biểu mẫu "${ten}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await bieuMauApi.delete(id);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Xóa biểu mẫu thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message || "Có lỗi xảy ra khi xóa biểu mẫu",
        });
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleDownload = (duongDan: string, ten: string) => {
    // Download file
    window.open(duongDan, "_blank");
  };

  // Client-side filtering for search
  const displayData = data.filter((item) => {
    const matchSearch = !searchTerm || 
      item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.moTa && item.moTa.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.phienBan && item.phienBan.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // Pagination calculations
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900 dark:text-white">
            Danh Mục Biểu Mẫu
          </h5>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý các biểu mẫu, văn bản mẫu của hệ thống
          </p>
        </div>
        {hasPermission("bieu-mau:create") && (
          <Link
            href="/admin/bieu-mau/them-moi"
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Biểu Mẫu
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm kiếm
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Tìm theo tên, mô tả hoặc phiên bản..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
                className="flex-1 px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
              <button
                onClick={handleSearch}
                className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium"
              >
                Tìm kiếm
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Số dòng / trang
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h5 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh sách biểu mẫu ({total})
          </h5>
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
          </div>
        ) : displayData.length === 0 ? (
          <div className="text-center py-12 text-gray-500 dark:text-gray-400">
            Không có dữ liệu
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      STT
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Tên biểu mẫu
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Phiên bản
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Mô tả
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ngày cập nhật
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Thao tác
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {displayData.map((item, index) => (
                    <tr
                      key={item.id}
                      className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm text-gray-900 dark:text-white">
                          {startIndex + index}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {item.ten}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          {item.phienBan || "v1.0"}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-600 dark:text-gray-300 max-w-md truncate">
                          {item.moTa || "-"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(item.ngayCapNhat)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDownload(item.duongDan, item.ten)}
                            className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Tải xuống"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                            </svg>
                          </button>
                          {hasPermission("bieu-mau:update") && (
                            <IconButton
                              icon={<PencilIcon />}
                              tooltip="Chỉnh sửa"
                              variant="edit"
                              href={`/admin/bieu-mau/${item.id}/chinh-sua`}
                            />
                          )}
                          {hasPermission("bieu-mau:delete") && (
                            <IconButton
                              icon={<TrashBinIcon />}
                              tooltip="Xóa"
                              variant="delete"
                              onClick={() => handleDelete(item.id, item.ten)}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between">
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Hiển thị {startIndex} - {endIndex} trong tổng {total} biểu mẫu
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  «« Đầu
                </button>
                <button
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  « Trước
                </button>
                
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (currentPage <= 3) {
                    pageNum = i + 1;
                  } else if (currentPage >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = currentPage - 2 + i;
                  }
                  
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setCurrentPage(pageNum)}
                      className={`px-3 py-1 border rounded ${
                        currentPage === pageNum
                          ? "bg-brand-500 text-white border-brand-500"
                          : "border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}

                <button
                  onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Tiếp »
                </button>
                <button
                  onClick={() => setCurrentPage(totalPages)}
                  disabled={currentPage === totalPages}
                  className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-gray-700 dark:text-gray-300"
                >
                  Cuối »»
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
