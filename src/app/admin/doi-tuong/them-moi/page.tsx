"use client";

import { useState, useEffect } from "react";
import { hoSoDoiTuongApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { Upload, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import type { UploadFile } from "antd";

export default function ThemDoiTuongPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fileList, setFileList] = useState<UploadFile[]>([]);
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
    document.title = "Thêm mới Đối tượng | QLCNC";
  }, []);

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
    setLoading(true);

    try {
      // Xử lý dữ liệu trước khi gửi
      const submitData = {
        ...formData,
        ngaySinh: formData.ngaySinh ? new Date(formData.ngaySinh).toISOString() : undefined,
        ngayCapCMND_CCCD: formData.ngayCapCMND_CCCD ? new Date(formData.ngayCapCMND_CCCD).toISOString() : undefined,
      };

      console.log('[Create] Submitting data:', submitData);
      const response = await hoSoDoiTuongApi.create(submitData);
      console.log('[Create] Response:', response);
      const doiTuongId = response.data.id;

      // Upload ảnh nếu có
      if (fileList.length > 0) {
        try {
          console.log('[Upload] Starting upload for', fileList.length, 'files');
          const files = fileList.map(file => file.originFileObj as File);
          const uploadResponse = await hoSoDoiTuongApi.uploadAnh(doiTuongId, files);
          console.log('[Upload] Upload response:', uploadResponse);
          message.success(`Thêm đối tượng thành công! Đã upload ${fileList.length} ảnh.`);
        } catch (uploadErr: any) {
          console.error('[Upload] Error:', uploadErr);
          message.warning(`Đã tạo đối tượng nhưng có lỗi khi upload ảnh: ${uploadErr.message}`);
        }
      } else {
        message.success("Thêm đối tượng thành công!");
      }

      router.push("/admin/doi-tuong");
    } catch (err: any) {
      console.error('[Create] Error:', err);
      setError(err.message || "Có lỗi xảy ra khi thêm đối tượng");
      message.error(err.message || "Có lỗi xảy ra khi thêm đối tượng");
    } finally {
      setLoading(false);
    }
  };

  const handleUploadChange = ({ fileList: newFileList }: any) => {
    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];
    const invalidFiles = newFileList.filter((file: any) => {
      const fileType = file.type || file.originFileObj?.type;
      return fileType && !validTypes.includes(fileType);
    });

    if (invalidFiles.length > 0) {
      message.error('Chỉ cho phép upload file ảnh (JPG, PNG, WEBP)!');
      // Remove invalid files
      const validFiles = newFileList.filter((file: any) => {
        const fileType = file.type || file.originFileObj?.type;
        return !fileType || validTypes.includes(fileType);
      });
      setFileList(validFiles);
      return;
    }

    // Validate file sizes (5MB max)
    const oversizedFiles = newFileList.filter((file: any) => {
      const size = file.size || file.originFileObj?.size;
      return size && size > 5 * 1024 * 1024;
    });

    if (oversizedFiles.length > 0) {
      message.error('Kích thước file không được vượt quá 5MB!');
      // Remove oversized files
      const validFiles = newFileList.filter((file: any) => {
        const size = file.size || file.originFileObj?.size;
        return !size || size <= 5 * 1024 * 1024;
      });
      setFileList(validFiles);
      return;
    }

    setFileList(newFileList);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
    </div>
  );

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="mb-6">
        <h5 className="text-3xl font-bold text-gray-900">Thêm Đối Tượng Mới</h5>
        <p className="text-gray-600 mt-1">
          Nhập thông tin đầy đủ về đối tượng vi phạm pháp luật
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
                <option value="KHAC">Khác</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Số CMND/CCCD <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="soCMND_CCCD"
                value={formData.soCMND_CCCD}
                onChange={handleChange}
                required
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
                Tiền án
              </label>
              <input
                type="text"
                name="tienAn"
                value={formData.tienAn}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
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
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                name="diaChiThuongTru"
                value={formData.diaChiThuongTru}
                onChange={handleChange}
                placeholder="Số nhà, tên đường..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            Địa chỉ tạm trú
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Địa chỉ chi tiết
              </label>
              <input
                type="text"
                name="diaChiTamTru"
                value={formData.diaChiTamTru}
                onChange={handleChange}
                placeholder="Số nhà, tên đường..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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

        {/* Thông tin khác */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Thông tin quản lý
          </h2>
          <div className="grid grid-cols-1 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Đặc điểm nhận dạng
              </label>
              <textarea
                name="dacDiemNhanDang"
                value={formData.dacDiemNhanDang}
                onChange={handleChange}
                rows={3}
                placeholder="Ngoại hình, sẹo, hình xăm, đặc điểm đặc biệt..."
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ghi chú
              </label>
              <textarea
                name="ghiChu"
                value={formData.ghiChu}
                onChange={handleChange}
                rows={4}
                placeholder="Thông tin bổ sung, ghi chú đặc biệt..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Upload ảnh */}
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Ảnh đối tượng</h2>
          <div>
            <Upload
              listType="picture-card"
              fileList={fileList}
              onChange={handleUploadChange}
              beforeUpload={() => false}
              multiple
              accept="image/*"
              maxCount={10}
            >
              {fileList.length >= 10 ? null : uploadButton}
            </Upload>
            <p className="text-sm text-gray-500 mt-2">
              Tải lên tối đa 10 ảnh. <strong>Chỉ chấp nhận:</strong> JPG, PNG, WEBP. <strong>Kích thước tối đa:</strong> 5MB/ảnh.
            </p>
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
            {loading ? "Đang xử lý..." : "Thêm đối tượng"}
          </button>
        </div>
      </form>
    </div>
  );
}
