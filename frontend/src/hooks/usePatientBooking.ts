import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import API from "../services/api";
import { authService } from "../services/authService";
import { appointmentService } from "../services/appointmentService";
import { getCancellationErrorMessage } from "../utils/patientActionErrors";

export interface ScheduleItem {
  IdLichLamViec: string;
  TenBacSi: string;
  TenPhongKham: string;
  NgayLamViec: string;
  GioBatDau: string;
  GioKetThuc: string;
  TrangThai: string;
  GhiChu?: string;
}

export interface AppointmentItem {
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

  useEffect(() => {
    if (location.state && (location.state as any).defaultReason) {
      setLiDoKham((location.state as any).defaultReason);
    }
  }, [location.state]);

  const fetchData = async () => {
    if (!currentUser) return;
    try {
      const [resSched, resApt, resProf, resAllApt] = await Promise.all([
        API.get("/schedules"),
        API.get(`/appointments?idTaiKhoan=${currentUser.IdTaiKhoan}`),
        API.get(`/patients/profiles?idTaiKhoan=${currentUser.IdTaiKhoan}`),
        API.get("/appointments/all").catch(() => ({ data: [] })),
      ]);

      setSchedules(resSched.data || []);
      setAppointments(resApt.data || []);

      const bookedSet = new Set<string>();
      const allAppts = [...(resAllApt.data || []), ...(resApt.data || [])];
      allAppts.forEach((a: any) => {
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
      if (profData.length > 0 && !selectedProfile) {
        setSelectedProfile(profData[0].IdHoSoBenhNhan);
      }
    } catch (err) {
      console.error("Lỗi đồng bộ dữ liệu đặt lịch:", err);
    }
  };

  useEffect(() => {
    fetchData();
  }, [currentUser?.IdTaiKhoan]);

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

  const relevantSchedules = useMemo(() => {
    if (!filterKeyword) return schedules;
    return schedules.filter((s) => {
      const note = (s.GhiChu || "").toLowerCase();
      const cleanNote = note
        .replace(/^(sự kiện:|chuyên sâu:|dịch vụ:)\s*/i, "")
        .trim();
      return (
        note.includes(filterKeyword) ||
        (cleanNote.length > 4 && filterKeyword.includes(cleanNote))
      );
    });
  }, [schedules, filterKeyword]);

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

  useEffect(() => {
    if (availableDates.length > 0 && !availableDates.includes(selectedDate))
      setSelectedDate(availableDates[0]);
    else if (availableDates.length === 0) setSelectedDate("");
  }, [availableDates, selectedDate]);

  const filteredSchedules = relevantSchedules.filter((s) =>
    s.NgayLamViec.startsWith(selectedDate),
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
      await API.post("/appointments", {
        IdTaiKhoan: currentUser!.IdTaiKhoan,
        IdHoSoBenhNhan: selectedProfile,
        IdLichLamViec: selectedScheduleId,
        LiDoKham: liDoKham,
        GhiChu: "",
      });

      setStatus({ type: "success", msg: "Đặt lịch khám thành công!" });
      setSelectedScheduleId("");
      fetchData();
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi đặt lịch khám!",
      });
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

  return {
    profiles,
    appointments,
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
  };
};
