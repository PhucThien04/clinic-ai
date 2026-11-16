import { useState, useEffect } from "react";
import { authService } from "../services/authService";
import API from "../services/api";

export interface PatientProfile {
  IdHoSoBenhNhan: string;
  LoaiThongTin: number; // 0: Bản thân, 1: Người thân
  IdThongTinNguoiThan?: string;
  MoiQuanHe?: string;
  HoTen?: string;
  NgaySinh?: string;
  GioiTinh?: string;
  SoDienThoai?: string;
  CCCD?: string;
  DiaChi?: string;
}

export interface ChronicDiseaseRecord {
  IdTienSuBenh: string;
  IdHoSoBenhNhan: string;
  TenBenh: string;
  MoTa?: string;
  ThoiDiemMac?: string;
  TrangThai?: string;
  TenNguoiGhiNhan?: string;
}

export interface MedicalHistoryRecord {
  IdLichDat: string;
  IdChiTietLD: string;
  NgayKham: string;
  GioBatDau?: string;
  TenBacSi: string;
  TenPhongKham?: string;
  LiDoKham?: string;
  TrangThaiLich?: string;
  TrieuChung?: string;
  ChuanDoan?: string;
  KetLuan?: string;
  NhietDo?: number;
  HuyetAp?: string;
}

export function usePatientHistory() {
  const [profiles, setProfiles] = useState<PatientProfile[]>([]);
  const [chronicDiseases, setChronicDiseases] = useState<
    ChronicDiseaseRecord[]
  >([]);
  const [examHistory, setExamHistory] = useState<MedicalHistoryRecord[]>([]);
  const [selectedProfileId, setSelectedProfileId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const currentUser = authService.getCurrentUser();

  const fetchProfiles = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const res = await API.get(
        `/patients/profiles?idTaiKhoan=${currentUser.IdTaiKhoan}`,
      );
      setProfiles(res.data || []);
      if (res.data?.length > 0 && !selectedProfileId) {
        setSelectedProfileId(res.data[0].IdHoSoBenhNhan);
      }
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfileDetails = async (profileId: string) => {
    if (!profileId) return;
    try {
      setLoading(true);
      const [resChronic, resExams] = await Promise.all([
        API.get(`/patients/histories?idHoSoBenhNhan=${profileId}`),
        API.get(`/patients/exam-histories?idHoSoBenhNhan=${profileId}`).catch(
          () => ({ data: [] }),
        ),
      ]);
      setChronicDiseases(resChronic.data || []);
      setExamHistory(resExams.data || []);
    } catch (error) {
      console.error("Lỗi tải dữ liệu tiền sử và lịch sử khám:", error);
    } finally {
      setLoading(false);
    }
  };

  // Thêm người thân
  const addRelativeProfile = async (relativeData: any) => {
    if (!currentUser) return { success: false, error: "Chưa đăng nhập" };
    try {
      await API.post("/patients/profiles", {
        IdTaiKhoan: currentUser.IdTaiKhoan,
        LoaiThongTin: 1,
        NguoiThan: relativeData,
      });
      await fetchProfiles();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Lỗi khi thêm hồ sơ người thân",
      };
    }
  };

  // Cập nhật người thân
  const updateRelativeProfile = async (relativeData: any) => {
    try {
      await API.put("/patients/relatives", relativeData);
      await fetchProfiles();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error:
          error.response?.data?.error || "Lỗi khi cập nhật hồ sơ người thân",
      };
    }
  };

  // Xóa hồ sơ người thân
  const deleteProfile = async (idHoSo: string) => {
    try {
      await API.delete(`/patients/profiles/${idHoSo}`);
      if (selectedProfileId === idHoSo) {
        setSelectedProfileId("");
      }
      await fetchProfiles();
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Lỗi khi xóa hồ sơ",
      };
    }
  };

  // Thêm tiền sử bệnh (bệnh nền)
  const addMedicalHistory = async (historyData: {
    TenBenh: string;
    MoTa?: string;
    ThoiDiemMac?: string;
    TrangThai?: string;
  }) => {
    if (!selectedProfileId || !currentUser)
      return { success: false, error: "Thiếu thông tin" };
    try {
      await API.post("/patients/histories", {
        IdHoSoBenhNhan: selectedProfileId,
        IdChiTietLD: null,
        NguoiGhiNhan: currentUser.IdTaiKhoan,
        ...historyData,
      });
      await fetchProfileDetails(selectedProfileId);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Lỗi khi thêm bệnh nền",
      };
    }
  };

  // Cập nhật tiền sử bệnh (bệnh nền)
  const updateMedicalHistory = async (
    idTienSu: string,
    historyData: {
      TenBenh: string;
      MoTa?: string;
      ThoiDiemMac?: string;
      TrangThai?: string;
    },
  ) => {
    try {
      await API.put(`/patients/histories/${idTienSu}`, historyData);
      await fetchProfileDetails(selectedProfileId);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Lỗi khi cập nhật bệnh nền",
      };
    }
  };

  // Xóa tiền sử bệnh
  const deleteMedicalHistory = async (idTienSu: string) => {
    try {
      await API.delete(`/patients/histories/${idTienSu}`);
      await fetchProfileDetails(selectedProfileId);
      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        error: error.response?.data?.error || "Lỗi khi xóa bệnh nền",
      };
    }
  };

  useEffect(() => {
    fetchProfiles();
  }, []);

  useEffect(() => {
    if (selectedProfileId) {
      fetchProfileDetails(selectedProfileId);
    }
  }, [selectedProfileId]);

  return {
    profiles,
    chronicDiseases,
    examHistory,
    selectedProfileId,
    setSelectedProfileId,
    loading,
    currentUser,
    addRelativeProfile,
    updateRelativeProfile,
    deleteProfile,
    addMedicalHistory,
    updateMedicalHistory,
    deleteMedicalHistory,
  };
}
