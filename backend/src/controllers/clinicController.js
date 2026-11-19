const pool = require('../config/db');
const {generateId}=require('../utils/idGenerator');
const {handle,transaction,columns,text,choice,time,date,fail}=require('../utils/managementUtils');
const clinicColumns=columns(['IdPhongKham','ChuPhongKham','TenPhongKham','DiaChi','SoDienThoai','Email','GioiThieu','GioMoCua','GioDongCua']);
const serviceColumns=columns(['IdDichVu','IdPhongKham','TenDichVu','MoTa','Gia','TrangThai']);
const eventColumns=columns(['IdSuKien','IdPhongKham','TieuDe','NoiDung','TrangThai'])+
  `,TO_CHAR(ThoiGianBatDau,'YYYY-MM-DD"T"HH24:MI:SS') AS "ThoiGianBatDau",TO_CHAR(ThoiGianKetThuc,'YYYY-MM-DD"T"HH24:MI:SS') AS "ThoiGianKetThuc"`;
function eventTimestamp(value){
  if(!value)return null;
  if(typeof value!=='string'||!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value))fail(400,'Thời gian sự kiện phải gồm ngày và giờ.');
  return date(value.slice(0,10))+'T'+time(value.slice(11));
}
async function currentClinic(db,id){
  const result=await db.query(`SELECT ${clinicColumns} FROM PHONGKHAM ${id?'WHERE IdPhongKham=$1':''} ORDER BY IdPhongKham LIMIT 1`,id?[id]:[]);
  if(!result.rows.length)fail(404,'Chưa có thông tin phòng khám. Vui lòng tạo thông tin phòng khám trước.');
  return result.rows[0];
}
exports.getClinicInfo=handle(async(req,res)=>{
  const result=await pool.query(`SELECT ${clinicColumns} FROM PHONGKHAM ORDER BY IdPhongKham LIMIT 1`);
  res.json(result.rows[0]||null);
});
exports.upsertClinicInfo=handle(async(req,res)=>{
  const b=req.body||{};
  const phone=text(b.SoDienThoai,'số điện thoại',10);if(!/^\d{10}$/.test(phone))fail(400,'Số điện thoại phải gồm 10 chữ số.');
  const email=text(b.Email,'email',100);if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Email không hợp lệ.');
  const open=time(b.GioMoCua,true);const close=time(b.GioDongCua,true);
  if((open&&!close)||(!open&&close)||(open&&close&&open>=close))fail(400,'Giờ mở cửa và đóng cửa phải đầy đủ, giờ mở trước giờ đóng.');
  const data=[req.user.IdTaiKhoan,text(b.TenPhongKham,'tên phòng khám'),text(b.DiaChi,'địa chỉ'),phone,email,text(b.GioiThieu,'giới thiệu',255,false),open,close];
  const info=await transaction(async client=>{
    await client.query("SELECT pg_advisory_xact_lock(hashtext('clinic-ai:clinic-info'))");
    const existing=await client.query('SELECT IdPhongKham AS "IdPhongKham" FROM PHONGKHAM ORDER BY IdPhongKham LIMIT 1 FOR UPDATE');
    const id=existing.rows[0]?.IdPhongKham||generateId('PK');
    const result=await client.query(existing.rows.length
      ? `UPDATE PHONGKHAM SET ChuPhongKham=$1,TenPhongKham=$2,DiaChi=$3,SoDienThoai=$4,Email=$5,GioiThieu=$6,GioMoCua=$7,GioDongCua=$8 WHERE IdPhongKham=$9 RETURNING ${clinicColumns}`
      : `INSERT INTO PHONGKHAM (ChuPhongKham,TenPhongKham,DiaChi,SoDienThoai,Email,GioiThieu,GioMoCua,GioDongCua,IdPhongKham) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING ${clinicColumns}`,[...data,id]);
    return result.rows[0];
  });
  res.json({message:'Đã lưu thông tin phòng khám.',phongKham:info});
});
exports.getServices=handle(async(req,res)=>{
  const result=await pool.query(`SELECT ${serviceColumns} FROM DICHVU
    WHERE ($1::text IS NULL OR IdPhongKham=$1) AND ($2::boolean OR TrangThai IN ('Hiển thị','Hoạt động')) ORDER BY TenDichVu,IdDichVu`,[req.query.idPhongKham||null,req.query.manage==='true']);
  res.json(result.rows);
});
exports.getEvents=handle(async(req,res)=>{
  const result=await pool.query(`SELECT ${eventColumns} FROM SUKIEN
    WHERE ($1::text IS NULL OR IdPhongKham=$1) AND ($2::boolean OR TrangThai='Hiển thị') ORDER BY ThoiGianBatDau DESC NULLS LAST,IdSuKien`,[req.query.idPhongKham||null,req.query.manage==='true']);
  res.json(result.rows);
});
async function saveService(req,update){
  return transaction(async client=>{
    let old={};
    if(update){const row=await client.query(`SELECT ${serviceColumns} FROM DICHVU WHERE IdDichVu=$1 FOR UPDATE`,[req.params.id]);if(!row.rows.length)fail(404,'Không tìm thấy dịch vụ.');old=row.rows[0];}
    const b={...old,...req.body};const clinic=await currentClinic(client,b.IdPhongKham);
    const price=String(b.Gia??'').trim();if(!/^\d{1,16}(\.\d{1,2})?$/.test(price))fail(400,'Giá dịch vụ phải là số không âm, tối đa 2 chữ số thập phân.');
    const id=update?req.params.id:generateId('DV');
    const values=[clinic.IdPhongKham,text(b.TenDichVu,'tên dịch vụ'),text(b.MoTa,'mô tả',255,false),price,
      choice(b.TrangThai||'Hiển thị',['Hiển thị','Hoạt động','Ngừng cung cấp'],'Trạng thái'),id];
    const result=await client.query(update
      ?`UPDATE DICHVU SET IdPhongKham=$1,TenDichVu=$2,MoTa=$3,Gia=$4,TrangThai=$5 WHERE IdDichVu=$6 RETURNING ${serviceColumns}`
      :`INSERT INTO DICHVU (IdPhongKham,TenDichVu,MoTa,Gia,TrangThai,IdDichVu) VALUES ($1,$2,$3,$4,$5,$6) RETURNING ${serviceColumns}`,values);
    return result.rows[0];
  });
}
async function saveEvent(req,update){
  return transaction(async client=>{
    let old={};
    if(update){const row=await client.query(`SELECT ${eventColumns} FROM SUKIEN WHERE IdSuKien=$1 FOR UPDATE`,[req.params.id]);if(!row.rows.length)fail(404,'Không tìm thấy sự kiện.');old=row.rows[0];}
    const b={...old,...req.body};const clinic=await currentClinic(client,b.IdPhongKham);
    const start=eventTimestamp(b.ThoiGianBatDau),end=eventTimestamp(b.ThoiGianKetThuc);
    if((start&&!end)||(!start&&end)||(start&&end&&start>=end))fail(400,'Thời điểm bắt đầu sự kiện phải trước thời điểm kết thúc.');
    const id=update?req.params.id:generateId('SK');
    const values=[clinic.IdPhongKham,text(b.TieuDe,'tiêu đề'),text(b.NoiDung,'nội dung',20000),
      choice(b.TrangThai||'Hiển thị',['Hiển thị','Ẩn'],'Trạng thái'),start,end,id];
    const result=await client.query(update
      ?`UPDATE SUKIEN SET IdPhongKham=$1,TieuDe=$2,NoiDung=$3,TrangThai=$4,ThoiGianBatDau=$5,ThoiGianKetThuc=$6 WHERE IdSuKien=$7 RETURNING ${eventColumns}`
      :`INSERT INTO SUKIEN (IdPhongKham,TieuDe,NoiDung,TrangThai,ThoiGianBatDau,ThoiGianKetThuc,IdSuKien) VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING ${eventColumns}`,values);
    return result.rows[0];
  });
}
exports.createService=handle(async(req,res)=>res.status(201).json({message:'Đã tạo dịch vụ.',dichVu:await saveService(req,false)}));
exports.updateService=handle(async(req,res)=>res.json({message:'Đã cập nhật dịch vụ.',dichVu:await saveService(req,true)}));
exports.createEvent=handle(async(req,res)=>res.status(201).json({message:'Đã tạo sự kiện.',suKien:await saveEvent(req,false)}));
exports.updateEvent=handle(async(req,res)=>res.json({message:'Đã cập nhật sự kiện.',suKien:await saveEvent(req,true)}));
