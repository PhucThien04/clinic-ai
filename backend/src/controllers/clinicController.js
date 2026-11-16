const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

// 1. Cập nhật hoặc tạo thông tin phòng khám (Chủ phòng khám)
exports.upsertClinicInfo = async (req, res) => {
  try {
    const { IdPhongKham, ChuPhongKham, TenPhongKham, DiaChi, SoDienThoai, Email, GioiThieu, GioMoCua, GioDongCua } = req.body;

    if (!IdPhongKham || !ChuPhongKham || !TenPhongKham || !DiaChi || !SoDienThoai || !Email) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ thông tin bắt buộc của phòng khám!' });
    }

    const query = `
      INSERT INTO PHONGKHAM (IdPhongKham, ChuPhongKham, TenPhongKham, DiaChi, SoDienThoai, Email, GioiThieu, GioMoCua, GioDongCua)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      ON CONFLICT (IdPhongKham) 
      DO UPDATE SET 
        TenPhongKham = EXCLUDED.TenPhongKham,
        DiaChi = EXCLUDED.DiaChi,
        SoDienThoai = EXCLUDED.SoDienThoai,
        Email = EXCLUDED.Email,
        GioiThieu = EXCLUDED.GioiThieu,
        GioMoCua = EXCLUDED.GioMoCua,
        GioDongCua = EXCLUDED.GioDongCua
      RETURNING *
    `;

    const values = [IdPhongKham, ChuPhongKham, TenPhongKham, DiaChi, SoDienThoai, Email, GioiThieu || null, GioMoCua || null, GioDongCua || null];
    const result = await pool.query(query, values);

    return res.status(200).json({
      message: 'Cập nhật thông tin phòng khám thành công!',
      phongKham: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin phòng khám:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 2. Quản lý Sự kiện (Tạo sự kiện mới)
exports.createEvent = async (req, res) => {
  try {
    const { IdPhongKham, TieuDe, NoiDung, TrangThai, ThoiGianBatDau, ThoiGianKetThuc } = req.body;

    if (!IdPhongKham || !TieuDe || !NoiDung || !TrangThai) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ tiêu đề, nội dung và trạng thái sự kiện!' });
    }

    const idSuKien = generateId('SK'); // Chuẩn 13 ký tự

    const query = `
      INSERT INTO SUKIEN (IdSuKien, IdPhongKham, TieuDe, NoiDung, TrangThai, ThoiGianBatDau, ThoiGianKetThuc)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *
    `;
    const values = [idSuKien, IdPhongKham, TieuDe, NoiDung, TrangThai, ThoiGianBatDau || null, ThoiGianKetThuc || null];
    const result = await pool.query(query, values);

    return res.status(201).json({
      message: 'Tạo sự kiện thành công!',
      suKien: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi khi tạo sự kiện:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 3. Quản lý Dịch vụ (Thêm dịch vụ nha khoa mới)
exports.createService = async (req, res) => {
  try {
    const { IdPhongKham, TenDichVu, MoTa, Gia, TrangThai } = req.body;

    if (!IdPhongKham || !TenDichVu || Gia === undefined || !TrangThai) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ tên dịch vụ, giá và trạng thái!' });
    }

    const idDichVu = generateId('DV'); // Chuẩn 13 ký tự

    const query = `
      INSERT INTO DICHVU (IdDichVu, IdPhongKham, TenDichVu, MoTa, Gia, TrangThai)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const values = [idDichVu, IdPhongKham, TenDichVu, MoTa || null, Gia, TrangThai];
    const result = await pool.query(query, values);

    return res.status(201).json({
      message: 'Thêm dịch vụ thành công!',
      dichVu: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi khi thêm dịch vụ:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 4. Lấy danh sách dịch vụ của phòng khám
exports.getServices = async (req, res) => {
  try {
    const { idPhongKham } = req.query;
    let query = `SELECT * FROM DICHVU WHERE 1=1`;
    const values = [];

    if (idPhongKham) {
      values.push(idPhongKham);
      query += ` AND IdPhongKham = $1`;
    }

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách dịch vụ:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 5. Lấy danh sách sự kiện của phòng khám
exports.getEvents = async (req, res) => {
  try {
    const { idPhongKham } = req.query;
    let query = `SELECT * FROM SUKIEN WHERE 1=1`;
    const values = [];

    if (idPhongKham) {
      values.push(idPhongKham);
      query += ` AND IdPhongKham = $1`;
    }

    query += ` ORDER BY ThoiGianBatDau DESC`;

    const result = await pool.query(query, values);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách sự kiện:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};