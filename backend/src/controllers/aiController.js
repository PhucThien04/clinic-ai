const service=require('../services/aiService');
const {handle}=require('../utils/managementUtils');
exports.analyzePatientExam=handle(async(req,res)=>res.json(await service.analyzeExam(req.body?.idHoSoBenhNhan)));
exports.getAIResults=handle(async(req,res)=>{res.set('Cache-Control','no-store');res.json(await service.getResults(req.query.idChiTietLD));});
exports.saveAIResult=handle(async(req,res)=>res.status(201).json({message:'Đã lưu kết quả AI tham khảo.',aiResult:await service.saveResult(req.body)}));
