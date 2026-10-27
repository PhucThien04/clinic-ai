const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Hàm sinh mã ID tự động ngẫu nhiên (ví dụ: TK + 8 số ngẫu nhiên)
const generateIdTaiKhoan = () => {
  const randomNum = Math.floor(10000000 + Math.random() * 90000000);
  return `TK${randomNum}`;
};

// 1. Đăng ký tài khoản
exports.register = async (req, res) => {
  try {
    const {
      TenTaiKhoan,
      MatKhau,
      HoTen,
      CCCD,
      NgaySinh,
      GioiTinh,
      Email,
      SoDienThoai,
      DiaChi,
      VaiTro
    } = req.body;

    // Kiểm tra các trường bắt buộc cơ bản
    if (!TenTaiKhoan || !MatKhau || !HoTen || !CCCD || !SoDienThoai || !VaiTro) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc!' });
    }

    // Kiểm tra xem TenTaiKhoan hoặc CCCD hoặc SoDienThoai đã tồn tại chưa
    const checkExist = await pool.query(
      'SELECT * FROM TAIKHOAN WHERE TenTaiKhoan = $1 OR CCCD = $2 OR SoDienThoai = $3',
      [TenTaiKhoan, CCCD, SoDienThoai]
    );

    if (checkExist.rows.length > 0) {
      return res.status(400).json({ error: 'Tên tài khoản, CCCD hoặc Số điện thoại đã tồn tại trong hệ thống!' });
    }

    // Hash mật khẩu theo quy tắc bảo mật[cite: 19]
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(MatKhau, saltRounds);
    const idTaiKhoan = generateIdTaiKhoan();
    const trangThai = 'Hoạt động';

    // Thêm mới vào bảng TAIKHOAN[cite: 18]
    const query = `
      INSERT INTO TAIKHOAN (IdTaiKhoan, TenTaiKhoan, MatKhau, HoTen, CCCD, NgaySinh, GioiTinh, Email, SoDienThoai, DiaChi, TrangThai, VaiTro)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING IdTaiKhoan, TenTaiKhoan, HoTen, VaiTro, TrangThai
    `;

    const values = [
      idTaiKhoan,
      TenTaiKhoan,
      hashedPassword,
      HoTen,
      CCCD,
      NgaySinh || null,
      GioiTinh || null,
      Email || null,
      SoDienThoai,
      DiaChi || null,
      trangThai,
      VaiTro
    ];

    const newUser = await pool.query(query, values);

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: newUser.rows[0]
    });

  } catch (err) {
    console.error('Lỗi khi đăng ký:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 2. Đăng nhập tài khoản
exports.login = async (req, res) => {
  try {
    const { TenTaiKhoan, MatKhau } = req.body;

    if (!TenTaiKhoan || !MatKhau) {
      return res.status(400).json({ error: 'Vui lòng nhập tên tài khoản và mật khẩu!' });
    }

    // Tìm tài khoản và dùng AS với dấu ngoặc kép để giữ nguyên định dạng tên cột
    const result = await pool.query(
      `SELECT 
        IdTaiKhoan AS "IdTaiKhoan", 
        TenTaiKhoan AS "TenTaiKhoan", 
        MatKhau AS "MatKhau", 
        HoTen AS "HoTen", 
        VaiTro AS "VaiTro", 
        Email AS "Email" 
      FROM TAIKHOAN 
      WHERE TenTaiKhoan = $1`, 
      [TenTaiKhoan]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Tên tài khoản hoặc mật khẩu không chính xác!' });
    }

    const user = result.rows[0];

    // So sánh mật khẩu đã hash
    const isMatch = await bcrypt.compare(MatKhau, user.MatKhau);
    if (!isMatch) {
      return res.status(401).json({ error: 'Tên tài khoản hoặc mật khẩu không chính xác!' });
    }

    // Tạo JWT Token
    const token = jwt.sign(
      { IdTaiKhoan: user.IdTaiKhoan, VaiTro: user.VaiTro, TenTaiKhoan: user.TenTaiKhoan },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    return res.status(200).json({
      message: 'Đăng nhập thành công!',
      token,
      user: {
        IdTaiKhoan: user.IdTaiKhoan,
        TenTaiKhoan: user.TenTaiKhoan,
        HoTen: user.HoTen,
        VaiTro: user.VaiTro,
        Email: user.Email
      }
    });

  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};