// Chạy thủ công: npm run test:integration. Chỉ ghi vào schema kiểm thử riêng, tự dọn sau khi chạy.
const { test } = require('node:test');
const assert = require('node:assert/strict');
const { once } = require('node:events');
const { Pool } = require('pg');
const express = require('express');
const jwt = require('jsonwebtoken');
const { generateId } = require('../src/utils/idGenerator');
require('dotenv').config({ quiet: true });

test('Luồng Bệnh nhân qua HTTP với PostgreSQL trong schema cách ly', { timeout: 60000 }, async t => {
  const config = { user: process.env.DB_USER, host: process.env.DB_HOST,
    database: process.env.DB_NAME, password: process.env.DB_PASSWORD, port: process.env.DB_PORT,
    connectionTimeoutMillis: 5000 };
  const admin = new Pool(config);
  const schema = `patient_test_${process.pid}_${Date.now()}`;
  assert.match(schema, /^patient_test_\d+_\d+$/);
  let pool;
  let server;
  const dbPath = require.resolve('../src/config/db');
  const previousDb = require.cache[dbPath];
  const oldSecret = process.env.JWT_SECRET;
  process.env.JWT_SECRET = require('node:crypto').randomBytes(32).toString('hex');
  try {
    await admin.query(`CREATE SCHEMA ${schema}`);
    for (const table of ['taikhoan', 'phongkham', 'lichlamviec', 'hosobenhnhan', 'thongtinnguoithan', 'lichdat', 'chitietlichdat', 'tiensubenh']) {
      await admin.query(`CREATE TABLE ${schema}.${table} (LIKE public.${table} INCLUDING ALL)`);
    }
    // LIKE không sao chép FOREIGN KEY; khai báo các liên kết cần kiểm thử.
    for (const [table, column, target, key] of [
      ['hosobenhnhan', 'idtaikhoan', 'taikhoan', 'idtaikhoan'],
      ['thongtinnguoithan', 'idhosobenhnhan', 'hosobenhnhan', 'idhosobenhnhan'],
      ['lichdat', 'idtaikhoan', 'taikhoan', 'idtaikhoan'],
      ['chitietlichdat', 'idlichdat', 'lichdat', 'idlichdat'],
      ['chitietlichdat', 'idhosobenhnhan', 'hosobenhnhan', 'idhosobenhnhan'],
      ['chitietlichdat', 'idlichlamviec', 'lichlamviec', 'idlichlamviec'],
      ['tiensubenh', 'idhosobenhnhan', 'hosobenhnhan', 'idhosobenhnhan'],
      ['tiensubenh', 'idchitietld', 'chitietlichdat', 'idchitietld'],
    ]) await admin.query(`ALTER TABLE ${schema}.${table} ADD FOREIGN KEY (${column}) REFERENCES ${schema}.${target}(${key})`);

    pool = new Pool({ ...config, options: `-c search_path=${schema},public` });
    require.cache[dbPath] = { id: dbPath, filename: dbPath, loaded: true, exports: pool };
    const app = express();
    app.use(express.json());
    app.use('/api/auth', require('../src/routes/authRoutes'));
    app.use('/api/patients', require('../src/routes/patientRoutes'));
    app.use('/api/appointments', require('../src/routes/appointmentRoutes'));
    server = app.listen(0, '127.0.0.1');
    await once(server, 'listening');
    const root = `http://127.0.0.1:${server.address().port}/api`;
    async function request(method, endpoint, token, body) {
      const response = await fetch(root + endpoint, { method,
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: body === undefined ? undefined : JSON.stringify(body) });
      return { status: response.status, body: await response.json() };
    }
    let sequence = 0;
    async function register(role = 'Bệnh nhân') {
      const number = ++sequence;
      const credentials = { TenTaiKhoan: `patient_${number}`, MatKhau: 'Test-password-123!', HoTen: `Bệnh nhân ${number}`,
        CCCD: String(number).padStart(12, '0'), SoDienThoai: String(number).padStart(10, '0'), VaiTro: role };
      const response = await request('POST', '/auth/register', null, credentials);
      assert.equal(response.status, 201, JSON.stringify(response.body));
      const login = await request('POST', '/auth/login', null, credentials);
      assert.equal(login.status, 200, JSON.stringify(login.body));
      return { ...login.body, credentials };
    }
    let first;
    let second;
    let profile;
    await t.test('Public register không thể tạo Admin; tự tạo đúng một hồ sơ bản thân', async () => {
      first = await register('Admin');
      second = await register();
      assert.equal(first.user.VaiTro, 'Bệnh nhân');
      const profiles = await request('GET', '/patients/profiles', first.token);
      assert.equal(profiles.status, 200);
      assert.equal(profiles.body.filter(row => row.LoaiThongTin === 0).length, 1);
      profile = profiles.body[0].IdHoSoBenhNhan;
      await Promise.all([request('POST', '/auth/login', null, first.credentials), request('POST', '/auth/login', null, first.credentials)]);
      const count = await pool.query('SELECT COUNT(*) FROM HOSOBENHNHAN WHERE IdTaiKhoan = $1 AND LoaiThongTin = 0', [first.user.IdTaiKhoan]);
      assert.equal(Number(count.rows[0].count), 1);
    });
    await t.test('Tài khoản cũ thiếu hồ sơ được khôi phục khi đăng nhập; tài khoản khóa bị chặn', async () => {
      await pool.query('DELETE FROM HOSOBENHNHAN WHERE IdTaiKhoan = $1', [second.user.IdTaiKhoan]);
      const logins = await Promise.all([request('POST', '/auth/login', null, second.credentials), request('POST', '/auth/login', null, second.credentials)]);
      assert.ok(logins.every(row => row.status === 200));
      assert.equal((await request('GET', '/patients/profiles', second.token)).body.length, 1);
      await pool.query("UPDATE TAIKHOAN SET TrangThai = 'Khóa' WHERE IdTaiKhoan = $1", [second.user.IdTaiKhoan]);
      assert.equal((await request('POST', '/auth/login', null, second.credentials)).status, 403);
      await pool.query("UPDATE TAIKHOAN SET TrangThai = 'Hoạt động' WHERE IdTaiKhoan = $1", [second.user.IdTaiKhoan]);
    });
    await t.test('Mọi route patients/appointments yêu cầu JWT, JWT sai/hết hạn bị từ chối', async () => {
      for (const [method, endpoint] of [['GET', '/patients/profiles'], ['POST', '/patients/profiles'],
        ['GET', '/patients/histories'], ['POST', '/patients/histories'], ['PUT', '/patients/histories/unknown'],
        ['DELETE', '/patients/histories/unknown'], ['GET', '/patients/relatives'], ['PUT', '/patients/relatives'],
        ['GET', '/patients/exam-histories'], ['DELETE', `/patients/profiles/${profile}`],
        ['GET', '/appointments'], ['GET', '/appointments/all'], ['POST', '/appointments'],
        ['PUT', '/appointments/unknown'], ['PUT', '/appointments/unknown/cancel']]) {
        assert.equal((await request(method, endpoint, null)).status, 401, endpoint);
      }
      assert.equal((await request('GET', '/patients/profiles', 'invalid')).status, 401);
      const expired = jwt.sign({ IdTaiKhoan: first.user.IdTaiKhoan }, process.env.JWT_SECRET, { expiresIn: -1 });
      assert.equal((await request('GET', '/patients/profiles', expired)).status, 401);
    });
    await t.test('Không thể giả mạo tài khoản hoặc đọc/xóa hồ sơ của người khác', async () => {
      assert.equal((await request('GET', `/patients/profiles?idTaiKhoan=${first.user.IdTaiKhoan}`, second.token)).status, 403);
      assert.equal((await request('DELETE', `/patients/profiles/${profile}`, second.token)).status, 403);
      for (const endpoint of ['histories', 'exam-histories', 'relatives']) {
        assert.equal((await request('GET', `/patients/${endpoint}?idHoSoBenhNhan=${profile}`, second.token)).status, 403);
      }
      assert.equal((await request('POST', '/patients/profiles', second.token, { IdTaiKhoan: first.user.IdTaiKhoan, LoaiThongTin: 0 })).status, 403);
    });

    const clinic = generateId('PK');
    await pool.query(`INSERT INTO PHONGKHAM (IdPhongKham, ChuPhongKham, TenPhongKham, DiaChi, SoDienThoai, Email)
      VALUES ($1, $2, 'Phòng khám kiểm thử', 'Đà Nẵng', '0123456789', 'test@example.invalid')`, [clinic, first.user.IdTaiKhoan]);
    async function schedule(hours, state = 'Hoạt động') {
      const id = generateId('LLV');
      await pool.query(`INSERT INTO LICHLAMVIEC (IdLichLamViec, IdBacSi, IdPhongKham, NgayLamViec, GioBatDau, GioKetThuc, TrangThai, NguoiCapNhat)
        SELECT $1, $2, $3, moment::date, moment::time, (moment + interval '30 minutes')::time, $4, $2
        FROM (SELECT (clock_timestamp() AT TIME ZONE 'Asia/Ho_Chi_Minh') + $5 * interval '1 hour' AS moment) value`,
      [id, first.user.IdTaiKhoan, clinic, state, hours]);
      return id;
    }
    const initial = await schedule(48);
    const target = await schedule(72);
    const near = await schedule(1);
    const past = await schedule(-2);
    const paused = await schedule(48, 'Tạm ngưng');
    const book = (id, selectedProfile = profile, token = first.token) => request('POST', '/appointments', token,
      { IdHoSoBenhNhan: selectedProfile, IdLichLamViec: id, LiDoKham: 'Khám kiểm thử' });
    let appointment;
    await t.test('Chặn ca quá hạn/tạm ngưng; đặt hợp lệ và chặn ca kín chỗ', async () => {
      assert.equal((await book(past)).status, 400);
      assert.equal((await book(paused)).status, 400);
      const created = await book(initial);
      assert.equal(created.status, 201, JSON.stringify(created.body));
      appointment = created.body.appointment;
      assert.equal((await book(initial)).status, 409);
    });
    await t.test('Danh sách lịch riêng và endpoint kín chỗ không tiết lộ thông tin người khác', async () => {
      assert.equal((await request('GET', '/appointments', second.token)).body.length, 0);
      const occupied = await request('GET', '/appointments/all', second.token);
      assert.ok(occupied.body.every(row => Object.keys(row).join() === 'IdLichLamViec'));
      assert.equal((await request('PUT', `/appointments/${appointment.IdChiTietLD}/cancel`, second.token, {})).status, 403);
      assert.equal((await request('PUT', `/appointments/${appointment.IdChiTietLD}`, second.token, { IdLichLamViec: target })).status, 403);
      assert.equal((await book(target, profile, second.token)).status, 404);
    });
    await t.test('Đổi lịch hợp lệ; ca mới sát giờ bị chặn; lịch cũ vẫn giữ khi thất bại', async () => {
      assert.equal((await request('PUT', `/appointments/${appointment.IdChiTietLD}`, first.token, { IdLichLamViec: near })).status, 400);
      const changed = await request('PUT', `/appointments/${appointment.IdChiTietLD}`, first.token,
        { IdLichLamViec: target, LiDoKham: 'Đổi giờ khám' });
      assert.equal(changed.status, 200, JSON.stringify(changed.body));
      const mine = await request('GET', '/appointments', first.token);
      assert.equal(mine.body[0].IdLichLamViec, target);
      assert.equal(mine.body[0].LiDoKham, 'Đổi giờ khám');
      assert.match(mine.body[0].NgayLamViec, /^\d{4}-\d{2}-\d{2}$/);
      assert.equal((await request('DELETE', `/patients/profiles/${profile}`, first.token)).status, 409);
      assert.equal((await request('PUT', `/appointments/${appointment.IdChiTietLD}/cancel`, first.token, {})).status, 200);
      assert.equal((await request('PUT', `/appointments/${appointment.IdChiTietLD}`, first.token, { IdLichLamViec: initial })).status, 400);
      assert.equal((await book(initial)).status, 201);
    });
    await t.test('Lịch cũ dưới 6 tiếng không được sửa/hủy', async () => {
      const created = await book(near);
      assert.equal(created.status, 201);
      const id = created.body.appointment.IdChiTietLD;
      assert.equal((await request('PUT', `/appointments/${id}`, first.token, { IdLichLamViec: target })).status, 400);
      assert.equal((await request('PUT', `/appointments/${id}/cancel`, first.token, {})).status, 400);
    });
    await t.test('Hai yêu cầu đặt cùng ca đồng thời chỉ một yêu cầu thành công', async () => {
      const slot = await schedule(96);
      const result = await Promise.all([book(slot), book(slot)]);
      assert.deepEqual(result.map(row => row.status).sort(), [201, 409]);
    });
    await t.test('Người thân khám nhiều lần được nhân bản đúng loại và bảo toàn chẩn đoán', async () => {
      const relative = await request('POST', '/patients/profiles', first.token,
        { LoaiThongTin: 1, NguoiThan: { HoTen: 'Người thân kiểm thử', MoiQuanHe: 'Mẹ' } });
      assert.equal(relative.status, 201, JSON.stringify(relative.body));
      const id = relative.body.hoso.idhosobenhnhan;
      assert.equal((await book(await schedule(110), id)).status, 201);
      await pool.query("UPDATE HOSOBENHNHAN SET ChuanDoan = 'Chẩn đoán cũ' WHERE IdHoSoBenhNhan = $1", [id]);
      const next = await book(await schedule(120), id);
      assert.equal(next.status, 201, JSON.stringify(next.body));
      assert.notEqual(next.body.appointment.IdHoSoBenhNhan, id);
      const copy = await pool.query(`SELECT h.LoaiThongTin, n.HoTen, h.ChuanDoan FROM HOSOBENHNHAN h
        JOIN THONGTINNGUOITHAN n ON n.IdHoSoBenhNhan = h.IdHoSoBenhNhan WHERE h.IdHoSoBenhNhan = $1`, [next.body.appointment.IdHoSoBenhNhan]);
      assert.equal(copy.rows[0].loaithongtin, 1);
      assert.equal(copy.rows[0].hoten, 'Người thân kiểm thử');
      assert.equal(copy.rows[0].chuandoan, null);
      const old = await pool.query('SELECT ChuanDoan FROM HOSOBENHNHAN WHERE IdHoSoBenhNhan = $1', [id]);
      assert.equal(old.rows[0].chuandoan, 'Chẩn đoán cũ');
    });
    await t.test('CRUD bệnh nền tự khai báo và kiểm tra quyền sở hữu từng endpoint', async () => {
      const created = await request('POST', '/patients/histories', first.token,
        { IdHoSoBenhNhan: profile, TenBenh: 'Dị ứng', NguoiGhiNhan: second.user.IdTaiKhoan });
      assert.equal(created.status, 201, JSON.stringify(created.body));
      const id = created.body.history.idtiensubenh;
      assert.equal(created.body.history.nguoighinhan, first.user.IdTaiKhoan);
      assert.equal((await request('PUT', `/patients/histories/${id}`, second.token, { TenBenh: 'Sai quyền' })).status, 403);
      assert.equal((await request('DELETE', `/patients/histories/${id}`, second.token)).status, 403);
      assert.equal((await request('POST', '/patients/histories', second.token, { IdHoSoBenhNhan: profile, TenBenh: 'Sai quyền' })).status, 403);
      assert.equal((await request('PUT', `/patients/histories/${id}`, first.token, { TenBenh: 'Dị ứng thuốc' })).status, 200);
      assert.equal((await request('DELETE', `/patients/histories/${id}`, first.token)).status, 200);
    });
    await t.test('Xóa hồ sơ chưa khám và bảng phụ trong transaction', async () => {
      const relative = await request('POST', '/patients/profiles', first.token,
        { LoaiThongTin: 1, NguoiThan: { HoTen: 'Hồ sơ có thể xóa', MoiQuanHe: 'Con' } });
      const id = relative.body.hoso.idhosobenhnhan;
      const relativeId = relative.body.nguoithan.idthongtinnguoithan;
      assert.equal((await request('PUT', '/patients/relatives', second.token, { IdThongTinNguoiThan: relativeId, HoTen: 'Sai quyền' })).status, 403);
      assert.equal((await request('PUT', '/patients/relatives', first.token, { IdThongTinNguoiThan: relativeId, HoTen: 'Hồ sơ cập nhật' })).status, 200);
      assert.equal((await request('POST', '/patients/histories', first.token, { IdHoSoBenhNhan: id, TenBenh: 'Bệnh nền' })).status, 201);
      assert.equal((await request('DELETE', `/patients/profiles/${id}`, first.token)).status, 200);
      assert.equal((await pool.query('SELECT 1 FROM THONGTINNGUOITHAN WHERE IdHoSoBenhNhan = $1', [id])).rowCount, 0);
      assert.equal((await pool.query('SELECT 1 FROM TIENSUBENH WHERE IdHoSoBenhNhan = $1', [id])).rowCount, 0);
    });
  } finally {
    if (server) await new Promise(resolve => server.close(resolve));
    if (pool) await pool.end();
    if (previousDb) require.cache[dbPath] = previousDb;
    else delete require.cache[dbPath];
    if (oldSecret === undefined) delete process.env.JWT_SECRET;
    else process.env.JWT_SECRET = oldSecret;
    await admin.query(`DROP SCHEMA IF EXISTS ${schema} CASCADE`);
    await admin.end();
  }
});
