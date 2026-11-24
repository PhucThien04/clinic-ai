const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
function mediaUrl(value){
  if(value==null||value==='')return null;
  if(typeof value!=='string'||value.length>500||!/^https?:\/\//i.test(value))fail(400,'URL ảnh phải là http:// hoặc https:// và tối đa 500 ký tự.');
  try{const url=new URL(value);if(!['http:','https:'].includes(url.protocol)||url.username||url.password)throw new Error();}
  catch{fail(400,'URL ảnh phải là http:// hoặc https:// và tối đa 500 ký tự.');}
  return value;
}
module.exports={mediaUrl};
