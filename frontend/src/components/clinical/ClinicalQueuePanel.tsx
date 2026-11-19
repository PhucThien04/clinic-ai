import type { useClinicalQueue } from '../../hooks/useClinicalQueue';
import { formatDate } from '../../utils/dateUtils';

type Props = { state: ReturnType<typeof useClinicalQueue>; selectedId?: string;
  busy?: boolean; onSelect: (id: string) => void };

export function ClinicalQueuePanel({ state, selectedId, busy, onSelect }: Props) {
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    <div className="mb-4 flex items-center justify-between gap-3">
      <h2 className="font-bold text-slate-900">Danh sách lịch khám</h2>
      <button type="button" onClick={() => void state.refreshQueue()} disabled={state.loadingQueue || busy}
        className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-semibold text-sky-600 disabled:opacity-50">Tải lại</button>
    </div>
    <div className="space-y-3">
      {!state.all && <label className="block text-sm font-medium text-slate-700">Ngày khám (giờ Việt Nam)
        <input type="date" value={state.date} disabled={busy} required
          onChange={event => { if (event.target.value) state.setDate(event.target.value); }}
          className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm disabled:bg-slate-50" />
      </label>}
      <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={state.all} disabled={busy} onChange={event => state.setAll(event.target.checked)} />Xem tất cả các ngày
      </label>
      {state.isDoctor && <label className="flex items-center gap-2 text-sm text-slate-600">
        <input type="checkbox" checked={state.onlyMine} disabled={busy} onChange={event => state.setOnlyMine(event.target.checked)} />Chỉ ca của tôi
      </label>}
      <label className="block text-sm font-medium text-slate-700">Trạng thái
        <select value={state.statusFilter} onChange={event => state.setStatusFilter(event.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2 text-sm">
          <option value="all">Tất cả trạng thái</option><option value="waiting">Chờ đo sinh hiệu</option>
          <option value="inProgress">Đang khám</option><option value="completed">Hoàn thành</option>
        </select>
      </label>
      <label className="block text-sm font-medium text-slate-700">Tìm nhanh tên / mã hồ sơ
        <input type="search" value={state.search} onChange={event => state.setSearch(event.target.value)}
          placeholder="Nhập tên hoặc mã HS..." className="mt-1 w-full rounded-lg border border-slate-200 p-2 text-sm" />
      </label>
    </div>
    {state.queueError && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{state.queueError}</p>}
    <p aria-live="polite" className="my-4 text-xs text-slate-500">{state.loadingQueue ? 'Đang tải lịch khám...' : `${state.filteredQueue.length} lượt khám`}</p>
    <div className="max-h-[60vh] space-y-3 overflow-y-auto">
      {!state.loadingQueue && !state.queueError && !state.filteredQueue.length
        && <p className="py-6 text-center text-sm text-slate-500">Không có lịch khám phù hợp.</p>}
      {state.filteredQueue.map(item => <button key={item.IdChiTietLD} type="button"
        disabled={busy || state.loadingQueue} onClick={() => onSelect(item.IdHoSoBenhNhan)}
        aria-pressed={item.IdHoSoBenhNhan === selectedId}
        className={`w-full rounded-lg border p-3 text-left transition disabled:opacity-50 ${item.IdHoSoBenhNhan === selectedId ? 'border-sky-600 bg-sky-50' : 'border-slate-200 hover:border-sky-400'}`}>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <strong className="text-sm text-slate-900">{item.TenBenhNhan || 'Chưa có tên'}</strong>
          <span className={`rounded-full px-2 py-1 text-[11px] font-semibold ${item.TrangThaiLich === 'Hoàn thành' ? 'bg-teal-50 text-teal-700' : item.DaDoSinhHieu ? 'bg-sky-100 text-sky-700' : 'bg-amber-50 text-amber-800'}`}>
            {item.TrangThaiLich === 'Hoàn thành' ? 'Hoàn thành' : item.TrangThaiLich === 'Đang khám' ? 'Đang khám' : item.DaDoSinhHieu ? 'Đã đo sinh hiệu' : 'Chờ đo sinh hiệu'}
          </span>
        </div>
        <p className="mt-2 text-xs font-semibold text-sky-700">{formatDate(item.NgayLamViec)} · {item.GioBatDau.slice(0, 5)} – {item.GioKetThuc.slice(0, 5)}</p>
        <p className="mt-1 text-xs text-slate-500">{item.IdHoSoBenhNhan}{item.LoaiThongTin === 1 ? ` · ${item.MoiQuanHe || 'Người thân'}` : ' · Bản thân'}</p>
        <p className="mt-2 text-xs text-slate-600">BS. {item.TenBacSi}{item.LaCaCuaToi ? ' · Ca của tôi' : ''}</p>
        <p className="mt-1 text-xs text-slate-600">{item.LiDoKham || 'Chưa ghi lý do khám'}</p>
      </button>)}
    </div>
  </section>;
}
