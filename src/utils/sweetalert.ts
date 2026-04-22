import Swal from 'sweetalert2';

export const showSuccess = (message: string, title?: string) => {
  return Swal.fire({
    icon: 'success',
    title: title || 'Thành công!',
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#10b981',
  });
};

export const showError = (message: string, title?: string) => {
  return Swal.fire({
    icon: 'error',
    title: title || 'Lỗi!',
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#ef4444',
  });
};

export const showWarning = (message: string, title?: string) => {
  return Swal.fire({
    icon: 'warning',
    title: title || 'Cảnh báo!',
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#f59e0b',
  });
};

export const showInfo = (message: string, title?: string) => {
  return Swal.fire({
    icon: 'info',
    title: title || 'Thông báo',
    text: message,
    confirmButtonText: 'OK',
    confirmButtonColor: '#3b82f6',
  });
};

export const showConfirm = async (
  message: string,
  title?: string,
  confirmText: string = 'Xác nhận',
  cancelText: string = 'Hủy'
) => {
  const result = await Swal.fire({
    icon: 'question',
    title: title || 'Xác nhận',
    text: message,
    showCancelButton: true,
    confirmButtonText: confirmText,
    cancelButtonText: cancelText,
    confirmButtonColor: '#3b82f6',
    cancelButtonColor: '#6b7280',
  });
  return result.isConfirmed;
};
