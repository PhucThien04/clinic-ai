const cloudinaryService=require('../services/cloudinaryService');
const {extractPublicId,mediaScope,validPublicId}=require('../utils/cloudinaryMedia');
const {handle,fail,transaction}=require('../utils/managementUtils');
exports.uploadImage=handle(async(req,res)=>{
  const type=req.query.type||req.body?.type;
  if(type&&type!=='avatar')fail(400,'Loại ảnh không hợp lệ.');
  const folder=type==='avatar'?'avatars':req.body?.folder||req.query.folder||'avatars';
  if(!['avatars','services','events'].includes(folder))fail(400,'Thư mục ảnh không hợp lệ.');
  if(folder!=='avatars'&&!['Chủ phòng khám','Admin'].includes(req.user.VaiTro))fail(403,'Bạn không có quyền tải ảnh dịch vụ hoặc sự kiện.');
  if(!req.file)fail(400,'Vui lòng chọn một ảnh JPEG, PNG, WebP hoặc GIF.');
  const b=req.file.buffer;
  const valid=b.length>=12&&((req.file.mimetype==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)
    ||(req.file.mimetype==='image/png'&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    ||(req.file.mimetype==='image/gif'&&/^GIF8[79]a$/.test(b.subarray(0,6).toString()))
    ||(req.file.mimetype==='image/webp'&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'));
  if(!valid)fail(400,'Nội dung file không đúng định dạng ảnh đã chọn.');
  const target=folder==='avatars'?`clinic-ai/avatars/${req.user.IdTaiKhoan}`:`clinic-ai/${folder}`;
  const result=await cloudinaryService.uploadImage(b,target);
  res.json({url:result.secure_url});
});
exports.listAvatars=handle(async(req,res)=>{res.set('Cache-Control','no-store');res.json({images:await cloudinaryService.listAvatars(req.user)});});
exports.deleteImage=handle(async(req,res)=>{
  const body=req.body||{};
  const fromUrl=body.url?extractPublicId(body.url,process.env.CLOUDINARY_CLOUD_NAME):null;
  const publicId=body.publicId||fromUrl;
  if(!validPublicId(publicId)||(body.url&&!fromUrl)||(body.publicId&&fromUrl&&body.publicId!==fromUrl))fail(400,'Mã hoặc URL ảnh Cloudinary không hợp lệ.');
  const scope=mediaScope(publicId,req.user);
  if(!scope)fail(403,'Bạn không có quyền xóa ảnh này.');
  await transaction(async client=>{
    const [table,idColumn,imageColumn]=scope==='avatars'?['TAIKHOAN','IdTaiKhoan','AnhDaiDien']:scope==='services'?['DICHVU','IdDichVu','HinhAnh']:['SUKIEN','IdSuKien','HinhAnh'];
    const rows=await client.query(`SELECT ${idColumn} AS "Id",${imageColumn} AS "Image" FROM ${table}
      ${scope==='avatars'?'WHERE IdTaiKhoan=$1':''} FOR UPDATE`,scope==='avatars'?[req.user.IdTaiKhoan]:[]);
    await cloudinaryService.destroyImage(publicId);
    for(const row of rows.rows)if(extractPublicId(row.Image,process.env.CLOUDINARY_CLOUD_NAME)===publicId)
      await client.query(`UPDATE ${table} SET ${imageColumn}=NULL WHERE ${idColumn}=$1`,[row.Id]);
  });
  res.json({message:'Đã xóa ảnh trên Cloudinary.'});
});
