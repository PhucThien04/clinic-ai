const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

// 1. Bệnh nhân tạo lịch đặt khám mới
exports.createAppointment = async (req, res) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    const { IdTaiKhoan, IdHoSoBenhNhan, IdLichLamViec, LiDoKham, GhiChu } =
      req.body;

    if (!IdTaiKhoan || !IdHoSoBenhNhan || !IdLichLamViec) {
      return res
        .status(400)
        .json({
          error:
            "Vui lòng cung cấp đầy đủ tài khoản, hồ sơ bệnh nhân và ca làm việc!",
        });
    }

    // Kiểm tra xem hồ sơ này đã gắn với lịch đặt nào hoặc đã có chẩn đoán chưa
    const profileCheck = await client.query(
      `SELECT 
        h.IdTaiKhoan, 
        h.LoaiThongTin,
        EXISTS(SELECT 1 FROM CHITIETLICHDAT c WHERE c.IdHoSoBenhNhan = h.IdHoSoBenhNhan) AS is_used,
        (h.ChuanDoan IS NOT NULL OR h.KetLuan IS NOT NULL) AS has_diagnosis
       FROM HOSOBENHNHAN h
       WHERE h.IdHoSoBenhNhan = $1`,
      [IdHoSoBenhNhan],
    );

    if (profileCheck.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Không tìm thấy hồ sơ bệnh nhân!" });
    }

    let targetHoSoId = IdHoSoBenhNhan;
    const { LoaiThongTin, is_used, has_diagnosis } = profileCheck.rows[0];

    // Nếu hồ sơ đã dùng cho lần khám khác -> tạo bản ghi HOSOBENHNHAN mới cho lượt khám này
    if (is_used || has_diagnosis) {
      targetHoSoId = generateId("HS");
      await client.query(
        `INSERT INTO HOSOBENHNHAN (IdHoSoBenhNhan, IdTaiKhoan, LoaiThongTin)
         VALUES ($1, $2, $3)`,
        [targetHoSoId, IdTaiKhoan, LoaiThongTin],
      );

      // Nếu là người thân (LoaiThongTin = 1), sao chép thông tin nhân thân sang hồ sơ khám mới
      if (LoaiThongTin === 1) {
        const relRes = await client.query(
          `SELECT MoiQuanHe, HoTen, CCCD, NgaySinh, GioiTinh, SoDienThoai, DiaChi
           FROM THONGTINNGUOITHAN
           WHERE IdHoSoBenhNhan = $1
           LIMIT 1`,
          [IdHoSoBenhNhan],
        );
        if (relRes.rows.length > 0) {
          const r = relRes.rows[0];
          await client.query(
            `INSERT INTO THONGTINNGUOITHAN (
              IdThongTinNguoiThan, IdHoSoBenhNhan, MoiQuanHe, HoTen, CCCD, NgaySinh, GioiTinh, SoDienThoai, DiaChi
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [
              generateId("NT"),
              targetHoSoId,
              r.moiquanhe,
              r.hoten,
              r.cccd,
              r.ngaysinh,
              r.gioitinh,
              r.sodienthoai,
              r.diachi,
            ],
          );
        }
      }
    }

    // Tạo bản ghi trong LICHDAT
    const idLichDat = generateId("LD");
    await client.query(
      `INSERT INTO LICHDAT (IdLichDat, IdTaiKhoan, TrangThai) VALUES ($1, $2, $3)`,
      [idLichDat, IdTaiKhoan, "Đã đặt"],
    );

    // Tạo bản ghi trong CHITIETLICHDAT gắn với targetHoSoId riêng biệt
    const idChiTietLD = generateId("CT");
    const newChiTiet = await client.query(
      `INSERT INTO CHITIETLICHDAT (IdChiTietLD, IdHoSoBenhNhan, IdLichLamViec, IdLichDat, LiDoKham, GhiChu)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        idChiTietLD,
        targetHoSoId,
        IdLichLamViec,
        idLichDat,
        LiDoKham || null,
        GhiChu || null,
      ],
    );

    await client.query("COMMIT");

    return res.status(201).json({
      message: "Đặt lịch khám thành công!",
      appointment: {
        IdLichDat: idLichDat,
        ...newChiTiet.rows[0],
      },
    });
  } catch (err) {
    await client.query("ROLLBACK");
    console.error("Lỗi khi đặt lịch khám:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ." });
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
        TO_CHAR(l.NgayLamViec, 'YYYY-MM-DD') AS "NgayLamViec",
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

// 3. Hủy lịch khám (Chỉ cho phép trước 6 tiếng)
exports.cancelAppointment = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { id } = req.params; // IdChiTietLD
    
    // Lấy thông tin ca làm việc và trạng thái lịch
    const getApptQuery = `
      SELECT d.IdLichDat AS "IdLichDat", d.TrangThai AS "TrangThai",
        EXTRACT(EPOCH FROM ((l.NgayLamViec + l.GioBatDau)
          AT TIME ZONE 'Asia/Ho_Chi_Minh')) AS "ExamTimestamp"
      FROM CHITIETLICHDAT c
      JOIN LICHLAMVIEC l ON c.IdLichLamViec = l.IdLichLamViec
      JOIN LICHDAT d ON c.IdLichDat = d.IdLichDat
      WHERE c.IdChiTietLD = $1
      FOR UPDATE OF c, d, l
    `;
    const apptResult = await client.query(getApptQuery, [id]);
    
    if (apptResult.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: "Không tìm thấy lịch hẹn" });
    }
    
    const appt = apptResult.rows[0];
    
    if (appt.TrangThai === 'Đã hủy') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Lịch hẹn này đã bị hủy trước đó" });
    }
    if (appt.TrangThai !== 'Đã đặt' && appt.TrangThai !== 'Chờ duyệt') {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: "Chỉ có thể hủy lịch hẹn ở trạng thái Đã đặt hoặc Chờ duyệt" });
    }

    // Kiểm tra mốc 6 tiếng
    // Giờ khám theo múi giờ Việt Nam, độc lập múi giờ máy chủ.
    const examTimestamp = Number(appt.ExamTimestamp);
    if (appt.ExamTimestamp == null || !Number.isFinite(examTimestamp)) {
      throw new Error('Thời gian khám không hợp lệ.');
    }
    const hoursDiff = (examTimestamp * 1000 - Date.now()) / (1000 * 60 * 60);

    if (hoursDiff < 6) {
      await client.query('ROLLBACK');
      return res.status(400).json({ 
        error: "Chỉ được phép hủy lịch trước giờ khám ít nhất 6 tiếng. Vui lòng liên hệ Hotline." 
      });
    }

    // Cập nhật trạng thái
    await client.query('UPDATE LICHDAT SET TrangThai = $1 WHERE IdLichDat = $2', ['Đã hủy', appt.IdLichDat]);
    await client.query('COMMIT');

    return res.status(200).json({ message: "Hủy lịch khám thành công" });
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error("Lỗi khi hủy lịch:", error);
    return res.status(500).json({ error: "Lỗi hệ thống khi hủy lịch" });
  } finally {
    if (client) client.release();
  }
};

// Lấy toàn bộ danh sách lịch đặt (dùng để check ca đã kín chỗ)
exports.getAllAppointments = async (req, res) => {
  try {
    const query = `
      SELECT 
        c.IdChiTietLD AS "IdChiTietLD",
        d.IdLichDat AS "IdLichDat",
        c.IdLichLamViec AS "IdLichLamViec",
        d.TrangThai AS "TrangThai"
      FROM CHITIETLICHDAT c
      JOIN LICHDAT d ON c.IdLichDat = d.IdLichDat
    `;
    const result = await pool.query(query);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy tất cả lịch đặt:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};
