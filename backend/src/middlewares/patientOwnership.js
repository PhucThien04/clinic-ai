const pool = require('../config/db');

// Các endpoint tự phục vụ chỉ nhận tài khoản hiện tại làm chủ dữ liệu.
exports.scopeAccount = (req, res, next) => {
  if (req.body !== undefined && (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ error: 'Nội dung yêu cầu không hợp lệ.' });
  }
  req.body = req.body || {};
  const id = req.user.IdTaiKhoan;
  if ((req.query.idTaiKhoan && req.query.idTaiKhoan !== id)
      || (req.body?.IdTaiKhoan && req.body.IdTaiKhoan !== id)) {
    return res.status(403).json({ error: 'Bạn không có quyền thao tác dữ liệu của tài khoản khác.' });
  }
  if (req.body) {
    req.body.IdTaiKhoan = id;
    req.body.NguoiGhiNhan = id;
  }
  next();
};

const queries = {
  profile: 'SELECT IdTaiKhoan AS "IdTaiKhoan" FROM HOSOBENHNHAN WHERE IdHoSoBenhNhan = $1',
  relative: `SELECT h.IdTaiKhoan AS "IdTaiKhoan" FROM THONGTINNGUOITHAN n
    JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan = n.IdHoSoBenhNhan
    WHERE n.IdThongTinNguoiThan = $1 OR n.IdHoSoBenhNhan = $1`,
  history: `SELECT h.IdTaiKhoan AS "IdTaiKhoan" FROM TIENSUBENH t
    JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan = t.IdHoSoBenhNhan WHERE t.IdTienSuBenh = $1`,
  appointment: `SELECT d.IdTaiKhoan AS "IdTaiKhoan" FROM CHITIETLICHDAT c
    JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat WHERE c.IdChiTietLD = $1`,
};

exports.ownsResource = (kind, getId) => async (req, res, next) => {
  const id = getId(req);
  if (!id || typeof id !== 'string') return res.status(400).json({ error: 'Thiếu mã dữ liệu hợp lệ.' });
  try {
    const result = await pool.query(queries[kind], [id]);
    if (!result.rows.length) return res.status(404).json({ error: 'Không tìm thấy dữ liệu yêu cầu.' });
    if (result.rows.some(row => row.IdTaiKhoan !== req.user.IdTaiKhoan)) {
      return res.status(403).json({ error: 'Bạn không có quyền thao tác dữ liệu này.' });
    }
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra quyền sở hữu:', error);
    return res.status(500).json({ error: 'Không thể kiểm tra quyền truy cập dữ liệu.' });
  }
};

exports.ownsHistoryAppointment = async (req, res, next) => {
  const { IdChiTietLD, IdHoSoBenhNhan } = req.body;
  if (!IdChiTietLD) return next();
  try {
    const result = await pool.query(`SELECT c.IdChiTietLD AS "IdChiTietLD" FROM CHITIETLICHDAT c
      JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
      WHERE c.IdChiTietLD = $1 AND c.IdHoSoBenhNhan = $2 AND d.IdTaiKhoan = $3`,
    [IdChiTietLD, IdHoSoBenhNhan, req.user.IdTaiKhoan]);
    if (!result.rows.length) return res.status(403).json({ error: 'Lượt khám không thuộc hồ sơ của bạn.' });
    next();
  } catch (error) {
    console.error('Lỗi kiểm tra lượt khám:', error);
    return res.status(500).json({ error: 'Không thể kiểm tra lượt khám.' });
  }
};
