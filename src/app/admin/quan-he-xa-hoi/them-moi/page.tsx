"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { quanHeXaHoiApi } from "@/lib/api";
import Swal from "sweetalert2";

export default function ThemMoiQuanHeXaHoiPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    tenQuanHe: "",
    moTa: "",
  });

  useEffect(() => {
    document.title = "Thêm mới Quan hệ xã hội | QLCNC";
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

    if (!formData.tenQuanHe) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập tên quan hệ",
      });
      return;
    }

    try {
      setLoading(true);
      await quanHeXaHoiApi.create(formData);
      
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Thêm quan hệ xã hội thành công",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/admin/quan-he-xa-hoi");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Có lỗi xảy ra khi thêm quan hệ xã hội",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h5 className="text-3xl font-bold text-gray-900 dark:text-white">
            Thêm Quan Hệ Xã Hội Mới
          </h5>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Nhập thông tin quan hệ xã hội mới (Cha, Mẹ, Vợ, Chồng, Con, Anh/Em, Bạn, ...)
          </p>
        </div>
        <Link
          href="/admin/quan-he-xa-hoi"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Quay lại
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Tên quan hệ */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên quan hệ <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="tenQuanHe"
              value={formData.tenQuanHe}
              onChange={handleChange}
              placeholder="VD: Cha, Mẹ, Vợ, Chồng, Con, Anh/Em, Bạn, ..."
              required
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Nhập tên gọi mối quan hệ (Cha, Mẹ, Vợ, Chồng, Con, Anh/Em, Bạn, Đồng nghiệp, ...)
            </p>
          </div>

          {/* Mô tả */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mô tả
            </label>
            <textarea
              name="moTa"
              value={formData.moTa}
              onChange={handleChange}
              rows={4}
              placeholder="Mô tả chi tiết về mối quan hệ này..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/quan-he-xa-hoi"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Thêm mới"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
