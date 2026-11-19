const pool = require('../config/db');
const bcrypt = require('bcrypt');
const {mediaUrl}=require('../utils/mediaUrl');
const { generateId } = require('../utils/idGenerator');
const { ensureSelfProfile } = require('../services/patientProfileService');
const { handle, transaction, columns, text, choice, roles, date, fail } = require('../utils/managementUtils');
const userColumns = columns(['IdTaiKhoan','TenTaiKhoan','HoTen','CCCD','GioiTinh','Email','SoDienThoai','DiaChi','TrangThai','VaiTro','AnhDaiDien']) + `,TO_CHAR(NgaySinh,'YYYY-MM-DD') AS "NgaySinh"`;
const deletionConflict='Không thể xóa tài khoản đã phát sinh dữ liệu nghiệp vụ liên quan. Vui lòng chuyển trạng thái sang Khóa.';
const contact = body => {
  const phone=text(body.SoDienThoai,'số điện thoại',10);
  if(!/^\d{10}$/.test(phone))fail(400,'Số điện thoại phải gồm 10 chữ số.');
  const email=text(body.Email,'email',100,false);
  if(email&&!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))fail(400,'Email không hợp lệ.');
  return {phone,email};
};
exports.getUsers = handle(async (req,res) => res.json((await pool.query(`SELECT ${userColumns} FROM TAIKHOAN ORDER BY HoTen,IdTaiKhoan`)).rows));
exports.createUser = handle(async (req,res) => {
  const b=req.body || {}; const {phone,email}=contact(b);
  const username=text(b.TenTaiKhoan,'tên đăng nhập',100);const name=text(b.HoTen,'họ tên');
  const cccd=text(b.CCCD,'CCCD',12); if(!/^\d{12}$/.test(cccd))fail(400,'CCCD phải gồm 12 chữ số.');
  const role=choice(b.VaiTro,roles,'Vai trò'); const password=text(b.MatKhau,'mật khẩu',72);
  if(password.length<6)fail(400,'Mật khẩu phải có ít nhất 6 ký tự.');
  const hash=await bcrypt.hash(password,10);const id=generateId('TK');
  const user=await transaction(async client => {
    const duplicate=await client.query('SELECT 1 FROM TAIKHOAN WHERE TenTaiKhoan=$1 OR CCCD=$2 OR SoDienThoai=$3 OR (Email=$4 AND $4 IS NOT NULL)',[username,cccd,phone,email]);
    if(duplicate.rows.length)fail(409,'Tên đăng nhập, CCCD, số điện thoại hoặc email đã được sử dụng.');
    const result=await client.query(`INSERT INTO TAIKHOAN (IdTaiKhoan,TenTaiKhoan,MatKhau,HoTen,CCCD,NgaySinh,GioiTinh,Email,SoDienThoai,DiaChi,TrangThai,VaiTro,AnhDaiDien)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING ${userColumns}`,
    [id,username,hash,name,cccd,b.NgaySinh?date(b.NgaySinh):null,text(b.GioiTinh,'giới tính',20,false),email,phone,text(b.DiaChi,'địa chỉ',255,false),choice(b.TrangThai||'Hoạt động',['Hoạt động','Khóa'],'Trạng thái'),role,mediaUrl(b.AnhDaiDien)]);
    if(role==='Bệnh nhân')await ensureSelfProfile(client,id);
    return result.rows[0];
  });
  res.status(201).json({message:'Đã tạo tài khoản.',user});
});
exports.updateUser = handle(async (req,res) => {
  const user=await transaction(async client=>{
    const existing=await client.query(`SELECT ${userColumns} FROM TAIKHOAN WHERE IdTaiKhoan=$1 FOR UPDATE`,[req.params.id]);
    if(!existing.rows.length)fail(404,'Không tìm thấy tài khoản.');
    const body={...existing.rows[0],...req.body};const {phone,email}=contact(body);
    const role=choice(body.VaiTro,roles,'Vai trò');const state=choice(body.TrangThai,['Hoạt động','Khóa'],'Trạng thái');
    if(existing.rows[0].IdTaiKhoan===req.user.IdTaiKhoan&&(role!=='Admin'||state!=='Hoạt động'))fail(400,'Admin không thể tự khóa hoặc tự đổi vai trò của mình.');
    let hash=null;
    if(req.body?.MatKhau){const password=text(req.body.MatKhau,'mật khẩu',72);if(password.length<6)fail(400,'Mật khẩu phải có ít nhất 6 ký tự.');hash=await bcrypt.hash(password,10);}
    const result=await client.query(`UPDATE TAIKHOAN SET HoTen=$1,VaiTro=$2,TrangThai=$3,SoDienThoai=$4,Email=$5,DiaChi=$6,MatKhau=COALESCE($7,MatKhau),AnhDaiDien=$9
      WHERE IdTaiKhoan=$8 RETURNING ${userColumns}`,[text(body.HoTen,'họ tên'),role,state,phone,email,text(body.DiaChi,'địa chỉ',255,false),hash,req.params.id,mediaUrl(body.AnhDaiDien)]);
    if(role==='Bệnh nhân')await ensureSelfProfile(client,req.params.id);
    return result.rows[0];
  });
  res.json({message:'Đã cập nhật tài khoản.',user});
});

exports.deleteUser = handle(async (req,res) => {
  try {
    await transaction(async client => {
      const result=await client.query('SELECT IdTaiKhoan AS "IdTaiKhoan",VaiTro AS "VaiTro" FROM TAIKHOAN WHERE IdTaiKhoan=$1 FOR UPDATE',[req.params.id]);
      if(!result.rows.length)fail(404,'Không tìm thấy tài khoản.');
      const account=result.rows[0];
      if(account.IdTaiKhoan===req.user.IdTaiKhoan)fail(400,'Không thể tự xóa tài khoản Admin đang đăng nhập.');
      const numeric=['NhietDo','HuyetApTamThu','HuyetApTamTruong','NhipTim','NhipTho','CanNang','ChieuCao'];
      const notes=['TrieuChung','MucDo','GhiChu','ChuanDoan','KetLuan'];
      const profiles=await client.query(`SELECT IdHoSoBenhNhan AS "IdHoSoBenhNhan",
        (LoaiThongTin=0 AND ${numeric.map(field=>`${field} IS NULL`).join(' AND ')}
          AND ${notes.map(field=>`NULLIF(BTRIM(${field}),'') IS NULL`).join(' AND ')}
          AND ThoiDiemKhoiPhat IS NULL AND ThoiDiemCapNhat IS NULL) AS "IsEmpty"
        FROM HOSOBENHNHAN WHERE IdTaiKhoan=$1 FOR UPDATE`,[account.IdTaiKhoan]);
      if(profiles.rows.length&&(account.VaiTro!=='Bệnh nhân'||profiles.rows.some(row=>!row.IsEmpty)))fail(409,deletionConflict);
      // Kiểm tra nghiệp vụ trước để không phụ thuộc một FK có vô tình dùng CASCADE hay không.
      const linked=await client.query(`SELECT (
        EXISTS(SELECT 1 FROM LICHDAT WHERE IdTaiKhoan=$1)
        OR EXISTS(SELECT 1 FROM LICHLAMVIEC WHERE IdBacSi=$1 OR NguoiCapNhat=$1)
        OR EXISTS(SELECT 1 FROM PHONGKHAM WHERE ChuPhongKham=$1)
        OR EXISTS(SELECT 1 FROM TIENSUBENH WHERE NguoiGhiNhan=$1)
        OR EXISTS(SELECT 1 FROM CHITIETLICHDAT c JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan=c.IdHoSoBenhNhan WHERE h.IdTaiKhoan=$1)
        OR EXISTS(SELECT 1 FROM TIENSUBENH t JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan=t.IdHoSoBenhNhan WHERE h.IdTaiKhoan=$1)
        OR EXISTS(SELECT 1 FROM THONGTINNGUOITHAN n JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan=n.IdHoSoBenhNhan WHERE h.IdTaiKhoan=$1)
      ) AS "HasBusinessData"`,[account.IdTaiKhoan]);
      if(linked.rows[0].HasBusinessData)fail(409,deletionConflict);
      if(account.VaiTro==='Bệnh nhân')await client.query('DELETE FROM HOSOBENHNHAN WHERE IdTaiKhoan=$1',[account.IdTaiKhoan]);
      await client.query('DELETE FROM TAIKHOAN WHERE IdTaiKhoan=$1',[account.IdTaiKhoan]);
    });
  } catch(error) {
    if(error.code==='23503')fail(409,deletionConflict);
    throw error;
  }
  res.json({message:'Đã xóa tài khoản.'});
});
