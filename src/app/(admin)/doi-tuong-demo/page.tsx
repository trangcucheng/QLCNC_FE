"use client";

import { useEffect, useState } from "react";
import { hoSoDoiTuongApi } from "@/lib/api";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { Protected, usePermissions } from "@/components/auth/Protected";

interface DoiTuong {
  id: string;
  hoTen: string;
  soCMND_CCCD: string;
  ngaySinh: string;
  trangThai: string;
  diaChiThuongTru?: string;
}

/**
 * DEMO: Page Danh sách Đối tượng với RBAC
 * 
 * Phân quyền:
 * - Xem danh sách: ho-so-doi-tuong:read
 * - Thêm mới: ho-so-doi-tuong:create
 * - Chỉnh sửa: ho-so-doi-tuong:update
 * - Xóa: ho-so-doi-tuong:delete
 */
export default function DoiTuongDemoPage() {
  const router = useRouter();
  const { user, isAdmin, isLanhDao, isCanBoNghiepVu } = useAuth();
  const [data, setData] = useState<DoiTuong[]>([]);
  const [loading, setLoading] = useState(true);

  // Sử dụng usePermissions hook để check nhiều quyền cùng lúc
  const { canCreate, canUpdate, canDelete, canExport } = usePermissions({
    canCreate: "ho-so-doi-tuong:create",
    canUpdate: "ho-so-doi-tuong:update",
    canDelete: "ho-so-doi-tuong:delete",
    canExport: "bao-cao:export",
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const response = await hoSoDoiTuongApi.getAll();
      setData(response.data || []);
    } catch (error) {
      console.error("Lỗi khi tải dữ liệu:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, hoTen: string) => {
    // Kiểm tra quyền trước khi thực hiện
    if (!canDelete) {
      alert("❌ Bạn không có quyền xóa đối tượng!");
      return;
    }

    if (!confirm(\`Bạn có chắc muốn xóa đối tượng "\${hoTen}"?\`)) return;

    try {
      await hoSoDoiTuongApi.delete(id);
      alert("✅ Xóa thành công!");
      fetchData();
    } catch (error) {
      alert("❌ Có lỗi khi xóa!");
      console.error(error);
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
    <div className="p-6 space-y-6">
      {/* Info Panel - Hiển thị thông tin user và quyền */}
      <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
        <h3 className="font-bold text-blue-900 mb-2">
          🔐 Thông tin phân quyền (Demo)
        </h3>
        <div className="text-sm text-blue-800 space-y-1">
          <p>👤 <strong>Người dùng:</strong> {user?.hoTen}</p>
          <p>🎭 <strong>Vai trò:</strong> {
            isAdmin() ? "Quản trị viên (Full quyền)" :
            isLanhDao() ? "Lãnh đạo (Chỉ xem)" :
            isCanBoNghiepVu() ? "Cán bộ nghiệp vụ (CRUD)" :
            "Không xác định"
          }</p>
          <div>
            <strong>✅ Quyền hiện tại:</strong>
            <ul className="ml-4 mt-1">
              <li>✓ Xem danh sách (mặc định)</li>
              {canCreate && <li>✓ Thêm mới đối tượng</li>}
              {canUpdate && <li>✓ Chỉnh sửa đối tượng</li>}
              {canDelete && <li>✓ Xóa đối tượng</li>}
              {canExport && <li>✓ Xuất báo cáo</li>}
              {!canCreate && !canUpdate && !canDelete && <li>⚠️ Chỉ được xem</li>}
            </ul>
          </div>
        </div>
      </div>

      {/* Header với nút hành động */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Quản lý đối tượng
          </h1>
          <p className="text-gray-600 mt-1">
            Tổng số: {data.length} đối tượng
          </p>
        </div>

        <div className="flex gap-3">
          {/* Nút Thêm mới - chỉ hiện khi có quyền CREATE */}
          <Protected permission="ho-so-doi-tuong:create">
            <button
              onClick={() => router.push("/admin/doi-tuong/them-moi")}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              + Thêm đối tượng
            </button>
          </Protected>

          {/* Nút Xuất báo cáo - chỉ hiện khi có quyền EXPORT */}
          <Protected permission="bao-cao:export">
            <button
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              📥 Xuất Excel
            </button>
          </Protected>

          {/* Nút Admin - chỉ Admin mới thấy */}
          <Protected role="QUAN_TRI_VIEN">
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
            >
              ⚙️ Cài đặt
            </button>
          </Protected>
        </div>
      </div>

      {/* Bảng dữ liệu */}
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Họ tên
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                CMND/CCCD
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Ngày sinh
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                Địa chỉ
              </th>
              <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                Thao tác
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                  Chưa có dữ liệu
                </td>
              </tr>
            ) : (
              data.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="font-semibold text-gray-900">
                      {item.hoTen}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.soCMND_CCCD}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {new Date(item.ngaySinh).toLocaleDateString("vi-VN")}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {item.diaChiThuongTru || "-"}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {/* Nút Xem - tất cả đều có thể xem */}
                      <button
                        onClick={() => router.push(\`/admin/doi-tuong/\${item.id}\`)}
                        className="px-3 py-1 bg-blue-100 text-blue-700 rounded hover:bg-blue-200 text-sm font-medium"
                      >
                        👁️ Xem
                      </button>

                      {/* Nút Sửa - chỉ hiện khi có quyền UPDATE */}
                      {canUpdate && (
                        <button
                          onClick={() =>
                            router.push(\`/admin/doi-tuong/\${item.id}/chinh-sua\`)
                          }
                          className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded hover:bg-yellow-200 text-sm font-medium"
                        >
                          ✏️ Sửa
                        </button>
                      )}

                      {/* Nút Xóa - chỉ hiện khi có quyền DELETE */}
                      {canDelete && (
                        <button
                          onClick={() => handleDelete(item.id, item.hoTen)}
                          className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200 text-sm font-medium"
                        >
                          🗑️ Xóa
                        </button>
                      )}

                      {/* Không có quyền gì - chỉ hiện thông báo */}
                      {!canUpdate && !canDelete && (
                        <span className="px-3 py-1 bg-gray-100 text-gray-500 rounded text-sm">
                          Chỉ xem
                        </span>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Hướng dẫn sử dụng */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h3 className="font-bold text-yellow-900 mb-2">
          💡 Hướng dẫn test RBAC
        </h3>
        <ol className="text-sm text-yellow-800 space-y-1 list-decimal list-inside">
          <li>Login với các tài khoản khác nhau (Admin, Lãnh đạo, Cán bộ)</li>
          <li>Quan sát menu sidebar tự động thay đổi theo quyền</li>
          <li>Thử click các nút "Thêm mới", "Sửa", "Xóa"</li>
          <li>Nếu không có quyền, nút sẽ không hiển thị hoặc báo lỗi</li>
          <li>Admin thấy tất cả, Lãnh đạo chỉ xem, Cán bộ CRUD</li>
        </ol>
      </div>
    </div>
  );
}
