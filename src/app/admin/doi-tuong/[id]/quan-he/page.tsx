"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { hoSoDoiTuongApi, danhMucApi } from "@/lib/api";

interface QuanHe {
  id: string;
  doiTuongLienQuan: string;
  quanHeId: string;
  moTa?: string;
  tenDoiTuong?: string;
  tenQuanHe?: string;
}

export default function QuanHeDoiTuongPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [quanHeList, setQuanHeList] = useState<QuanHe[]>([]);
  const [danhSachQuanHe, setDanhSachQuanHe] = useState<any[]>([]);
  const [allDoiTuong, setAllDoiTuong] = useState<any[]>([]);

  // Form thêm quan hệ
  const [showAddForm, setShowAddForm] = useState(false);
  const [addFormData, setAddFormData] = useState({
    doiTuongLienQuan: "",
    quanHeId: "",
    moTa: "",
  });

  useEffect(() => {
    if (id) {
      fetchData();
      fetchDanhSachQuanHe();
      fetchAllDoiTuong();
    }
  }, [id]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoDoiTuongApi.getOne(id);
      setData(response.data);
      // TODO: Fetch quan hệ của đối tượng này
      // Giả sử sẽ có API endpoint /ho-so-doi-tuong/:id/quan-he
      setQuanHeList([]);
    } catch (error) {
      console.error("Lỗi khi tải thông tin:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchDanhSachQuanHe = async () => {
    try {
      const response = await danhMucApi.getQuanHeXaHoi();
      setDanhSachQuanHe(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách quan hệ:", error);
    }
  };

  const fetchAllDoiTuong = async () => {
    try {
      const response = await hoSoDoiTuongApi.getAll({ pageSize: 1000 });
      setAllDoiTuong((response.data || []).filter((dt: any) => dt.id !== id));
    } catch (error) {
      console.error("Lỗi khi tải danh sách đối tượng:", error);
    }
  };

  const handleAddQuanHe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!addFormData.doiTuongLienQuan || !addFormData.quanHeId) {
      alert("Vui lòng chọn đầy đủ thông tin!");
      return;
    }

    try {
      // TODO: Call API to add relation
      // await quanHeDoiTuongApi.create({
      //   doiTuongChinh: id,
      //   doiTuongLienQuan: addFormData.doiTuongLienQuan,
      //   quanHeId: addFormData.quanHeId,
      //   moTa: addFormData.moTa,
      // });
      alert("Thêm quan hệ thành công! (Cần tích hợp API)");
      setShowAddForm(false);
      setAddFormData({ doiTuongLienQuan: "", quanHeId: "", moTa: "" });
      fetchData();
    } catch (error) {
      alert("Có lỗi khi thêm quan hệ!");
      console.error(error);
    }
  };

  const handleDeleteQuanHe = async (quanHeId: string) => {
    if (!confirm("Bạn có chắc muốn xóa quan hệ này?")) return;

    try {
      // TODO: Call API to delete relation
      // await quanHeDoiTuongApi.delete(quanHeId);
      alert("Xóa quan hệ thành công! (Cần tích hợp API)");
      fetchData();
    } catch (error) {
      alert("Có lỗi khi xóa quan hệ!");
      console.error(error);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-blue-600 hover:text-blue-700 mb-2 flex items-center gap-2"
        >
          ← Quay lại
        </button>
        <h1 className="text-3xl font-bold text-gray-900">
          Quản lý quan hệ: {data.hoTen}
        </h1>
        <p className="text-gray-600 mt-1">
          Quản lý mối quan hệ với các đối tượng khác
        </p>
      </div>

      {/* Thông tin đối tượng */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-start gap-4">
          {data.anhDaiDien && (
            <img
              src={data.anhDaiDien}
              alt={data.hoTen}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          )}
          <div>
            <h2 className="text-2xl font-bold text-gray-900">{data.hoTen}</h2>
            <div className="mt-2 space-y-1 text-sm text-gray-600">
              {data.soCMND_CCCD && <p>📇 CMND/CCCD: {data.soCMND_CCCD}</p>}
              {data.ngaySinh && (
                <p>
                  🎂 Ngày sinh:{" "}
                  {new Date(data.ngaySinh).toLocaleDateString("vi-VN")}
                </p>
              )}
              {data.diaChiThuongTru && <p>📍 {data.diaChiThuongTru}</p>}
            </div>
          </div>
        </div>
      </div>

      {/* Danh sách quan hệ */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">
            Mối quan hệ ({quanHeList.length})
          </h2>
          <button
            onClick={() => setShowAddForm(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
          >
            + Thêm quan hệ
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <form
            onSubmit={handleAddQuanHe}
            className="mb-6 p-4 bg-blue-50 rounded-lg border-2 border-blue-200"
          >
            <h3 className="font-bold text-gray-900 mb-4">Thêm quan hệ mới</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Đối tượng liên quan <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.doiTuongLienQuan}
                  onChange={(e) =>
                    setAddFormData({
                      ...addFormData,
                      doiTuongLienQuan: e.target.value,
                    })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn đối tượng --</option>
                  {allDoiTuong.map((dt) => (
                    <option key={dt.id} value={dt.id}>
                      {dt.hoTen} {dt.soCMND_CCCD && `(${dt.soCMND_CCCD})`}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Loại quan hệ <span className="text-red-500">*</span>
                </label>
                <select
                  value={addFormData.quanHeId}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, quanHeId: e.target.value })
                  }
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Chọn loại quan hệ --</option>
                  {danhSachQuanHe.map((qh) => (
                    <option key={qh.id} value={qh.id}>
                      {qh.tenQuanHe}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mô tả
                </label>
                <input
                  type="text"
                  value={addFormData.moTa}
                  onChange={(e) =>
                    setAddFormData({ ...addFormData, moTa: e.target.value })
                  }
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mô tả chi tiết..."
                />
              </div>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Thêm
              </button>
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                Hủy
              </button>
            </div>
          </form>
        )}

        {/* List */}
        {quanHeList.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p className="text-6xl mb-4">👥</p>
            <p>Chưa có quan hệ nào được thiết lập</p>
            <p className="text-sm mt-2">
              Nhấn "Thêm quan hệ" để liên kết với đối tượng khác
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {quanHeList.map((qh) => (
              <div
                key={qh.id}
                className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-semibold">
                        {qh.tenQuanHe}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900">{qh.tenDoiTuong}</h3>
                    {qh.moTa && (
                      <p className="text-sm text-gray-600 mt-1">{qh.moTa}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDeleteQuanHe(qh.id)}
                    className="text-red-600 hover:text-red-700 p-2"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Note */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Lưu ý:</strong> Chức năng này cần tích hợp với API backend để
          quản lý quan hệ đối tượng. Hiện tại đang ở chế độ demo.
        </p>
      </div>
    </div>
  );
}
