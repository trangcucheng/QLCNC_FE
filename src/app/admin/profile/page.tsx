"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { authApi } from "@/lib/api";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const { user, login } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  
  const [formData, setFormData] = useState({
    hoTen: "",
    email: "",
    soDienThoai: "",
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  useEffect(() => {
    document.title = "Thông tin cá nhân | QLCNC";
    
    // Load user data
    if (user) {
      setFormData((prev) => ({
        ...prev,
        hoTen: user.hoTen || "",
        email: user.email || "",
        soDienThoai: user.soDienThoai || "",
      }));
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.hoTen.trim()) {
      setError("Họ tên không được để trống");
      return;
    }

    if (!formData.email.trim()) {
      setError("Email không được để trống");
      return;
    }

    // Kiểm tra nếu đổi mật khẩu
    if (showPasswordFields) {
      if (!formData.currentPassword) {
        setError("Vui lòng nhập mật khẩu hiện tại");
        return;
      }

      if (!formData.newPassword) {
        setError("Vui lòng nhập mật khẩu mới");
        return;
      }

      if (formData.newPassword.length < 6) {
        setError("Mật khẩu mới phải có ít nhất 6 ký tự");
        return;
      }

      if (formData.newPassword !== formData.confirmPassword) {
        setError("Mật khẩu xác nhận không khớp");
        return;
      }
    }

    // Kiểm tra nếu đổi email thì cần mật khẩu
    if (formData.email !== user?.email && !formData.currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại để đổi email");
      return;
    }

    setLoading(true);

    try {
      const updateData: any = {
        hoTen: formData.hoTen,
        soDienThoai: formData.soDienThoai || undefined,
      };

      // Chỉ gửi email nếu thay đổi
      if (formData.email !== user?.email) {
        updateData.email = formData.email;
        updateData.currentPassword = formData.currentPassword;
      }

      // Chỉ gửi password nếu người dùng muốn đổi
      if (showPasswordFields && formData.newPassword) {
        updateData.currentPassword = formData.currentPassword;
        updateData.newPassword = formData.newPassword;
      }

      const response = await authApi.updateProfile(updateData);

      // Cập nhật localStorage với thông tin mới
      if (response.data) {
        localStorage.setItem("user", JSON.stringify(response.data));
        
        // Nếu đổi email hoặc mật khẩu, yêu cầu đăng nhập lại
        if (updateData.email || updateData.newPassword) {
          setSuccess("Cập nhật thành công! Vui lòng đăng nhập lại.");
          setTimeout(() => {
            localStorage.removeItem("access_token");
            localStorage.removeItem("user");
            router.push("/auth/login");
          }, 2000);
        } else {
          setSuccess("Cập nhật thông tin thành công!");
          // Reload page để cập nhật UI
          window.location.reload();
        }
      }
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-gray-500">Đang tải...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Thông tin cá nhân
        </h1>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Cập nhật thông tin tài khoản của bạn
        </p>
      </div>

      {error && (
        <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-800 dark:bg-red-900/20 dark:text-red-400">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-lg bg-green-50 p-4 text-sm text-green-800 dark:bg-green-900/20 dark:text-green-400">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <h2 className="mb-4 text-lg font-semibold text-gray-900 dark:text-white">
            Thông tin cơ bản
          </h2>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="hoTen"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Họ và tên <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                id="hoTen"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Nhập họ và tên"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Nhập email"
                required
              />
              {formData.email !== user.email && (
                <p className="mt-1 text-xs text-yellow-600 dark:text-yellow-400">
                  ⚠️ Thay đổi email sẽ yêu cầu đăng nhập lại
                </p>
              )}
            </div>

            <div>
              <label
                htmlFor="soDienThoai"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Số điện thoại
              </label>
              <input
                type="tel"
                id="soDienThoai"
                name="soDienThoai"
                value={formData.soDienThoai}
                onChange={handleChange}
                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white dark:placeholder-gray-400"
                placeholder="Nhập số điện thoại"
              />
            </div>
          </div>
        </div>

        {/* Đổi mật khẩu */}
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-700 dark:bg-gray-800">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Đổi mật khẩu
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowPasswordFields(!showPasswordFields);
                if (showPasswordFields) {
                  setFormData((prev) => ({
                    ...prev,
                    currentPassword: "",
                    newPassword: "",
                    confirmPassword: "",
                  }));
                }
              }}
              className="text-sm text-blue-600 hover:underline dark:text-blue-400"
            >
              {showPasswordFields ? "Hủy" : "Đổi mật khẩu"}
            </button>
          </div>

          {showPasswordFields && (
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mật khẩu hiện tại <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="currentPassword"
                  name="currentPassword"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập mật khẩu hiện tại"
                />
              </div>

              <div>
                <label
                  htmlFor="newPassword"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="newPassword"
                  name="newPassword"
                  value={formData.newPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập mật khẩu mới (tối thiểu 6 ký tự)"
                />
              </div>

              <div>
                <label
                  htmlFor="confirmPassword"
                  className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Xác nhận mật khẩu mới <span className="text-red-500">*</span>
                </label>
                <input
                  type="password"
                  id="confirmPassword"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-gray-300 px-4 py-2.5 text-gray-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </div>
            </div>
          )}
        </div>

        {/* Nút submit */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="rounded-lg border border-gray-300 bg-white px-6 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-200 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-lg bg-blue-600 px-6 py-2.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600 dark:focus:ring-blue-800"
          >
            {loading ? "Đang lưu..." : "Lưu thay đổi"}
          </button>
        </div>
      </form>
    </div>
  );
}
