"use client";
import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { EyeCloseIcon, EyeIcon } from "@/icons";
import Image from "next/image";

export default function SignInForm() {
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(formData.email, formData.password);
    } catch (err: any) {
      setError(err.message || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-red-50 to-rose-50 dark:from-gray-900 dark:via-gray-900 dark:to-gray-800 p-2 relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23dc2626' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>

      <div className="w-full max-w-4xl relative z-10">
        {/* Header Banner */}
        {/* <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white py-4 px-6 rounded-t-xl shadow-lg border-b-4 border-yellow-500">
          <div className="flex items-center justify-center gap-4">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg">
                <svg className="w-10 h-10 text-red-700" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
                </svg>
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold tracking-wide uppercase">
                  CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM
                </h1>
                <p className="text-yellow-200 font-semibold text-sm border-t border-yellow-400 pt-1 mt-1">
                  Độc lập - Tự do - Hạnh phúc
                </p>
              </div>
            </div>
          </div>
        </div> */}

        <div className="bg-white dark:bg-gray-800 shadow-2xl overflow-hidden rounded-xl border-3" style={{borderColor: '#BA0C2F'}}>
          <div className="grid lg:grid-cols-5">
            {/* Left Side - Official Branding */}
            <div className="hidden lg:flex lg:col-span-2 flex-col justify-center items-center p-6 text-white relative overflow-hidden" style={{background: 'linear-gradient(to bottom right, #8B0A1F, #BA0C2F, #8B0A1F)'}}>
              {/* Decorative Elements */}
              <div className="absolute top-0 left-0 w-64 h-64 bg-yellow-500/10 rounded-full -translate-x-32 -translate-y-32"></div>
              <div className="absolute bottom-0 right-0 w-96 h-96 bg-yellow-500/10 rounded-full translate-x-48 translate-y-48"></div>
              
              <div className="relative z-10 space-y-4 text-center">
                {/* Logo */}
                <div className="flex justify-center mb-2">
                  <div className="relative w-24 h-24 bg-white rounded-full p-2 shadow-2xl border-3 border-yellow-500">
                    <Image
                      src="/images/logo/logoDN.jpg"
                      alt="Logo Bộ Công an"
                      fill
                      className="object-contain rounded-full"
                      priority
                    />
                  </div>
                </div>
                
                {/* Title */}
                <div className="space-y-2">
                  <h2 className="text-lg font-bold uppercase tracking-wider leading-tight border-b-2 border-yellow-500 pb-2 mb-2">
                    BỘ CÔNG AN
                  </h2>
                  <h3 className="text-base font-semibold leading-snug">
                    HỆ THỐNG QUẢN LÝ<br />
                    DỮ LIỆU TỘI PHẠM<br />
                    CÔNG NGHỆ CAO<br />
                    THÀNH PHỐ ĐÀ NẴNG
                  </h3>
                </div>

                {/* Decorative Line */}
                <div className="flex items-center justify-center gap-2 pt-2">
                  <div className="w-10 h-0.5 bg-yellow-500"></div>
                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                  <div className="w-10 h-0.5 bg-yellow-500"></div>
                </div>

                {/* Security Notice */}
                <div className="mt-4 p-2.5 bg-red-900/50 backdrop-blur-sm rounded-lg border border-yellow-500/30">
                  <div className="flex items-start gap-2">
                    <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-2 16l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z"/>
                    </svg>
                    <div className="text-left text-xs">
                      <p className="font-semibold text-yellow-300 mb-0.5">HỆ THỐNG BẢO MẬT</p>
                      <p className="text-red-100 text-[11px] leading-snug">
                        Chỉ dành cho cán bộ có thẩm quyền. Mọi truy cập trái phép sẽ bị xử lý theo quy định pháp luật.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Side - Login Form */}
            <div className="lg:col-span-3 p-5 sm:p-6 bg-gray-50 dark:bg-gray-900">
              <div className="max-w-md mx-auto">
                {/* Mobile Logo */}
                <div className="lg:hidden flex justify-center mb-3">
                  <div className="relative w-16 h-16 bg-white rounded-full p-1.5 shadow-lg border-2" style={{borderColor: '#BA0C2F'}}>
                    <Image
                      src="/images/logo/logoDN.jpg"
                      alt="Logo Bộ Công an"
                      fill
                      className="object-contain rounded-full"
                      priority
                    />
                  </div>
                </div>

                {/* Header */}
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1 uppercase">
                    Đăng Nhập Hệ Thống
                  </h2>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <div className="h-px w-10" style={{backgroundColor: '#BA0C2F'}}></div>
                    <svg className="w-3.5 h-3.5" style={{color: '#BA0C2F'}} fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                    </svg>
                    <div className="h-px w-10" style={{backgroundColor: '#BA0C2F'}}></div>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mt-2 text-xs">
                    Vui lòng nhập thông tin đăng nhập được cấp
                  </p>
                </div>

                {/* Error Alert */}
                {error && (
                  <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/30 border-l-4 rounded-r" style={{borderLeftColor: '#BA0C2F'}}>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{color: '#BA0C2F'}} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                      </svg>
                      <p className="text-sm font-medium" style={{color: '#BA0C2F'}}>{error}</p>
                    </div>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                      Tài khoản
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full pl-12 pr-4 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium text-sm focus:ring-2 focus:border-[#BA0C2F]"
                        style={{'--tw-ring-color': '#BA0C2F'} as React.CSSProperties}
                        placeholder="Nhập địa chỉ email"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5 uppercase tracking-wide">
                      Mật khẩu
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-12 pr-12 py-2.5 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-400 transition-all font-medium text-sm focus:ring-2 focus:border-[#BA0C2F]"
                        style={{'--tw-ring-color': '#BA0C2F'} as React.CSSProperties}
                        placeholder="Nhập mật khẩu"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                      >
                        {showPassword ? (
                          <EyeIcon className="w-5 h-5" />
                        ) : (
                          <EyeCloseIcon className="w-5 h-5" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full text-white font-bold py-3 px-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-wider border-b-4 active:transform active:translate-y-1 text-sm"
                    style={{
                      background: loading ? '#BA0C2F' : 'linear-gradient(to right, #8B0A1F, #BA0C2F, #8B0A1F)',
                      borderBottomColor: '#6B0817',
                    }}
                    onMouseEnter={(e) => !loading && (e.currentTarget.style.background = 'linear-gradient(to right, #6B0817, #8B0A1F, #6B0817)')}
                    onMouseLeave={(e) => !loading && (e.currentTarget.style.background = 'linear-gradient(to right, #8B0A1F, #BA0C2F, #8B0A1F)')}
                  >
                    {loading ? (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Đang xác thực...
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                        </svg>
                        Đăng Nhập Hệ Thống
                      </span>
                    )}
                  </button>
                </form>

                {/* Security Notice */}
                <div className="mt-4 p-2.5 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
                  <div className="flex items-start gap-2">
                    <svg className="w-4 h-4 text-amber-600 dark:text-amber-500 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    <div className="text-[11px] text-amber-800 dark:text-amber-300">
                      <p className="font-semibold mb-0.5">LƯU Ý QUAN TRỌNG:</p>
                      <p className="leading-snug">
                        Hệ thống này chỉ dành cho cán bộ được ủy quyền. Mọi hành vi truy cập trái phép đều được ghi nhận và xử lý nghiêm túc theo quy định của pháp luật Việt Nam.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-2 space-y-0.5">
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">
            © 2026 Bộ Công an - Cục An ninh mạng và Phòng, chống tội phạm sử dụng công nghệ cao
          </p>
          <p className="text-[10px] text-gray-600 dark:text-gray-400">
            Phát triển bởi Phòng Công nghệ thông tin - Công an thành phố Đà Nẵng
          </p>
        </div>
      </div>
    </div>
  );
}
