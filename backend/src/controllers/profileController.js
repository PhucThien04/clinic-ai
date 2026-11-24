const pool=require('../config/db');
const {handle,columns,fail,transaction}=require('../utils/managementUtils');
const {mediaUrl}=require('../utils/mediaUrl');
const {removeStoredImage}=require('../services/cloudinaryService');
const {extractPublicId,mediaScope}=require('../utils/cloudinaryMedia');
const profileColumns=columns(['IdTaiKhoan','TenTaiKhoan','HoTen','CCCD','GioiTinh','Email','SoDienThoai','DiaChi','VaiTro','AnhDaiDien'])+`,TO_CHAR(NgaySinh,'YYYY-MM-DD') AS "NgaySinh"`;
exports.getProfile=handle(async(req,res)=>{
  const result=await pool.query(`SELECT ${profileColumns} FROM TAIKHOAN WHERE IdTaiKhoan=$1`,[req.user.IdTaiKhoan]);
  if(!result.rows.length)fail(404,'Không tìm thấy tài khoản.');
  res.json(result.rows[0]);
});
exports.updateProfile=handle(async(req,res)=>{
  const b=req.body||{};const hasImage=Object.hasOwn(b,'AnhDaiDien');
  const image=hasImage?mediaUrl(b.AnhDaiDien):null;
  const id=extractPublicId(image,process.env.CLOUDINARY_CLOUD_NAME);
  if(id&&mediaScope(id,req.user)!=='avatars')fail(403,'Chỉ được chọn ảnh đại diện trong thư viện của bạn.');
  const profile=await transaction(async client=>{
    const old=await client.query('SELECT AnhDaiDien AS "AnhDaiDien" FROM TAIKHOAN WHERE IdTaiKhoan=$1 FOR UPDATE',[req.user.IdTaiKhoan]);
    if(!old.rows.length)fail(404,'Không tìm thấy tài khoản.');
    const result=await client.query(`UPDATE TAIKHOAN SET HoTen=COALESCE($1,HoTen),NgaySinh=COALESCE($2,NgaySinh),
    GioiTinh=COALESCE($3,GioiTinh),Email=COALESCE($4,Email),SoDienThoai=COALESCE($5,SoDienThoai),DiaChi=COALESCE($6,DiaChi),
    AnhDaiDien=CASE WHEN $8::boolean AND $9::text IS NOT NULL THEN $9 ELSE AnhDaiDien END,ThoiDiemCapNhat=NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' WHERE IdTaiKhoan=$7 RETURNING ${profileColumns}`,
    [b.HoTen,b.NgaySinh,b.GioiTinh,b.Email,b.SoDienThoai,b.DiaChi,req.user.IdTaiKhoan,hasImage,image]);
    if(hasImage&&!image){
      await removeStoredImage(old.rows[0].AnhDaiDien,req.user,'avatars');
      return (await client.query(`UPDATE TAIKHOAN SET AnhDaiDien=NULL,ThoiDiemCapNhat=NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' WHERE IdTaiKhoan=$1 RETURNING ${profileColumns}`,[req.user.IdTaiKhoan])).rows[0];
    }
    return result.rows[0];
  });
  res.json({message:'Cập nhật thông tin cá nhân thành công!',profile});
});
