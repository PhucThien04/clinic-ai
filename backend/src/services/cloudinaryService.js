const {v2:cloudinary}=require('cloudinary');
const {extractPublicId,mediaScope}=require('../utils/cloudinaryMedia');
const {fail}=require('../utils/managementUtils');
function configuredCloudinary(){
  const {CLOUDINARY_CLOUD_NAME:cloud_name,CLOUDINARY_API_KEY:api_key,CLOUDINARY_API_SECRET:api_secret}=process.env;
  if(!cloud_name||!api_key||!api_secret)fail(503,'Chưa cấu hình Cloudinary. Vui lòng cấu hình CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY và CLOUDINARY_API_SECRET.');
  cloudinary.config({cloud_name,api_key,api_secret});return cloudinary;
}
async function destroyImage(publicId){
  const client=configuredCloudinary();
  try{const result=await client.uploader.destroy(publicId,{resource_type:'image',invalidate:true});
    if(!['ok','not found'].includes(result.result))throw new Error();
  }catch{fail(502,'Không thể xóa ảnh trên Cloudinary. Vui lòng thử lại.');}
}
async function removeStoredImage(url,user,scope){
  const id=extractPublicId(url,process.env.CLOUDINARY_CLOUD_NAME);
  // Không suy đoán quyền xóa file cũ nằm ngoài thư mục được cấp phép.
  if(id&&mediaScope(id,user)===scope)await destroyImage(id);
}
async function uploadImage(buffer,folder){
  const client=configuredCloudinary();
  try{return await new Promise((resolve,reject)=>{
    const stream=client.uploader.upload_stream({folder,resource_type:'image',quality:'auto',fetch_format:'auto'},(error,result)=>error?reject(error):resolve(result));stream.end(buffer);
  });}catch{fail(502,'Không thể tải ảnh lên Cloudinary. Vui lòng thử lại.');}
}
async function listAvatars(user){
  const client=configuredCloudinary();const prefix=`clinic-ai/avatars/${user.IdTaiKhoan}/`;
  try{
    const images=[];let cursor;
    do{
      const result=await client.api.resources({type:'upload',resource_type:'image',prefix,max_results:500,...(cursor?{next_cursor:cursor}:{})});
      for(const item of result.resources||[])if(item.public_id.startsWith(prefix))images.push({publicId:item.public_id,url:item.secure_url,createdAt:item.created_at});
      cursor=result.next_cursor;
    }while(cursor);
    return images.sort((a,b)=>(b.createdAt||'').localeCompare(a.createdAt||''));
  }catch{fail(502,'Không thể tải thư viện ảnh đại diện. Vui lòng thử lại.');}
}
module.exports={destroyImage,removeStoredImage,uploadImage,listAvatars};
