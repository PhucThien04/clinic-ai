const examinationService = require('../services/examinationService');

const reject = message => { throw Object.assign(new Error(message), { status: 400 }); };
const sendError = (res, error) => {
  if (!error.status) console.error('Lỗi xử lý khám lâm sàng:', error);
  return res.status(error.status || 500).json({ error: error.status ? error.message : 'Không thể xử lý dữ liệu khám. Vui lòng thử lại.' });
};
const profileId = value => {
  if (typeof value !== 'string' || !/^HS[A-Za-z0-9]{11}$/.test(value.trim())) reject('Mã hồ sơ bệnh nhân không hợp lệ (13 ký tự, bắt đầu bằng HS).');
  return value.trim();
};
const validDate = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return year >= 1000 && date.getUTCFullYear() === year && date.getUTCMonth() + 1 === month && date.getUTCDate() === day;
};

exports.getClinicalQueue = async (req, res) => {
  try {
    if (req.query.date !== undefined && !validDate(req.query.date)) reject('Ngày khám phải hợp lệ, theo định dạng YYYY-MM-DD.');
    if (req.query.all !== undefined && !['true', 'false'].includes(req.query.all)) reject('Tham số all phải là true hoặc false.');
    const queue = await examinationService.getClinicalQueue({ date: req.query.date,
      all: req.query.all === 'true', idBacSi: req.user.VaiTro === 'Bác sĩ' ? req.user.IdTaiKhoan : null });
    return res.json(queue);
  } catch (error) { return sendError(res, error); }
};

exports.getPatientExamInfo = async (req, res) => {
  try {
    const record = await examinationService.getPatientExamInfo(profileId(req.params.idHoSoBenhNhan));
    if (!record) return res.status(404).json({ error: 'Không tìm thấy hồ sơ bệnh nhân.' });
    return res.json(record);
  } catch (error) { return sendError(res, error); }
};

const numericFields = {
  NhietDo: { max: 999.9 }, HuyetApTamThu: { max: 32767, integer: true },
  HuyetApTamTruong: { max: 32767, integer: true }, NhipTim: { max: 32767, integer: true },
  NhipTho: { max: 32767, integer: true }, CanNang: { max: 999.99 }, ChieuCao: { max: 999.99 },
};

exports.updateClinicalVitals = async (req, res) => {
  try {
    const body = req.body || {};
    const id = profileId(body.idHoSoBenhNhan);
    const fields = {};
    for (const [name, rule] of Object.entries(numericFields)) {
      if (body[name] === undefined) continue;
      const value = body[name];
      if (value === null || (typeof value === 'string' && !value.trim())) { fields[name] = null; continue; }
      const number = Number(value);
      if (!['number', 'string'].includes(typeof value) || !Number.isFinite(number) || number < 0
          || number > rule.max || (rule.integer && !Number.isInteger(number))) reject(`Giá trị ${name} không hợp lệ.`);
      fields[name] = number;
    }
    for (const name of ['TrieuChung', 'MucDo', 'GhiChu']) {
      if (body[name] === undefined) continue;
      if (body[name] !== null && (typeof body[name] !== 'string' || body[name].length > 255)) reject(`Giá trị ${name} không hợp lệ.`);
      fields[name] = body[name]?.trim() || null;
    }
    if (fields.MucDo && !['Nhẹ', 'Trung bình', 'Nặng'].includes(fields.MucDo)) reject('Mức độ triệu chứng không hợp lệ.');
    if (body.ThoiDiemKhoiPhat !== undefined) {
      const value = body.ThoiDiemKhoiPhat;
      if (value !== null && typeof value !== 'string') reject('Thời điểm khởi phát không hợp lệ.');
      if (value && (typeof value !== 'string' || !validDate(value.slice(0, 10))
          || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?$/.test(value) || !Number.isFinite(Date.parse(value)))) {
        reject('Thời điểm khởi phát không hợp lệ.');
      }
      fields.ThoiDiemKhoiPhat = value || null;
    }
    if (!Object.values(fields).some(value => value !== null && value !== '')) reject('Vui lòng nhập dữ liệu sinh hiệu hoặc triệu chứng.');
    const hoso = await examinationService.saveExam(id, fields, false);
    return res.json({ message: 'Đã lưu sinh hiệu và cập nhật lượt khám.', hoso });
  } catch (error) { return sendError(res, error); }
};

exports.updateDoctorDiagnosis = async (req, res) => {
  try {
    const body = req.body || {};
    const id = profileId(body.idHoSoBenhNhan);
    const fields = {};
    for (const name of ['ChuanDoan', 'KetLuan']) {
      if (typeof body[name] !== 'string' || !body[name].trim() || body[name].length > 255) {
        reject('Vui lòng nhập chẩn đoán và kết luận, mỗi nội dung không quá 255 ký tự.');
      }
      fields[name] = body[name].trim();
    }
    const hoso = await examinationService.saveExam(id, fields, true);
    return res.json({ message: 'Đã lưu chẩn đoán, kết luận và hoàn thành lượt khám.', hoso });
  } catch (error) { return sendError(res, error); }
};
