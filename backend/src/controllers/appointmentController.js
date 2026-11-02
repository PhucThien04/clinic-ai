const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

// 1. Bệnh nhân tạo lịch đặt khám mới
exports.createAppointment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    const { IdTaiKhoan, IdHoSoBenhNhan, IdLichLamViec, LiDoKham, GhiChu } = req.body;

    if (!IdTaiKhoan || !IdHoSoBenhNhan || !IdLichLamViec) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ tài khoản, hồ sơ bệnh nhân và ca làm việc!' });
    }

    // Tạo bản ghi trong bảng LICHDAT
    const idLichDat = generateId('LD'); // Chuẩn 13 ký tự
    const trangThaiLichDat = 'Đã đặt';

    const lichDatQuery = `
      INSERT INTO LICHDAT (IdLichDat, IdTaiKhoan, TrangThai)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const lichDatValues = [idLichDat, IdTaiKhoan, trangThaiLichDat];
    await client.query(lichDatQuery, lichDatValues);

    // Tạo bản ghi chi tiết trong bảng CHITIETLICHDAT
    const idChiTietLD = generateId('CT'); // Chuẩn 13 ký tự
    const chiTietQuery = `
      INSERT INTO CHITIETLICHDAT (IdChiTietLD, IdHoSoBenhNhan, IdLichLamViec, IdLichDat, LiDoKham, GhiChu)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const chiTietValues = [
      idChiTietLD,
      IdHoSoBenhNhan,
      IdLichLamViec,
      idLichDat,
      LiDoKham || null,
      GhiChu || null
    ];
    const newChiTiet = await client.query(chiTietQuery, chiTietValues);

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Đặt lịch khám thành công!',
      appointment: {
        IdLichDat: idLichDat,
        ...newChiTiet.rows[0]
      }
    });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error('Lỗi khi đặt lịch khám:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
};

// 2. Lấy danh sách lịch đặt
exports.getAppointments = async (req, res) => {
  try {
    const { idTaiKhoan } = req.query;
    let query = `
      SELECT 
        c.IdChiTietLD AS "IdChiTietLD",
        d.IdLichDat AS "IdLichDat",
        d.IdTaiKhoan AS "IdTaiKhoan",
        h.IdHoSoBenhNhan AS "IdHoSoBenhNhan",
        l.IdLichLamViec AS "IdLichLamViec",
        l.NgayLamViec AS "NgayLamViec",
        l.GioBatDau AS "GioBatDau",
        l.GioKetThuc AS "GioKetThuc",
        p.TenPhongKham AS "TenPhongKham",
        t.HoTen AS "TenBacSi",
        c.LiDoKham AS "LiDoKham",
        d.TrangThai AS "TrangThai"
      FROM CHITIETLICHDAT c
      JOIN LICHDAT d ON c.IdLichDat = d.IdLichDat
      JOIN HOSOBENHNHAN h ON c.IdHoSoBenhNhan = h.IdHoSoBenhNhan
      JOIN LICHLAMVIEC l ON c.IdLichLamViec = l.IdLichLamViec
      JOIN PHONGKHAM p ON l.IdPhongKham = p.IdPhongKham
      JOIN TAIKHOAN t ON l.IdBacSi = t.IdTaiKhoan
      WHERE 1=1
    `;
    const values = [];

    if (idTaiKhoan) {
      values.push(idTaiKhoan);
      query += ` AND d.IdTaiKhoan = $${values.length}`;
    }

    query += ` ORDER BY l.NgayLamViec DESC`;

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('Lỗi khi lấy danh sách lịch đặt:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};