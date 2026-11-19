import {ImageUploadField} from '../../components/management/ImageUploadField';
import {MediaImage} from '../../components/management/MediaImage';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import {Plus,RefreshCw,Pencil,Trash2} from 'lucide-react';
import {ManagementModal} from '../../components/management/ManagementModal';
import {IconButton} from '../../components/management/IconButton';
import {ManagementForm,ManagementMessages,ManagementTabs} from '../../components/management/ManagementForm';
import {useClinicManagement} from '../../hooks/useClinicManagement';
import {options} from '../../utils/managementConfig';
import {formatDateTime} from '../../utils/dateUtils';
export default function ClinicManagement(){
  const owner=useClinicManagement();
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-5">
    <header className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Quản lý phòng khám</h1><p className="mt-1 text-sm text-slate-500">Cập nhật thông tin phòng khám, danh mục dịch vụ và chương trình ưu đãi.</p></div><IconButton label="Tải lại" icon={RefreshCw} spinning={owner.loading} disabled={owner.loading||owner.saving} onClick={()=>void owner.load()}/></header>
    <ManagementTabs value={owner.tab} onChange={owner.switchTab} disabled={owner.saving} tabs={[{value:'info',label:'Thông tin phòng khám'},{value:'services',label:'Danh mục dịch vụ'},{value:'events',label:'Sự kiện & Ưu đãi'}]}/>
    <ManagementMessages error={owner.error} message={owner.message} loading={owner.loading}/>
    {owner.tab==='info'?<div className="w-full"><ManagementForm columns={2} submitLabel="Lưu thông tin phòng khám" title="Thông tin phòng khám hiện tại" values={owner.info} onChange={owner.changeInfo} onSubmit={owner.saveInfo} saving={owner.saving||owner.loading} fields={[
      {name:'TenPhongKham',label:'Tên phòng khám'},{name:'SoDienThoai',label:'Số điện thoại (10 chữ số)',type:'tel',maxLength:10,pattern:'[0-9]{10}'},
      {name:'Email',label:'Email',type:'email',maxLength:100},{name:'DiaChi',label:'Địa chỉ'},
      {name:'GioMoCua',label:'Giờ mở cửa',type:'time',required:false},{name:'GioDongCua',label:'Giờ đóng cửa',type:'time',required:false},
      {name:'GioiThieu',label:'Giới thiệu',type:'textarea',required:false,fullWidth:true},
    ]}/></div>:<div>
      <section className="rounded-xl border border-slate-200 bg-white p-5"><div className="mb-4 flex justify-between"><h2 className="font-bold text-slate-900">{owner.tab==='services'?'Danh mục dịch vụ':'Sự kiện & Ưu đãi'}</h2>
        <IconButton label={owner.tab==='services'?'Thêm dịch vụ':'Thêm sự kiện'} icon={Plus} tone="primary" disabled={owner.saving||owner.loading} onClick={()=>owner.tab==='services'?owner.openService():owner.openEvent()}/></div>
        <p className="mb-4 text-xs text-slate-500">Ngừng cung cấp dịch vụ hoặc ẩn sự kiện để gỡ khỏi nội dung công khai, giữ dữ liệu đã lưu.</p>
        <div className="space-y-3">{owner.tab==='services'?owner.services.map(row=><article key={row.IdDichVu} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4"><MediaImage src={row.HinhAnh} alt={row.TenDichVu} className="h-20 w-28 shrink-0 rounded-lg"/><div className="min-w-0 flex-1 break-words"><h3 className="font-semibold text-slate-900">{row.TenDichVu}</h3><p className="mt-1 text-sm text-teal-700">{row.Gia} VNĐ · {row.TrangThai}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{row.MoTa||'Chưa có mô tả'}</p></div><div className="flex shrink-0 gap-2"><IconButton label="Chỉnh sửa dịch vụ" icon={Pencil} disabled={owner.saving} onClick={()=>owner.openService(row)}/><IconButton label="Xóa dịch vụ" icon={Trash2} tone="danger" disabled={owner.saving} onClick={()=>void owner.deleteService(row.IdDichVu)}/></div></article>)
          :owner.events.map(row=><article key={row.IdSuKien} className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 p-4"><MediaImage src={row.HinhAnh} alt={row.TieuDe} className="h-20 w-28 shrink-0 rounded-lg"/><div className="min-w-0 flex-1 break-words"><h3 className="font-semibold text-slate-900">{row.TieuDe}</h3><p className="mt-1 text-xs text-sky-700">{row.TrangThai} · {formatDateTime(row.ThoiGianBatDau||'')||'Chưa đặt giờ'} {row.ThoiGianKetThuc?`– ${formatDateTime(row.ThoiGianKetThuc)}`:''}</p><p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">{row.NoiDung}</p></div><div className="flex shrink-0 gap-2"><IconButton label="Chỉnh sửa sự kiện" icon={Pencil} disabled={owner.saving} onClick={()=>owner.openEvent(row)}/><IconButton label="Xóa sự kiện" icon={Trash2} tone="danger" disabled={owner.saving} onClick={()=>void owner.deleteEvent(row.IdSuKien)}/></div></article>)}</div>
        {!owner.loading&&!(owner.tab==='services'?owner.services.length:owner.events.length)&&<p className="p-6 text-center text-sm text-slate-500">Chưa có dữ liệu. Hãy lưu thông tin phòng khám trước khi thêm mới.</p>}
      </section>
      {owner.formOpen&&<ManagementModal title={owner.tab==='services'?(owner.editingId?'Cập nhật dịch vụ':'Thêm dịch vụ'):(owner.editingId?'Cập nhật sự kiện':'Thêm sự kiện')} busy={owner.saving||owner.uploadingMedia} onClose={()=>owner.setFormOpen(false)}><ImageUploadField folder={owner.tab==='services'?'services':'events'} label="Hình ảnh" value={owner.tab==='services'?owner.serviceForm.HinhAnh:owner.eventForm.HinhAnh} onChange={value=>owner.tab==='services'?owner.changeService('HinhAnh',value):owner.changeEvent('HinhAnh',value)} disabled={owner.saving} onBusyChange={owner.setUploadingMedia}/><ManagementMessages error={owner.error} message="" loading={false}/>{owner.tab==='services'?<ManagementForm hideTitle title={owner.editingId?'Cập nhật dịch vụ':'Thêm dịch vụ'} values={owner.serviceForm} onChange={owner.changeService} onSubmit={owner.saveService} saving={owner.saving||owner.uploadingMedia} onCancel={()=>owner.setFormOpen(false)} fields={[
        {name:'TenDichVu',label:'Tên dịch vụ'},{name:'MoTa',label:'Mô tả',type:'textarea',required:false},{name:'Gia',label:'Giá (VNĐ)',type:'number',min:'0',step:'0.01'},
        {name:'TrangThai',label:'Trạng thái',options:options(['Hiển thị','Hoạt động','Ngừng cung cấp'])},
      ]}/>:<ManagementForm hideTitle title={owner.editingId?'Cập nhật sự kiện':'Thêm sự kiện'} values={owner.eventForm} onChange={owner.changeEvent} onSubmit={owner.saveEvent} saving={owner.saving||owner.uploadingMedia} onCancel={()=>owner.setFormOpen(false)} fields={[
        {name:'TieuDe',label:'Tiêu đề'},{name:'NoiDung',label:'Nội dung',type:'textarea',maxLength:20000},{name:'TrangThai',label:'Trạng thái',options:options(['Hiển thị','Ẩn'])},
        {name:'ThoiGianBatDau',label:'Ngày giờ bắt đầu',type:'datetime-local',required:false},{name:'ThoiGianKetThuc',label:'Ngày giờ kết thúc',type:'datetime-local',required:false},
      ]}/>}</ManagementModal>}
    </div>}
  </div></DashboardLayout>;
}
