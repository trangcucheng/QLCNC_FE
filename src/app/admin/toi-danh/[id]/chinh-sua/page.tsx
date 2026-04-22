"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { toimDanhApi } from "@/lib/api";
import Swal from "sweetalert2";

interface ToiDanh {
  id: string;
  ma: string;
  ten: string;
  moTa?: string;
  khungHinhPhat?: string;
}

export default function ChinhSuaToiDanhPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [formData, setFormData] = useState({
    ma: "",
    ten: "",
    moTa: "",
    khungHinhPhat: "",
  });

  useEffect(() => {
    document.title = "Chỉnh sửa Tội danh | QLCNC";
  }, []);

  useEffect(() => {
    if (id) {
      fetchToiDanh();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchToiDanh = async () => {
    try {
      setInitialLoading(true);
      const response = await toimDanhApi.getById(id);
      
      if (response) {
        setFormData({
          ma: response.ma || "",
          ten: response.ten || "",
          moTa: response.moTa || "",
          khungHinhPhat: response.khungHinhPhat || "",
        });
      }
    } catch (error) {
      console.error("Lỗi khi tải thông tin tội danh:", error);
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: "Không thể tải thông tin tội danh",
      });
      router.push("/admin/toi-danh");
    } finally {
      setInitialLoading(false);
    }
  };

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

    if (!formData.ma || !formData.ten) {
      Swal.fire({
        icon: "warning",
        title: "Thiếu thông tin!",
        text: "Vui lòng nhập mã và tên tội danh",
      });
      return;
    }

    try {
      setLoading(true);
      await toimDanhApi.update(id, formData);
      
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật tội danh thành công",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/admin/toi-danh");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Có lỗi xảy ra khi cập nhật tội danh",
      });
    } finally {
      setLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <div className="p-6">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Chỉnh Sửa Tội Danh
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cập nhật thông tin tội danh
          </p>
        </div>
        <Link
          href="/admin/toi-danh"
          className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
        >
          ← Quay lại
        </Link>
      </div>

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Mã tội danh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Mã tội danh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ma"
                value={formData.ma}
                onChange={handleChange}
                placeholder="VD: TD001"
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>

            {/* Tên tội danh */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên tội danh <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ten"
                value={formData.ten}
                onChange={handleChange}
                placeholder="Nhập tên tội danh"
                required
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Khung hình phạt */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Khung hình phạt
            </label>
            <input
              type="text"
              name="khungHinhPhat"
              value={formData.khungHinhPhat}
              onChange={handleChange}
              placeholder="VD: Phạt tiền - 20 năm tù"
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
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
              placeholder="Mô tả chi tiết về tội danh..."
              className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
          </div>

          {/* Buttons */}
          <div className="flex gap-4 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/admin/toi-danh"
              className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
            >
              Hủy
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-brand-500 text-white rounded-lg hover:bg-brand-600 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? "Đang lưu..." : "Cập nhật"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
