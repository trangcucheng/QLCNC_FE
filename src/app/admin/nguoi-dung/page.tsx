"use client";

import { useEffect, useState } from "react";
import { nguoiDungApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import IconButton from "@/components/ui/IconButton";
import { EyeIcon, PencilIcon, TrashBinIcon } from "@/icons";
import { useAuth } from "@/context/AuthContext";
import { showSuccess, showError, showConfirm } from "@/utils/sweetalert";

interface NguoiDung {
  id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  loaiNguoiDung: string;
  trangThaiHoatDong: boolean;
  lanDangNhapCuoi?: string;
  ngayTao: string;
  vaiTroNguoiDung?: Array<{
    id: string;
    nguoiDungId: string;
    vaiTroId: string;
    vaiTro: {
      id: string;
      tenVaiTro: string;
      moTa: string;
      ngayTao: string;
      ngayCapNhat: string;
    };
  }>;
}

export default function QuanLyNguoiDungPage() {
  const { hasPermission } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<NguoiDung[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    document.title = "Quản lý Người dùng | QLCNC";
  }, []);

  useEffect(() => {
    fetchData();
  }, [currentPage, pageSize, filterLoai]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params: any = {
        page: currentPage.toString(),
        pageSize: pageSize.toString(),
      };
      
      if (filterLoai) {
        // Map loaiNguoiDung to role name for API
        const roleMap: Record<string, string> = {
          'QUAN_TRI_VIEN': 'Admin',
          'LANH_DAO': 'Lãnh đạo',
          'CAN_BO_NGHIEP_VU': 'Cán bộ nghiệp vụ',
        };
        params.role = roleMap[filterLoai];
      }

      const response = await nguoiDungApi.getAll(params);
      console.log("API Response:", response);
      
      if (response && response.data) {
        setData(response.data);
        setTotal(response.total || 0);
      } else {
        setData([]);
        setTotal(0);
      }
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      showError("Không thể tải danh sách người dùng!");
      setData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData();
  };

  const handleDelete = async (id: string, hoTen: string) => {
    const confirmed = await showConfirm(`Bạn có chắc chắn muốn xóa người dùng "${hoTen}"?`);
    if (!confirmed) return;

    try {
      await nguoiDungApi.delete(id);
      showSuccess("Xóa người dùng thành công!");
      fetchData();
    } catch (error) {
      showError("Có lỗi khi xóa người dùng!");
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await nguoiDungApi.update(id, {
        trangThaiHoatDong: !currentStatus,
      });
      showSuccess(`${!currentStatus ? "Kích hoạt" : "Vô hiệu hóa"} người dùng thành công!`);
      fetchData();
    } catch (error) {
      showError("Có lỗi khi cập nhật trạng thái!");
      console.error(error);
    }
  };

  const getLoaiNguoiDungLabel = (loai: string) => {
    const labels: Record<string, string> = {
      CAN_BO_NGHIEP_VU: "Cán bộ nghiệp vụ",
      LANH_DAO: "Lãnh đạo",
      QUAN_TRI_VIEN: "Quản trị viên",
    };
    return labels[loai] || loai;
  };

  const getLoaiNguoiDungColor = (loai: string) => {
    const colors: Record<string, string> = {
      CAN_BO_NGHIEP_VU: "bg-blue-100 text-blue-800",
      LANH_DAO: "bg-purple-100 text-purple-800",
      QUAN_TRI_VIEN: "bg-red-100 text-red-800",
    };
    return colors[loai] || "bg-gray-100 text-gray-800";
  };

  // Client-side filter for status and search (since backend doesn't support these)
  const displayData = data.filter((item) => {
    const matchSearch = !searchTerm || 
      item.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.soDienThoai && item.soDienThoai.includes(searchTerm));

    const matchTrangThai =
      !filterTrangThai ||
      (filterTrangThai === "active" && item.trangThaiHoatDong) ||
      (filterTrangThai === "inactive" && !item.trangThaiHoatDong);

    return matchSearch && matchTrangThai;
  });

  const totalPages = Math.ceil(total / pageSize);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900">
            Quản lý người dùng
          </h5>
          <p className="text-gray-600 mt-1">
            Tổng số: {total} người dùng (Hiển thị {displayData.length} trên trang này)
          </p>
        </div>
        {hasPermission("CREATE_USER") && (
          <button
            onClick={() => router.push("/admin/nguoi-dung/them-moi")}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Thêm người dùng
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Họ tên, email, số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                onClick={handleSearch}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Tìm
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Loại người dùng
            </label>
            <select
              value={filterLoai}
              onChange={(e) => setFilterLoai(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="CAN_BO_NGHIEP_VU">Cán bộ nghiệp vụ</option>
              <option value="LANH_DAO">Lãnh đạo</option>
              <option value="QUAN_TRI_VIEN">Quản trị viên</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Trạng thái
            </label>
            <select
              value={filterTrangThai}
              onChange={(e) => setFilterTrangThai(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Tất cả</option>
              <option value="active">Đang hoạt động</option>
              <option value="inactive">Đã khóa</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Số dòng/trang
            </label>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Họ tên
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Số điện thoại
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Loại
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Lần đăng nhập cuối
                </th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {displayData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                displayData.map((user) => (
                  <tr
                    key={user.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">
                        {user.hoTen}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{user.email}</td>
                    <td className="px-6 py-4 text-gray-600">
                      {user.soDienThoai || "-"}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${getLoaiNguoiDungColor(
                          user.loaiNguoiDung
                        )}`}
                      >
                        {getLoaiNguoiDungLabel(user.loaiNguoiDung)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() =>
                          handleToggleStatus(user.id, user.trangThaiHoatDong)
                        }
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          user.trangThaiHoatDong
                            ? "bg-green-100 text-green-800 hover:bg-green-200"
                            : "bg-red-100 text-red-800 hover:bg-red-200"
                        }`}
                      >
                        {user.trangThaiHoatDong
                          ? "Đang hoạt động"
                          : "Đã khóa"}
                      </button>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {user.lanDangNhapCuoi
                        ? new Date(user.lanDangNhapCuoi).toLocaleString(
                            "vi-VN"
                          )
                        : "Chưa đăng nhập"}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <IconButton
                          icon={<EyeIcon />}
                          tooltip="Xem chi tiết"
                          variant="view"
                          onClick={() => router.push(`/admin/nguoi-dung/${user.id}`)}
                        />
                        {hasPermission("UPDATE_USER") && (
                          <IconButton
                            icon={<PencilIcon />}
                            tooltip="Chỉnh sửa"
                            variant="edit"
                            onClick={() => router.push(`/admin/nguoi-dung/${user.id}/chinh-sua`)}
                          />
                        )}
                        {hasPermission("DELETE_USER") && (
                          <IconButton
                            icon={<TrashBinIcon />}
                            tooltip="Xóa người dùng"
                            variant="delete"
                            onClick={() => handleDelete(user.id, user.hoTen)}
                          />
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
            <div className="text-sm text-gray-700">
              Hiển thị {((currentPage - 1) * pageSize) + 1} - {Math.min(currentPage * pageSize, total)} trong tổng {total} người dùng
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(1)}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                «« Đầu
              </button>
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                « Trước
              </button>
              
              {/* Page numbers */}
              <div className="flex items-center gap-1">
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
                      className={`px-3 py-1 border rounded-lg ${
                        currentPage === pageNum
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tiếp »
              </button>
              <button
                onClick={() => setCurrentPage(totalPages)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cuối »»
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
