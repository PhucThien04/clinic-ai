import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import {ClinicalAccess} from '../../components/clinical/ClinicalAccess';
import {ManagementForm,ManagementMessages} from '../../components/management/ManagementForm';
import {useAdminUsers} from '../../hooks/useAdminUsers';
import {options,userRoles} from '../../utils/managementConfig';
export default function AdminUsers(){return <ClinicalAccess roles={['Admin']}><UsersWorkspace/></ClinicalAccess>;}
function UsersWorkspace(){
  const admin=useAdminUsers();
  return <DashboardLayout><div className="mx-auto max-w-7xl space-y-5">
    <header className="flex flex-wrap justify-between gap-3"><div><h1 className="text-2xl font-bold text-slate-900">Quản lý tài khoản</h1><p className="mt-1 text-sm text-slate-500">Tạo tài khoản, phân vai trò và khóa/mở khóa người dùng.</p></div><button disabled={admin.saving} onClick={()=>admin.openUser()} className="rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white">Tạo tài khoản</button></header>
    <ManagementMessages error={admin.error} message={admin.message} loading={admin.loading}/>
    <div className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4"><input aria-label="Tìm tài khoản" type="search" value={admin.search} onChange={event=>admin.setSearch(event.target.value)} placeholder="Tên, tài khoản, số điện thoại..." className="min-w-56 flex-1 rounded-lg border border-slate-200 p-2 text-sm"/>
      <select aria-label="Lọc vai trò" value={admin.role} onChange={event=>admin.setRole(event.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm"><option value="">Tất cả vai trò</option>{userRoles.map(role=><option key={role}>{role}</option>)}</select>
      <select aria-label="Lọc trạng thái" value={admin.state} onChange={event=>admin.setState(event.target.value)} className="rounded-lg border border-slate-200 p-2 text-sm"><option value="">Tất cả trạng thái</option><option>Hoạt động</option><option>Khóa</option></select>
      <button disabled={admin.loading||admin.saving} onClick={()=>void admin.load()} className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-sky-600">Tải lại</button></div>
    <div className={`grid items-start gap-5 ${admin.formOpen?'xl:grid-cols-[minmax(0,1fr)_380px]':''}`}>
      <section className="overflow-x-auto rounded-xl border border-slate-200 bg-white p-4"><table className="w-full text-left text-sm"><thead className="border-b border-slate-200 text-slate-500"><tr><th className="p-3">Người dùng</th><th className="p-3">Liên hệ</th><th className="p-3">Vai trò / Trạng thái</th><th className="p-3">Thao tác</th></tr></thead>
        <tbody>{admin.filteredUsers.map(user=><tr key={user.IdTaiKhoan} className="border-b border-slate-100 align-top"><td className="p-3"><strong>{user.HoTen}</strong><p className="mt-1 text-xs text-slate-500">{user.TenTaiKhoan} · {user.IdTaiKhoan}</p></td><td className="p-3">{user.SoDienThoai}<p className="mt-1 text-xs text-slate-500">{user.Email||'Chưa có email'}</p></td><td className="p-3">{user.VaiTro}<p className={`mt-1 text-xs font-semibold ${user.TrangThai==='Khóa'?'text-amber-800':'text-teal-700'}`}>{user.TrangThai}</p></td><td className="p-3"><button disabled={admin.saving} onClick={()=>admin.openUser(user)} className="rounded-lg border border-slate-200 px-3 py-2 text-xs text-sky-600">Sửa / Phân quyền</button></td></tr>)}</tbody></table>
        {!admin.filteredUsers.length&&!admin.loading&&<p className="p-8 text-center text-slate-500">Không có tài khoản phù hợp.</p>}
      </section>
      {admin.formOpen&&<ManagementForm title={admin.editingId?'Cập nhật tài khoản':'Tạo tài khoản'} values={admin.form} onChange={admin.changeForm} onSubmit={admin.saveUser} saving={admin.saving} onCancel={()=>admin.setFormOpen(false)} fields={[
        {name:'TenTaiKhoan',label:'Tên đăng nhập',readOnly:!!admin.editingId,maxLength:100},
        {name:'MatKhau',label:admin.editingId?'Mật khẩu mới (trống để giữ nguyên)':'Mật khẩu',type:'password',required:!admin.editingId,maxLength:72},
        {name:'HoTen',label:'Họ và tên'},{name:'CCCD',label:'CCCD (12 chữ số)',readOnly:!!admin.editingId,maxLength:12,pattern:'[0-9]{12}'},
        ...(!admin.editingId?[{name:'NgaySinh',label:'Ngày sinh',type:'date',required:false},{name:'GioiTinh',label:'Giới tính',required:false,options:options(['','Nam','Nữ','Khác'])}]:[]),
        {name:'SoDienThoai',label:'Số điện thoại',type:'tel',maxLength:10,pattern:'[0-9]{10}'},{name:'Email',label:'Email',type:'email',required:false,maxLength:100},
        {name:'DiaChi',label:'Địa chỉ',required:false},{name:'VaiTro',label:'Vai trò',options:options(userRoles)},
        {name:'TrangThai',label:'Trạng thái',options:options(['Hoạt động','Khóa'])},
      ]}><p className="mb-4 rounded-lg bg-amber-50 p-3 text-xs text-amber-900">Không thể tự khóa hoặc tự đổi vai trò Admin đang đăng nhập.</p></ManagementForm>}
    </div>
  </div></DashboardLayout>;
}
