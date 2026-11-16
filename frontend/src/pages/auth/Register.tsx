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
    } catch (err: any) {
      setStatus({ type: 'error', msg: err.response?.data?.error || 'Lỗi khi đăng ký tài khoản!' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '40px auto' }}>
      <div className="card" style={{ padding: '36px' }}>
        
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '56px', height: '56px', background: '#e0f2fe', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px auto' }}>
            <UserPlus size={28} color="#0284c7" />
          </div>
          <h2 style={{ fontSize: '22px', color: '#0f172a' }}>Đăng Ký Tài Khoản Bệnh Nhân</h2>
          <p style={{ color: '#64748b', fontSize: '14px', marginTop: '4px' }}>Điền đầy đủ thông tin để tạo hồ sơ khám bệnh trực tuyến</p>
        </div>

        {status.msg && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 16px', borderRadius: '8px', marginBottom: '20px', background: status.type === 'success' ? '#dcfce7' : '#fee2e2', color: status.type === 'success' ? '#166534' : '#991b1b', border: `1px solid ${status.type === 'success' ? '#bbf7d0' : '#fecaca'}` }}>
            {status.type === 'success' ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
            <span style={{ fontSize: '14px', fontWeight: 600 }}>{status.msg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Tên đăng nhập <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="TenTaiKhoan" value={formData.TenTaiKhoan} onChange={handleChange} required className="input-field" placeholder="VD: nguyenvan_a" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Mật khẩu <span style={{ color: 'red' }}>*</span></label>
              <input type="password" name="MatKhau" value={formData.MatKhau} onChange={handleChange} required className="input-field" placeholder="••••••••" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Họ và tên <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="HoTen" value={formData.HoTen} onChange={handleChange} required className="input-field" placeholder="VD: Nguyễn Văn A" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Số CCCD <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="CCCD" value={formData.CCCD} onChange={handleChange} required className="input-field" placeholder="Nhập 12 số CCCD" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Số điện thoại <span style={{ color: 'red' }}>*</span></label>
              <input type="text" name="SoDienThoai" value={formData.SoDienThoai} onChange={handleChange} required className="input-field" placeholder="VD: 0905123456" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Email</label>
              <input type="email" name="Email" value={formData.Email} onChange={handleChange} className="input-field" placeholder="VD: email@example.com" />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Ngày sinh</label>
              <input type="date" name="NgaySinh" value={formData.NgaySinh} onChange={handleChange} className="input-field" />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Giới tính</label>
              <select name="GioiTinh" value={formData.GioiTinh} onChange={handleChange} className="input-field" style={{ background: '#fff' }}>
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '13px', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>Địa chỉ</label>
            <input type="text" name="DiaChi" value={formData.DiaChi} onChange={handleChange} className="input-field" placeholder="Nhập địa chỉ liên hệ..." />
          </div>

          <button type="submit" disabled={loading} className="btn btn-primary" style={{ width: '100%', padding: '14px', fontSize: '15px', marginTop: '8px' }}>
            {loading ? 'Đang xử lý...' : 'Tạo Tài Khoản Bệnh Nhân'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px', fontSize: '14px', color: '#64748b', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          Đã có tài khoản? <Link to="/login" style={{ color: '#0284c7', fontWeight: 600, textDecoration: 'none' }}>Đăng nhập ngay</Link>
        </div>

      </div>
    </div>
  );
}