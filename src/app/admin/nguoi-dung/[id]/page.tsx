"use client";

import { useEffect, useState } from "react";
import { nguoiDungApi } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

interface NguoiDung {
  id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  loaiNguoiDung: string;
  trangThaiHoatDong: boolean;
  lanDangNhapCuoi?: string;
  ngayTao: string;
  ngayCapNhat: string;
}

export default function ChiTietNguoiDungPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [data, setData] = useState<NguoiDung | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await nguoiDungApi.getById(id);
      setData(response.data);
    } catch (error) {
      console.error("Lỗi khi tải chi tiết người dùng:", error);
      alert("Không tìm thấy người dùng này!");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!data) return;

    try {
      await nguoiDungApi.update(id, {
        trangThaiHoatDong: !data.trangThaiHoatDong,
      });
      alert(
        `${!data.trangThaiHoatDong ? "Kích hoạt" : "Vô hiệu hóa"} người dùng thành công!`
      );
      fetchData();
    } catch (error) {
      alert("Có lỗi khi cập nhật trạng thái!");
      console.error(error);
    }
  };

  const handleDelete = async () => {
    if (!data) return;
    if (!confirm(`Bạn có chắc chắn muốn xóa người dùng "${data.hoTen}"?`))
      return;

    try {
      await nguoiDungApi.delete(id);
      alert("Xóa người dùng thành công!");
      router.push("/admin/nguoi-dung");
    } catch (error) {
      alert("Có lỗi khi xóa người dùng!");
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
      CAN_BO_NGHIEP_VU: "bg-blue-500",
      LANH_DAO: "bg-purple-500",
      QUAN_TRI_VIEN: "bg-red-500",
    };
    return colors[loai] || "bg-gray-500";
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <button
            onClick={() => router.back()}
            className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
          >
            ← Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">{data.hoTen}</h1>
          <p className="text-gray-600 mt-1">{data.email}</p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => router.push(`/admin/nguoi-dung/${id}/chinh-sua`)}
            className="px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition-colors font-medium"
          >
            ✏️ Chỉnh sửa
          </button>
          <button
            onClick={handleToggleStatus}
            className={`px-6 py-3 rounded-lg font-semibold text-white ${
              data.trangThaiHoatDong
                ? "bg-red-500 hover:bg-red-600"
                : "bg-green-500 hover:bg-green-600"
            }`}
          >
            {data.trangThaiHoatDong ? "🔒 Khóa tài khoản" : "🔓 Kích hoạt"}
          </button>
          <button
            onClick={handleDelete}
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
          >
            🗑️ Xóa
          </button>
        </div>
      </div>

      {/* Thông tin cơ bản */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Thông tin tài khoản
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <p className="text-sm text-gray-600">Họ và tên</p>
            <p className="text-base font-semibold text-gray-900">
              {data.hoTen}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Email</p>
            <p className="text-base font-semibold text-gray-900">
              {data.email}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Số điện thoại</p>
            <p className="text-base font-semibold text-gray-900">
              {data.soDienThoai || "-"}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-600">Loại người dùng</p>
            <span
              className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${getLoaiNguoiDungColor(
                data.loaiNguoiDung
              )}`}
            >
              {getLoaiNguoiDungLabel(data.loaiNguoiDung)}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600">Trạng thái</p>
            <span
              className={`inline-block px-4 py-2 rounded-lg font-semibold text-white ${
                data.trangThaiHoatDong ? "bg-green-500" : "bg-red-500"
              }`}
            >
              {data.trangThaiHoatDong ? "Đang hoạt động" : "Đã khóa"}
            </span>
          </div>

          <div>
            <p className="text-sm text-gray-600">Lần đăng nhập cuối</p>
            <p className="text-base font-semibold text-gray-900">
              {data.lanDangNhapCuoi
                ? new Date(data.lanDangNhapCuoi).toLocaleString("vi-VN")
                : "Chưa đăng nhập"}
            </p>
          </div>
        </div>
      </div>

      {/* Thời gian */}
      <div className="bg-gray-50 rounded-xl p-4">
        <div className="flex justify-between text-sm text-gray-600">
          <span>
            Tạo lúc: {new Date(data.ngayTao).toLocaleString("vi-VN")}
          </span>
          <span>
            Cập nhật lúc: {new Date(data.ngayCapNhat).toLocaleString("vi-VN")}
          </span>
        </div>
      </div>
    </div>
  );
}
