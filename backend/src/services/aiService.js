const pool=require('../config/db');
const examinationService=require('./examinationService');
const {generateId}=require('../utils/idGenerator');
const {transaction,fail}=require('../utils/managementUtils');
const categories=['TOMTAT','PHANTICH','CANHBAO'];
const disclaimer='Nội dung do AI tổng hợp chỉ mang tính chất tham khảo hỗ trợ lâm sàng, không thay thế chẩn đoán và quyết định điều trị của bác sĩ.';
const resultColumns=`IdAIKetQua AS "IdAIKetQua",IdChiTietLD AS "IdChiTietLD",LoaiKetQua AS "LoaiKetQua",NoiDung AS "NoiDung",
  TO_CHAR(ThoiDiemTao,'YYYY-MM-DD"T"HH24:MI:SS.US')||'+07:00' AS "ThoiDiemTao"`;
const unavailable=()=>fail(502,'Dịch vụ phân tích AI hiện không khả dụng. Vui lòng thử lại sau.');
function validateVisitId(id){if(typeof id!=='string'||!/^CT[A-Za-z0-9]{11}$/.test(id))fail(400,'Mã chi tiết lịch đặt không hợp lệ.');return id;}
async function visit(db,id,lock=false){
  const result=await db.query(`SELECT d.TrangThai AS "TrangThai" FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat=c.IdLichDat
    JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan=c.IdHoSoBenhNhan JOIN LICHLAMVIEC l ON l.IdLichLamViec=c.IdLichLamViec
    WHERE c.IdChiTietLD=$1 ${lock?'FOR UPDATE OF c,d,h,l':''}`,[id]);
  if(!result.rows.length)fail(404,'Không tìm thấy lượt khám.');
  return result.rows[0];
}
function payloadFromRecord(record){
  const pick=(source,fields)=>Object.fromEntries(fields.map(name=>[name,source[name]??null]));
  const vitals=pick(record,['NhietDo','HuyetApTamThu','HuyetApTamTruong','NhipTim','NhipTho','CanNang','ChieuCao']);
  for(const name of Object.keys(vitals))if(vitals[name]!==null)vitals[name]=Number(vitals[name]);
  return {IdChiTietLD:record.IdChiTietLD,IdHoSoBenhNhan:record.IdHoSoBenhNhan,
    BenhNhan:pick(record,['TenBenhNhan','GioiTinh','NgaySinh']),SinhHieu:vitals,
    LamSang:pick(record,['LiDoKham','TrieuChung','ThoiDiemKhoiPhat','MucDo','GhiChu']),
    tienSuBenh:record.tienSuBenh.map(row=>pick(row,['TenBenh','MoTa','ThoiDiemMac','TrangThai'])),
    lichSuKhamTruoc:record.lichSuKhamTruoc.map(row=>pick(row,['NgayLamViec','GioBatDau','TenBacSi','LiDoKham','TrieuChung','ChuanDoan','KetLuan']))};
}
function validateAnalysis(data,id){
  if(!data||data.IdChiTietLD!==id||!Array.isArray(data.ketQua)||data.ketQua.length!==3)unavailable();
  for(let i=0;i<3;i++)if(data.ketQua[i]?.LoaiKetQua!==categories[i]||typeof data.ketQua[i].NoiDung!=='string'||!data.ketQua[i].NoiDung.trim()||data.ketQua[i].NoiDung.length>500000)unavailable();
  if(!Array.isArray(data.canhBaoSinhHieu)||data.canhBaoSinhHieu.length>30||data.canhBaoSinhHieu.some(item=>!item||!['Lưu ý','Cảnh báo'].includes(item.mucDo)||['chiSo','giaTri','moTa'].some(key=>typeof item[key]!=='string'||item[key].length>2000)))unavailable();
  if(data.metadata?.ruleEngineVersion!=='1.0'||typeof data.metadata.llmUsed!=='boolean'||(data.metadata.model!==null&&typeof data.metadata.model!=='string'))unavailable();
  return data;
}
async function requestAnalysis(payload){
  const requested=Number(process.env.AI_SERVICE_TIMEOUT_MS||25000);
  const timeout=Number.isFinite(requested)&&requested>0&&requested<=120000?requested:25000;
  const signal=AbortSignal.timeout(timeout);
  try{
    const response=await fetch(`${(process.env.AI_SERVICE_URL||'http://localhost:8000').replace(/\/$/,'')}/analyze`,{
      method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(payload),signal,redirect:'error',
    });
    if(!response.ok)unavailable();
    const reader=response.body.getReader();const parts=[];let length=0;
    try{for(;;){const {done,value}=await reader.read();if(done)break;length+=value.length;if(length>2000000){await reader.cancel();unavailable();}parts.push(value);}}
    finally{reader.releaseLock();}
    return validateAnalysis(JSON.parse(Buffer.concat(parts).toString('utf8')),payload.IdChiTietLD);
  }catch{unavailable();}
}
const insertResult=async(client,id,category,content)=>{
  const result=await client.query(`INSERT INTO AIKETQUA (IdAIKetQua,IdChiTietLD,LoaiKetQua,NoiDung,ThoiDiemTao)
    VALUES ($1,$2,$3,$4,NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh') RETURNING ${resultColumns}`,[generateId('AI'),id,category,content]);
  return result.rows[0];
};
async function analyzeExam(id){
  if(typeof id!=='string'||!/^HS[A-Za-z0-9]{11}$/.test(id))fail(400,'Mã hồ sơ bệnh nhân không hợp lệ.');
  const record=await examinationService.getPatientExamInfo(id);
  if(!record)fail(404,'Không tìm thấy hồ sơ bệnh nhân.');
  if(!record.IdChiTietLD||record.TrangThaiLich==='Đã hủy')fail(409,'Hồ sơ chưa gắn lịch khám hoặc lượt khám đã hủy.');
  const payload=payloadFromRecord(record);const data=await requestAnalysis(payload);
  const results=await transaction(async client=>{
    const current=await visit(client,record.IdChiTietLD,true);
    if(current.TrangThai==='Đã hủy')fail(409,'Lượt khám đã hủy trong khi phân tích.');
    const fresh=await examinationService.getPatientExamInfo(id,client);
    if(!fresh||JSON.stringify(payloadFromRecord(fresh))!==JSON.stringify(payload))fail(409,'Hồ sơ đã thay đổi trong khi phân tích. Vui lòng tải lại và phân tích lại.');
    await client.query('DELETE FROM AIKETQUA WHERE IdChiTietLD=$1',[record.IdChiTietLD]);
    const rows=[];for(const block of data.ketQua)rows.push(await insertResult(client,record.IdChiTietLD,block.LoaiKetQua,block.NoiDung));
    return rows;
  });
  return {IdChiTietLD:record.IdChiTietLD,nhanThamKhao:disclaimer,canhBaoSinhHieu:data.canhBaoSinhHieu,
    metadata:{ruleEngineVersion:'1.0',llmUsed:data.metadata.llmUsed,model:data.metadata.model},results};
}
async function getResults(id){
  validateVisitId(id);await visit(pool,id);
  return (await pool.query(`SELECT ${resultColumns} FROM AIKETQUA WHERE IdChiTietLD=$1 ORDER BY ThoiDiemTao DESC,IdAIKetQua`,[id])).rows;
}
async function saveResult(body){
  const id=validateVisitId(body?.IdChiTietLD);
  if(!categories.includes(body.LoaiKetQua)||typeof body.NoiDung!=='string'||!body.NoiDung.trim()||body.NoiDung.length>500000)fail(400,'Loại kết quả hoặc nội dung AI không hợp lệ.');
  return transaction(async client=>{
    const current=await visit(client,id,true);if(current.TrangThai==='Đã hủy')fail(409,'Không thể ghi kết quả AI cho lượt khám đã hủy.');
    return insertResult(client,id,body.LoaiKetQua,body.NoiDung.trim());
  });
}
module.exports={analyzeExam,getResults,saveResult};
