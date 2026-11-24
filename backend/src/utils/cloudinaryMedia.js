function validPublicId(value){
  return typeof value==='string'&&value.length<=500&&/^[a-zA-Z0-9_./-]+$/.test(value)
    &&value.split('/').every(part=>part&&part!=='.'&&part!=='..');
}
function extractPublicId(value,cloudName){
  try{
    const url=new URL(value);
    if(url.hostname!=='res.cloudinary.com'||!['https:','http:'].includes(url.protocol)||url.username||url.password)return null;
    const match=/^\/([^/]+)\/image\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i.exec(url.pathname);
    if(!match||(cloudName&&match[1]!==cloudName))return null;
    const id=decodeURIComponent(match[2]);return validPublicId(id)?id:null;
  }catch{return null;}
}
function mediaScope(publicId,user){
  if(!validPublicId(publicId))return null;
  if(publicId.startsWith(`clinic-ai/avatars/${user.IdTaiKhoan}/`))return 'avatars';
  if(['Nhân viên','Admin','Chủ phòng khám'].includes(user.VaiTro)){
    if(publicId.startsWith('clinic-ai/services/'))return 'services';
    if(publicId.startsWith('clinic-ai/events/'))return 'events';
  }
  return null;
}
module.exports={extractPublicId,validPublicId,mediaScope};
