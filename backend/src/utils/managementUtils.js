const pool = require('../config/db');
const fail = (status, message) => { throw Object.assign(new Error(message), { status }); };
const columns = (names, alias = '') => names.map(name => `${alias ? alias + '.' : ''}${name} AS "${name}"`).join(', ');
const handle = action => async (req, res) => {
  try { await action(req, res); } catch (error) {
    if (error.code === '23505') return res.status(409).json({ error: 'Tên tài khoản, CCCD, số điện thoại hoặc email đã được sử dụng.' });
    if (!error.status) console.error('Lỗi quản lý nghiệp vụ:', error.code || error.message);
    return res.status(error.status || 500).json({ error: error.status ? error.message : 'Không thể xử lý yêu cầu. Vui lòng thử lại.' });
  }
};
async function transaction(action) {
  const client = await pool.connect();
  try { await client.query('BEGIN'); const result = await action(client); await client.query('COMMIT'); return result; }
  catch (error) { await client.query('ROLLBACK').catch(() => {}); throw error; }
  finally { client.release(); }
}
function text(value, label, max = 255, required = true) {
  if (value == null || value === '') { if (required) fail(400, `Vui lòng nhập ${label}.`); return null; }
  if (typeof value !== 'string' || value.trim().length > max || (required && !value.trim())) fail(400, `${label} không hợp lệ.`);
  return value.trim() || null;
}
function choice(value, allowed, label) { if (!allowed.includes(value)) fail(400, `${label} không hợp lệ.`); return value; }
function date(value) {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) fail(400, 'Ngày phải có dạng YYYY-MM-DD.');
  const parsed = new Date(value + 'T00:00:00Z');
  if (!Number.isFinite(parsed.getTime()) || parsed.toISOString().slice(0, 10) !== value) fail(400, 'Ngày không hợp lệ.');
  return value;
}
function time(value, optional = false) {
  if (optional && !value) return null;
  if (typeof value !== 'string' || !/^([01]\d|2[0-3]):[0-5]\d(:[0-5]\d)?$/.test(value)) fail(400, 'Giờ phải có dạng HH:mm hoặc HH:mm:ss.');
  return value.length === 5 ? value + ':00' : value;
}
const roles = ['Bệnh nhân', 'Nhân viên', 'Y tá', 'Bác sĩ', 'Admin', 'Chủ phòng khám'];
module.exports = { fail, columns, handle, transaction, text, choice, date, time, roles };
