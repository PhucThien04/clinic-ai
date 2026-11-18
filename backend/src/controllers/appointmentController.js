const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');

const editableStates = ['Đã đặt', 'Chờ duyệt'];
const sixHours = 6 * 60 * 60 * 1000;
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };

async function transaction(res, action) {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const result = await action(client);
    await client.query('COMMIT');
    return res.status(result.status || 200).json(result.body);
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    if (!error.status) console.error('Lỗi xử lý lịch hẹn:', error);
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'Không thể xử lý lịch hẹn. Vui lòng thử lại.' });
  } finally {
    if (client) client.release();
  }
}

// Khóa ca trước khi kiểm tra chỗ trống để tuần tự hóa các yêu cầu đặt cùng ca.
async function validateSchedule(client, id, excludeAppointment = null, minimumMs = 0) {
  const result = await client.query(`SELECT TrangThai AS "TrangThai",
    EXTRACT(EPOCH FROM ((NgayLamViec + GioBatDau) AT TIME ZONE 'Asia/Ho_Chi_Minh')) AS "ExamTimestamp"
    FROM LICHLAMVIEC WHERE IdLichLamViec = $1 FOR UPDATE`, [id]);
  if (!result.rows.length) fail(404, 'Không tìm thấy ca khám.');
  const schedule = result.rows[0];
  if (schedule.TrangThai !== 'Hoạt động') fail(400, 'Ca khám đang tạm ngưng, vui lòng chọn ca khác.');
  const remaining = Number(schedule.ExamTimestamp) * 1000 - Date.now();
  if (!Number.isFinite(remaining) || remaining <= 0) fail(400, 'Không thể đặt ca khám đã quá hạn.');
  if (remaining < minimumMs) fail(400, 'Ca khám mới phải cách thời điểm hiện tại ít nhất 6 tiếng.');
  const occupied = await client.query(`SELECT c.IdChiTietLD AS "IdChiTietLD"
    FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
    WHERE c.IdLichLamViec = $1 AND d.TrangThai <> 'Đã hủy'
      AND ($2::char(13) IS NULL OR c.IdChiTietLD <> $2) LIMIT 1`, [id, excludeAppointment]);
  if (occupied.rows.length) fail(409, 'Ca khám đã kín chỗ. Vui lòng chọn ca khác.');
}

async function getEditableAppointment(client, id, idTaiKhoan) {
  const result = await client.query(`SELECT d.IdLichDat AS "IdLichDat", d.TrangThai AS "TrangThai",
    c.IdLichLamViec AS "IdLichLamViec", c.LiDoKham AS "LiDoKham", c.GhiChu AS "GhiChu",
    EXTRACT(EPOCH FROM ((l.NgayLamViec + l.GioBatDau) AT TIME ZONE 'Asia/Ho_Chi_Minh')) AS "ExamTimestamp"
    FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
    JOIN LICHLAMVIEC l ON l.IdLichLamViec = c.IdLichLamViec
    WHERE c.IdChiTietLD = $1 AND d.IdTaiKhoan = $2 FOR UPDATE OF c, d`, [id, idTaiKhoan]);
  if (!result.rows.length) fail(404, 'Không tìm thấy lịch hẹn thuộc tài khoản của bạn.');
  const appointment = result.rows[0];
  if (!editableStates.includes(appointment.TrangThai)) fail(400, 'Chỉ có thể sửa/hủy lịch ở trạng thái Đã đặt hoặc Chờ duyệt.');
  const remaining = Number(appointment.ExamTimestamp) * 1000 - Date.now();
  if (!Number.isFinite(remaining) || remaining < sixHours) fail(400, 'Chỉ được phép sửa/hủy lịch trước giờ khám ít nhất 6 tiếng. Vui lòng liên hệ phòng khám.');
  return appointment;
}

exports.createAppointment = (req, res) => transaction(res, async client => {
  const { IdHoSoBenhNhan, IdLichLamViec, LiDoKham, GhiChu } = req.body;
  const idTaiKhoan = req.user.IdTaiKhoan;
  if (!IdHoSoBenhNhan || !IdLichLamViec) fail(400, 'Vui lòng chọn hồ sơ bệnh nhân và ca khám.');
  await validateSchedule(client, IdLichLamViec);
  const profileResult = await client.query(`SELECT h.LoaiThongTin AS "LoaiThongTin",
    EXISTS(SELECT 1 FROM CHITIETLICHDAT c WHERE c.IdHoSoBenhNhan = h.IdHoSoBenhNhan) AS "IsUsed",
    (h.ChuanDoan IS NOT NULL OR h.KetLuan IS NOT NULL) AS "HasDiagnosis"
    FROM HOSOBENHNHAN h WHERE h.IdHoSoBenhNhan = $1 AND h.IdTaiKhoan = $2 FOR UPDATE OF h`,
  [IdHoSoBenhNhan, idTaiKhoan]);
  if (!profileResult.rows.length) fail(404, 'Không tìm thấy hồ sơ thuộc tài khoản của bạn.');
  const profile = profileResult.rows[0];
  let targetId = IdHoSoBenhNhan;
  if (profile.IsUsed || profile.HasDiagnosis) {
    targetId = generateId('HS');
    await client.query('INSERT INTO HOSOBENHNHAN (IdHoSoBenhNhan, IdTaiKhoan, LoaiThongTin) VALUES ($1, $2, $3)',
      [targetId, idTaiKhoan, profile.LoaiThongTin]);
    if (profile.LoaiThongTin === 1) {
      const copied = await client.query(`INSERT INTO THONGTINNGUOITHAN
        (IdThongTinNguoiThan, IdHoSoBenhNhan, MoiQuanHe, HoTen, CCCD, NgaySinh, GioiTinh, SoDienThoai, DiaChi)
        SELECT $1, $2, MoiQuanHe, HoTen, CCCD, NgaySinh, GioiTinh, SoDienThoai, DiaChi
        FROM THONGTINNGUOITHAN WHERE IdHoSoBenhNhan = $3 LIMIT 1`, [generateId('NT'), targetId, IdHoSoBenhNhan]);
      if (!copied.rowCount) fail(400, 'Hồ sơ người thân chưa có thông tin hợp lệ.');
    }
  }
  const idLichDat = generateId('LD');
  const idChiTietLD = generateId('CT');
  await client.query('INSERT INTO LICHDAT (IdLichDat, IdTaiKhoan, TrangThai) VALUES ($1, $2, $3)', [idLichDat, idTaiKhoan, 'Đã đặt']);
  await client.query(`INSERT INTO CHITIETLICHDAT (IdChiTietLD, IdHoSoBenhNhan, IdLichLamViec, IdLichDat, LiDoKham, GhiChu)
    VALUES ($1, $2, $3, $4, $5, $6)`, [idChiTietLD, targetId, IdLichLamViec, idLichDat, LiDoKham || null, GhiChu || null]);
  return { status: 201, body: { message: 'Đặt lịch khám thành công!', appointment: {
    IdChiTietLD: idChiTietLD, IdLichDat: idLichDat, IdHoSoBenhNhan: targetId, IdLichLamViec
  } } };
});

exports.updateAppointment = (req, res) => transaction(res, async client => {
  const appointment = await getEditableAppointment(client, req.params.id, req.user.IdTaiKhoan);
  const { IdLichLamViec, LiDoKham, GhiChu } = req.body;
  const targetSchedule = IdLichLamViec || appointment.IdLichLamViec;
  await validateSchedule(client, targetSchedule, req.params.id, sixHours);
  await client.query(`UPDATE CHITIETLICHDAT SET IdLichLamViec = $1, LiDoKham = $2, GhiChu = $3
    WHERE IdChiTietLD = $4`, [targetSchedule, LiDoKham ?? appointment.LiDoKham, GhiChu ?? appointment.GhiChu, req.params.id]);
  return { body: { message: 'Cập nhật lịch khám thành công!' } };
});

exports.cancelAppointment = (req, res) => transaction(res, async client => {
  const appointment = await getEditableAppointment(client, req.params.id, req.user.IdTaiKhoan);
  await client.query('UPDATE LICHDAT SET TrangThai = $1 WHERE IdLichDat = $2 AND IdTaiKhoan = $3',
    ['Đã hủy', appointment.IdLichDat, req.user.IdTaiKhoan]);
  return { body: { message: 'Hủy lịch khám thành công!' } };
});

exports.getAppointments = async (req, res) => {
  try {
    const result = await pool.query(`SELECT c.IdChiTietLD AS "IdChiTietLD", d.IdLichDat AS "IdLichDat",
      h.IdHoSoBenhNhan AS "IdHoSoBenhNhan", l.IdLichLamViec AS "IdLichLamViec",
      TO_CHAR(l.NgayLamViec, 'YYYY-MM-DD') AS "NgayLamViec", l.GioBatDau AS "GioBatDau",
      l.GioKetThuc AS "GioKetThuc", p.TenPhongKham AS "TenPhongKham", t.HoTen AS "TenBacSi",
      c.LiDoKham AS "LiDoKham", c.GhiChu AS "GhiChu", d.TrangThai AS "TrangThai"
      FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
      JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan = c.IdHoSoBenhNhan
      JOIN LICHLAMVIEC l ON l.IdLichLamViec = c.IdLichLamViec
      JOIN PHONGKHAM p ON p.IdPhongKham = l.IdPhongKham JOIN TAIKHOAN t ON t.IdTaiKhoan = l.IdBacSi
      WHERE d.IdTaiKhoan = $1 ORDER BY l.NgayLamViec DESC, l.GioBatDau DESC`, [req.user.IdTaiKhoan]);
    return res.json(result.rows);
  } catch (error) {
    console.error('Lỗi tải lịch hẹn:', error);
    return res.status(500).json({ error: 'Không thể tải lịch hẹn.' });
  }
};

// Chỉ trả tình trạng kín chỗ, không lộ ID lịch/hồ sơ của người khác.
exports.getAllAppointments = async (req, res) => {
  try {
    const result = await pool.query(`SELECT DISTINCT c.IdLichLamViec AS "IdLichLamViec"
      FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat WHERE d.TrangThai <> 'Đã hủy'`);
    return res.json(result.rows);
  } catch (error) {
    console.error('Lỗi tải tình trạng ca khám:', error);
    return res.status(500).json({ error: 'Không thể tải tình trạng ca khám.' });
  }
};
