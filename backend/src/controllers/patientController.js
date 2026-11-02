const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

// 1. Tạo hồ sơ bệnh nhân (Bản thân hoặc Người thân)
exports.createPatientProfile = async (req, res) => {
  const client = await pool.connect();
  try {
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

    if (!IdTaiKhoan || LoaiThongTin === undefined) {
      return res.status(400).json({ error: 'Thiếu thông tin tài khoản hoặc loại thông tin hồ sơ!' });
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
    await client.query('ROLLBACK');
    console.error('Lỗi khi tạo hồ sơ bệnh nhân:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  } finally {
    client.release();
  }
};

// 2. Lấy danh sách hồ sơ bệnh nhân theo tài khoản
exports.getPatientProfiles = async (req, res) => {
  try {
    const { idTaiKhoan } = req.query;
    if (!idTaiKhoan) {
      return res.status(400).json({ error: 'Thiếu mã tài khoản yêu cầu!' });
    }

    const query = `
      SELECT 
        h.IdHoSoBenhNhan AS "IdHoSoBenhNhan",
        h.IdTaiKhoan AS "IdTaiKhoan",
        h.LoaiThongTin AS "LoaiThongTin",
        CASE 
          WHEN h.LoaiThongTin = 0 THEN t.HoTen
          ELSE nt.HoTen
        END AS "HoTen",
        CASE 
          WHEN h.LoaiThongTin = 0 THEN t.SoDienThoai
          ELSE nt.SoDienThoai
        END AS "SoDienThoai",
        nt.MoiQuanHe AS "MoiQuanHe",
        h.TrieuChung AS "TrieuChung",
        h.ChuanDoan AS "ChuanDoan",
        h.KetLuan AS "KetLuan"
      FROM HOSOBENHNHAN h
      JOIN TAIKHOAN t ON h.IdTaiKhoan = t.IdTaiKhoan
      LEFT JOIN THONGTINNGUOITHAN nt ON h.IdHoSoBenhNhan = nt.IdHoSoBenhNhan
      WHERE h.IdTaiKhoan = $1
    `;
    const result = await pool.query(query, [idTaiKhoan]);
    return res.status(200).json(result.rows);

  } catch (err) {
    console.error('Lỗi khi lấy danh sách hồ sơ bệnh nhân:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 3. Thêm bản ghi tiền sử bệnh cho hồ sơ bệnh nhân
exports.createMedicalHistory = async (req, res) => {
  try {
    const { IdHoSoBenhNhan, IdChiTietLD, NguoiGhiNhan, TenBenh, MoTa, ThoiDiemMac, TrangThai } = req.body;

    if (!IdHoSoBenhNhan || !IdChiTietLD || !NguoiGhiNhan || !TenBenh) {
      return res.status(400).json({ error: 'Vui lòng điền đầy đủ các thông tin bắt buộc của tiền sử bệnh!' });
    }

    const idTienSuBenh = generateId('TS'); // Chuẩn 13 ký tự

    const query = `
      INSERT INTO TIENSUBENH (IdTienSuBenh, IdHoSoBenhNhan, IdChiTietLD, NguoiGhiNhan, TenBenh, MoTa, ThoiDiemMac, TrangThai)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `;
    const values = [
      idTienSuBenh,
      IdHoSoBenhNhan,
      IdChiTietLD,
      NguoiGhiNhan,
      TenBenh,
      MoTa || null,
      ThoiDiemMac || null,
      TrangThai || null
    ];

    const newHistory = await pool.query(query, values);

    return res.status(201).json({
      message: 'Thêm tiền sử bệnh thành công!',
      history: newHistory.rows[0]
    });

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
      WHERE IdThongTinNguoiThan = $8
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

// 6. Lấy danh sách tiền sử bệnh theo hồ sơ bệnh nhân
exports.getMedicalHistoriesByProfile = async (req, res) => {
  try {
    const { idHoSoBenhNhan } = req.query;
    if (!idHoSoBenhNhan) {
      return res.status(400).json({ error: 'Thiếu mã hồ sơ bệnh nhân!' });
    }

    const query = `
      SELECT 
        ts.*,
        t.HoTen AS "TenNguoiGhiNhan"
      FROM TIENSUBENH ts
      JOIN TAIKHOAN t ON ts.NguoiGhiNhan = t.IdTaiKhoan
      WHERE ts.IdHoSoBenhNhan = $1
      ORDER BY ts.ThoiDiemMac DESC
    `;
    const result = await pool.query(query, [idHoSoBenhNhan]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy danh sách tiền sử bệnh:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};