import { useState, useEffect } from 'react';
import {clinicService} from '../services/clinicService';

export interface ServiceItem {
  HinhAnh?:string|null;
  IdDichVu: string;
  TenDichVu: string;
  MoTa: string;
  Gia: string;
}

export interface EventItem {
  HinhAnh?:string|null;
  IdSuKien: string;
  TieuDe: string;
  NoiDung: string;
  TrangThai: string;
  ThoiGianBatDau?: string;
  ThoiGianKetThuc?: string;
}

export function useClinic() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClinicData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [serviceRes, eventRes] = await Promise.all([
          clinicService.getServices(),
          clinicService.getEvents()
        ]);

        if (isMounted) {
          const normalizedServices: ServiceItem[] = (serviceRes.data || []).map((item: any) => ({
            HinhAnh: item.HinhAnh || item.hinhanh || null,
            IdDichVu: item.IdDichVu || item.iddichvu || item.id_dich_vu,
            TenDichVu: item.TenDichVu || item.tendichvu || item.ten_dich_vu,
            MoTa: item.MoTa || item.mota || item.mo_ta || '',
            Gia: item.Gia || item.gia || '0',
          }));

          const normalizedEvents: EventItem[] = (eventRes.data || []).map((item: any) => ({
            HinhAnh: item.HinhAnh || item.hinhanh || null,
            IdSuKien: item.IdSuKien || item.idsukien || item.id_su_kien,
            TieuDe: item.TieuDe || item.tieude || item.tieu_de,
            NoiDung: item.NoiDung || item.noidung || item.noi_dung || '',
            TrangThai: item.TrangThai || item.trangthai || item.trang_thai || 'Hiển thị',
            ThoiGianBatDau: item.ThoiGianBatDau || item.thoigianbatdau || item.thoi_gian_bat_dau || '',
            ThoiGianKetThuc: item.ThoiGianKetThuc || item.thoigianketthuc || item.thoi_gian_ket_thuc || '',
          }));

          setServices(normalizedServices);
          setEvents(normalizedEvents);
        }
      } catch (err: any) {
        if (isMounted) {
          console.error('Lỗi khi lấy dữ liệu phòng khám:', err);
          setError('Không thể kết nối đến cơ sở dữ liệu!');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClinicData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { services, events, loading, error };
}
