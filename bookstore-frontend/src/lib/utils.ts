import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatPrice(value: number) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(value);
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString('vi-VN');
}

export function formatDateTime(value: string) {
  return new Date(value).toLocaleString('vi-VN');
}

export function translateOrderStatus(status: string) {
  const statuses: Record<string, string> = {
    PENDING: 'Chờ xác nhận',
    PROCESSING: 'Đang xử lý',
    SHIPPED: 'Đang giao',
    DELIVERED: 'Hoàn thành',
    CANCELLED: 'Đã hủy',
  };

  return statuses[status] || status;
}

export function translateApiMessage(message: unknown, fallback: string) {
  if (typeof message !== 'string') return fallback;

  const translations: Record<string, string> = {
    'Email and password are required': 'Vui lòng nhập email và mật khẩu.',
    'Invalid credentials': 'Email hoặc mật khẩu không chính xác.',
    'Please verify your email before signing in': 'Vui lòng xác minh email trước khi đăng nhập.',
    'User already exists': 'Email này đã được đăng ký.',
    'Email, password, and full name are required': 'Vui lòng nhập đầy đủ họ tên, email và mật khẩu.',
    'A valid email address is required': 'Vui lòng nhập địa chỉ email hợp lệ.',
    'Password must be at least 8 characters': 'Mật khẩu phải có ít nhất 8 ký tự.',
    'Full name is too long': 'Họ tên không được vượt quá 191 ký tự.',
    'Invalid or expired verification code': 'Mã xác minh không hợp lệ hoặc đã hết hạn.',
    'Invalid or expired reset code': 'Mã đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.',
    'Verification code is shown in the backend terminal for local development.': 'Mã xác minh đã được in trong cửa sổ terminal chạy backend.',
    'Verification code sent to your email': 'Mã xác minh đã được gửi đến email của bạn.',
    'If an account exists, its reset code is shown in the backend terminal.': 'Nếu email đã đăng ký, mã đặt lại mật khẩu đã được in trong terminal chạy backend.',
    'If an account exists for that email, a reset code has been sent.': 'Nếu email đã đăng ký, mã đặt lại mật khẩu đã được gửi.',
    'Email verified. You can now sign in.': 'Email đã được xác minh. Bạn có thể đăng nhập.',
    'Password reset successfully. You can now sign in.': 'Đặt lại mật khẩu thành công. Bạn có thể đăng nhập.',
    'Email delivery is not configured': 'Chưa cấu hình phương thức gửi email.',
    'Current password is incorrect': 'Mật khẩu hiện tại không chính xác.',
    'New password must be at least 8 characters': 'Mật khẩu mới phải có ít nhất 8 ký tự.',
    'New password must be different from the current password': 'Mật khẩu mới phải khác mật khẩu hiện tại.',
    'Full name is required': 'Vui lòng nhập họ tên.',
    'Phone number is invalid': 'Số điện thoại không hợp lệ.',
    'Address is invalid': 'Địa chỉ không hợp lệ.',
    'A user with this email already exists': 'Email này đã được một tài khoản khác sử dụng.',
    'At least one active administrator is required': 'Hệ thống cần ít nhất một tài khoản quản trị đang hoạt động.',
    'You cannot remove your own administrator role': 'Bạn không thể tự gỡ quyền quản trị của mình.',
    'You cannot deactivate your own account': 'Bạn không thể tự khóa tài khoản của mình.',
    'You cannot delete your own account': 'Bạn không thể tự xóa tài khoản của mình.',
    'This user has orders; deactivate the account instead': 'Tài khoản này có đơn hàng; hãy khóa tài khoản thay vì xóa.',
    'Account is inactive': 'Tài khoản này đã bị khóa.',
    'Role must be USER or ADMIN': 'Vai trò không hợp lệ.',
    'Select a valid cancellation reason': 'Vui lòng chọn một lý do hủy hợp lệ.',
    'Orders can only be cancelled while awaiting confirmation': 'Chỉ có thể hủy đơn hàng đang chờ xác nhận.',
  };

  return translations[message] || fallback;
}
