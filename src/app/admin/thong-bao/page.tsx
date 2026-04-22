"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { thongBaoApi } from "@/lib/api";
import Swal from "sweetalert2";
import IconButton from "@/components/ui/IconButton";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";

interface ThongBao {
  id: string;
  tieuDe: string;
  noiDung: string;
  loaiThongBao: string;
  uu_tien: number;
  trangThai: boolean;
  ngayTao: string;
  ngayCapNhat: string;
}

export default function ThongBaoPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<ThongBao[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.title = "Thông báo | QLCNC";
  }, []);

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, pageSize, filterStatus]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      };

      if (filterStatus !== "all") {
        params.trangThai = filterStatus === "active" ? "true" : "false";
      }
      
      const response = await thongBaoApi.getAll(params);
      
      if (response && response.data) {
        setData(response.data);
        setTotal(response.total || 0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách thông báo:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể tải danh sách thông báo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await thongBaoApi.toggleStatus(id);
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: `Đã ${currentStatus ? "tắt" : "bật"} thông báo`,
        timer: 1500,
        showConfirmButton: false,
      });
      fetchData();
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Có lỗi xảy ra",
      });
    }
  };

  const handleDelete = async (id: string, tieuDe: string) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa thông báo "${tieuDe}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await thongBaoApi.delete(id);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Xóa thông báo thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message || "Có lỗi xảy ra khi xóa thông báo",
        });
      }
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  // Client-side filtering
  const displayData = data.filter((item) => {
    const matchSearch = !searchTerm || 
      item.tieuDe.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.noiDung.toLowerCase().includes(searchTerm.toLowerCase());
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

  const getPriorityBadge = (priority: number) => {
    const badges = {
      1: { text: "Thấp", color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" },
      2: { text: "Trung bình", color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" },
      3: { text: "Cao", color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200" },
    };
    const badge = badges[priority as keyof typeof badges] || badges[1];
    return (
      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${badge.color}`}>
        {badge.text}
      </span>
    );
  };

  const getTypeBadge = (type: string) => {
    const types: Record<string, { icon: string; color: string }> = {
      info: { icon: "ℹ️", color: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200" },
      warning: { icon: "⚠️", color: "bg-yellow-50 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-200" },
      error: { icon: "❌", color: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200" },
      success: { icon: "✅", color: "bg-green-50 text-green-700 dark:bg-green-900/30 dark:text-green-200" },
    };
    const typeInfo = types[type] || types.info;
    return (
      <span className={`px-3 py-1 inline-flex items-center gap-1 text-xs font-medium rounded-full ${typeInfo.color}`}>
        <span>{typeInfo.icon}</span>
        {type}
      </span>
    );
  };

  // Pagination
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, total);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản Lý Thông Báo
          </h5>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý các thông báo, tin tức của hệ thống
          </p>
        </div>
        {hasPermission("thong-bao:create") && (
          <Link
            href="/admin/thong-bao/them-moi"
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Thông Báo
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
                placeholder="Tìm theo tiêu đề hoặc nội dung..."
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
              Trạng thái
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            >
              <option value="all">Tất cả</option>
              <option value="active">Đang hiển thị</option>
              <option value="inactive">Đã ẩn</option>
            </select>
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh sách thông báo ({total})
          </h2>
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
                      Tiêu đề
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Loại
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ưu tiên
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Trạng thái
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Ngày tạo
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
                          {item.tieuDe}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                          {item.noiDung}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getTypeBadge(item.loaiThongBao)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {getPriorityBadge(item.uu_tien)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => handleToggleStatus(item.id, item.trangThai)}
                          className={`px-3 py-1 text-xs font-semibold rounded-full ${
                            item.trangThai
                              ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                              : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                          }`}
                        >
                          {item.trangThai ? "Hiển thị" : "Đã ẩn"}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-600 dark:text-gray-300">
                          {formatDate(item.ngayTao)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex gap-2">
                          {hasPermission("thong-bao:update") && (
                            <IconButton
                              icon={<PencilIcon />}
                              tooltip="Chỉnh sửa"
                              variant="edit"
                              href={`/admin/thong-bao/${item.id}/chinh-sua`}
                            />
                          )}
                          {hasPermission("thong-bao:delete") && (
                            <IconButton
                              icon={<TrashBinIcon />}
                              tooltip="Xóa"
                              variant="delete"
                              onClick={() => handleDelete(item.id, item.tieuDe)}
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
                Hiển thị {startIndex} - {endIndex} trong tổng {total} thông báo
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
