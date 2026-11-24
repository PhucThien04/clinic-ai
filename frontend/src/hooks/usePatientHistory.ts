import {getApiErrorMessage} from '../utils/apiErrors';
import { useState, useEffect, useCallback } from "react";
import { authService } from "../services/authService";
import { patientService } from "../services/patientService";
import { getProfileDeletionErrorMessage } from "../utils/patientActionErrors";

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

interface MedicalHistoryRecord {
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

  const currentUserId=currentUser?.IdTaiKhoan as string|undefined;
  const fetchProfiles = useCallback(async () => {
    if (!currentUserId) return;
    try {
      setLoading(true);
      const res = await patientService.getProfiles();
      setProfiles(res.data || []);
      setSelectedProfileId(previous=>previous||res.data?.[0]?.IdHoSoBenhNhan||'');
    } catch (error) {
      console.error("Lỗi tải hồ sơ:", error);
    } finally {
      setLoading(false);
    }
  },[currentUserId]);

  const fetchProfileDetails = useCallback(async (profileId: string) => {
    if (!profileId) return;
    try {
      setLoading(true);
      const [resChronic, resExams] = await Promise.all([
        patientService.getHistories(profileId),
        patientService.getExamHistories(profileId).catch(
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
  },[]);

  // Thêm người thân
  const addRelativeProfile = async (relativeData: Partial<PatientProfile>) => {
    if (!currentUser) return { success: false, error: "Chưa đăng nhập" };
    try {
      await patientService.createRelative({
        IdTaiKhoan: currentUser.IdTaiKhoan,
        LoaiThongTin: 1,
        NguoiThan: relativeData,
      });
      await fetchProfiles();
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getApiErrorMessage(error,"Lỗi khi thêm hồ sơ người thân"),
      };
    }
  };

  // Cập nhật người thân
  const updateRelativeProfile = async (relativeData: Partial<PatientProfile>) => {
    try {
      await patientService.updateRelative(relativeData);
      await fetchProfiles();
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error:
          getApiErrorMessage(error,"Lỗi khi cập nhật hồ sơ người thân"),
      };
    }
  };

  // Xóa hồ sơ người thân
  const deleteProfile = async (idHoSo: string) => {
    try {
      await patientService.deleteProfile(idHoSo);
      if (selectedProfileId === idHoSo) {
        setSelectedProfileId("");
      }
      await fetchProfiles();
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getProfileDeletionErrorMessage(error),
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
      await patientService.createHistory({
        IdHoSoBenhNhan: selectedProfileId,
        IdChiTietLD: null,
        NguoiGhiNhan: currentUser.IdTaiKhoan,
        ...historyData,
      });
      await fetchProfileDetails(selectedProfileId);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getApiErrorMessage(error,"Lỗi khi thêm bệnh nền"),
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
      await patientService.updateHistory(idTienSu,historyData);
      await fetchProfileDetails(selectedProfileId);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getApiErrorMessage(error,"Lỗi khi cập nhật bệnh nền"),
      };
    }
  };

  // Xóa tiền sử bệnh
  const deleteMedicalHistory = async (idTienSu: string) => {
    try {
      await patientService.deleteHistory(idTienSu);
      await fetchProfileDetails(selectedProfileId);
      return { success: true };
    } catch (error: unknown) {
      return {
        success: false,
        error: getApiErrorMessage(error,"Lỗi khi xóa bệnh nền"),
      };
    }
  };

  useEffect(() => {
    let active=true;queueMicrotask(()=>{if(active)void fetchProfiles();});return()=>{active=false;};
  }, [fetchProfiles]);

  useEffect(() => {
    let active=true;queueMicrotask(()=>{if(active&&selectedProfileId)void fetchProfileDetails(selectedProfileId);});return()=>{active=false;};
  }, [selectedProfileId,fetchProfileDetails]);

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
