"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { donViApi } from "@/lib/api";
import Swal from "sweetalert2";
import IconButton from "@/components/ui/IconButton";
import { PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";

interface DonVi {
  id: string;
  ma: string;
  ten: string;
  moTa?: string;
  trangThai: boolean;
  donViChaId?: string;
  donViCha?: { ten: string };
  ngayTao: string;
  ngayCapNhat: string;
}

export default function DonViToChucPage() {
  const { hasPermission } = useAuth();
  const [data, setData] = useState<DonVi[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    document.title = "Đơn vị Tổ chức | QLCNC";
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await donViApi.getAll({ page: "1", pageSize: "100" });
      setData(response || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn vị:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể tải danh sách đơn vị",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, ten: string) => {
    const result = await Swal.fire({
      title: "Xác nhận xóa?",
      text: `Bạn có chắc chắn muốn xóa đơn vị "${ten}"?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Xóa",
      cancelButtonText: "Hủy",
    });

    if (result.isConfirmed) {
      try {
        await donViApi.delete(id);
        Swal.fire({
          icon: "success",
          title: "Đã xóa!",
          text: "Xóa đơn vị thành công",
          timer: 1500,
          showConfirmButton: false,
        });
        fetchData();
      } catch (error: any) {
        Swal.fire({
          icon: "error",
          title: "Lỗi!",
          text: error.message || "Có lỗi xảy ra khi xóa đơn vị",
        });
      }
    }
  };

  const displayData = data.filter((item) => {
    const matchSearch = !searchTerm || 
      item.ma.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.ten.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.moTa && item.moTa.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchSearch;
  });

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("vi-VN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Quản Lý Đơn Vị Tổ Chức
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Quản lý cấu trúc tổ chức, phòng ban, đơn vị
          </p>
        </div>
        {hasPermission("don-vi-to-chuc:create") && (
          <Link
            href="/admin/don-vi-to-chuc/them-moi"
            className="px-6 py-3 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium shadow-md flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Thêm Đơn Vị
          </Link>
        )}
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <div className="flex gap-4 items-center">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Tìm theo mã, tên hoặc mô tả..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Danh sách đơn vị ({displayData.length})
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
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700 border-b border-gray-200 dark:border-gray-600">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    STT
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Mã
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Tên đơn vị
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Đơn vị cha
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
                        {index + 1}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.ma}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {item.ten}
                      </div>
                      {item.moTa && (
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {item.moTa}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm text-gray-600 dark:text-gray-300">
                        {item.donViCha?.ten || "-"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          item.trangThai
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"
                        }`}
                      >
                        {item.trangThai ? "Hoạt động" : "Không hoạt động"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-600 dark:text-gray-300">
                        {formatDate(item.ngayTao)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        {hasPermission("don-vi-to-chuc:update") && (
                          <IconButton
                            icon={<PencilIcon />}
                            tooltip="Chỉnh sửa"
                            variant="edit"
                            href={`/admin/don-vi-to-chuc/${item.id}/chinh-sua`}
                          />
                        )}
                        {hasPermission("don-vi-to-chuc:delete") && (
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
        )}
      </div>
    </div>
  );
}
