const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

// 1. Lưu kết quả AI (Tóm tắt, Phân tích hoặc Cảnh báo)
exports.saveAIResult = async (req, res) => {
  try {
    const { IdChiTietLD, LoaiKetQua, NoiDung } = req.body;

    if (!IdChiTietLD || !LoaiKetQua || !NoiDung) {
      return res.status(400).json({ error: 'Vui lòng cung cấp đầy đủ mã chi tiết lịch đặt, loại kết quả và nội dung!' });
    }

    // LoaiKetQua chuẩn theo tài liệu: 'TOMTAT', 'PHANTICH', 'CANHBAO'
    const idAIKetQua = generateId('AI'); // Chuẩn 13 ký tự
    const thoiDiemTao = new Date();

    const query = `
      INSERT INTO AIKETQUA (IdAIKetQua, IdChiTietLD, LoaiKetQua, NoiDung, ThoiDiemTao)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *
    `;
    const values = [idAIKetQua, IdChiTietLD, LoaiKetQua, NoiDung, thoiDiemTao];
    const result = await pool.query(query, values);

    return res.status(201).json({
      message: 'Lưu kết quả AI thành công!',
      aiResult: result.rows[0]
    });
  } catch (err) {
    console.error('Lỗi khi lưu kết quả AI:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};

// 2. Lấy danh sách kết quả AI theo lượt khám (IdChiTietLD)
exports.getAIResults = async (req, res) => {
  try {
    const { idChiTietLD } = req.query;

    if (!idChiTietLD) {
      return res.status(400).json({ error: 'Thiếu mã chi tiết lịch đặt yêu cầu!' });
    }

    const query = `
      SELECT * FROM AIKETQUA 
      WHERE IdChiTietLD = $1 
      ORDER BY ThoiDiemTao DESC
    `;
    const result = await pool.query(query, [idChiTietLD]);

    return res.status(200).json(result.rows);
  } catch (err) {
    console.error('Lỗi khi lấy kết quả AI:', err);
    return res.status(500).json({ error: 'Lỗi server nội bộ.' });
  }
};