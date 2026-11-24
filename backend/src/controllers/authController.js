const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { generateId } = require('../utils/idGenerator');
const { ensureSelfProfile } = require('../services/patientProfileService');

// 1. Đăng ký tài khoản
exports.register = async (req, res) => {
  let client;
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
      DiaChi
    } = req.body;
    const VaiTro = 'Bệnh nhân';

    // Kiểm tra các trường bắt buộc cơ bản
    if (!TenTaiKhoan || !MatKhau || !HoTen || !CCCD || !SoDienThoai) {
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

    // Hash mật khẩu theo quy tắc bảo mật
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(MatKhau, saltRounds);
    const idTaiKhoan = generateId('TK'); // Sử dụng helper chuẩn 13 ký tự
    const trangThai = 'Hoạt động';

    // Thêm mới vào bảng TAIKHOAN
    const query = `
      INSERT INTO TAIKHOAN (IdTaiKhoan, TenTaiKhoan, MatKhau, HoTen, CCCD, NgaySinh, GioiTinh, Email, SoDienThoai, DiaChi, TrangThai, VaiTro, ThoiDiemCapNhat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')
      RETURNING IdTaiKhoan AS "IdTaiKhoan", TenTaiKhoan AS "TenTaiKhoan",
        HoTen AS "HoTen", VaiTro AS "VaiTro", TrangThai AS "TrangThai"
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

    client = await pool.connect();
    await client.query('BEGIN');
    const newUser = await client.query(query, values);
    await ensureSelfProfile(client, idTaiKhoan);
    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Đăng ký tài khoản thành công!',
      user: newUser.rows[0]
    });

  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23505') return res.status(409).json({ error: 'Thông tin tài khoản đã được sử dụng.' });
    console.error('Lỗi khi đăng ký:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  } finally {
    if (client) client.release();
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
        Email AS "Email", TrangThai AS "TrangThai", AnhDaiDien AS "AnhDaiDien"
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

    if (user.TrangThai !== 'Hoạt động') {
      return res.status(403).json({ error: 'Tài khoản đã bị khóa. Vui lòng liên hệ phòng khám.' });
    }
    if (user.VaiTro === 'Bệnh nhân') {
      const client = await pool.connect();
      try {
        await client.query('BEGIN');
        await ensureSelfProfile(client, user.IdTaiKhoan);
        await client.query('COMMIT');
      } catch (error) {
        await client.query('ROLLBACK').catch(() => {});
        throw error;
      } finally {
        client.release();
      }
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
        Email: user.Email,
        AnhDaiDien: user.AnhDaiDien
      }
    });

  } catch (err) {
    console.error('Lỗi khi đăng nhập:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};
