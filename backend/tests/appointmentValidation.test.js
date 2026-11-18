const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const now = Date.parse('2026-11-18T00:00:00Z');
const sixHours = 6 * 3600;
const appointment = { IdLichDat: 'LD00000000001', IdLichLamViec: 'LLV0000000001',
  TrangThai: 'Đã đặt', ExamTimestamp: now / 1000 + sixHours };
const schedule = { TrangThai: 'Hoạt động', ExamTimestamp: now / 1000 + sixHours };

async function action(name, results, body = {}) {
  const calls = [];
  let released = false;
  const client = { query: async (sql, values) => {
    calls.push({ sql, values });
    if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)) return {};
    assert.ok(results.length, `Unexpected query: ${sql}`);
    return results.shift();
  }, release: () => { released = true; } };
  const context = { exports: {}, Date: { now: () => now }, console: { error() {} },
    require: name => {
      if (name === '../config/db') return { connect: async () => client };
      if (name === '../utils/idGenerator') return {};
      throw new Error(name);
    } };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers/appointmentController.js'), 'utf8'), context);
  const res = { status(code) { this.code = code; return this; }, json(value) { this.body = value; return this; } };
  await context.exports[name]({ params: { id: 'CT00000000001' }, user: { IdTaiKhoan: 'TK00000000001' }, body }, res);
  assert.equal(released, true);
  assert.equal(results.length, 0);
  return { res, calls };
}

test('Đổi lịch đúng mốc 6 tiếng được phép; cập nhật chỉ trong transaction', async () => {
  const { res, calls } = await action('updateAppointment', [
    { rows: [appointment] }, { rows: [schedule] }, { rows: [] }, { rowCount: 1 }
  ], { IdLichLamViec: 'LLV0000000002', LiDoKham: 'Khám lại' });
  assert.equal(res.code, 200);
  assert.equal(calls.at(-1).sql, 'COMMIT');
  assert.match(calls[1].sql, /d.IdTaiKhoan = \$2/);
  assert.equal(calls[1].values[1], 'TK00000000001');
  assert.equal(calls.at(-2).values[0], 'LLV0000000002');
  assert.equal(calls[3].values[1], 'CT00000000001');
});

test('Lịch cũ còn thiếu 1 giây so với mốc 6 tiếng không được đổi', async () => {
  const { res, calls } = await action('updateAppointment', [
    { rows: [{ ...appointment, ExamTimestamp: now / 1000 + sixHours - 1 }] }
  ]);
  assert.equal(res.code, 400);
  assert.equal(calls.at(-1).sql, 'ROLLBACK');
});

test('Ca mới còn thiếu 1 giây so với mốc 6 tiếng không được chọn', async () => {
  const { res, calls } = await action('updateAppointment', [
    { rows: [appointment] }, { rows: [{ ...schedule, ExamTimestamp: now / 1000 + sixHours - 1 }] }
  ]);
  assert.equal(res.code, 400);
  assert.equal(calls.at(-1).sql, 'ROLLBACK');
});

test('Ca mới kín chỗ rollback, không cập nhật lịch cũ', async () => {
  const { res, calls } = await action('updateAppointment', [
    { rows: [appointment] }, { rows: [schedule] }, { rows: [{ IdChiTietLD: 'CT00000000002' }] }
  ]);
  assert.equal(res.code, 409);
  assert.ok(!calls.some(call => call.sql.startsWith('UPDATE')));
  assert.equal(calls.at(-1).sql, 'ROLLBACK');
});

for (const [label, row, expected] of [
  ['không tồn tại', null, 404],
  ['tạm ngưng', { ...schedule, TrangThai: 'Tạm ngưng' }, 400],
  ['đã bắt đầu', { ...schedule, ExamTimestamp: now / 1000 }, 400],
  ['quá hạn', { ...schedule, ExamTimestamp: now / 1000 - 1 }, 400],
]) {
  test(`Đặt ca ${label} bị chặn tại Backend`, async () => {
    const { res, calls } = await action('createAppointment', [{ rows: row ? [row] : [] }],
      { IdHoSoBenhNhan: 'HS00000000001', IdLichLamViec: 'LLV0000000001' });
    assert.equal(res.code, expected);
    assert.equal(calls.at(-1).sql, 'ROLLBACK');
  });
}

test('Đặt thiếu dữ liệu rollback trước khi truy vấn ca khám', async () => {
  const { res, calls } = await action('createAppointment', []);
  assert.equal(res.code, 400);
  assert.equal(calls.length, 2);
});
