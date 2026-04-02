"use client";

import { useEffect, useState } from "react";
import { nguoiDungApi } from "@/lib/api";
import { useRouter } from "next/navigation";

interface NguoiDung {
  id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  loaiNguoiDung: string;
  trangThaiHoatDong: boolean;
  lanDangNhapCuoi?: string;
  ngayTao: string;
}

export default function QuanLyNguoiDungPage() {
  const router = useRouter();
  const [data, setData] = useState<NguoiDung[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterLoai, setFilterLoai] = useState("");
  const [filterTrangThai, setFilterTrangThai] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await nguoiDungApi.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách người dùng:", error);
      alert("Không thể tải danh sách người dùng!");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, hoTen: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${hoTen}"?`)) return;

    try {
      await nguoiDungApi.delete(id);
      alert("Xóa người dùng thành công!");
      fetchData();
    } catch (error) {
      alert("Có lỗi khi xóa người dùng!");
      console.error(error);
    }
  };

  const handleToggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await nguoiDungApi.update(id, {
        trangThaiHoatDong: !currentStatus,
      });
      alert(`${!currentStatus ? "Kích hoạt" : "Vô hiệu hóa"} người dùng thành công!`);
      fetchData();
    } catch (error) {
      alert("Có lỗi khi cập nhật trạng thái!");
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

  const filteredData = data.filter((item) => {
    const matchSearch =
      item.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.soDienThoai && item.soDienThoai.includes(searchTerm));

    const matchLoai = !filterLoai || item.loaiNguoiDung === filterLoai;
    const matchTrangThai =
      !filterTrangThai ||
      (filterTrangThai === "active" && item.trangThaiHoatDong) ||
      (filterTrangThai === "inactive" && !item.trangThaiHoatDong);

    return matchSearch && matchLoai && matchTrangThai;
  });

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
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý người dùng
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng số: {filteredData.length} người dùng
          </p>
        </div>
        <button
          onClick={() => router.push("/admin/nguoi-dung/them-moi")}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
        >
          + Thêm người dùng
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tìm kiếm
            </label>
            <input
              type="text"
              placeholder="Họ tên, email, số điện thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
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
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Không tìm thấy người dùng nào
                  </td>
                </tr>
              ) : (
                filteredData.map((user) => (
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
                        <button
                          onClick={() =>
                            router.push(`/admin/nguoi-dung/${user.id}`)
                          }
                          className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                        >
                          Chi tiết
                        </button>
                        <button
                          onClick={() =>
                            router.push(`/admin/nguoi-dung/${user.id}/chinh-sua`)
                          }
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
                        >
                          Sửa
                        </button>
                        <button
                          onClick={() => handleDelete(user.id, user.hoTen)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                        >
                          Xóa
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
