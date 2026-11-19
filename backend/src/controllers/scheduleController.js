const pool = require('../config/db');
const { generateId } = require('../utils/idGenerator');
const { handle, transaction, columns, fail, text, date, time, choice } = require('../utils/managementUtils');
const scheduleColumns = `IdLichLamViec AS "IdLichLamViec", IdBacSi AS "IdBacSi", IdPhongKham AS "IdPhongKham",
  TO_CHAR(NgayLamViec,'YYYY-MM-DD') AS "NgayLamViec", GioBatDau AS "GioBatDau", GioKetThuc AS "GioKetThuc",
  TrangThai AS "TrangThai", GhiChu AS "GhiChu", NguoiCapNhat AS "NguoiCapNhat"`;

exports.getSchedules = handle(async (req, res) => {
  const day = req.query.ngayLamViec ? date(req.query.ngayLamViec) : null;
  const result = await pool.query(`SELECT ${columns(['IdLichLamViec','IdBacSi','IdPhongKham','GioBatDau','GioKetThuc','TrangThai','GhiChu'], 'l')},
    t.HoTen AS "TenBacSi", p.TenPhongKham AS "TenPhongKham", TO_CHAR(l.NgayLamViec,'YYYY-MM-DD') AS "NgayLamViec"
    FROM LICHLAMVIEC l JOIN TAIKHOAN t ON t.IdTaiKhoan=l.IdBacSi JOIN PHONGKHAM p ON p.IdPhongKham=l.IdPhongKham
    WHERE ($1::text IS NULL OR l.IdBacSi=$1) AND ($2::date IS NULL OR l.NgayLamViec=$2::date)
    ORDER BY l.NgayLamViec,l.GioBatDau,l.IdLichLamViec`, [req.query.idBacSi || null, day]);
  res.json(result.rows);
});
exports.getResources = handle(async (req, res) => {
  const [doctors, clinics] = await Promise.all([
    pool.query(`SELECT ${columns(['IdTaiKhoan','HoTen'])} FROM TAIKHOAN WHERE VaiTro='Bác sĩ' AND TrangThai='Hoạt động' ORDER BY HoTen`),
    pool.query(`SELECT ${columns(['IdPhongKham','TenPhongKham'])} FROM PHONGKHAM ORDER BY IdPhongKham`),
  ]);
  res.json({ doctors: doctors.rows, clinics: clinics.rows });
});
async function save(req, update) {
  return transaction(async client => {
    // Tuần tự hóa việc sửa/tạo ca để kiểm tra trùng khung giờ an toàn khi có request đồng thời.
    await client.query("SELECT pg_advisory_xact_lock(hashtext('clinic-ai:schedules'))");
    let old = {};
    if (update) {
      const row = await client.query(`SELECT ${scheduleColumns} FROM LICHLAMVIEC WHERE IdLichLamViec=$1 FOR UPDATE`, [req.params.id]);
      if (!row.rows.length) fail(404, 'Không tìm thấy ca làm việc.');
      old = row.rows[0];
    }
    const body = { ...old, ...req.body };
    const values = { IdBacSi: text(body.IdBacSi,'bác sĩ',13), IdPhongKham: text(body.IdPhongKham,'phòng khám',13),
      NgayLamViec: date(body.NgayLamViec), GioBatDau: time(body.GioBatDau), GioKetThuc: time(body.GioKetThuc),
      TrangThai: choice(body.TrangThai || 'Hoạt động',['Hoạt động','Tạm ngưng'],'Trạng thái'), GhiChu: text(body.GhiChu,'ghi chú',255,false) };
    if (values.GioBatDau >= values.GioKetThuc) fail(400,'Giờ bắt đầu phải trước giờ kết thúc.');
    const fixed = ['IdBacSi','IdPhongKham','NgayLamViec','GioBatDau','GioKetThuc'];
    if (update) {
      const booked = await client.query(`SELECT 1 FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat=c.IdLichDat
        WHERE c.IdLichLamViec=$1 AND d.TrangThai<>'Đã hủy' LIMIT 1`, [req.params.id]);
      if (booked.rows.length && fixed.some(key => values[key] !== old[key])) fail(409,'Ca đã có lịch đặt, chỉ được sửa trạng thái hoặc ghi chú.');
    }
    const doctor = await client.query("SELECT 1 FROM TAIKHOAN WHERE IdTaiKhoan=$1 AND VaiTro='Bác sĩ'", [values.IdBacSi]);
    if (!doctor.rows.length) fail(400,'Bác sĩ không tồn tại hoặc không đúng vai trò.');
    if (!(await client.query('SELECT 1 FROM PHONGKHAM WHERE IdPhongKham=$1',[values.IdPhongKham])).rows.length) fail(400,'Phòng khám không tồn tại.');
    if (values.TrangThai === 'Hoạt động') {
      const conflict = await client.query(`SELECT 1 FROM LICHLAMVIEC WHERE IdBacSi=$1 AND NgayLamViec=$2 AND TrangThai='Hoạt động'
        AND GioBatDau<$4::time AND GioKetThuc>$3::time AND ($5::text IS NULL OR IdLichLamViec<>$5) LIMIT 1`,
      [values.IdBacSi,values.NgayLamViec,values.GioBatDau,values.GioKetThuc,update ? req.params.id : null]);
      if (conflict.rows.length) fail(409,'Bác sĩ đã có ca hoạt động trùng khung giờ trong ngày.');
    }
    const id = update ? req.params.id : generateId('LLV');
    const params = [...Object.values(values),req.user.IdTaiKhoan,id];
    const result = await client.query(update
      ? `UPDATE LICHLAMVIEC SET IdBacSi=$1,IdPhongKham=$2,NgayLamViec=$3,GioBatDau=$4,GioKetThuc=$5,TrangThai=$6,GhiChu=$7,NguoiCapNhat=$8 WHERE IdLichLamViec=$9 RETURNING ${scheduleColumns}`
      : `INSERT INTO LICHLAMVIEC (IdBacSi,IdPhongKham,NgayLamViec,GioBatDau,GioKetThuc,TrangThai,GhiChu,NguoiCapNhat,IdLichLamViec) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${scheduleColumns}`, params);
    return result.rows[0];
  });
}
exports.createSchedule = handle(async (req,res) => res.status(201).json({ message:'Đã tạo ca làm việc.',schedule:await save(req,false) }));
exports.updateSchedule = handle(async (req,res) => res.json({ message:'Đã cập nhật ca làm việc.',schedule:await save(req,true) }));
