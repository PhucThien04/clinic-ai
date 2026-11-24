const router=require('express').Router();
const multer=require('multer');
const {verifyToken}=require('../middlewares/authMiddleware');
const {uploadImage,listAvatars,deleteImage}=require('../controllers/uploadController');
router.get('/avatars',verifyToken,listAvatars);
router.delete('/',verifyToken,deleteImage);
const upload=multer({storage:multer.memoryStorage(),limits:{fileSize:5*1024*1024,files:1,fields:1},fileFilter:(req,file,cb)=>{
  if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.mimetype))return cb(Object.assign(new Error('Chỉ chấp nhận ảnh JPEG, PNG, WebP hoặc GIF.'),{status:400}));
  cb(null,true);
}}).single('file');
router.post('/',verifyToken,(req,res,next)=>upload(req,res,error=>{
  if(error)return res.status(error.code==='LIMIT_FILE_SIZE'?413:400).json({error:error.code==='LIMIT_FILE_SIZE'?'Ảnh không được vượt quá 5MB.':'File tải lên không hợp lệ. Chỉ chọn một ảnh JPEG, PNG, WebP hoặc GIF.'});
  next();
}),uploadImage);
module.exports=router;
