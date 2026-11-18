import { isAxiosError } from 'axios';

export function getCancellationErrorMessage(error: unknown): string {
  if (!isAxiosError<{ error?: string }>(error)) return 'Không thể hủy lịch hẹn. Vui lòng thử lại sau.';
  const message = error.response?.data?.error;
  if (error.response?.status === 400 && message?.includes('6 tiếng')) {
    return 'Không thể hủy lịch cận giờ khám. Vui lòng hủy trước giờ khám ít nhất 6 tiếng hoặc liên hệ phòng khám để được hỗ trợ.';
  }
  return message || 'Không thể hủy lịch hẹn. Vui lòng kiểm tra kết nối và thử lại.';
}

export function getProfileDeletionErrorMessage(error: unknown): string {
  if (!isAxiosError<{ error?: string }>(error)) return 'Không thể xóa hồ sơ. Vui lòng thử lại sau.';
  if (error.response?.status === 409) {
    return 'Không thể xóa hồ sơ đã có lịch sử khám bệnh tại phòng khám';
  }
  return error.response?.data?.error || 'Không thể xóa hồ sơ. Vui lòng kiểm tra kết nối và thử lại.';
}
