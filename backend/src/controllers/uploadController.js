const {v2:cloudinary}=require('cloudinary');
const {handle,fail}=require('../utils/managementUtils');
exports.uploadImage=handle(async(req,res)=>{
  const folder=req.body?.folder||req.query.folder||'avatars';
  if(!['avatars','services','events'].includes(folder))fail(400,'Thư mục ảnh không hợp lệ.');
  if(folder!=='avatars'&&!['Chủ phòng khám','Admin'].includes(req.user.VaiTro))fail(403,'Bạn không có quyền tải ảnh dịch vụ hoặc sự kiện.');
  if(!req.file)fail(400,'Vui lòng chọn một ảnh JPEG, PNG, WebP hoặc GIF.');
  const {CLOUDINARY_CLOUD_NAME,CLOUDINARY_API_KEY,CLOUDINARY_API_SECRET}=process.env;
  if(!CLOUDINARY_CLOUD_NAME||!CLOUDINARY_API_KEY||!CLOUDINARY_API_SECRET)fail(503,'Chưa cấu hình Cloudinary. Vui lòng cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET hoặc dán URL ảnh trực tiếp.');
  const b=req.file.buffer;
  const valid=b.length>=12&&((req.file.mimetype==='image/jpeg'&&b[0]===255&&b[1]===216&&b[2]===255)
    ||(req.file.mimetype==='image/png'&&b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))
    ||(req.file.mimetype==='image/gif'&&/^GIF8[79]a$/.test(b.subarray(0,6).toString()))
    ||(req.file.mimetype==='image/webp'&&b.subarray(0,4).toString()==='RIFF'&&b.subarray(8,12).toString()==='WEBP'));
  if(!valid)fail(400,'Nội dung file không đúng định dạng ảnh đã chọn.');
  cloudinary.config({cloud_name:CLOUDINARY_CLOUD_NAME,api_key:CLOUDINARY_API_KEY,api_secret:CLOUDINARY_API_SECRET});
  try{
    const result=await new Promise((resolve,reject)=>{
      const stream=cloudinary.uploader.upload_stream({folder:`clinic-ai/${folder}`,resource_type:'image',quality:'auto',fetch_format:'auto'},(error,result)=>error?reject(error):resolve(result));
      stream.end(b);
    });
    res.json({url:result.secure_url});
  }catch{fail(502,'Không thể tải ảnh lên Cloudinary. Vui lòng thử lại hoặc dán URL ảnh trực tiếp.');}
});
