import {Plus,RefreshCw,Pencil,Trash2} from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import {ManagementForm,ManagementMessages} from '../../components/management/ManagementForm';
import {ManagementModal} from '../../components/management/ManagementModal';
import {IconButton} from '../../components/management/IconButton';
import {ImageUploadField} from '../../components/management/ImageUploadField';
import {UserAvatar} from '../../components/management/MediaImage';
import {useAdminUsers} from '../../hooks/useAdminUsers';
import {options,userRoles} from '../../utils/managementConfig';

export default function AdminUsers(){
  const admin=useAdminUsers();
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-5">
    <header><h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1><p className="mt-1 text-sm text-slate-500">Tạo tài khoản, phân vai trò và khóa/mở khóa người dùng.</p></header>
    <ManagementMessages error={admin.selfWarning?'':admin.error} message={admin.message} loading={admin.loading}/>
    {!admin.formOpen&&admin.selfWarning&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{admin.selfWarning}</p>}
    <div className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white p-4">
      <input aria-label="Tìm tài khoản" type="search" value={admin.search} onChange={event=>admin.setSearch(event.target.value)} placeholder="Tên, tài khoản, số điện thoại..." className="min-w-56 flex-1 rounded-lg border border-slate-200 p-2 text-sm"/>
      <select aria-label="Lọc vai trò" value={admin.role} onChange={event=>admin.setRole(event.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm"><option value="">Tất cả vai trò</option>{userRoles.map(role=><option key={role}>{role}</option>)}</select>
      <select aria-label="Lọc trạng thái" value={admin.state} onChange={event=>admin.setState(event.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm"><option value="">Tất cả trạng thái</option><option>Hoạt động</option><option>Khóa</option></select>
      <div className="flex items-center gap-2">
        <IconButton label="Tạo tài khoản mới" icon={Plus} tone="primary" disabled={admin.saving||admin.loading} onClick={()=>admin.openUser()}/>
        <IconButton label="Tải lại" icon={RefreshCw} spinning={admin.loading} disabled={admin.loading||admin.saving} onClick={()=>void admin.load()}/>
      </div>
    </div>
    <section className="w-full overflow-x-auto rounded-xl border border-slate-200 bg-white p-4">
      <table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="p-3">Người dùng</th><th className="p-3">Liên hệ</th><th className="p-3">Vai trò / Trạng thái</th><th className="p-3">Thao tác</th></tr></thead>
        <tbody>{admin.filteredUsers.map(user=><tr key={user.IdTaiKhoan} className="border-b border-slate-100 align-top">
          <td className="p-3"><div className="flex items-center gap-3"><UserAvatar src={user.AnhDaiDien} name={user.HoTen}/><div><strong>{user.HoTen}</strong><p className="mt-1 text-xs text-slate-500">{user.TenTaiKhoan} · {user.IdTaiKhoan}</p></div></div></td>
          <td className="p-3">{user.SoDienThoai}<p className="mt-1 text-xs text-slate-500">{user.Email||'Chưa có email'}</p></td>
          <td className="p-3">{user.VaiTro}<p className={`mt-1 text-xs font-semibold ${user.TrangThai==='Khóa'?'text-amber-800':'text-teal-700'}`}>{user.TrangThai}</p></td>
          <td className="p-3"><div className="flex gap-2">
            <IconButton label="Sửa thông tin & phân quyền" icon={Pencil} disabled={admin.saving} onClick={()=>admin.openUser(user)}/>
            <IconButton label="Xóa tài khoản" icon={Trash2} tone="danger" disabled={admin.saving||user.IdTaiKhoan===admin.currentUserId} onClick={()=>void admin.deleteUser(user.IdTaiKhoan)}/>
          </div></td>
        </tr>)}</tbody>
      </table>
      {!admin.filteredUsers.length&&!admin.loading&&<p className="p-8 text-center text-slate-500">Không có tài khoản phù hợp.</p>}
    </section>
    {admin.formOpen&&<ManagementModal title={admin.editingId?'Cập nhật tài khoản':'Tạo tài khoản mới'} busy={admin.saving||admin.uploadingMedia} onClose={()=>admin.setFormOpen(false)}>
      <ImageUploadField folder="avatars" label="Ảnh đại diện" value={admin.form.AnhDaiDien} onChange={value=>admin.changeForm('AnhDaiDien',value)} disabled={admin.saving} onBusyChange={admin.setUploadingMedia}/>
      <ManagementForm hideTitle title="Thông tin tài khoản" values={admin.form} onChange={admin.changeForm} onSubmit={admin.saveUser} saving={admin.saving||admin.uploadingMedia} onCancel={()=>admin.setFormOpen(false)} fields={[
        {name:'TenTaiKhoan',label:'Tên đăng nhập',readOnly:!!admin.editingId,maxLength:100},
        {name:'MatKhau',label:admin.editingId?'Mật khẩu mới (trống để giữ nguyên)':'Mật khẩu',type:'password',required:!admin.editingId,maxLength:72},
        {name:'HoTen',label:'Họ và tên'},{name:'CCCD',label:'CCCD (12 chữ số)',readOnly:!!admin.editingId,maxLength:12,pattern:'[0-9]{12}'},
        ...(!admin.editingId?[{name:'NgaySinh',label:'Ngày sinh',type:'date',required:false},{name:'GioiTinh',label:'Giới tính',required:false,options:options(['','Nam','Nữ','Khác'])}]:[]),
        {name:'SoDienThoai',label:'Số điện thoại',type:'tel',maxLength:10,pattern:'[0-9]{10}'},{name:'Email',label:'Email',type:'email',required:false,maxLength:100},
        {name:'DiaChi',label:'Địa chỉ',required:false},{name:'VaiTro',label:'Vai trò',options:options(userRoles)},
        {name:'TrangThai',label:'Trạng thái',options:options(['Hoạt động','Khóa'])},
      ]}>
        <ManagementMessages error={admin.selfWarning?'':admin.error} message="" loading={false}/>
        {admin.selfWarning&&<p role="alert" className="my-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">{admin.selfWarning}</p>}
      </ManagementForm>
    </ManagementModal>}
  </div></DashboardLayout>;
}
