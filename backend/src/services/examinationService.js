const pool = require('../config/db');

const profileFields = ['IdHoSoBenhNhan', 'LoaiThongTin', 'NhietDo', 'HuyetApTamThu',
  'HuyetApTamTruong', 'NhipTim', 'NhipTho', 'CanNang', 'ChieuCao', 'TrieuChung',
  'ThoiDiemKhoiPhat', 'MucDo', 'GhiChu', 'ChuanDoan', 'KetLuan', 'ThoiDiemCapNhat'];
// Danh sách cột cố định do server định nghĩa, không nhận tên cột từ request.
const selectProfile = alias => profileFields.map(field => field === 'ThoiDiemKhoiPhat'
  ? `TO_CHAR(${alias}.${field}, 'YYYY-MM-DD"T"HH24:MI') AS "${field}"`
  : `${alias}.${field} AS "${field}"`).join(', ');
const vitalFields = ['NhietDo', 'HuyetApTamThu', 'HuyetApTamTruong', 'NhipTim', 'NhipTho', 'CanNang', 'ChieuCao'];
const identityFields = `CASE WHEN h.LoaiThongTin = 0 THEN tk.HoTen ELSE nt.HoTen END AS "TenBenhNhan",
  nt.MoiQuanHe AS "MoiQuanHe",
  CASE WHEN h.LoaiThongTin = 0 THEN tk.SoDienThoai ELSE nt.SoDienThoai END AS "SoDienThoai",
  CASE WHEN h.LoaiThongTin = 0 THEN tk.GioiTinh ELSE nt.GioiTinh END AS "GioiTinh",
  TO_CHAR(CASE WHEN h.LoaiThongTin = 0 THEN tk.NgaySinh ELSE nt.NgaySinh END, 'YYYY-MM-DD') AS "NgaySinh"`;
const samePerson = `WITH target AS (
  SELECT h.IdTaiKhoan, h.LoaiThongTin, nt.HoTen, nt.MoiQuanHe
  FROM HOSOBENHNHAN h LEFT JOIN THONGTINNGUOITHAN nt ON nt.IdHoSoBenhNhan = h.IdHoSoBenhNhan
  WHERE h.IdHoSoBenhNhan = $1
), person AS (
  SELECT h.IdHoSoBenhNhan FROM HOSOBENHNHAN h
  LEFT JOIN THONGTINNGUOITHAN nt ON nt.IdHoSoBenhNhan = h.IdHoSoBenhNhan
  CROSS JOIN target t WHERE h.IdTaiKhoan = t.IdTaiKhoan AND h.LoaiThongTin = t.LoaiThongTin
    AND (t.LoaiThongTin = 0 OR (nt.HoTen = t.HoTen AND nt.MoiQuanHe = t.MoiQuanHe))
)`;

exports.getClinicalQueue = async ({ date, all, idBacSi }) => {
  const result = await pool.query(`SELECT c.IdChiTietLD AS "IdChiTietLD", d.IdLichDat AS "IdLichDat",
    h.IdHoSoBenhNhan AS "IdHoSoBenhNhan", TO_CHAR(l.NgayLamViec, 'YYYY-MM-DD') AS "NgayLamViec",
    l.GioBatDau AS "GioBatDau", l.GioKetThuc AS "GioKetThuc", bs.HoTen AS "TenBacSi",
    pk.TenPhongKham AS "TenPhongKham", c.LiDoKham AS "LiDoKham", d.TrangThai AS "TrangThaiLich",
    h.LoaiThongTin AS "LoaiThongTin", ${identityFields},
    (${vitalFields.map(field => `h.${field} IS NOT NULL`).join(' OR ')}) AS "DaDoSinhHieu",
    (NULLIF(BTRIM(h.ChuanDoan), '') IS NOT NULL OR NULLIF(BTRIM(h.KetLuan), '') IS NOT NULL) AS "DaChanDoan",
    COALESCE(l.IdBacSi = $3, FALSE) AS "LaCaCuaToi"
    FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
    JOIN LICHLAMVIEC l ON l.IdLichLamViec = c.IdLichLamViec
    JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan = c.IdHoSoBenhNhan
    JOIN TAIKHOAN tk ON tk.IdTaiKhoan = h.IdTaiKhoan JOIN TAIKHOAN bs ON bs.IdTaiKhoan = l.IdBacSi
    JOIN PHONGKHAM pk ON pk.IdPhongKham = l.IdPhongKham
    LEFT JOIN THONGTINNGUOITHAN nt ON nt.IdHoSoBenhNhan = h.IdHoSoBenhNhan
    WHERE d.TrangThai IN ('Đã xác nhận', 'Đang khám', 'Hoàn thành')
      AND ($2::boolean OR l.NgayLamViec = COALESCE($1::date, (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date))
    ORDER BY "LaCaCuaToi" DESC, l.NgayLamViec, l.GioBatDau, c.IdChiTietLD`, [date || null, all, idBacSi || null]);
  return result.rows;
};

exports.getPatientExamInfo = async id => {
  // Một lượt khám dùng một hồ sơ riêng; LATERAL giúp dữ liệu cũ có nhiều liên kết vẫn trả một bản ghi.
  const result = await pool.query(`SELECT ${selectProfile('h')}, ${identityFields},
    visit.IdChiTietLD AS "IdChiTietLD", visit.LiDoKham AS "LiDoKham",
    TO_CHAR(visit.NgayLamViec, 'YYYY-MM-DD') AS "NgayLamViec", visit.GioBatDau AS "GioBatDau",
    visit."TenBacSi" AS "TenBacSi", visit.TrangThai AS "TrangThaiLich", visit."TenPhongKham" AS "TenPhongKham"
    FROM HOSOBENHNHAN h JOIN TAIKHOAN tk ON tk.IdTaiKhoan = h.IdTaiKhoan
    LEFT JOIN THONGTINNGUOITHAN nt ON nt.IdHoSoBenhNhan = h.IdHoSoBenhNhan
    LEFT JOIN LATERAL (
      SELECT c.IdChiTietLD, c.LiDoKham, l.NgayLamViec, l.GioBatDau, bs.HoTen AS "TenBacSi",
        d.TrangThai, pk.TenPhongKham AS "TenPhongKham" FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
      JOIN LICHLAMVIEC l ON l.IdLichLamViec = c.IdLichLamViec
      JOIN TAIKHOAN bs ON bs.IdTaiKhoan = l.IdBacSi JOIN PHONGKHAM pk ON pk.IdPhongKham = l.IdPhongKham
      WHERE c.IdHoSoBenhNhan = h.IdHoSoBenhNhan ORDER BY l.NgayLamViec DESC, l.GioBatDau DESC, c.IdChiTietLD LIMIT 1
    ) visit ON TRUE WHERE h.IdHoSoBenhNhan = $1`, [id]);
  if (!result.rows.length) return null;
  const [history, past] = await Promise.all([
    pool.query(`${samePerson} SELECT ts.IdTienSuBenh AS "IdTienSuBenh", ts.IdHoSoBenhNhan AS "IdHoSoBenhNhan",
      ts.TenBenh AS "TenBenh", ts.MoTa AS "MoTa", TO_CHAR(ts.ThoiDiemMac, 'YYYY-MM-DD') AS "ThoiDiemMac",
      ts.TrangThai AS "TrangThai", tk.HoTen AS "TenNguoiGhiNhan"
      FROM TIENSUBENH ts JOIN person p ON p.IdHoSoBenhNhan = ts.IdHoSoBenhNhan
      LEFT JOIN TAIKHOAN tk ON tk.IdTaiKhoan = ts.NguoiGhiNhan
      ORDER BY ts.ThoiDiemMac DESC NULLS LAST, ts.IdTienSuBenh`, [id]),
    pool.query(`${samePerson} SELECT c.IdChiTietLD AS "IdChiTietLD", h.IdHoSoBenhNhan AS "IdHoSoBenhNhan",
      TO_CHAR(l.NgayLamViec, 'YYYY-MM-DD') AS "NgayLamViec", l.GioBatDau AS "GioBatDau", bs.HoTen AS "TenBacSi",
      c.LiDoKham AS "LiDoKham", h.TrieuChung AS "TrieuChung", h.ChuanDoan AS "ChuanDoan", h.KetLuan AS "KetLuan"
      FROM person p JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan = p.IdHoSoBenhNhan
      JOIN CHITIETLICHDAT c ON c.IdHoSoBenhNhan = h.IdHoSoBenhNhan
      JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat JOIN LICHLAMVIEC l ON l.IdLichLamViec = c.IdLichLamViec
      JOIN TAIKHOAN bs ON bs.IdTaiKhoan = l.IdBacSi
      WHERE h.IdHoSoBenhNhan <> $1 AND d.TrangThai <> 'Đã hủy'
        AND (NULLIF(BTRIM(h.ChuanDoan), '') IS NOT NULL OR NULLIF(BTRIM(h.KetLuan), '') IS NOT NULL)
      ORDER BY l.NgayLamViec DESC, l.GioBatDau DESC, c.IdChiTietLD`, [id]),
  ]);
  return { ...result.rows[0], tienSuBenh: history.rows, lichSuKhamTruoc: past.rows };
};

exports.saveExam = async (id, fields, diagnosis) => {
  let client;
  try {
    client = await pool.connect();
    await client.query('BEGIN');
    const visit = await client.query(`SELECT d.IdLichDat AS "IdLichDat", d.TrangThai AS "TrangThaiLich"
      FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat = c.IdLichDat
      JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan = c.IdHoSoBenhNhan
      WHERE h.IdHoSoBenhNhan = $1 FOR UPDATE OF c, d, h`, [id]);
    if (!visit.rows.length) throw Object.assign(new Error('Không tìm thấy hồ sơ có lịch khám.'), { status: 404 });
    if (visit.rows.length !== 1) throw Object.assign(new Error('Hồ sơ liên kết nhiều lượt khám, cần kiểm tra trước khi cập nhật.'), { status: 409 });
    const state = visit.rows[0].TrangThaiLich;
    if (!diagnosis && !['Đã xác nhận', 'Đang khám'].includes(state)) {
      throw Object.assign(new Error(state === 'Đã đặt' ? 'Lịch hẹn chưa được nhân viên xác nhận.' : 'Lượt khám không ở trạng thái cho phép đo sinh hiệu.'), { status: 409 });
    }
    if (state === 'Đã hủy' || (!diagnosis && state === 'Hoàn thành')) {
      throw Object.assign(new Error('Không thể cập nhật sinh hiệu/lâm sàng cho lượt khám đã hủy hoặc đã hoàn thành.'), { status: 409 });
    }
    const names = Object.keys(fields);
    const values = Object.values(fields);
    // fields đã được Controller giới hạn theo danh sách cố định.
    const setters = names.map((name, i) => `${name} = $${i + 1}`);
    if (diagnosis) setters.push('ThoiDiemCapNhat = NOW()');
    values.push(id);
    const updated = await client.query(`UPDATE HOSOBENHNHAN SET ${setters.join(', ')}
      WHERE IdHoSoBenhNhan = $${values.length} RETURNING ${selectProfile('HOSOBENHNHAN')}`, values);
    await client.query(diagnosis
      ? `UPDATE LICHDAT SET TrangThai = 'Hoàn thành' WHERE IdLichDat = $1 AND TrangThai <> 'Đã hủy'`
      : `UPDATE LICHDAT SET TrangThai = 'Đang khám' WHERE IdLichDat = $1 AND TrangThai = 'Đã xác nhận'`,
    [visit.rows[0].IdLichDat]);
    await client.query('COMMIT');
    return updated.rows[0];
  } catch (error) {
    if (client) await client.query('ROLLBACK').catch(() => {});
    throw error;
  } finally {
    if (client) client.release();
  }
};
