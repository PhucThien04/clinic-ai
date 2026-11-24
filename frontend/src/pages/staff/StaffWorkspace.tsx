import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import {Plus,RefreshCw,Pencil,Check,X} from 'lucide-react';
import {ManagementModal} from '../../components/management/ManagementModal';
import {IconButton} from '../../components/management/IconButton';
import {ManagementForm,ManagementMessages,ManagementTabs} from '../../components/management/ManagementForm';
import {useStaffWorkspace} from '../../hooks/useStaffWorkspace';
import {formatDate} from '../../utils/dateUtils';
import {options} from '../../utils/managementConfig';
export default function StaffWorkspace(){
  const staff=useStaffWorkspace();
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-5">
    <header className="flex flex-wrap items-center justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Quản lý lịch đặt & Ca làm việc</h1><p className="mt-1 text-sm text-slate-500">Xác nhận lịch trước khi tiếp nhận lâm sàng và điều phối ca bác sĩ.</p></div>
      <IconButton label="Tải lại" icon={RefreshCw} spinning={staff.loading} onClick={()=>void staff.load()} disabled={staff.loading||staff.saving}/></header>
    <ManagementTabs value={staff.tab} onChange={staff.setTab} disabled={staff.saving} tabs={[{value:'appointments',label:'Duyệt lịch đặt khám'},{value:'schedules',label:'Quản lý ca làm việc'}]}/>
    <ManagementMessages error={staff.error} message={staff.message} loading={staff.loading}/>
    <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
      {staff.tab==='appointments'&&<><label className="text-sm text-slate-600">Ngày khám<input type="date" value={staff.date} onChange={event=>staff.setDate(event.target.value)} className="ml-2 rounded-lg border border-slate-200 p-2"/></label>
      {staff.date&&<button type="button" onClick={()=>staff.setDate('')} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-sky-600 hover:bg-sky-50">Tất cả ngày</button>}</>}
      {staff.tab==='appointments'&&<label className="text-sm text-slate-600">Trạng thái<select value={staff.status} onChange={event=>staff.setStatus(event.target.value)} className="ml-2 rounded-lg border border-slate-200 p-2"><option value="">Tất cả</option>{['Đã đặt','Đã xác nhận','Đang khám','Hoàn thành','Đã hủy'].map(state=><option key={state}>{state}</option>)}</select></label>}
      <input aria-label="Tìm kiếm" type="search" value={staff.search} onChange={event=>staff.setSearch(event.target.value)} placeholder={staff.tab==='appointments'?'Tên bệnh nhân / mã hồ sơ / SĐT':'Tên bác sĩ / mã ca'} className="min-w-56 flex-1 rounded-lg border border-slate-200 p-2 text-sm"/>
    </div>
    {staff.tab==='appointments'?<section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="p-3">Bệnh nhân / Người đặt</th><th className="p-3">Lịch khám</th><th className="p-3">Lý do / Trạng thái</th><th className="p-3">Thao tác</th></tr></thead>
        <tbody>{staff.filteredAppointments.map(row=><tr key={row.IdChiTietLD} className="border-b border-slate-100 align-top"><td className="p-3"><strong>{row.TenBenhNhan||'Chưa có tên'}</strong><p className="mt-1 text-xs text-slate-500">{row.IdHoSoBenhNhan} · {row.MoiQuanHe||'Bản thân'}</p><p className="mt-1 text-xs">{row.SoDienThoai||'Chưa có SĐT'} · Đặt bởi {row.TenNguoiDat}</p></td>
          <td className="p-3">{formatDate(row.NgayLamViec)} · {row.GioBatDau.slice(0,5)}–{row.GioKetThuc.slice(0,5)}<p className="mt-1 text-xs text-slate-500">{row.TenBacSi} · {row.TenPhongKham}</p></td>
          <td className="p-3"><p>{row.LiDoKham||'Chưa ghi nhận'}</p><p className="mt-2 font-semibold text-sky-700">{row.TrangThai}</p>{row.GhiChu&&<p className="mt-1 text-xs text-slate-500">{row.GhiChu}</p>}</td>
          <td className="p-3"><div className="flex gap-2">{row.TrangThai==='Đã đặt'&&<IconButton label="Xác nhận lịch đặt" icon={Check} tone="success" disabled={staff.saving} onClick={()=>void staff.updateStatus(row,'Đã xác nhận')}/>}
            {['Đã đặt','Đã xác nhận'].includes(row.TrangThai)&&<IconButton label="Hủy lịch đặt" icon={X} tone="danger" disabled={staff.saving} onClick={()=>void staff.updateStatus(row,'Đã hủy')}/>}</div></td></tr>)}</tbody></table>
      {!staff.filteredAppointments.length&&!staff.loading&&<p className="p-8 text-center text-slate-500">Không có lịch đặt phù hợp.</p>}
    </section>:<div>
      <section className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><h2 className="font-bold text-slate-900">Ngày làm việc</h2><div className="flex items-center gap-2">
          <label className="text-sm text-slate-600">Chọn ngày<input type="date" value={staff.scheduleDate} onChange={event=>{if(event.target.value)staff.setScheduleDate(event.target.value);}} className="ml-2 rounded-lg border border-slate-200 p-2"/></label>
          <IconButton label="Thêm ca làm việc" icon={Plus} tone="primary" disabled={staff.saving||staff.loading} onClick={()=>staff.openSchedule()}/></div></div>
        <div className="mb-5 flex gap-2 overflow-x-auto pb-2" aria-label="Ngày làm việc">{staff.availableScheduleDates.map(day=><button type="button" key={day} aria-pressed={staff.scheduleDate===day} onClick={()=>staff.setScheduleDate(day)} className={`shrink-0 rounded-lg border px-4 py-3 text-sm font-semibold ${staff.scheduleDate===day?'border-sky-600 bg-sky-600 text-white':'border-slate-200 bg-white text-slate-600 hover:bg-sky-50'}`}>{formatDate(day)}</button>)}</div>
        <p className="mb-4 text-sm text-slate-500">Các ca làm việc ngày {formatDate(staff.scheduleDate)}</p>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">{staff.filteredSchedules.map(row=><article key={row.IdLichLamViec} className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="mb-3 flex items-start justify-between gap-2"><h3 className="font-bold text-sky-600">{row.GioBatDau.slice(0,5)} – {row.GioKetThuc.slice(0,5)}</h3><IconButton label="Sửa ca làm việc" icon={Pencil} disabled={staff.saving} onClick={()=>staff.openSchedule(row)}/></div>
          <p className="font-semibold text-slate-900">BS. {row.TenBacSi}</p><p className="mt-1 text-sm text-slate-600">{row.TenPhongKham}</p>
          <span className={`mt-3 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${row.TrangThai==='Hoạt động'?'bg-teal-50 text-teal-700':'bg-amber-50 text-amber-800'}`}>{row.TrangThai}</span>
          <p className="mt-3 whitespace-pre-wrap text-xs text-slate-500">{row.GhiChu||'Không có ghi chú'}</p></article>)}</div>
        {!staff.filteredSchedules.length&&!staff.loading&&<p className="p-6 text-center text-sm text-slate-500">Không có ca làm việc phù hợp.</p>}
      </section>
      {staff.formOpen&&<ManagementModal title={staff.editingId?'Cập nhật ca làm việc':'Tạo ca làm việc'} busy={staff.saving} onClose={()=>staff.setFormOpen(false)}><ManagementForm hideTitle title="Thông tin ca làm việc" values={staff.form} onChange={staff.changeForm} onSubmit={staff.saveSchedule} saving={staff.saving} onCancel={()=>staff.setFormOpen(false)} fields={[
        {name:'IdBacSi',label:'Bác sĩ',options:[{value:'',label:'Chọn bác sĩ'},...staff.resources.doctors.map(row=>({value:row.IdTaiKhoan,label:row.HoTen}))]},
        {name:'IdPhongKham',label:'Phòng khám',options:[{value:'',label:'Chọn phòng khám'},...staff.resources.clinics.map(row=>({value:row.IdPhongKham,label:row.TenPhongKham}))]},
        {name:'NgayLamViec',label:'Ngày làm việc',type:'date'},{name:'GioBatDau',label:'Giờ bắt đầu',type:'time'},{name:'GioKetThuc',label:'Giờ kết thúc',type:'time'},
        {name:'TrangThai',label:'Trạng thái',options:options(['Hoạt động','Tạm ngưng'])},{name:'GhiChu',label:'Ghi chú',type:'textarea',required:false},
      ]}><ManagementMessages error={staff.error} message="" loading={false}/><p className="my-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Ca đã có lịch chưa hủy chỉ được sửa trạng thái hoặc ghi chú.</p></ManagementForm></ManagementModal>}
    </div>}
  </div></DashboardLayout>;
}
