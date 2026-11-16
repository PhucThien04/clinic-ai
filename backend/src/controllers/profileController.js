const pool = require('../config/db');

// Lấy thông tin cá nhân của User hiện tại
exports.getProfile = async (req, res) => {
  try {
    const idTaiKhoan = req.user.IdTaiKhoan; 

    const query = `
      SELECT IdTaiKhoan, TenTaiKhoan, HoTen, CCCD, NgaySinh, GioiTinh, Email, SoDienThoai, DiaChi, VaiTro
      FROM TAIKHOAN
      WHERE IdTaiKhoan = $1
    `;
    const result = await pool.query(query, [idTaiKhoan]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản!' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy profile:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};

// Cập nhật thông tin cá nhân
exports.updateProfile = async (req, res) => {
  try {
    const idTaiKhoan = req.user.IdTaiKhoan;
    const { HoTen, NgaySinh, GioiTinh, Email, SoDienThoai, DiaChi } = req.body;

    const query = `
      UPDATE TAIKHOAN
      SET 
        HoTen = COALESCE($1, HoTen),
        NgaySinh = COALESCE($2, NgaySinh),
        GioiTinh = COALESCE($3, GioiTinh),
        Email = COALESCE($4, Email),
        SoDienThoai = COALESCE($5, SoDienThoai),
        DiaChi = COALESCE($6, DiaChi)
      WHERE IdTaiKhoan = $7
      RETURNING IdTaiKhoan, TenTaiKhoan, HoTen, CCCD, NgaySinh, GioiTinh, Email, SoDienThoai, DiaChi, VaiTro
    `;

    const values = [HoTen, NgaySinh, GioiTinh, Email, SoDienThoai, DiaChi, idTaiKhoan];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy tài khoản để cập nhật!' });
    }

    return res.status(200).json({
      message: 'Cập nhật thông tin cá nhân thành công!',
      profile: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật profile:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};