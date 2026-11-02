const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

// 1. Tạo ca làm việc mới (Dành cho Nhân viên / Admin / Chủ phòng khám)
exports.createSchedule = async (req, res) => {
  try {
    const { IdBacSi, IdPhongKham, NgayLamViec, GioBatDau, GioKetThuc, TrangThai, GhiChu, NguoiCapNhat } = req.body;

    if (!IdBacSi || !IdPhongKham || !NgayLamViec || !GioBatDau || !GioKetThuc || !TrangThai || !NguoiCapNhat) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin ca làm việc!' });
    }

    const idLichLamViec = generateId('LLV'); // Chuẩn 13 ký tự

    const query = `
      INSERT INTO LICHLAMVIEC (IdLichLamViec, IdBacSi, IdPhongKham, NgayLamViec, GioBatDau, GioKetThuc, TrangThai, GhiChu, NguoiCapNhat)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING *
    `;

    const values = [
      idLichLamViec,
      IdBacSi,
      IdPhongKham,
      NgayLamViec,
      GioBatDau,
      GioKetThuc,
      TrangThai,
      GhiChu || null,
      NguoiCapNhat
    ];

    const newSchedule = await pool.query(query, values);

    return res.status(201).json({
      message: 'Tạo lịch làm việc thành công!',
      schedule: newSchedule.rows[0]
    });

  } catch (err) {
    console.error('Lỗi khi tạo lịch làm việc:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 2. Lấy danh sách lịch làm việc
exports.getSchedules = async (req, res) => {
  try {
    const { idBacSi, ngayLamViec } = req.query;
    let query = `
      SELECT 
        l.IdLichLamViec AS "IdLichLamViec",
        l.IdBacSi AS "IdBacSi",
        t.HoTen AS "TenBacSi",
        l.IdPhongKham AS "IdPhongKham",
        p.TenPhongKham AS "TenPhongKham",
        l.NgayLamViec AS "NgayLamViec",
        l.GioBatDau AS "GioBatDau",
        l.GioKetThuc AS "GioKetThuc",
        l.TrangThai AS "TrangThai",
        l.GhiChu AS "GhiChu"
      FROM LICHLAMVIEC l
      JOIN TAIKHOAN t ON l.IdBacSi = t.IdTaiKhoan
      JOIN PHONGKHAM p ON l.IdPhongKham = p.IdPhongKham
      WHERE 1=1
    `;
    const values = [];

    if (idBacSi) {
      values.push(idBacSi);
      query += ` AND l.IdBacSi = $${values.length}`;
    }

    if (ngayLamViec) {
      values.push(ngayLamViec);
      query += ` AND l.NgayLamViec = $${values.length}`;
    }

    query += ` ORDER BY l.NgayLamViec ASC, l.GioBatDau ASC`;

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('Lỗi khi lấy danh sách lịch làm việc:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};