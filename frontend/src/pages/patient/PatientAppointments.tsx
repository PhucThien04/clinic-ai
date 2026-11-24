import React from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {
  Calendar,
  Clock,
  User,
  CheckCircle2,
  AlertCircle,
  Stethoscope,
  Check,
  Lock,
} from "lucide-react";
import { usePatientBooking } from "../../hooks/usePatientBooking";
import { formatDate } from "../../utils/dateUtils";


export default function PatientAppointments(): React.JSX.Element {
  const {
    profiles,
    appointmentTab,setAppointmentTab,appointmentStatusTabs,filteredAppointments,
    availableDates,
    filteredSchedules,
    bookedScheduleIds,
    selectedDate,
    setSelectedDate,
    selectedScheduleId,
    setSelectedScheduleId,
    selectedProfile,
    setSelectedProfile,
    liDoKham,
    setLiDoKham,
    filterKeyword,
    status,
    loading,
    handleBooking,
    cancelAppointment,
    cancelStatus,
    canEditAppointment, editingAppointment, editSchedules, editScheduleId, setEditScheduleId,
    editReason, setEditReason, editError, openEditAppointment, closeEditAppointment, saveAppointment,
  } = usePatientBooking();

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto my-0 flex flex-col gap-[30px]">
        <div>
          <h1 className="text-[24px] text-slate-900 mb-2">Hệ Thống Đặt Lịch Khám Trực Tuyến</h1>
          <p className="text-slate-500 text-[14px]">
            Hệ thống tự động lọc lịch trực phù hợp với dịch vụ/sự kiện bạn đã
            chọn.
          </p>
        </div>

        {status.msg && (
          <div
            className={`flex items-center gap-2 [padding:12px_16px] rounded-[8px] [border:1px_solid_transparent] ${status.type === "success" ? "[background:#dcfce7] [color:#166534] [border-color:#bbf7d0]" : "bg-red-100 [color:#991b1b] [border-color:#fecaca]"}`}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span className="text-[14px] font-semibold">{status.msg}</span>
          </div>
        )}

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm p-6">
          <h2 className="text-[18px] text-slate-800 mb-4 flex items-center gap-2">
            <User size={20} color="#0284c7" /> Bước 1: Chọn Hồ Sơ Khám & Thông
            Tin
          </h2>
          <div className="grid grid-cols-[1fr_1fr] gap-5">
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-[6px]">Hồ Sơ Bệnh Nhân *</label>
              <select
                value={selectedProfile}
                onChange={(e) => setSelectedProfile(e.target.value)}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 bg-white"
              >
                {profiles.map((p) => (
                  <option key={p.IdHoSoBenhNhan} value={p.IdHoSoBenhNhan}>
                    {p.HoTen}{" "}
                    {p.LoaiThongTin === 0
                      ? "(Bản thân)"
                      : `- Người thân (${p.MoiQuanHe || "Khác"})`}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-slate-700 mb-[6px]">
                Lý do khám / Dịch vụ / Sự kiện
              </label>
              <input
                type="text"
                value={liDoKham}
                onChange={(e) => setLiDoKham(e.target.value)}
                placeholder="Ví dụ: Nhổ răng khôn..."
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
              />
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm p-6">
          <h2 className="text-[18px] text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} color="#0d9488" /> Bước 2: Chọn Ngày & Khung Giờ
            Trực
          </h2>

          <div className="mb-5">
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">Chọn Ngày Khám:</label>
            <div className="flex gap-[10px] flex-wrap">
              {availableDates.length === 0 ? (
                <div className="text-red-500 text-[14px] font-semibold">
                  {filterKeyword
                    ? `Chưa có lịch trực nào cho "${filterKeyword}".`
                    : "Chưa có lịch làm việc nào được mở."}
                </div>
              ) : (
                availableDates.map((date) => (
                  <button
                    key={date}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date);
                      setSelectedScheduleId("");
                    }}
                    className={`[padding:10px_18px] rounded-[8px] font-semibold cursor-pointer text-[14px] [transition:all_0.2s] ${selectedDate === date ? "[border:2px_solid_#0284c7] bg-sky-600 text-white" : "[border:1px_solid_#cbd5e1] bg-white text-slate-700"}`}
                  >
                    {formatDate(date)}
                  </button>
                ))
              )}
            </div>
          </div>

          <div>
            <label className="block text-[13px] font-semibold text-slate-700 mb-2">
              Khung Giờ Trực {filterKeyword ? "Dành Riêng" : ""}:
            </label>
            {filteredSchedules.length === 0 ? (
              <div className="p-5 text-center bg-slate-50 rounded-[8px] text-slate-500">
                Không có ca trực phù hợp trong ngày này.
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,_minmax(260px,_1fr))] gap-4">
                {filteredSchedules.map((s) => {
                  const isBooked = bookedScheduleIds.has(s.IdLichLamViec);
                  const isSelected = selectedScheduleId === s.IdLichLamViec;
                  return (
                    <div
                      key={s.IdLichLamViec}
                      onClick={() => {
                        if (!isBooked) setSelectedScheduleId(s.IdLichLamViec);
                      }}
                      className={`rounded-[12px] p-4 [transition:all_0.2s] relative ${isBooked ? "[border:2px_solid_#cbd5e1] bg-slate-100 cursor-not-allowed [opacity:0.6]" : isSelected ? "[border:2px_solid_#0284c7] bg-sky-50 cursor-pointer" : "[border:2px_solid_#e2e8f0] bg-white cursor-pointer"}`}
                    >
                      {isBooked ? (
                        <div className="absolute [top:12px] [right:12px] bg-slate-400 text-white rounded-[20px] [padding:2px_8px] text-[11px] font-bold flex items-center gap-1">
                          <Lock size={10} /> Đã kín chỗ
                        </div>
                      ) : (
                        isSelected && (
                          <div className="absolute [top:12px] [right:12px] bg-sky-600 text-white rounded-full w-[22px] h-[22px] flex items-center justify-center">
                            <Check size={14} />
                          </div>
                        )
                      )}
                      <div className="flex items-center gap-[6px] text-[16px] font-extrabold text-slate-900 mb-2">
                        <Clock
                          size={16}
                          color={isBooked ? "#94a3b8" : "#0284c7"}
                        />
                        {s.GioBatDau} - {s.GioKetThuc}
                      </div>
                      <div className="text-[13px] text-slate-700 flex items-center gap-[6px]">
                        <Stethoscope size={14} color="#0d9488" />{" "}
                        <strong>BS:</strong> {s.TenBacSi}
                      </div>
                      {s.GhiChu && (
                        <div className="text-[12px] text-sky-600 bg-sky-100 [padding:4px_8px] rounded-[4px] mt-[6px]">{s.GhiChu}</div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="mt-6 flex justify-end [border-top:1px_solid_#e2e8f0] pt-5">
            <button
              type="button"
              disabled={loading || !selectedScheduleId}
              onClick={handleBooking}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [padding:12px_30px] text-[15px] cursor-pointer [&:disabled]:[opacity:0.6] [&:disabled]:cursor-not-allowed"
            >
              {loading ? "Đang xử lý..." : "Xác Nhận Đặt Lịch"}
            </button>
          </div>
        </div>

        <div>
          <h2 className="text-[18px] text-slate-800 mb-4 flex items-center gap-2">
            <Calendar size={20} color="#0d9488" /> Lịch Hẹn Đã Đặt
          </h2>
          <div className="mb-4 flex flex-wrap gap-2" aria-label="Lọc trạng thái lịch hẹn">{appointmentStatusTabs.map(tab=><button type="button" key={tab.value} aria-pressed={appointmentTab===tab.value} onClick={()=>setAppointmentTab(tab.value)} className={`rounded-lg border px-3 py-2 text-sm font-semibold ${appointmentTab===tab.value?'border-sky-600 bg-sky-600 text-white':'border-slate-200 bg-white text-slate-600 hover:bg-sky-50'}`}>{tab.label} ({tab.count})</button>)}</div>
          {filteredAppointments.length === 0 ? (
            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm text-center p-[30px] text-slate-500">{appointmentTab==='all'?'Chưa có lịch hẹn khám nào.':'Chưa có lịch hẹn trong nhóm trạng thái này.'}</div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,_minmax(340px,_1fr))] gap-4">
              {filteredAppointments.map((apt) => {
                const showCancelStatus =
                  cancelStatus.id === apt.IdChiTietLD && cancelStatus.msg;
                const canCancel =
                  apt.TrangThai === "Đã đặt" || apt.TrangThai === "Chờ duyệt";

                return (
                  <div
                    key={apt.IdChiTietLD}
                    className={"rounded-xl border border-slate-200 bg-white p-6 shadow-sm p-5 [border-left:5px_solid_#0284c7] flex flex-col gap-[10px]" + " " + (apt.TrangThai === "Đã hủy" ? "[opacity:0.6]!" : "[opacity:1]!")}

                  >
                    <div className="flex justify-between items-center">
                      <span
                        className={"bg-sky-100 text-sky-600 [padding:4px_10px] rounded-[20px] text-[12px] font-bold" + " " + (apt.TrangThai === "Đã hủy" ? "bg-slate-100!" : "bg-sky-100!") + " " + (apt.TrangThai === "Đã hủy" ? "text-slate-500!" : "text-sky-600!")}

                      >
                        {apt.TrangThai}
                      </span>
                      <div  className="flex! items-center!">
                        <span className="text-[13px] text-slate-500 font-semibold">Mã: {apt.IdLichDat}</span>
                        {canEditAppointment(apt) && (
                          <button type="button" disabled={loading} onClick={() => openEditAppointment(apt)}
                            className="ml-2 rounded-md border border-sky-600 px-3 py-1.5 text-xs font-semibold text-sky-600 hover:bg-sky-50 disabled:opacity-50">
                            Đổi lịch
                          </button>
                        )}
                        {canCancel && (
                          <button
                            className="[padding:6px_12px] [background:transparent] text-red-500 [border:1px_solid_#fca5a5] rounded-[6px] text-[12px] font-semibold cursor-pointer [transition:all_0.2s] ml-[10px] [&:hover:not(:disabled)]:bg-red-100 [&:hover:not(:disabled)]:border-red-500 [&:disabled]:[opacity:0.5] [&:disabled]:cursor-not-allowed"
                            onClick={() => cancelAppointment(apt.IdChiTietLD)}
                            disabled={loading}
                          >
                            Hủy lịch
                          </button>
                        )}
                      </div>
                    </div>

                    {showCancelStatus && (
                      <div
                        role={cancelStatus.type === "error" ? "alert" : "status"}
                        className={`text-[12px] p-2 rounded-[4px] mt-2 ${cancelStatus.type === "success" ? "[background:#dcfce7] [color:#166534]" : "bg-red-100 [color:#991b1b]"}`}
                      >
                        {cancelStatus.msg}
                      </div>
                    )}

                    <div className="text-[15px] font-bold text-slate-900 flex items-center gap-[6px]">
                      <Calendar size={16} color="#0284c7" /> Ngày:{" "}
                      {formatDate(apt.NgayLamViec)} ({apt.GioBatDau} -{" "}
                      {apt.GioKetThuc})
                    </div>
                    <div className="text-[14px] text-slate-700">
                      <strong  className="text-teal-600!">Bác sĩ:</strong>{" "}
                      {apt.TenBacSi}
                    </div>
                    <div className="text-[14px] text-slate-500 bg-slate-50 [padding:8px_12px] rounded-[6px]">
                      <strong>Lý do:</strong> {apt.LiDoKham}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      {editingAppointment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4">
          <section role="dialog" aria-modal="true" aria-labelledby="edit-appointment-title"
            className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl">
            <h2 id="edit-appointment-title" className="text-xl font-bold text-slate-900">Cập nhật lịch khám</h2>
            <p className="mt-2 text-sm text-slate-600">Chỉ đổi lịch trước giờ khám ít nhất 6 tiếng. Ca mới cũng phải cách hiện tại ít nhất 6 tiếng.</p>
            <form onSubmit={saveAppointment} className="mt-5 flex flex-col gap-4">
              <label className="text-sm font-semibold text-slate-700">
                Ca khám
                <select autoFocus required value={editScheduleId} onChange={event => setEditScheduleId(event.target.value)}
                  className="mt-2 w-full rounded-lg border border-slate-200 bg-white p-2.5 focus:border-sky-600">
                  <option value="">Chọn ca khám</option>
                  {editSchedules.map(schedule => (
                    <option key={schedule.IdLichLamViec} value={schedule.IdLichLamViec}>
                      {formatDate(schedule.NgayLamViec)} · {schedule.GioBatDau.slice(0, 5)} · {schedule.TenBacSi}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm font-semibold text-slate-700">
                Lý do khám
                <textarea maxLength={255} value={editReason} onChange={event => setEditReason(event.target.value)}
                  className="mt-2 min-h-24 w-full rounded-lg border border-slate-200 p-2.5 focus:border-sky-600" />
              </label>
              {editError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{editError}</p>}
              <div className="flex justify-end gap-3">
                <button type="button" onClick={closeEditAppointment} disabled={loading}
                  className="rounded-lg border border-slate-200 px-4 py-2 text-slate-700 disabled:opacity-50">Đóng</button>
                <button type="submit" disabled={loading || !editScheduleId}
                  className="rounded-lg bg-sky-600 px-4 py-2 font-semibold text-white hover:bg-sky-700 disabled:opacity-50">
                  {loading ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </section>
        </div>
      )}
    </DashboardLayout>
  );
}
