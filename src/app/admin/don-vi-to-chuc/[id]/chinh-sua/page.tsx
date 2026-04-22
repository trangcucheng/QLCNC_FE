"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { donViApi } from "@/lib/api";
import Swal from "sweetalert2";

export default function ChinhSuaDonViPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id as string;

  const [loading, setLoading] = useState(false);
  const [fetchingData, setFetchingData] = useState(true);
  const [donViList, setDonViList] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    ma: "",
    ten: "",
    moTa: "",
    donViChaId: "",
    trangThai: true,
  });

  useEffect(() => {
    document.title = "Chỉnh sửa Đơn vị | QLCNC";
    fetchDonViList();
    if (id) {
      fetchDonVi();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchDonViList = async () => {
    try {
      const response = await donViApi.getAll({ page: "1", pageSize: "100" });
      setDonViList((response || []).filter((dv: any) => dv.id !== id));
    } catch (error) {
      console.error("Lỗi khi tải danh sách đơn vị:", error);
    }
  };

  const fetchDonVi = async () => {
    try {
      setFetchingData(true);
      const response = await donViApi.getById(id);
      
      if (response) {
        setFormData({
          ma: response.ma || "",
          ten: response.ten || "",
          moTa: response.moTa || "",
          donViChaId: response.donViChaId || "",
          trangThai: response.trangThai ?? true,
        });
      }
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Không thể tải thông tin đơn vị",
      });
      router.push("/admin/don-vi-to-chuc");
    } finally {
      setFetchingData(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
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
        text: "Vui lòng nhập mã và tên đơn vị",
      });
      return;
    }

    try {
      setLoading(true);
      const payload = {
        ...formData,
        donViChaId: formData.donViChaId || undefined,
      };
      await donViApi.update(id, payload);
      
      Swal.fire({
        icon: "success",
        title: "Thành công!",
        text: "Cập nhật đơn vị thành công",
        timer: 1500,
        showConfirmButton: false,
      });

      router.push("/admin/don-vi-to-chuc");
    } catch (error: any) {
      Swal.fire({
        icon: "error",
        title: "Lỗi!",
        text: error.message || "Có lỗi xảy ra khi cập nhật đơn vị",
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
            Chỉnh Sửa Đơn Vị
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Cập nhật thông tin đơn vị
          </p>
        </div>
        <Link
          href="/admin/don-vi-to-chuc"
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
                Mã đơn vị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ma"
                value={formData.ma}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="VD: DV001"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Tên đơn vị <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="ten"
                value={formData.ten}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                placeholder="VD: Phòng Kế hoạch"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Đơn vị cha
              </label>
              <select
                name="donViChaId"
                value={formData.donViChaId}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">-- Không có --</option>
                {donViList.map((dv) => (
                  <option key={dv.id} value={dv.id}>
                    {dv.ma} - {dv.ten}
                  </option>
                ))}
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
                <option value="true">Hoạt động</option>
                <option value="false">Không hoạt động</option>
              </select>
            </div>
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
              placeholder="Nhập mô tả về đơn vị..."
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
              href="/admin/don-vi-to-chuc"
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
