// Chỉ bổ sung thời điểm cập nhật; không tạo bảng hoặc thay đổi dữ liệu nghiệp vụ.
async function ensureNotificationTimestamps(pool){
  const client=await pool.connect();
  try{
    await client.query('BEGIN');
    await client.query("SELECT pg_advisory_xact_lock(hashtext(current_schema()||':notification-timestamps'))");
    await client.query(`CREATE OR REPLACE FUNCTION touch_notification_timestamp() RETURNS trigger LANGUAGE plpgsql AS $$
      BEGIN NEW.ThoiDiemCapNhat := NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh'; RETURN NEW; END; $$`);
    for(const table of ['DICHVU','SUKIEN','LICHDAT','LICHLAMVIEC','TAIKHOAN']){
      await client.query(`ALTER TABLE ${table} ADD COLUMN IF NOT EXISTS ThoiDiemCapNhat TIMESTAMP`);
      await client.query(`ALTER TABLE ${table} ALTER COLUMN ThoiDiemCapNhat SET DEFAULT (NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh')`);
      await client.query(`UPDATE ${table} SET ThoiDiemCapNhat=NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh' WHERE ThoiDiemCapNhat IS NULL`);
      await client.query(`DROP TRIGGER IF EXISTS notification_timestamp ON ${table}`);
      await client.query(`CREATE TRIGGER notification_timestamp BEFORE INSERT OR UPDATE ON ${table}
        FOR EACH ROW EXECUTE FUNCTION touch_notification_timestamp()`);
    }
    await client.query('COMMIT');
  }catch(error){await client.query('ROLLBACK');throw error;}finally{client.release();}
}
module.exports={ensureNotificationTimestamps};
