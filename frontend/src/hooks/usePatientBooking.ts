import {getApiErrorMessage} from '../utils/apiErrors';
import { useState, useEffect, useMemo, useCallback } from "react";
import { useLocation } from "react-router-dom";
import { isAxiosError } from "axios";
import { patientService } from "../services/patientService";
import { getClinicTimestamp } from "../utils/dateUtils";
import { authService } from "../services/authService";
import { appointmentService } from "../services/appointmentService";
import { getCancellationErrorMessage } from "../utils/patientActionErrors";
import {appointmentTabs,matchesAppointmentStatus} from '../utils/appointmentStatus';
import type {AppointmentTab} from '../utils/appointmentStatus';

interface ScheduleItem {
  IdLichLamViec: string;
  TenBacSi: string;
  TenPhongKham: string;
  NgayLamViec: string;
  GioBatDau: string;
  GioKetThuc: string;
  TrangThai: string;
  GhiChu?: string;
}

interface AppointmentItem {
  IdChiTietLD: string;
  IdLichDat: string;
  NgayLamViec: string;
  GioBatDau: string;
  GioKetThuc: string;
  TenPhongKham: string;
  TenBacSi: string;
  LiDoKham: string;
  TrangThai: string;
  IdLichLamViec?: string;
  IdHoSoBenhNhan: string;
}

export interface PatientProfile {
  IdHoSoBenhNhan: string;
  HoTen: string;
  LoaiThongTin: number;
  MoiQuanHe?: string;
}

export const usePatientBooking = () => {
  const currentUser = authService.getCurrentUser();
  const location = useLocation();

  const [schedules, setSchedules] = useState<ScheduleItem[]>([]);
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [appointments, setAppointments] = useState<AppointmentItem[]>([]);
  const [bookedScheduleIds, setBookedScheduleIds] = useState<Set<string>>(
    new Set(),
  );

  const [selectedDate, setSelectedDate] = useState<string>("");
  const [selectedScheduleId, setSelectedScheduleId] = useState<string>("");
  const [selectedProfile, setSelectedProfile] = useState<string>("");
  const [liDoKham, setLiDoKham] = useState<string>("");

  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });
  const [cancelStatus, setCancelStatus] = useState<{
    id: string;
    type: "success" | "error";
    msg: string;
  }>({ id: "", type: "success", msg: "" });
  const [loading, setLoading] = useState<boolean>(false);
  const [editingAppointment, setEditingAppointment] = useState<AppointmentItem | null>(null);
  const [editScheduleId, setEditScheduleId] = useState('');
  const [editReason, setEditReason] = useState('');
  const [editError, setEditError] = useState('');

  useEffect(() => {
    if (location.state && location.state.defaultReason) {
      queueMicrotask(()=>setLiDoKham(location.state.defaultReason));
    }
  }, [location.state]);

  const currentUserId=currentUser?.IdTaiKhoan as string|undefined;
  const fetchData = useCallback(async () => {
    if (!currentUserId) return;
    try {
      const [resSched, resApt, resProf, resAllApt] = await Promise.all([
        appointmentService.getSchedules(),
        appointmentService.getAppointments(),
        patientService.getProfiles(),
        appointmentService.getOccupiedSchedules(),
      ]);

      setSchedules(resSched.data || []);
      setAppointments(resApt.data || []);

      const bookedSet = new Set<string>();
      const allAppts = [...(resAllApt.data || []), ...(resApt.data || [])];
      allAppts.forEach((a: {IdLichLamViec?:string;TrangThai?:string}) => {
        if (a.IdLichLamViec && a.TrangThai !== "Đã hủy")
          bookedSet.add(a.IdLichLamViec);
      });
      setBookedScheduleIds(bookedSet);

      let profData: PatientProfile[] = resProf.data || [];
      let hasSelf = false;
      profData = profData.filter((p) => {
        if (p.LoaiThongTin === 0) {
          if (hasSelf) return false;
          hasSelf = true;
        }
        return true;
      });
      setProfiles(profData);
      setSelectedProfile(previous=>previous||profData[0]?.IdHoSoBenhNhan||'');
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu đặt lịch:", err);
    }
  },[currentUserId]);

  useEffect(() => {let active=true;queueMicrotask(()=>{if(active)void fetchData();});return()=>{active=false;};}, [fetchData]);

  const filterKeyword = useMemo(() => {
    if (
      liDoKham &&
      (liDoKham.startsWith("Đăng ký dịch vụ:") ||
        liDoKham.startsWith("Tham gia sự kiện:"))
    ) {
      return liDoKham
        .replace(/^(Đăng ký dịch vụ:|Tham gia sự kiện:)\s*/i, "")
        .trim()
        .toLowerCase();
    }
    return "";
  }, [liDoKham]);

  const [now,setNow]=useState(Date.now);
  useEffect(()=>{const timer=window.setInterval(()=>setNow(Date.now()),30000);return()=>window.clearInterval(timer);},[]);
  const relevantSchedules = useMemo(() => {
    const activeSchedules = schedules.filter(s => s.TrangThai === 'Hoạt động'
      && getClinicTimestamp(s.NgayLamViec, s.GioBatDau) > now);
    if (!filterKeyword) return activeSchedules;
    return activeSchedules.filter((s) => {
      const note = (s.GhiChu || "").toLowerCase();
      const cleanNote = note
        .replace(/^(sự kiện:|chuyên sâu:|dịch vụ:)\s*/i, "")
        .trim();
      return (
        note.includes(filterKeyword) ||
        (cleanNote.length > 4 && filterKeyword.includes(cleanNote))
      );
    });
  }, [schedules, filterKeyword,now]);

  const availableDates = useMemo(() => {
    return Array.from(
      new Set(
        relevantSchedules.map((s) =>
          s.NgayLamViec ? s.NgayLamViec.split("T")[0] : "",
        ),
      ),
    )
      .filter(Boolean)
      .sort();
  }, [relevantSchedules]);

  const effectiveDate=availableDates.includes(selectedDate)?selectedDate:availableDates[0]||'';

  const filteredSchedules = relevantSchedules.filter((s) =>
    s.NgayLamViec.startsWith(effectiveDate),
  );

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheduleId || !selectedProfile) {
      setStatus({
        type: "error",
        msg: "Vui lòng chọn ca khám và hồ sơ bệnh nhân!",
      });
      return;
    }

    setStatus({ type: "", msg: "" });
    setLoading(true);

    try {
      await appointmentService.createAppointment({
        IdHoSoBenhNhan: selectedProfile,
        IdLichLamViec: selectedScheduleId,
        LiDoKham: liDoKham,
      });

      setStatus({ type: "success", msg: "Đặt lịch khám thành công!" });
      setSelectedScheduleId("");
      fetchData();
    } catch (err: unknown) {
      setStatus({
        type: "error",
        msg: getApiErrorMessage(err,"Lỗi khi đặt lịch khám!"),
      });
    } finally {
      setLoading(false);
    }
  };

  const canEditAppointment = (appointment: AppointmentItem) =>
    ['Đã đặt', 'Chờ duyệt'].includes(appointment.TrangThai)
    && getClinicTimestamp(appointment.NgayLamViec, appointment.GioBatDau) - now >= 6 * 60 * 60 * 1000;

  const editSchedules = schedules.filter(schedule => schedule.TrangThai === 'Hoạt động'
    && getClinicTimestamp(schedule.NgayLamViec, schedule.GioBatDau) - now >= 6 * 60 * 60 * 1000
    && (!bookedScheduleIds.has(schedule.IdLichLamViec) || schedule.IdLichLamViec === editingAppointment?.IdLichLamViec));

  const openEditAppointment = (appointment: AppointmentItem) => {
    setEditingAppointment(appointment);
    setEditScheduleId(appointment.IdLichLamViec || '');
    setEditReason(appointment.LiDoKham || '');
    setEditError('');
  };

  const closeEditAppointment = () => { if (!loading) setEditingAppointment(null); };

  const saveAppointment = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!editingAppointment || !editScheduleId) return;
    setLoading(true);
    setEditError('');
    try {
      await appointmentService.updateAppointment(editingAppointment.IdChiTietLD, {
        IdLichLamViec: editScheduleId, LiDoKham: editReason,
      });
      setEditingAppointment(null);
      setStatus({ type: 'success', msg: 'Cập nhật lịch khám thành công!' });
      await fetchData();
    } catch (error: unknown) {
      setEditError(isAxiosError<{ error?: string }>(error)
        ? getApiErrorMessage(error,'Không thể đổi lịch. Vui lòng thử lại.')
        : 'Không thể đổi lịch. Vui lòng thử lại.');
    } finally {
      setLoading(false);
    }
  };

  const cancelAppointment = async (idChiTietLD: string) => {
    if (
      !window.confirm(
        "Bạn có chắc chắn muốn hủy lịch hẹn này không? (Lưu ý: Chỉ cho phép hủy trước 6 tiếng)",
      )
    ) {
      return;
    }

    setLoading(true);
    setCancelStatus({ id: idChiTietLD, type: "success", msg: "" });

    try {
      await appointmentService.cancelAppointment(idChiTietLD);
      setCancelStatus({
        id: idChiTietLD,
        type: "success",
        msg: "Hủy lịch thành công!",
      });
      fetchData();
    } catch (err: unknown) {
      setCancelStatus({
        id: idChiTietLD,
        type: "error",
        msg: getCancellationErrorMessage(err),
      });
    } finally {
      setLoading(false);
      setTimeout(
        () => setCancelStatus({ id: "", type: "success", msg: "" }),
        6000,
      );
    }
  };

  const [appointmentTab,setAppointmentTab]=useState<AppointmentTab>('all');
  const appointmentStatusTabs=useMemo(()=>appointmentTabs.map(tab=>({...tab,count:appointments.filter(appointment=>matchesAppointmentStatus(appointment.TrangThai,tab.value)).length})),[appointments]);
  const filteredAppointments=useMemo(()=>appointments.filter(appointment=>matchesAppointmentStatus(appointment.TrangThai,appointmentTab)),[appointments,appointmentTab]);
  return {
    appointmentTab,setAppointmentTab,appointmentStatusTabs,filteredAppointments,
    profiles,
    availableDates,
    filteredSchedules,
    bookedScheduleIds,
    selectedDate:effectiveDate,
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
  };
};
