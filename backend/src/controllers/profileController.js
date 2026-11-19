const pool=require('../config/db');
const {handle,columns,fail}=require('../utils/managementUtils');
const {mediaUrl}=require('../utils/mediaUrl');
const profileColumns=columns(['IdTaiKhoan','TenTaiKhoan','HoTen','CCCD','GioiTinh','Email','SoDienThoai','DiaChi','VaiTro','AnhDaiDien'])+`,TO_CHAR(NgaySinh,'YYYY-MM-DD') AS "NgaySinh"`;
exports.getProfile=handle(async(req,res)=>{
  const result=await pool.query(`SELECT ${profileColumns} FROM TAIKHOAN WHERE IdTaiKhoan=$1`,[req.user.IdTaiKhoan]);
  if(!result.rows.length)fail(404,'Không tìm thấy tài khoản.');
  res.json(result.rows[0]);
});
exports.updateProfile=handle(async(req,res)=>{
  const b=req.body||{};const hasImage=Object.hasOwn(b,'AnhDaiDien');
  const result=await pool.query(`UPDATE TAIKHOAN SET HoTen=COALESCE($1,HoTen),NgaySinh=COALESCE($2,NgaySinh),
    GioiTinh=COALESCE($3,GioiTinh),Email=COALESCE($4,Email),SoDienThoai=COALESCE($5,SoDienThoai),DiaChi=COALESCE($6,DiaChi),
    AnhDaiDien=CASE WHEN $8::boolean THEN $9 ELSE AnhDaiDien END WHERE IdTaiKhoan=$7 RETURNING ${profileColumns}`,
    [b.HoTen,b.NgaySinh,b.GioiTinh,b.Email,b.SoDienThoai,b.DiaChi,req.user.IdTaiKhoan,hasImage,hasImage?mediaUrl(b.AnhDaiDien):null]);
  if(!result.rows.length)fail(404,'Không tìm thấy tài khoản.');
  res.json({message:'Cập nhật thông tin cá nhân thành công!',profile:result.rows[0]});
});
