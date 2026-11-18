const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');
const { ensureSelfProfile } = require('../services/patientProfileService');

// 1. Tạo hồ sơ bệnh nhân (Bản thân hoặc Người thân)
exports.createPatientProfile = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');

    const {
      IdTaiKhoan,
      LoaiThongTin, // 0: Chủ tài khoản, 1: Người thân
      NhietDo,
      HuyetApTamThu,
      HuyetApTamTruong,
      NhipTim,
      NhipTho,
      CanNang,
      ChieuCao,
      TrieuChung,
      ThoiDiemKhoiPhat,
      MucDo,
      GhiChu,
      NguoiThan
    } = req.body;

    if (!IdTaiKhoan || ![0, 1].includes(LoaiThongTin)
        || (LoaiThongTin === 1 && (!NguoiThan?.HoTen?.trim() || !NguoiThan?.MoiQuanHe?.trim()))) {
      await client.query('ROLLBACK');
      return res.status(400).json({ error: 'Vui lòng cung cấp loại hồ sơ hợp lệ, họ tên và quan hệ người thân.' });
    }
    if (LoaiThongTin === 0) {
      const id = await ensureSelfProfile(client, req.user.IdTaiKhoan);
      await client.query('COMMIT');
      return res.status(200).json({ message: 'Hồ sơ bản thân đã sẵn sàng.', hoso: { IdHoSoBenhNhan: id, LoaiThongTin: 0 } });
    }

    const idHoSoBenhNhan = generateId('HS'); // Chuẩn 13 ký tự

    // Thêm vào bảng HOSOBENHNHAN
    const hoSoQuery = `
      INSERT INTO HOSOBENHNHAN (
        IdHoSoBenhNhan, IdTaiKhoan, LoaiThongTin, 
        NhietDo, HuyetApTamThu, HuyetApTamTruong, NhipTim, NhipTho, 
        CanNang, ChieuCao, TrieuChung, ThoiDiemKhoiPhat, MucDo, GhiChu
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14)
      RETURNING *
    `;
    const hoSoValues = [
      idHoSoBenhNhan, IdTaiKhoan, LoaiThongTin,
      NhietDo || null, HuyetApTamThu || null, HuyetApTamTruong || null, 
      NhipTim || null, NhipTho || null, CanNang || null, ChieuCao || null,
      TrieuChung || null, ThoiDiemKhoiPhat || null, MucDo || null, GhiChu || null
    ];

    const newHoSo = await client.query(hoSoQuery, hoSoValues);

    let nguoiThanResult = null;
    // Nếu là hồ sơ người thân (LoaiThongTin = 1)
    if (LoaiThongTin === 1 && NguoiThan) {
      const idThongTinNguoiThan = generateId('NT'); // Chuẩn 13 ký tự
      const nguoiThanQuery = `
        INSERT INTO THONGTINNGUOITHAN (
          IdThongTinNguoiThan, IdHoSoBenhNhan, MoiQuanHe, HoTen, CCCD, NgaySinh, GioiTinh, SoDienThoai, DiaChi
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
        RETURNING *
      `;
      const nguoiThanValues = [
        idThongTinNguoiThan,
        idHoSoBenhNhan,
        NguoiThan.MoiQuanHe,
        NguoiThan.HoTen || null,
        NguoiThan.CCCD || null,
        NguoiThan.NgaySinh || null,
        NguoiThan.GioiTinh || null,
        NguoiThan.SoDienThoai || null,
        NguoiThan.DiaChi || null
      ];
      const resNguoiThan = await client.query(nguoiThanQuery, nguoiThanValues);
      nguoiThanResult = resNguoiThan.rows[0];
    }

    await client.query('COMMIT');

    return res.status(201).json({
      message: 'Tạo hồ sơ bệnh nhân thành công!',
      hoso: newHoSo.rows[0],
      nguoithan: nguoiThanResult
    });

  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    console.error('Lỗi khi tạo hồ sơ bệnh nhân:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  } finally {
    if (client) client.release();
  }
};

// 2. Lấy danh sách hồ sơ bệnh nhân (gom duy nhất 1 thẻ cho mỗi người)
exports.getPatientProfiles = async (req, res) => {
  try {
    const idTaiKhoan = req.user.IdTaiKhoan;
    if (!idTaiKhoan) {
      return res.status(400).json({ error: "Thiếu mã tài khoản yêu cầu!" });
    }

    const query = `
      SELECT DISTINCT ON (
        CASE 
          WHEN h.LoaiThongTin = 0 THEN 'SELF' 
          ELSE CONCAT(COALESCE(nt.HoTen, ''), '|', COALESCE(nt.MoiQuanHe, ''))
        END
      )
        h.IdHoSoBenhNhan AS "IdHoSoBenhNhan",
        h.IdTaiKhoan AS "IdTaiKhoan",
        h.LoaiThongTin AS "LoaiThongTin",
        nt.IdThongTinNguoiThan AS "IdThongTinNguoiThan",
        CASE WHEN h.LoaiThongTin = 0 THEN t.HoTen ELSE nt.HoTen END AS "HoTen",
        CASE WHEN h.LoaiThongTin = 0 THEN t.SoDienThoai ELSE nt.SoDienThoai END AS "SoDienThoai",
        nt.MoiQuanHe AS "MoiQuanHe",
        nt.CCCD AS "CCCD",
        nt.NgaySinh AS "NgaySinh",
        nt.GioiTinh AS "GioiTinh",
        nt.DiaChi AS "DiaChi"
      FROM HOSOBENHNHAN h
      JOIN TAIKHOAN t ON h.IdTaiKhoan = t.IdTaiKhoan
      LEFT JOIN THONGTINNGUOITHAN nt ON h.IdHoSoBenhNhan = nt.IdHoSoBenhNhan
      WHERE h.IdTaiKhoan = $1 AND (h.LoaiThongTin = 0 OR nt.HoTen IS NOT NULL)
      ORDER BY 
        CASE 
          WHEN h.LoaiThongTin = 0 THEN 'SELF' 
          ELSE CONCAT(COALESCE(nt.HoTen, ''), '|', COALESCE(nt.MoiQuanHe, ''))
        END,
        h.IdHoSoBenhNhan ASC
    `;
    const result = await pool.query(query, [idTaiKhoan]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách hồ sơ bệnh nhân:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ." });
  }
};

// 3. Thêm bản ghi tiền sử bệnh (hỗ trợ cả khai báo trước khi khám lẫn trong lúc khám)
exports.createMedicalHistory = async (req, res) => {
  try {
    const { IdHoSoBenhNhan, IdChiTietLD, NguoiGhiNhan, TenBenh, MoTa, ThoiDiemMac, TrangThai } = req.body;

    if (!IdHoSoBenhNhan || !TenBenh) {
      return res.status(400).json({ error: 'Vui lòng cung cấp mã hồ sơ và tên bệnh nền!' });
    }

    const idTienSuBenh = generateId('TS');

    // Kiểm tra IdChiTietLD hợp lệ trong CHITIETLICHDAT (nếu không có thì để null)
    let validIdChiTietLD = null;
    if (IdChiTietLD && IdChiTietLD !== 'SYSTEM') {
      const checkCT = await pool.query('SELECT IdChiTietLD FROM CHITIETLICHDAT WHERE IdChiTietLD = $1', [IdChiTietLD]);
      if (checkCT.rows.length > 0) {
        validIdChiTietLD = IdChiTietLD;
      }
    }

    const insertQuery = `
      INSERT INTO TIENSUBENH (IdTienSuBenh, IdHoSoBenhNhan, IdChiTietLD, NguoiGhiNhan, TenBenh, MoTa, ThoiDiemMac, TrangThai)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      idTienSuBenh,
      IdHoSoBenhNhan,
      validIdChiTietLD,
      NguoiGhiNhan || null,
      TenBenh,
      MoTa || null,
      ThoiDiemMac || null,
      TrangThai || 'Đang điều trị'
    ];

    try {
      const newHistory = await pool.query(insertQuery, values);
      return res.status(201).json({
        message: 'Thêm tiền sử bệnh thành công!',
        history: newHistory.rows[0]
      });
    } catch (insertErr) {
      // Nếu cột IdChiTietLD trong DB đang bị NOT NULL, tự động gỡ NOT NULL để cho phép khai báo trước khi khám
      if (insertErr.code === '23502' && insertErr.column === 'idchitietld') {
        await pool.query('ALTER TABLE TIENSUBENH ALTER COLUMN IdChiTietLD DROP NOT NULL');
        const retryHistory = await pool.query(insertQuery, values);
        return res.status(201).json({
          message: 'Thêm tiền sử bệnh thành công!',
          history: retryHistory.rows[0]
        });
      }
      throw insertErr;
    }
  } catch (err) {
    console.error('Lỗi khi thêm tiền sử bệnh:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 4. Lấy danh sách thông tin người thân theo mã hồ sơ bệnh nhân
exports.getRelativesByProfile = async (req, res) => {
  try {
    const { idHoSoBenhNhan } = req.query;
    if (!idHoSoBenhNhan) {
      return res.status(400).json({ error: 'Thiếu mã hồ sơ bệnh nhân!' });
    }

    const query = `SELECT * FROM THONGTINNGUOITHAN WHERE IdHoSoBenhNhan = $1`;
    const result = await pool.query(query, [idHoSoBenhNhan]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách người thân:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 5. Cập nhật thông tin người thân
exports.updateRelative = async (req, res) => {
  try {
    const { IdThongTinNguoiThan, MoiQuanHe, HoTen, CCCD, NgaySinh, GioiTinh, SoDienThoai, DiaChi } = req.body;

    if (!IdThongTinNguoiThan) {
      return res.status(400).json({ error: 'Thiếu mã thông tin người thân cần cập nhật!' });
    }

    const query = `
      UPDATE THONGTINNGUOITHAN 
      SET 
        MoiQuanHe = COALESCE($1, MoiQuanHe),
        HoTen = COALESCE($2, HoTen),
        CCCD = COALESCE($3, CCCD),
        NgaySinh = COALESCE($4, NgaySinh),
        GioiTinh = COALESCE($5, GioiTinh),
        SoDienThoai = COALESCE($6, SoDienThoai),
        DiaChi = COALESCE($7, DiaChi)
      WHERE IdThongTinNguoiThan = $8 OR IdHoSoBenhNhan = $8
      RETURNING *
    `;

    const values = [
      MoiQuanHe || null,
      HoTen || null,
      CCCD || null,
      NgaySinh || null,
      GioiTinh || null,
      SoDienThoai || null,
      DiaChi || null,
      IdThongTinNguoiThan
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy thông tin người thân cần cập nhật!' });
    }

    return res.status(200).json({
      message: 'Cập nhật thông tin người thân thành công!',
      nguoiThan: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi khi cập nhật thông tin người thân:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 6. Lấy danh sách tiền sử bệnh (bệnh nền) theo tất cả hồ sơ của cùng một người
exports.getMedicalHistoriesByProfile = async (req, res) => {
  try {
    const { idHoSoBenhNhan } = req.query;
    if (!idHoSoBenhNhan) {
      return res.status(400).json({ error: "Thiếu mã hồ sơ bệnh nhân!" });
    }

    const query = `
      WITH target AS (
        SELECT h.IdTaiKhoan, h.LoaiThongTin, nt.HoTen, nt.MoiQuanHe
        FROM HOSOBENHNHAN h
        LEFT JOIN THONGTINNGUOITHAN nt ON h.IdHoSoBenhNhan = nt.IdHoSoBenhNhan
        WHERE h.IdHoSoBenhNhan = $1
        LIMIT 1
      )
      SELECT 
        ts.IdTienSuBenh AS "IdTienSuBenh",
        ts.IdHoSoBenhNhan AS "IdHoSoBenhNhan",
        ts.TenBenh AS "TenBenh",
        ts.MoTa AS "MoTa",
        ts.ThoiDiemMac AS "ThoiDiemMac",
        ts.TrangThai AS "TrangThai",
        COALESCE(tk.HoTen, 'Bệnh nhân/Người thân tự khai báo') AS "TenNguoiGhiNhan"
      FROM TIENSUBENH ts
      JOIN HOSOBENHNHAN h ON ts.IdHoSoBenhNhan = h.IdHoSoBenhNhan
      LEFT JOIN THONGTINNGUOITHAN nt ON h.IdHoSoBenhNhan = nt.IdHoSoBenhNhan
      LEFT JOIN TAIKHOAN tk ON ts.NguoiGhiNhan = tk.IdTaiKhoan
      CROSS JOIN target tg
      WHERE h.IdTaiKhoan = tg.IdTaiKhoan
        AND h.LoaiThongTin = tg.LoaiThongTin
        AND (
          tg.LoaiThongTin = 0 
          OR (nt.HoTen = tg.HoTen AND nt.MoiQuanHe = tg.MoiQuanHe)
        )
      ORDER BY ts.ThoiDiemMac DESC NULLS LAST, ts.IdTienSuBenh DESC
    `;
    const result = await pool.query(query, [idHoSoBenhNhan]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy danh sách tiền sử bệnh:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ." });
  }
};

// 7. Cập nhật bản ghi tiền sử bệnh (bệnh nền)
exports.updateMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params; // IdTienSuBenh
    const { TenBenh, MoTa, ThoiDiemMac, TrangThai } = req.body;

    if (!TenBenh || !TenBenh.trim()) {
      return res.status(400).json({ error: "Vui lòng nhập tên bệnh nền!" });
    }

    const query = `
      UPDATE TIENSUBENH
      SET 
        TenBenh = $1,
        MoTa = $2,
        ThoiDiemMac = $3,
        TrangThai = $4
      WHERE IdTienSuBenh = $5
      RETURNING 
        IdTienSuBenh AS "IdTienSuBenh",
        IdHoSoBenhNhan AS "IdHoSoBenhNhan",
        TenBenh AS "TenBenh",
        MoTa AS "MoTa",
        ThoiDiemMac AS "ThoiDiemMac",
        TrangThai AS "TrangThai"
    `;

    const values = [
      TenBenh.trim(),
      MoTa || null,
      ThoiDiemMac || null,
      TrangThai || "Đang điều trị",
      id
    ];

    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "Không tìm thấy bản ghi tiền sử bệnh cần cập nhật!" });
    }

    return res.status(200).json({
      message: "Cập nhật tiền sử bệnh thành công!",
      history: result.rows[0]
    });
  } catch (err) {
    console.error("Lỗi khi cập nhật tiền sử bệnh:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ." });
  }
};

// 8. Lấy lịch sử các lần khám bệnh của cùng một người (mỗi lần khám giữ nguyên chẩn đoán riêng)
exports.getExamHistoriesByProfile = async (req, res) => {
  try {
    const { idHoSoBenhNhan } = req.query;
    if (!idHoSoBenhNhan) {
      return res.status(400).json({ error: "Thiếu mã hồ sơ bệnh nhân!" });
    }

    const query = `
      WITH target AS (
        SELECT h.IdTaiKhoan, h.LoaiThongTin, nt.HoTen, nt.MoiQuanHe
        FROM HOSOBENHNHAN h
        LEFT JOIN THONGTINNGUOITHAN nt ON h.IdHoSoBenhNhan = nt.IdHoSoBenhNhan
        WHERE h.IdHoSoBenhNhan = $1
        LIMIT 1
      )
      SELECT 
        d.IdLichDat AS "IdLichDat",
        c.IdChiTietLD AS "IdChiTietLD",
        TO_CHAR(l.NgayLamViec, 'DD/MM/YYYY') AS "NgayKham",
        l.GioBatDau AS "GioBatDau",
        bs.HoTen AS "TenBacSi",
        pk.TenPhongKham AS "TenPhongKham",
        c.LiDoKham AS "LiDoKham",
        d.TrangThai AS "TrangThaiLich",
        h.TrieuChung AS "TrieuChung",
        h.ChuanDoan AS "ChuanDoan",
        h.KetLuan AS "KetLuan",
        h.NhietDo AS "NhietDo",
        CASE 
          WHEN h.HuyetApTamThu IS NOT NULL AND h.HuyetApTamTruong IS NOT NULL 
          THEN CONCAT(h.HuyetApTamThu, '/', h.HuyetApTamTruong, ' mmHg')
          ELSE NULL
        END AS "HuyetAp"
      FROM CHITIETLICHDAT c
      JOIN LICHDAT d ON c.IdLichDat = d.IdLichDat
      JOIN HOSOBENHNHAN h ON c.IdHoSoBenhNhan = h.IdHoSoBenhNhan
      LEFT JOIN THONGTINNGUOITHAN nt ON h.IdHoSoBenhNhan = nt.IdHoSoBenhNhan
      JOIN LICHLAMVIEC l ON c.IdLichLamViec = l.IdLichLamViec
      JOIN TAIKHOAN bs ON l.IdBacSi = bs.IdTaiKhoan
      JOIN PHONGKHAM pk ON l.IdPhongKham = pk.IdPhongKham
      CROSS JOIN target tg
      WHERE h.IdTaiKhoan = tg.IdTaiKhoan
        AND h.LoaiThongTin = tg.LoaiThongTin
        AND (
          tg.LoaiThongTin = 0 
          OR (nt.HoTen = tg.HoTen AND nt.MoiQuanHe = tg.MoiQuanHe)
        )
      ORDER BY l.NgayLamViec DESC, l.GioBatDau DESC
    `;

    const result = await pool.query(query, [idHoSoBenhNhan]);
    return res.status(200).json(result.rows);
  } catch (err) {
    console.error("Lỗi khi lấy lịch sử khám bệnh:", err);
    return res.status(500).json({ error: "Lỗi server nội bộ." });
  }
};

// 9. Xóa hồ sơ bệnh nhân hoặc người thân
exports.deletePatientProfile = async (req, res) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const { id } = req.params; // IdHoSoBenhNhan

    // Kiểm tra hồ sơ tồn tại
    const check = await client.query(`SELECT ChuanDoan AS "ChuanDoan", KetLuan AS "KetLuan"
      FROM HOSOBENHNHAN WHERE IdHoSoBenhNhan = $1 FOR UPDATE`, [id]);
    if (check.rows.length === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân!' });
    }

    // Bảo toàn hồ sơ đã gắn lịch khám; khóa hồ sơ ngăn liên kết mới khi xóa.
    const appointments = await client.query(
      'SELECT IdChiTietLD AS "IdChiTietLD" FROM CHITIETLICHDAT WHERE IdHoSoBenhNhan = $1 LIMIT 1', [id]);
    if (appointments.rows.length > 0 || check.rows[0].ChuanDoan || check.rows[0].KetLuan) {
      await client.query('ROLLBACK');
      return res.status(409).json({ error: 'Không thể xóa hồ sơ đã có lịch sử khám bệnh tại phòng khám. Hồ sơ đã gắn lịch khám hoặc có chẩn đoán/kết luận cần được lưu giữ.' });
    }

    // Xóa thông tin người thân liên quan nếu có
    await client.query('DELETE FROM THONGTINNGUOITHAN WHERE IdHoSoBenhNhan = $1', [id]);
    // Xóa tiền sử bệnh liên quan
    await client.query('DELETE FROM TIENSUBENH WHERE IdHoSoBenhNhan = $1', [id]);
    // Xóa hồ sơ bệnh nhân
    await client.query('DELETE FROM HOSOBENHNHAN WHERE IdHoSoBenhNhan = $1', [id]);

    await client.query('COMMIT');
    return res.status(200).json({ message: 'Xóa hồ sơ thành công!' });
  } catch (err) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (err.code === '23503') {
      return res.status(409).json({ error: 'Không thể xóa hồ sơ đang có dữ liệu liên quan. Vui lòng kiểm tra lịch khám.' });
    }
    console.error('Lỗi khi xóa hồ sơ:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  } finally {
    if (client) client.release();
  }
};

// 10. Xóa bản ghi tiền sử bệnh (bệnh nền)
exports.deleteMedicalHistory = async (req, res) => {
  try {
    const { id } = req.params; // IdTienSuBenh
    const result = await pool.query('DELETE FROM TIENSUBENH WHERE IdTienSuBenh = $1 RETURNING *', [id]);
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy bản ghi tiền sử bệnh!' });
    }
    return res.status(200).json({ message: 'Xóa tiền sử bệnh thành công!' });
  } catch (err) {
    console.error('Lỗi khi xóa tiền sử bệnh:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};
