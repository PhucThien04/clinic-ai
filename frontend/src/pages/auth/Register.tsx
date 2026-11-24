import {getApiErrorMessage} from '../../utils/apiErrors';
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authService, type RegisterData } from '../../services/authService';
import { UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Register(): React.JSX.Element {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<RegisterData>({
    TenTaiKhoan: '',
    MatKhau: '',
    HoTen: '',
    CCCD: '',
    NgaySinh: '',
    GioiTinh: '',
    Email: '',
    SoDienThoai: '',
    DiaChi: '',
    VaiTro: 'Bệnh nhân' // Mặc định đăng ký public là Bệnh nhân
  });

  const [status, setStatus] = useState<{ type: 'success' | 'error' | '', msg: string }>({ type: '', msg: '' });
  const [loading, setLoading] = useState<boolean>(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: '', msg: '' });
    setLoading(true);

    try {
      const res = await authService.register(formData);
      setStatus({ type: 'success', msg: res.message || 'Đăng ký tài khoản thành công! Đang chuyển hướng...' });

      // Chuyển hướng sang trang đăng nhập sau 2 giây
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: unknown) {
      setStatus({ type: 'error', msg: getApiErrorMessage(err,'Lỗi khi đăng ký tài khoản!') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div  className="max-w-150! [margin:40px_auto]!">
      <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm p-9!" >

        <div  className="text-center! mb-7!">
          <div  className="w-14! h-14! bg-sky-100! rounded-full! flex! items-center! justify-center! [margin:0_auto_16px_auto]!">
            <UserPlus size={28} color="#0284c7" />
          </div>
          <h2  className="text-[22px]! text-slate-900!">Đăng Ký Tài Khoản Bệnh Nhân</h2>
          <p  className="text-slate-500! text-[14px]! mt-1!">Điền đầy đủ thông tin để tạo hồ sơ khám bệnh trực tuyến</p>
        </div>

        {status.msg && (
          <div  className={"flex!" + " " + "items-center!" + " " + "gap-2!" + " " + "[padding:12px_16px]!" + " " + "rounded-[8px]!" + " " + "mb-5!" + " " + (status.type === 'success' ? "[background:#dcfce7]!" : "bg-red-100!") + " " + (status.type === 'success' ? "[color:#166534]!" : "[color:#991b1b]!") + " " + (status.type === 'success' ? "[border:1px_solid_#bbf7d0]!" : "[border:1px_solid_#fecaca]!")}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span  className="text-[14px]! font-semibold!">{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit}  className="flex! flex-col! gap-5!">

          <div  className="grid! grid-cols-[1fr_1fr]! gap-5!">
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Tên đăng nhập <span  className="[color:red]!">*</span></label>
              <input type="text" name="TenTaiKhoan" value={formData.TenTaiKhoan} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="VD: nguyenvan_a" />
            </div>
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Mật khẩu <span  className="[color:red]!">*</span></label>
              <input type="password" name="MatKhau" value={formData.MatKhau} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="••••••••" />
            </div>
          </div>

          <div  className="grid! grid-cols-[1fr_1fr]! gap-5!">
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Họ và tên <span  className="[color:red]!">*</span></label>
              <input type="text" name="HoTen" value={formData.HoTen} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="VD: Nguyễn Văn A" />
            </div>
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Số CCCD <span  className="[color:red]!">*</span></label>
              <input type="text" name="CCCD" value={formData.CCCD} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="Nhập 12 số CCCD" />
            </div>
          </div>

          <div  className="grid! grid-cols-[1fr_1fr]! gap-5!">
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Số điện thoại <span  className="[color:red]!">*</span></label>
              <input type="text" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} required className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="VD: 0905123456" />
            </div>
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Email</label>
              <input type="email" name="Email" value={formData.Email} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="VD: email@example.com" />
            </div>
          </div>

          <div  className="grid! grid-cols-[1fr_1fr]! gap-5!">
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Ngày sinh</label>
              <input type="date" name="NgaySinh" value={formData.NgaySinh} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" />
            </div>
            <div>
              <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Giới tính</label>
              <select name="GioiTinh" value={formData.GioiTinh} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 bg-white!" >
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label  className="block! text-[13px]! font-semibold! text-slate-700! mb-[6px]!">Địa chỉ</label>
            <input type="text" name="DiaChi" value={formData.DiaChi} onChange={handleChange} className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15" placeholder="Nhập địa chỉ liên hệ..." />
          </div>

          <button type="submit" disabled={loading} className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 w-full! p-[14px]! text-[15px]! mt-2!" >
            {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản Bệnh Nhân'}
          </button>
        </form>

        <div  className="text-center! mt-6! text-[14px]! text-slate-500! [border-top:1px_solid_#e2e8f0]! pt-5!">
          Đã có tài khoản? <Link to="/login"  className="text-sky-600! font-semibold! no-underline!">Đăng nhập ngay</Link>
        </div>

      </div>
    </div>
  );
}