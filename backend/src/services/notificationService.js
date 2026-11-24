const pool = require('../config/db');
const { fail } = require('../utils/managementUtils');
const today = "(CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')::date";
const vitals = ['NhietDo','HuyetApTamThu','HuyetApTamTruong','NhipTim','NhipTho','CanNang','ChieuCao'];
const iso=expression=>`TO_CHAR(${expression},'YYYY-MM-DD"T"HH24:MI:SS.US')||'+07:00'`;
const visitQuery = `SELECT c.IdChiTietLD AS "Id", d.TrangThai AS "Status",
  TO_CHAR(l.NgayLamViec,'YYYY-MM-DD') AS "Day", TO_CHAR(l.GioBatDau,'HH24:MI') AS "Time",
  ${iso('GREATEST(d.ThoiDiemCapNhat,l.ThoiDiemCapNhat,h.ThoiDiemCapNhat)')} AS "Timestamp",
  CASE WHEN h.LoaiThongTin=0 THEN tk.HoTen ELSE nt.HoTen END AS "Name", bs.HoTen AS "Doctor",
  (${vitals.map(field=>`h.${field} IS NOT NULL`).join(' OR ')}) AS "HasVitals",
  NULLIF(BTRIM(h.KetLuan),'') IS NOT NULL AS "HasConclusion",
  EXISTS(SELECT 1 FROM TIENSUBENH ts JOIN HOSOBENHNHAN ph ON ph.IdHoSoBenhNhan=ts.IdHoSoBenhNhan
    LEFT JOIN THONGTINNGUOITHAN pn ON pn.IdHoSoBenhNhan=ph.IdHoSoBenhNhan
    WHERE ph.IdTaiKhoan=h.IdTaiKhoan AND ph.LoaiThongTin=h.LoaiThongTin
      AND (h.LoaiThongTin=0 OR (pn.HoTen=nt.HoTen AND pn.MoiQuanHe=nt.MoiQuanHe))) AS "HasHistory"
  FROM CHITIETLICHDAT c JOIN LICHDAT d ON d.IdLichDat=c.IdLichDat
  JOIN LICHLAMVIEC l ON l.IdLichLamViec=c.IdLichLamViec
  JOIN HOSOBENHNHAN h ON h.IdHoSoBenhNhan=c.IdHoSoBenhNhan
  JOIN TAIKHOAN tk ON tk.IdTaiKhoan=h.IdTaiKhoan JOIN TAIKHOAN bs ON bs.IdTaiKhoan=l.IdBacSi
  LEFT JOIN THONGTINNGUOITHAN nt ON nt.IdHoSoBenhNhan=h.IdHoSoBenhNhan`;

exports.getNotifications = async user => {
  const notifications=[];
  const add=(id,title,message,type,category,link,timestamp=null,priority=0)=>notifications.push({id:timestamp?`${id}:${timestamp}`:id,title,message,type,category,link,timestamp,priority});
  const role=user.VaiTro;
  if(['Bệnh nhân','Nhân viên','Y tá','Bác sĩ'].includes(role)){
    let condition,params=[];
    if(role==='Bệnh nhân'){
      condition="d.IdTaiKhoan=$1 AND d.TrangThai IN ('Đã xác nhận','Đang khám','Hoàn thành','Đã hủy') AND (d.TrangThai<>'Hoàn thành' OR NULLIF(BTRIM(h.KetLuan),'') IS NOT NULL)";params=[user.IdTaiKhoan];
    }else if(role==='Nhân viên')condition=`(d.TrangThai='Đã đặt' OR (d.TrangThai='Đã hủy' AND d.ThoiDiemCapNhat >= (CURRENT_TIMESTAMP AT TIME ZONE 'Asia/Ho_Chi_Minh')-INTERVAL '7 days'))`;
    else if(role==='Y tá')condition=`l.NgayLamViec=${today} AND (d.TrangThai='Đang khám' OR (d.TrangThai='Đã xác nhận' AND NOT (${vitals.map(field=>`h.${field} IS NOT NULL`).join(' OR ')})))`;
    else {condition=`l.IdBacSi=$1 AND l.NgayLamViec=${today} AND d.TrangThai IN ('Đã xác nhận','Đang khám')`;params=[user.IdTaiKhoan];}
    const priorityOrder=role==='Bác sĩ'?'"HasVitals" DESC,"HasHistory" DESC':role==='Bệnh nhân'
      ?`CASE WHEN d.TrangThai='Đã xác nhận' AND l.NgayLamViec BETWEEN ${today} AND ${today}+1 THEN 0 ELSE 1 END`
      :role==='Y tá'?"CASE WHEN d.TrangThai='Đã xác nhận' THEN 0 ELSE 1 END"
      :"CASE WHEN d.TrangThai='Đã đặt' THEN 0 ELSE 1 END";
    const rows=(await pool.query(`${visitQuery} WHERE ${condition}
      ORDER BY ${priorityOrder},
        "Timestamp" DESC,l.NgayLamViec,l.GioBatDau,c.IdChiTietLD LIMIT ${['Bệnh nhân','Nhân viên'].includes(role)?15:20}`,params)).rows;
    const currentDay=(await pool.query(`SELECT TO_CHAR(${today},'YYYY-MM-DD') AS "Today",TO_CHAR(${today}+1,'YYYY-MM-DD') AS "Tomorrow"`)).rows[0];
    for(const row of rows){
      const reminder=role==='Bệnh nhân'&&row.Status==='Đã xác nhận'&&[currentDay.Today,currentDay.Tomorrow].includes(row.Day);
      const warning=row.Status==='Đã đặt'||role==='Y tá'&&!row.HasVitals||role==='Bác sĩ'&&(row.HasVitals||row.HasHistory)||reminder;
      const link=role==='Bệnh nhân'?(row.Status==='Hoàn thành'?'/patient-history':'/patient-appointments'):role==='Nhân viên'?'/staff':role==='Y tá'?'/nurse':'/doctor';
      const title=reminder?'Nhắc lịch khám '+(row.Day===currentDay.Today?'hôm nay':'ngày mai'):role==='Bác sĩ'&&row.HasVitals?'Bệnh nhân đã đo sinh hiệu':row.Status==='Đã đặt'?'Lịch hẹn chờ xác nhận':role==='Y tá'&&!row.HasVitals?'Bệnh nhân chờ đo sinh hiệu':`Lịch hẹn: ${row.Status}`;
      add(`visit:${row.Id}:${row.Status}:${row.HasVitals}:${row.HasHistory}:${reminder?currentDay.Today:''}`,title,
        `${row.Name||'Bệnh nhân'} · ${row.Day} ${row.Time} · Bác sĩ ${row.Doctor}${role==='Bác sĩ'&&row.HasHistory?' · Có tiền sử bệnh cần lưu ý.':''}`,
        warning?'warning':row.Status==='Hoàn thành'?'success':'info','appointment',link,row.Timestamp,warning?3:1);
    }
  }else if(!['Admin','Chủ phòng khám'].includes(role))fail(403,'Bạn không có quyền thực hiện chức năng này.');
  if(role==='Nhân viên'){
    const rows=(await pool.query(`SELECT IdLichLamViec AS "Id",TO_CHAR(GioBatDau,'HH24:MI') AS "Time",TrangThai AS "Status",
      ${iso('ThoiDiemCapNhat')} AS "Timestamp"
      FROM LICHLAMVIEC WHERE NgayLamViec=${today} ORDER BY ThoiDiemCapNhat DESC,GioBatDau LIMIT 5`)).rows;
    for(const row of rows)add(`schedule:${row.Id}:${row.Status}`,'Ca làm việc hôm nay',`${row.Time} · ${row.Status}`,'info','schedule','/staff',row.Timestamp);
  }
  if(role==='Admin'){
    const rows=(await pool.query(`SELECT IdTaiKhoan AS "Id",HoTen AS "Name",VaiTro AS "Role",TrangThai AS "Status",${iso('ThoiDiemCapNhat')} AS "Timestamp"
      FROM TAIKHOAN ORDER BY ThoiDiemCapNhat DESC,IdTaiKhoan DESC LIMIT 8`)).rows;
    for(const row of rows)add(`account:${row.Id}`,'Tài khoản cập nhật gần đây',`${row.Name} · ${row.Role}`,'info','account','/admin/users',row.Timestamp);
    const locked=(await pool.query(`SELECT (COUNT(*) FILTER (WHERE TrangThai='Khóa'))::int AS "Count",${iso('MAX(ThoiDiemCapNhat)')} AS "Timestamp" FROM TAIKHOAN`)).rows[0];
    if(locked.Count)add(`locked:${locked.Count}`,'Tài khoản đang khóa',`Có ${locked.Count} tài khoản đang ở trạng thái Khóa.`,'warning','account','/admin/users',locked.Timestamp,3);
  }
  if(role==='Chủ phòng khám'){
    const counts=(await pool.query(`SELECT d.TrangThai AS "Status",COUNT(*)::int AS "Count",${iso('MAX(GREATEST(d.ThoiDiemCapNhat,l.ThoiDiemCapNhat))')} AS "Timestamp" FROM CHITIETLICHDAT c
      JOIN LICHDAT d ON d.IdLichDat=c.IdLichDat JOIN LICHLAMVIEC l ON l.IdLichLamViec=c.IdLichLamViec
      WHERE l.NgayLamViec=${today} GROUP BY d.TrangThai`)).rows;
    const day=(await pool.query(`SELECT TO_CHAR(${today},'YYYY-MM-DD') AS "Day"`)).rows[0].Day;
    const summary=['Đã đặt','Đã xác nhận','Đang khám','Hoàn thành'].map(state=>`${state}: ${counts.find(row=>row.Status===state)?.Count||0}`).join(' · ');
    const latest=counts.map(row=>row.Timestamp).filter(Boolean).sort().at(-1)||null;
    add(`summary:${day}:${summary}`,'Hoạt động phòng khám hôm nay',summary,'info','summary','/owner/clinic',latest,3);
    const services=(await pool.query(`SELECT IdDichVu AS "Id",TenDichVu AS "Name",TrangThai AS "Status",${iso('ThoiDiemCapNhat')} AS "Timestamp" FROM DICHVU ORDER BY ThoiDiemCapNhat DESC,IdDichVu DESC LIMIT 5`)).rows;
    for(const row of services)add(`service:${row.Id}:${row.Status}`,'Danh mục dịch vụ',`${row.Name} · ${row.Status}`,'info','service','/owner/clinic?tab=services',row.Timestamp);
  }
  if(['Bệnh nhân','Chủ phòng khám'].includes(role)){
    const events=(await pool.query(`SELECT IdSuKien AS "Id",TieuDe AS "Title",${iso('ThoiDiemCapNhat')} AS "Timestamp"
      FROM SUKIEN WHERE TrangThai='Hiển thị' ORDER BY ThoiDiemCapNhat DESC,IdSuKien DESC LIMIT 5`)).rows;
    for(const row of events)add(`event:${row.Id}`,row.Title,'Xem thông tin sự kiện và ưu đãi của phòng khám.','info','event',role==='Chủ phòng khám'?'/owner/clinic?tab=events':'/su-kien',row.Timestamp);
  }
  return notifications.sort((a,b)=>b.priority-a.priority||(b.timestamp||'').localeCompare(a.timestamp||'')).slice(0,20).map(({priority,...notification})=>notification);
};
