const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const now = Date.parse('2026-11-18T00:00:00Z');

async function run(controller, action, results, connectionError) {
  const queries = [];
  let released = false;
  const client = {
    async query(sql, values) {
      queries.push({ sql, values });
      if (['BEGIN', 'COMMIT', 'ROLLBACK'].includes(sql)) return {};
      const result = results.shift();
      if (result instanceof Error) throw result;
      assert.ok(result, `Unexpected query: ${sql}`);
      return result;
    },
    release() { released = true; }
  };
  const pool = { async connect() {
    if (connectionError) throw connectionError;
    return client;
  } };
  const context = {
    exports: {}, console: { error() {} }, Date: { now: () => now },
    require(name) {
      if (name === '../config/db') return pool;
      if (name === '../utils/idGenerator') return {};
      throw new Error(`Unexpected import: ${name}`);
    }
  };
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, '../src/controllers', controller), 'utf8'), context);
  const response = { status(code) { this.code = code; return this; }, json(body) { this.body = body; return this; } };
  await context.exports[action]({ params: { id: 'CT00000000001' } }, response);
  assert.equal(released, !connectionError);
  assert.equal(results.length, 0);
  return { response, queries };
}

for (const state of ['Đã đặt', 'Chờ duyệt']) {
  for (const hours of [6, 7]) {
    test(`Hủy ${state}, còn ${hours} giờ`, async () => {
      const { response, queries } = await run('appointmentController.js', 'cancelAppointment', [
        { rows: [{ IdLichDat: 'LD00000000001', TrangThai: state, ExamTimestamp: String(now / 1000 + hours * 3600) }] },
        { rowCount: 1 }
      ]);
      assert.equal(response.code, 200);
      assert.match(queries[1].sql, /AS "TrangThai"/);
      assert.match(queries[1].sql, /Asia\/Ho_Chi_Minh/);
      assert.match(queries[1].sql, /WHERE c.IdChiTietLD = \$1/);
      assert.equal(queries.at(-1).sql, 'COMMIT');
      assert.equal(queries.at(-2).values[1], 'LD00000000001');
    });
  }
}

for (const state of ['Đã hủy', 'Đã xác nhận', 'Đang khám', 'Hoàn thành']) {
  test(`Từ chối hủy trạng thái ${state}`, async () => {
    const { response, queries } = await run('appointmentController.js', 'cancelAppointment', [
      { rows: [{ TrangThai: state }] }
    ]);
    assert.equal(response.code, 400);
    assert.ok(response.body.error);
    assert.equal(queries.at(-1).sql, 'ROLLBACK');
  });
}

for (const seconds of [6 * 3600 - 1, 0, -3600]) {
  test(`Từ chối hủy còn ${seconds} giây`, async () => {
    const { response, queries } = await run('appointmentController.js', 'cancelAppointment', [
      { rows: [{ TrangThai: 'Đã đặt', ExamTimestamp: now / 1000 + seconds }] }
    ]);
    assert.equal(response.code, 400);
    assert.match(response.body.error, /6 tiếng/);
    assert.equal(queries.at(-1).sql, 'ROLLBACK');
  });
}

for (const [controller, action] of [
  ['appointmentController.js', 'cancelAppointment'], ['patientController.js', 'deletePatientProfile']
]) {
  test(`${action}: không tồn tại`, async () => {
    const { response, queries } = await run(controller, action, [{ rows: [] }]);
    assert.equal(response.code, 404);
    assert.equal(queries.at(-1).sql, 'ROLLBACK');
  });
  test(`${action}: lỗi kết nối được xử lý`, async () => {
    const { response } = await run(controller, action, [], new Error('Connection unavailable'));
    assert.equal(response.code, 500);
  });
}

test('Xóa hồ sơ và dữ liệu phụ trong cùng transaction', async () => {
  const { response, queries } = await run('patientController.js', 'deletePatientProfile', [
    { rows: [{}] }, { rows: [] }, { rowCount: 1 }, { rowCount: 1 }, { rowCount: 1 }
  ]);
  assert.equal(response.code, 200);
  assert.match(queries[1].sql, /FOR UPDATE/);
  assert.match(queries[3].sql, /DELETE FROM THONGTINNGUOITHAN/);
  assert.match(queries[4].sql, /DELETE FROM TIENSUBENH/);
  assert.match(queries[5].sql, /DELETE FROM HOSOBENHNHAN/);
  assert.equal(queries.at(-1).sql, 'COMMIT');
});

for (const profile of [{ ChuanDoan: 'Chẩn đoán' }, { KetLuan: 'Kết luận' }, {}]) {
  test(`Bảo toàn hồ sơ đã dùng: ${JSON.stringify(profile)}`, async () => {
    const { response, queries } = await run('patientController.js', 'deletePatientProfile', [
      { rows: [profile] }, { rows: Object.keys(profile).length ? [] : [{ IdChiTietLD: 'CT00000000001' }] }
    ]);
    assert.equal(response.code, 409);
    assert.equal(queries.at(-1).sql, 'ROLLBACK');
    assert.ok(!queries.some(({ sql }) => sql.startsWith('DELETE')));
  });
}

for (const code of ['23503', 'XX000']) {
  test(`Rollback khi xóa thất bại: ${code}`, async () => {
    const error = Object.assign(new Error('Delete failed'), { code });
    const { response, queries } = await run('patientController.js', 'deletePatientProfile', [
      { rows: [{}] }, { rows: [] }, { rowCount: 1 }, error
    ]);
    assert.equal(response.code, code === '23503' ? 409 : 500);
    assert.equal(queries.at(-1).sql, 'ROLLBACK');
    assert.ok(!queries.some(({ sql }) => sql === 'COMMIT'));
  });
}

test('Rollback khi cập nhật hủy lịch thất bại', async () => {
  const { response, queries } = await run('appointmentController.js', 'cancelAppointment', [
    { rows: [{ TrangThai: 'Đã đặt', ExamTimestamp: now / 1000 + 7 * 3600 }] }, new Error('Update failed')
  ]);
  assert.equal(response.code, 500);
  assert.equal(queries.at(-1).sql, 'ROLLBACK');
});
