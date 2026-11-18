const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const { stripTypeScriptTypes } = require('node:module');

function loadUtility(name) {
  const source = fs.readFileSync(path.join(__dirname, '../src/utils', name), 'utf8');
  const names = [...source.matchAll(/export (?:const|function) (\w+)/g)].map(match => match[1]);
  const compiled = stripTypeScriptTypes(source)
    .replace(/import \{ isAxiosError \} from 'axios';/, "const { isAxiosError } = require('axios');")
    .replace(/export /g, '') + '\nObject.assign(exports, { ' + names.join(', ') + ' });';
  const context = { exports: {}, require, Date };
  vm.runInNewContext(compiled, context);
  return context.exports;
}

const { formatDate, getClinicTimestamp } = loadUtility('dateUtils.ts');
const { getCancellationErrorMessage, getProfileDeletionErrorMessage } = loadUtility('patientActionErrors.ts');
const apiError = (status, message) => ({ isAxiosError: true, response: { status, data: { error: message } } });

test('Ngày khám giữ nguyên qua các múi giờ', () => {
  const previous = process.env.TZ;
  try {
    for (const zone of ['UTC', 'Asia/Ho_Chi_Minh', 'America/Los_Angeles', 'Pacific/Kiritimati']) {
      process.env.TZ = zone;
      assert.equal(formatDate('2026-11-19'), '19/11/2026');
      assert.equal(formatDate('2026-11-19T23:00:00.000Z'), '19/11/2026');
      assert.equal(formatDate('2026-12-31'), '31/12/2026');
      assert.equal(formatDate('2028-02-29'), '29/02/2028');
    }
  } finally {
    if (previous === undefined) delete process.env.TZ;
    else process.env.TZ = previous;
  }
});

test('Ngày thiếu và ngày đã format không bị đổi', () => {
  assert.equal(formatDate(), '');
  assert.equal(formatDate('19/11/2026'), '19/11/2026');
});

test('Giờ khám luôn dùng UTC+7 khi kiểm tra điều kiện đổi lịch', () => {
  assert.equal(getClinicTimestamp('2026-11-19', '13:00:00'), Date.parse('2026-11-19T06:00:00Z'));
  assert.equal(getClinicTimestamp('2026-11-19', '00:00:00'), Date.parse('2026-11-18T17:00:00Z'));
});

test('Hủy sát giờ có thông báo thân thiện', () => {
  const message = getCancellationErrorMessage(apiError(400, 'Chỉ được phép hủy lịch trước giờ khám ít nhất 6 tiếng.'));
  assert.match(message, /Không thể hủy lịch cận giờ khám/);
  assert.match(message, /liên hệ phòng khám/);
});

test('Hủy sai trạng thái giữ thông báo chính xác từ backend', () => {
  const message = 'Lịch hẹn này đã bị hủy trước đó';
  assert.equal(getCancellationErrorMessage(apiError(400, message)), message);
});

test('Xóa hồ sơ gặp 409 có thông báo yêu cầu', () => {
  assert.equal(getProfileDeletionErrorMessage(apiError(409, 'Conflict')),
    'Không thể xóa hồ sơ đã có lịch sử khám bệnh tại phòng khám');
});

test('Xử lý lỗi mạng và lỗi không có response', () => {
  for (const error of [new Error('Network'), { isAxiosError: true }, null]) {
    assert.ok(getCancellationErrorMessage(error));
    assert.ok(getProfileDeletionErrorMessage(error));
  }
  assert.equal(getProfileDeletionErrorMessage(apiError(404, 'Không tìm thấy hồ sơ')), 'Không tìm thấy hồ sơ');
});
