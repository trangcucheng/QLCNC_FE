"use client";

import { useEffect, useState } from "react";
import { hoSoDoiTuongApi } from "@/lib/api";
import { useRouter, useParams } from "next/navigation";
import { showSuccess, showError } from "@/utils/sweetalert";

export default function ChinhSuaDoiTuongPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    hoTen: "",
    tenGoiKhac: "",
    ngaySinh: "",
    gioiTinh: "NAM",
    soCMND_CCCD: "",
    ngayCapCMND_CCCD: "",
    noiCapCMND_CCCD: "",
    soDienThoai: "",
    email: "",
    diaChiThuongTru: "",
    xaPhuongThuongTru: "",
    quanHuyenThuongTru: "",
    tinhThanhThuongTru: "",
    diaChiTamTru: "",
    xaPhuongTamTru: "",
    quanHuyenTamTru: "",
    tinhThanhTamTru: "",
    ngheNghiep: "",
    noiLamViec: "",
    trinhDoHocVan: "",
    danToc: "",
    tonGiao: "",
    quocTich: "Việt Nam",
    tienAn: "",
    dacDiemNhanDang: "",
    trangThai: "DANG_THEO_DOI",
    ghiChu: "",
  });

  useEffect(() => {
    document.title = "Chỉnh sửa Đối tượng | QLCNC";
  }, []);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoDoiTuongApi.getOne(id);
      const data = response.data;

      // Format ngày tháng để hiển thị trong input type="date"
      const formatDate = (date: any) => {
        if (!date) return "";
        const d = new Date(date);
        return d.toISOString().split("T")[0];
      };

      setFormData({
        hoTen: data.hoTen || "",
        tenGoiKhac: data.tenGoiKhac || "",
        ngaySinh: formatDate(data.ngaySinh),
        gioiTinh: data.gioiTinh || "NAM",
        soCMND_CCCD: data.soCMND_CCCD || "",
        ngayCapCMND_CCCD: formatDate(data.ngayCapCMND_CCCD),
        noiCapCMND_CCCD: data.noiCapCMND_CCCD || "",
        soDienThoai: data.soDienThoai || "",
        email: data.email || "",
        diaChiThuongTru: data.diaChiThuongTru || "",
        xaPhuongThuongTru: data.xaPhuongThuongTru || "",
        quanHuyenThuongTru: data.quanHuyenThuongTru || "",
        tinhThanhThuongTru: data.tinhThanhThuongTru || "",
        diaChiTamTru: data.diaChiTamTru || "",
        xaPhuongTamTru: data.xaPhuongTamTru || "",
        quanHuyenTamTru: data.quanHuyenTamTru || "",
        tinhThanhTamTru: data.tinhThanhTamTru || "",
        ngheNghiep: data.ngheNghiep || "",
        noiLamViec: data.noiLamViec || "",
        trinhDoHocVan: data.trinhDoHocVan || "",
        danToc: data.danToc || "",
        tonGiao: data.tonGiao || "",
        quocTich: data.quocTich || "Việt Nam",
        tienAn: data.tienAn || "",
        dacDiemNhanDang: data.dacDiemNhanDang || "",
        trangThai: data.trangThai || "DANG_THEO_DOI",
        ghiChu: data.ghiChu || "",
      });
    } catch (error) {
      console.error("Lỗi khi tải thông tin đối tượng:", error);
      showError("Không tìm thấy đối tượng này!");
      router.back();
    } finally {
      setLoading(false);
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      // Xử lý dữ liệu trước khi gửi
      const submitData = {
        ...formData,
        ngaySinh: formData.ngaySinh
          ? new Date(formData.ngaySinh).toISOString()
          : undefined,
        ngayCapCMND_CCCD: formData.ngayCapCMND_CCCD
          ? new Date(formData.ngayCapCMND_CCCD).toISOString()
          : undefined,
      };

      await hoSoDoiTuongApi.update(id, submitData);
      showSuccess("Cập nhật đối tượng thành công!");
      router.push(`/admin/doi-tuong/${id}`);
    } catch (err: any) {
      setError(err.message || "Có lỗi xảy ra khi cập nhật đối tượng");
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
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
        >
          ← Quay lại
        </button>
        <h5 className="text-3xl font-bold text-gray-900">Chỉnh sửa đối tượng</h5>
        <p className="text-gray-600 mt-1">
          Cập nhật thông tin đối tượng vi phạm pháp luật
        </p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Thông tin cá nhân */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông tin cá nhân
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Họ và Tên <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="hoTen"
                value={formData.hoTen}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên gọi khác (biệt danh)
              </label>
              <input
                type="text"
                name="tenGoiKhac"
                value={formData.tenGoiKhac}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày sinh <span className="text-red-600">*</span>
              </label>
              <input
                type="date"
                name="ngaySinh"
                value={formData.ngaySinh}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Giới tính <span className="text-red-600">*</span>
              </label>
              <select
                name="gioiTinh"
                value={formData.gioiTinh}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="NAM">Nam</option>
                <option value="NU">Nữ</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số CMND/CCCD
              </label>
              <input
                type="text"
                name="soCMND_CCCD"
                value={formData.soCMND_CCCD}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ngày cấp CMND/CCCD
              </label>
              <input
                type="date"
                name="ngayCapCMND_CCCD"
                value={formData.ngayCapCMND_CCCD}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nơi cấp CMND/CCCD
              </label>
              <input
                type="text"
                name="noiCapCMND_CCCD"
                value={formData.noiCapCMND_CCCD}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nghề nghiệp
              </label>
              <input
                type="text"
                name="ngheNghiep"
                value={formData.ngheNghiep}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nơi làm việc
              </label>
              <input
                type="text"
                name="noiLamViec"
                value={formData.noiLamViec}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Trình độ học vấn
              </label>
              <input
                type="text"
                name="trinhDoHocVan"
                value={formData.trinhDoHocVan}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dân tộc
              </label>
              <input
                type="text"
                name="danToc"
                value={formData.danToc}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tôn giáo
              </label>
              <input
                type="text"
                name="tonGiao"
                value={formData.tonGiao}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Quốc tịch
              </label>
              <input
                type="text"
                name="quocTich"
                value={formData.quocTich}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                <option value="DANG_THEO_DOI">Đang theo dõi</option>
                <option value="TAM_GIAM">Tạm giam</option>
                <option value="DA_XU_LY">Đã xử lý</option>
                <option value="CHUYEN_NOI_KHAC">Chuyển nơi khác</option>
              </select>
            </div>
          </div>
        </div>

        {/* Địa chỉ thường trú */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Địa chỉ thường trú
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="diaChiThuongTru"
                value={formData.diaChiThuongTru}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Số nhà, đường, ấp..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xã/Phường
              </label>
              <input
                type="text"
                name="xaPhuongThuongTru"
                value={formData.xaPhuongThuongTru}
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
                name="quanHuyenThuongTru"
                value={formData.quanHuyenThuongTru}
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
                name="tinhThanhThuongTru"
                value={formData.tinhThanhThuongTru}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Địa chỉ tạm trú */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Địa chỉ tạm trú (nếu có)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ
              </label>
              <input
                type="text"
                name="diaChiTamTru"
                value={formData.diaChiTamTru}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Số nhà, đường, ấp..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Xã/Phường
              </label>
              <input
                type="text"
                name="xaPhuongTamTru"
                value={formData.xaPhuongTamTru}
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
                name="quanHuyenTamTru"
                value={formData.quanHuyenTamTru}
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
                name="tinhThanhTamTru"
                value={formData.tinhThanhTamTru}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Thông tin bổ sung */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông tin bổ sung
          </h2>
          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tiền án
              </label>
              <textarea
                name="tienAn"
                value={formData.tienAn}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Mô tả tiền án (nếu có)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đặc điểm nhận dạng
              </label>
              <textarea
                name="dacDiemNhanDang"
                value={formData.dacDiemNhanDang}
                onChange={handleChange}
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ngoại hình, vết sẹo, hình xăm..."
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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ghi chú khác..."
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
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
      </form>
    </div>
  );
}
