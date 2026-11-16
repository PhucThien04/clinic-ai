const pool = require('../config/db');

// 1. Y tá cập nhật thông tin sinh hiệu, triệu chứng vào hồ sơ khám (HOSOBENHNHAN)
exports.updateClinicalVitals = async (req, res) => {
  try {
    const { idHoSoBenhNhan, NhietDo, HuyetApTamThu, HuyetApTamTruong, NhipTim, NhipTho, CanNang, ChieuCao, TrieuChung, ThoiDiemKhoiPhat, MucDo, GhiChu } = req.body;

    if (!idHoSoBenhNhan) {
      return res.status(400).json({ error: 'Thiếu mã hồ sơ bệnh nhân cần cập nhật!' });
    }

    const query = `
      UPDATE HOSOBENHNHAN 
      SET 
        NhietDo = COALESCE($1, NhietDo),
        HuyetApTamThu = COALESCE($2, HuyetApTamThu),
        HuyetApTamTruong = COALESCE($3, HuyetApTamTruong),
        NhipTim = COALESCE($4, NhipTim),
        NhipTho = COALESCE($5, NhipTho),
        CanNang = COALESCE($6, CanNang),
        ChieuCao = COALESCE($7, ChieuCao),
        TrieuChung = COALESCE($8, TrieuChung),
        ThoiDiemKhoiPhat = COALESCE($9, ThoiDiemKhoiPhat),
        MucDo = COALESCE($10, MucDo),
        GhiChu = COALESCE($11, GhiChu)
      WHERE IdHoSoBenhNhan = $12
      RETURNING *
    `;

    const values = [
      NhietDo || null,
      HuyetApTamThu || null,
      HuyetApTamTruong || null,
      NhipTim || null,
      NhipTho || null,
      CanNang || null,
      ChieuCao || null,
      TrieuChung || null,
      ThoiDiemKhoiPhat || null,
      MucDo || null,
      GhiChu || null,
      idHoSoBenhNhan
    ];

    const updated = await pool.query(query, values);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân!' });
    }

    return res.status(200).json({
      message: 'Cập nhật sinh hiệu và triệu chứng thành công!',
      hoso: updated.rows[0]
    });

  } catch (err) {
    console.error('Lỗi khi cập nhật sinh hiệu:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 2. Bác sĩ cập nhật chẩn đoán, kết luận và thời điểm khám
exports.updateDoctorDiagnosis = async (req, res) => {
  try {
    const { idHoSoBenhNhan, ChuanDoan, KetLuan } = req.body;

    if (!idHoSoBenhNhan || !ChuanDoan || !KetLuan) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ chẩn đoán và kết luận khám!' });
    }

    const thoiDiemCapNhat = new Date();

    const query = `
      UPDATE HOSOBENHNHAN 
      SET 
        ChuanDoan = $1,
        KetLuan = $2,
        ThoiDiemCapNhat = $3
      WHERE IdHoSoBenhNhan = $4
      RETURNING *
    `;

    const values = [ChuanDoan, KetLuan, thoiDiemCapNhat, idHoSoBenhNhan];
    const updated = await pool.query(query, values);

    if (updated.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân!' });
    }

    return res.status(200).json({
      message: 'Cập nhật chẩn đoán và kết luận khám thành công!',
      hoso: updated.rows[0]
    });

  } catch (err) {
    console.error('Lỗi khi cập nhật chẩn đoán của bác sĩ:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// Hàm lấy thông tin hồ sơ cho Bác sĩ
exports.getPatientExamInfo = async (req, res) => {
  try {
    const { idHoSoBenhNhan } = req.params;

    const query = `
      SELECT 
        IdHoSoBenhNhan,
        NhietDo,
        HuyetApTamThu,
        HuyetApTamTruong,
        NhipTim,
        NhipTho,
        CanNang,
        ChieuCao,
        TrieuChung,
        MucDo,
        GhiChu,
        ChuanDoan,
        KetLuan
      FROM HOSOBENHNHAN
      WHERE IdHoSoBenhNhan = $1
    `;
    
    const result = await pool.query(query, [idHoSoBenhNhan]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân!' });
    }

    return res.status(200).json(result.rows[0]);
  } catch (err) {
    console.error('Lỗi khi lấy thông tin khám:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ' });
  }
};