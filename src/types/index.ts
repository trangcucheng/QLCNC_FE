// Types for QLCNC System

// ===== AUTH & RBAC =====
export enum LoaiNguoiDung {
  CAN_BO_NGHIEP_VU = 'CAN_BO_NGHIEP_VU',
  LANH_DAO = 'LANH_DAO',
  QUAN_TRI_VIEN = 'QUAN_TRI_VIEN',
}

export interface User {
  id: string;
  hoTen: string;
  email: string;
  soDienThoai?: string;
  loaiNguoiDung: LoaiNguoiDung;
  trangThaiHoatDong: boolean;
  vaiTroNguoiDung?: VaiTroNguoiDung[];
}

export interface VaiTro {
  id: string;
  tenVaiTro: string;
  moTa?: string;
}

export interface Quyen {
  id: string;
  tenQuyen: string;
  moTa?: string;
}

export interface VaiTroNguoiDung {
  id: string;
  nguoiDungId: string;
  vaiTroId: string;
  vaiTro: VaiTro;
}

export interface VaiTroQuyen {
  id: string;
  vaiTroId: string;
  quyenId: string;
  quyen: Quyen;
}

export interface AuthUser extends User {
  roles: string[];        // Tên vai trò: ['Admin', 'Quản lý']
  permissions: string[];   // Tên quyền: ['ho-so-doi-tuong:read', 'ho-so-doi-tuong:create']
}

// ===== ENUMS =====
export enum GioiTinh {
  NAM = 'NAM',
  NU = 'NU',
}

export enum TrangThaiDoiTuong {
  DANG_THEO_DOI = 'DANG_THEO_DOI',
  TAM_GIAM = 'TAM_GIAM',
  DA_XU_LY = 'DA_XU_LY',
  CHUYEN_NOI_KHAC = 'CHUYEN_NOI_KHAC',
}

export enum TrangThaiHoSo {
  DANG_XU_LY = 'DANG_XU_LY',
  TAM_DUNG = 'TAM_DUNG',
  HOAN_THANH = 'HOAN_THANH',
  CHUYEN_GIAI = 'CHUYEN_GIAI',
  HUY_BO = 'HUY_BO',
}

export enum MucDoViPham {
  NONG = 'NONG',
  RAT_NONG = 'RAT_NONG',
  DAC_BIET_NONG = 'DAC_BIET_NONG',
}

export enum LoaiTaiLieu {
  HINH_ANH = 'HINH_ANH',
  VIDEO = 'VIDEO',
  TAI_LIEU = 'TAI_LIEU',
  CHUNG_CU_SO = 'CHUNG_CU_SO',
}

export interface HoSoDoiTuong {
  id: string;
  hoTen: string;
  tenGoiKhac?: string;
  gioiTinh: GioiTinh;
  ngaySinh: Date | string;
  noiSinh?: string;
  quocTich?: string;
  danToc?: string;
  tonGiao?: string;
  soCMND_CCCD?: string;
  ngayCapCMND?: Date | string;
  ngayCapCMND_CCCD?: Date | string;
  noiCapCMND?: string;
  noiCapCMND_CCCD?: string;
  soHoChieu?: string;
  trinhDoHocVan?: string;
  ngheNghiep?: string;
  noiLamViec?: string;
  soDienThoai?: string;
  email?: string;
  queQuanId?: string;
  diaChiQueQuan?: string;
  noiThuongTruId?: string;
  diaChiThuongTru?: string;
  xaPhuongThuongTru?: string;
  quanHuyenThuongTru?: string;
  tinhThanhThuongTru?: string;
  noiOHienTaiId?: string;
  diaChiHienTai?: string;
  diaChiTamTru?: string;
  xaPhuongTamTru?: string;
  quanHuyenTamTru?: string;
  tinhThanhTamTru?: string;
  tienAn?: string;
  tienSu?: string;
  dacDiemNhanDang?: string;
  trangThai: TrangThaiDoiTuong;
  ghiChu?: string;
  anhDaiDien?: string;
  fileAnh?: string[];
  ngayTao?: Date | string;
  ngayCapNhat?: Date | string;
  createdAt?: Date | string;
  updatedAt?: Date | string;
}

export interface HoSoVuViec {
  id: string;
  soHoSo: string;
  tenVuViec: string;
  moTaVuViec?: string;
  tomTatNoiDung?: string;
  ngayXayRa: Date | string;
  diaChiXayRa?: string;
  diaDiemXayRa?: string;
  xaPhuong?: string;
  quanHuyen?: string;
  tinhThanh?: string;
  donViHanhChinhId?: string;
  mucDoViPham: MucDoViPham;
  trangThai: TrangThaiHoSo;
  donViXuLy?: string;
  canBoXuLy?: string;
  ngayBatDauXuLy?: Date | string;
  ngayKetThuc?: Date | string;
  ketQuaXuLy?: string;
  ghiChu?: string;
  ngayTao?: Date | string;
  ngayCapNhat?: Date | string;
  VuViecDoiTuong?: Array<{
    id: string;
    vaiTro?: string;
    hoSoDoiTuong: HoSoDoiTuong;
  }>;
  vuViecDoiTuong?: Array<{
    id: string;
    vaiTro?: string;
    doiTuong: HoSoDoiTuong;
  }>;
  lichSuXuLy?: Array<{
    id: string;
    trangThaiCu?: TrangThaiHoSo;
    trangThaiMoi: TrangThaiHoSo;
    lyDo: string;
    nguoiThucHien: string;
    ngayThucHien: Date | string;
  }>;
}

export interface TaiLieuDoiTuong {
  id: string;
  hoSoDoiTuongId: string;
  loaiTaiLieu: string;
  tenFile: string;
  duongDanFile: string;
  kichThuoc?: number;
  createdAt?: Date | string;
}

export interface TaiLieuVuViec {
  id: string;
  hoSoVuViecId: string;
  loaiTaiLieu: string;
  tenFile: string;
  duongDanFile: string;
  kichThuoc?: number;
  createdAt?: Date | string;
}

export interface DashboardData {
  tongQuan: {
    tongDoiTuong: number;
    tongVuViec: number;
    vuViecDangXuLy: number;
    vuViecHoanThanh: number;
    doiTuongDangTheoDoi: number;
    doiTuongTamGiam: number;
  };
  vuViecTheoMucDo: Array<{
    mucDo: MucDoViPham;
    soLuong: number;
  }>;
  vuViecTheoTrangThai: Array<{
    trangThai: TrangThaiHoSo;
    soLuong: number;
  }>;
}

// Helper functions for display
export const getTrangThaiDoiTuongLabel = (status: TrangThaiDoiTuong): string => {
  const labels: Record<TrangThaiDoiTuong, string> = {
    DANG_THEO_DOI: 'Đang theo dõi',
    TAM_GIAM: 'Tạm giam',
    DA_XU_LY: 'Đã xử lý',
    CHUYEN_NOI_KHAC: 'Chuyển nơi khác',
  };
  return labels[status] || status;
};

export const getTrangThaiHoSoLabel = (status: TrangThaiHoSo): string => {
  const labels: Record<TrangThaiHoSo, string> = {
    DANG_XU_LY: 'Đang xử lý',
    TAM_DUNG: 'Tạm dừng',
    HOAN_THANH: 'Hoàn thành',
    CHUYEN_GIAI: 'Chuyển giai',
    HUY_BO: 'Hủy bỏ',
  };
  return labels[status] || status;
};

export const getMucDoViPhamLabel = (level: MucDoViPham): string => {
  const labels: Record<MucDoViPham, string> = {
    NONG: 'Nóng',
    RAT_NONG: 'Rất nóng',
    DAC_BIET_NONG: 'Đặc biệt nóng',
  };
  return labels[level] || level;
};

export const getGioiTinhLabel = (gender: GioiTinh): string => {
  return gender === GioiTinh.NAM ? 'Nam' : 'Nữ';
};

// Color helpers for status badges
export const getTrangThaiDoiTuongColor = (status: TrangThaiDoiTuong): string => {
  const colors: Record<TrangThaiDoiTuong, string> = {
    DANG_THEO_DOI: 'bg-brand-100 text-brand-800',
    TAM_GIAM: 'bg-red-100 text-red-800',
    DA_XU_LY: 'bg-green-100 text-green-800',
    CHUYEN_NOI_KHAC: 'bg-gray-100 text-gray-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getTrangThaiHoSoColor = (status: TrangThaiHoSo): string => {
  const colors: Record<TrangThaiHoSo, string> = {
    DANG_XU_LY: 'bg-yellow-100 text-yellow-800',
    TAM_DUNG: 'bg-orange-100 text-orange-800',
    HOAN_THANH: 'bg-green-100 text-green-800',
    CHUYEN_GIAI: 'bg-brand-100 text-brand-800',
    HUY_BO: 'bg-red-100 text-red-800',
  };
  return colors[status] || 'bg-gray-100 text-gray-800';
};

export const getMucDoViPhamColor = (level: MucDoViPham): string => {
  const colors: Record<MucDoViPham, string> = {
    NONG: 'bg-yellow-100 text-yellow-800',
    RAT_NONG: 'bg-orange-100 text-orange-800',
    DAC_BIET_NONG: 'bg-red-100 text-red-800',
  };
  return colors[level] || 'bg-gray-100 text-gray-800';
};
