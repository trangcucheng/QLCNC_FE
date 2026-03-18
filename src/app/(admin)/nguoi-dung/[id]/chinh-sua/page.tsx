"use client";

import { useEffect, useState } from "react";
import { nguoiDungApi } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";

export default function ChinhSuaNguoiDungPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    loaiNguoiDung: "CAN_BO_NGHIEP_VU",
    trangThaiHoatDong: true,
  });

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await nguoiDungApi.getById(id);
      const data = response.data;
      setFormData({
        hoTen: data.hoTen || "",
        email: data.email || "",
        soDienThoai: data.soDienThoai || "",
        loaiNguoiDung: data.loaiNguoiDung || "CAN_BO_NGHIEP_VU",
        trangThaiHoatDong: data.trangThaiHoatDong ?? true,
      });
    } catch (error) {
      console.error("Lỗi khi tải thông tin người dùng:", error);
      alert("Không tìm thấy người dùng này!");
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.hoTen || !formData.email) {
      alert("Vui lòng điền đầy đủ thông tin bắt buộc!");
      return;
    }

    try {
      setSaving(true);
      await nguoiDungApi.update(id, formData);
      alert("Cập nhật người dùng thành công!");
      router.push(`/admin/nguoi-dung/${id}`);
    } catch (error: any) {
      console.error("Lỗi khi cập nhật người dùng:", error);
      alert(error.message || "Có lỗi khi cập nhật người dùng!");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Chỉnh sửa người dùng</h1>
        <p className="text-gray-600 mt-1">
          Cập nhật thông tin tài khoản người dùng
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white rounded-xl shadow-lg p-6">
        <div className="space-y-6">
          {/* Thông tin cơ bản */}
          <div className="border-b pb-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Thông tin cơ bản
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Họ và tên <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nguyễn Văn A"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="nguyenvana@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Số điện thoại
                </label>
                <input
                  type="tel"
                  name="soDienThoai"
                  value={formData.soDienThoai}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="0123456789"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại người dùng <span className="text-red-500">*</span>
                </label>
                <select
                  name="loaiNguoiDung"
                  value={formData.loaiNguoiDung}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="CAN_BO_NGHIEP_VU">Cán bộ nghiệp vụ</option>
                  <option value="LANH_DAO">Lãnh đạo</option>
                  <option value="QUAN_TRI_VIEN">Quản trị viên</option>
                </select>
              </div>
            </div>
          </div>

          {/* Trạng thái */}
          <div>
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              Trạng thái
            </h2>
            <div className="flex items-center">
              <input
                type="checkbox"
                name="trangThaiHoatDong"
                checked={formData.trangThaiHoatDong}
                onChange={handleChange}
                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label className="ml-2 text-sm text-gray-700">
                Kích hoạt tài khoản (cho phép đăng nhập)
              </label>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="submit"
              disabled={saving}
              className={`flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium ${
                saving ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              {saving ? "Đang lưu..." : "Lưu thay đổi"}
            </button>
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Hủy
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
