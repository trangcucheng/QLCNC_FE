"use client";

import { useState, useEffect } from "react";
import { hoSoVuViecApi, hoSoDoiTuongApi, danhMucApi, nguoiDungApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { showSuccess } from "@/utils/sweetalert";

export default function ThemVuViecPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [doiTuongs, setDoiTuongs] = useState<any[]>([]);
  const [selectedDoiTuongs, setSelectedDoiTuongs] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    soHoSo: "",
    tenVuViec: "",
    ngayXayRa: "",
    diaDiemXayRa: "",
    xaPhuong: "",
    quanHuyen: "",
    tinhThanh: "",
    mucDoViPham: "NONG",
    trangThai: "DANG_XU_LY",
    tomTatNoiDung: "",
    ketQuaXuLy: "",
    ghiChu: "",
  });

  useEffect(() => {
    document.title = "Thêm mới Vụ việc | QLCNC";
  }, []);

  useEffect(() => {
    fetchDoiTuongs();
  }, []);

  const fetchDoiTuongs = async () => {
    try {
      const response = await hoSoDoiTuongApi.getAll({ page: 1, limit: 100 });
      setDoiTuongs(response.data.items);
    } catch (error) {
      console.error("Lỗi khi tải danh sách đối tượng:", error);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDoiTuongToggle = (id: string) => {
    setSelectedDoiTuongs((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Map frontend field names to backend DTO field names
      const submitData = {
        soHoSo: formData.soHoSo,
        tenVuViec: formData.tenVuViec,
        moTaVuViec: formData.tomTatNoiDung, // Backend expects: moTaVuViec
        ngayXayRa: formData.ngayXayRa ? new Date(formData.ngayXayRa).toISOString() : undefined,
        diaChiXayRa: formData.diaDiemXayRa, // Backend expects: diaChiXayRa
        mucDoViPham: formData.mucDoViPham,
        trangThai: formData.trangThai,
        ghiChu: formData.ghiChu,
        doiTuongIds: selectedDoiTuongs, // Backend expects: doiTuongIds (not hoSoDoiTuongIds)
      };

      await hoSoVuViecApi.create(submitData);
      showSuccess("Thêm vụ việc thành công!");
      router.push("/admin/vu-viec");
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi thêm vụ việc");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h5 className="text-3xl font-bold text-gray-900">Thêm Vụ Việc Mới</h5>
        <p className="text-gray-600 mt-1">
          Nhập thông tin đầy đủ về vụ việc vi phạm pháp luật
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cơ bản */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông tin cơ bản
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số hồ sơ <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="soHoSo"
                value={formData.soHoSo}
                onChange={handleChange}
                required
                placeholder="VD: HS-2025-001"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày xảy ra <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="ngayXayRa"
                value={formData.ngayXayRa}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên vụ việc <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="tenVuViec"
                value={formData.tenVuViec}
                onChange={handleChange}
                required
                placeholder="VD: Vi phạm trật tự công cộng tại khu vực..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mức độ vi phạm <span className="text-red-600">*</span>
              </label>
              <select
                name="mucDoViPham"
                value={formData.mucDoViPham}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NONG">Nóng</option>
                <option value="RAT_NONG">Rất nóng</option>
                <option value="DAC_BIET_NONG">Đặc biệt nóng</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trạng thái <span className="text-red-600">*</span>
              </label>
              <select
                name="trangThai"
                value={formData.trangThai}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="DANG_XU_LY">Đang xử lý</option>
                <option value="TAM_DUNG">Tạm dừng</option>
                <option value="HOAN_THANH">Hoàn thành</option>
                <option value="CHUYEN_GIAI">Chuyển giải</option>
                <option value="HUY_BO">Hủy bỏ</option>
              </select>
            </div>
          </div>
        </div>

        {/* Địa điểm xảy ra */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Địa điểm xảy ra
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa điểm chi tiết <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="diaDiemXayRa"
                value={formData.diaDiemXayRa}
                onChange={handleChange}
                required
                placeholder="Số nhà, tên đường, địa danh..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xã/Phường
              </label>
              <input
                type="text"
                name="xaPhuong"
                value={formData.xaPhuong}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quận/Huyện
              </label>
              <input
                type="text"
                name="quanHuyen"
                value={formData.quanHuyen}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tỉnh/Thành phố
              </label>
              <input
                type="text"
                name="tinhThanh"
                value={formData.tinhThanh}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Đối tượng liên quan */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Đối tượng liên quan
          </h2>
          <p className="text-sm text-gray-600 mb-4">
            Chọn các đối tượng tham gia vụ việc này
          </p>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg">
            {doiTuongs.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                Chưa có đối tượng nào trong hệ thống
              </div>
            ) : (
              <div className="divide-y divide-gray-200">
                {doiTuongs.map((dt) => (
                  <label
                    key={dt.id}
                    className="flex items-center p-4 hover:bg-gray-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={selectedDoiTuongs.includes(dt.id)}
                      onChange={() => handleDoiTuongToggle(dt.id)}
                      className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {dt.hoTen}
                      </div>
                      <div className="text-sm text-gray-500">
                        CMND/CCCD: {dt.soCMND_CCCD}
                        {dt.tenGoiKhac && ` • Aka: ${dt.tenGoiKhac}`}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            )}
          </div>
          <div className="mt-3 text-sm text-gray-600">
            Đã chọn: <span className="font-semibold">{selectedDoiTuongs.length}</span> đối tượng
          </div>
        </div>

        {/* Nội dung vụ việc */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Nội dung vụ việc
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tóm tắt nội dung <span className="text-red-600">*</span>
              </label>
              <textarea
                name="tomTatNoiDung"
                value={formData.tomTatNoiDung}
                onChange={handleChange}
                required
                rows={6}
                placeholder="Mô tả chi tiết diễn biến, hành vi vi phạm, người liên quan..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Kết quả xử lý
              </label>
              <textarea
                name="ketQuaXuLy"
                value={formData.ketQuaXuLy}
                onChange={handleChange}
                rows={4}
                placeholder="Các biện pháp đã áp dụng, kết quả xử lý..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleChange}
                rows={3}
                placeholder="Thông tin bổ sung, lưu ý đặc biệt..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-4 bg-white rounded-xl shadow-lg p-6">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý..." : "Thêm vụ việc"}
          </button>
        </div>
      </form>
    </div>
  );
}
