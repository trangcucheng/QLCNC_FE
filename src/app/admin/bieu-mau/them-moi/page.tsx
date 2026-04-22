"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { bieuMauApi } from "@/lib/api";
import Swal from "sweetalert2";

export default function ThemMoiBieuMauPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    ten: "",
    moTa: "",
    duongDan: "",
    phienBan: "",
  });

  useEffect(() => {
    document.title = "Thêm mới Biểu mẫu | QLCNC";
  }, []);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.ten || !formData.duongDan) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập tên biểu mẫu và đường dẫn",
      });
      return;
    }

    try {
      setLoading(true);
      await bieuMauApi.create(formData);
      
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Thêm biểu mẫu mới thành công",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/admin/bieu-mau");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Có lỗi xảy ra khi thêm biểu mẫu",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thêm Mới Biểu Mẫu
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Thêm biểu mẫu, văn bản mẫu mới vào hệ thống
          </p>
        </div>
        <Link
          href="/admin/bieu-mau"
          className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          ← Quay lại
        </Link>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên biểu mẫu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ten"
                value={formData.ten}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="VD: Biên bản kiểm tra"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phiên bản
              </label>
              <input
                type="text"
                name="phienBan"
                value={formData.phienBan}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="VD: v1.0, 2024.01"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Đường dẫn file <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="duongDan"
              value={formData.duongDan}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="VD: https://example.com/file.pdf hoặc /uploads/forms/bien-ban.docx"
              required
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nhập URL hoặc đường dẫn đến file biểu mẫu
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="Nhập mô tả về biểu mẫu..."
            />
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Thêm Biểu Mẫu"}
            </button>
            <Link
              href="/admin/bieu-mau"
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
