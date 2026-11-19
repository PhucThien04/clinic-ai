import type { PatientExamDetail } from '../../services/examinationService';
import { formatDate } from '../../utils/dateUtils';

export function PatientExamSummary({ record }: { record: PatientExamDetail }) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="flex flex-wrap items-start justify-between gap-3">
      <div><h2 className="text-lg font-bold text-slate-900">{record.TenBenhNhan || 'Chưa có tên bệnh nhân'}</h2>
        <p className="mt-1 text-xs font-semibold text-sky-600">{record.IdHoSoBenhNhan} · {record.LoaiThongTin === 0 ? 'Bản thân' : record.MoiQuanHe || 'Người thân'}</p></div>
      <span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-700">{record.TrangThaiLich || 'Chưa gắn lịch khám'}</span>
    </div>
    <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
      <div><dt className="text-slate-500">Ngày sinh / Giới tính</dt><dd className="font-medium text-slate-800">{formatDate(record.NgaySinh || '') || 'Chưa cập nhật'} · {record.GioiTinh || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Số điện thoại</dt><dd className="font-medium text-slate-800">{record.SoDienThoai || 'Chưa cập nhật'}</dd></div>
      <div><dt className="text-slate-500">Lịch khám</dt><dd className="font-medium text-slate-800">{formatDate(record.NgayLamViec || '') || 'Chưa có lịch'} {record.GioBatDau?.slice(0, 5)}</dd></div>
      <div><dt className="text-slate-500">Bác sĩ / Phòng khám</dt><dd className="font-medium text-slate-800">{record.TenBacSi || 'Chưa phân công'} · {record.TenPhongKham || 'Chưa cập nhật'}</dd></div>
    </dl>
    <div className="mt-4 rounded-lg bg-slate-50 p-3 text-sm text-slate-700"><strong>Lý do khám: </strong>{record.LiDoKham || 'Chưa ghi nhận'}</div>
  </section>;
}
