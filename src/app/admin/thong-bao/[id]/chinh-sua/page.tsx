"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { thongBaoApi } from "@/lib/api";
import Swal from "sweetalert2";

export default function ChinhSuaThongBaoPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [formData, setFormData] = useState({
    tieuDe: "",
    noiDung: "",
    loaiThongBao: "info",
    uu_tien: 1,
    trangThai: true,
  });

  useEffect(() => {
    document.title = "Chỉnh sửa Thông báo | QLCNC";
    if (id) {
      fetchThongBao();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchThongBao = async () => {
    try {
      setFetchingData(true);
      const response = await thongBaoApi.getById(id);
      
      if (response) {
        setFormData({
          tieuDe: response.tieuDe || "",
          noiDung: response.noiDung || "",
          loaiThongBao: response.loaiThongBao || "info",
          uu_tien: response.uu_tien || 1,
          trangThai: response.trangThai ?? true,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Không thể tải thông tiến thông báo",
      });
      router.push("/admin/thong-bao");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.tieuDe || !formData.noiDung) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập tiêu đề và nội dung",
      });
      return;
    }

    try {
      setLoading(true);
      await thongBaoApi.update(id, formData);
      
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật thông báo thành công",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/admin/thong-bao");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Có lỗi xảy ra khi cập nhật thông báo",
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetchingData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chỉnh Sửa Thông Báo
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cập nhật thông tin thông báo
          </p>
        </div>
        <Link
          href="/admin/thong-bao"
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ← Quay lại
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tiêu đề <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tieuDe"
              value={formData.tieuDe}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="VD: Bảo trì hệ thống"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Loại thông báo
              </label>
              <select
                name="loaiThongBao"
                value={formData.loaiThongBao}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="info">ℹ️ Thông tin</option>
                <option value="warning">⚠️ Cảnh báo</option>
                <option value="error">❌ Lỗi</option>
                <option value="success">✅ Thành công</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Độ ưu tiên
              </label>
              <select
                name="uu_tien"
                value={formData.uu_tien}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value={1}>1 - Thấp</option>
                <option value={2}>2 - Trung bình</option>
                <option value={3}>3 - Cao</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Trạng thái
              </label>
              <select
                name="trangThai"
                value={formData.trangThai ? "true" : "false"}
                onChange={(e) => setFormData(prev => ({ ...prev, trangThai: e.target.value === "true" }))}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="true">Hiển thị</option>
                <option value="false">Ẩn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nội dung <span className="text-red-500">*</span>
            </label>
            <textarea
              name="noiDung"
              value={formData.noiDung}
              onChange={handleChange}
              rows={6}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Nhập nội dung thông báo chi tiết..."
              required
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Cập Nhật"}
            </button>
            <Link
              href="/admin/thong-bao"
              className="px-6 py-2.5 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-medium"
            >
              Hủy
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
