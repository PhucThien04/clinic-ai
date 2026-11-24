import type {PatientProfile} from '../../hooks/usePatientHistory';
import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {
  usePatientHistory,
  type ChronicDiseaseRecord,
} from "../../hooks/usePatientHistory";
import {
  User,
  Users,
  Plus,
  Edit,
  Trash2,
  FileText,
  Calendar,
  Stethoscope,
  Activity,
  FileWarning,
  ClipboardCheck,
  X,
  ShieldAlert,
} from "lucide-react";


export default function PatientMedicalHistory(): React.JSX.Element {
  const {
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
  } = usePatientHistory();

  // Modal Người thân
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditingRelative, setIsEditingRelative] = useState(false);
  const [selectedRelativeId, setSelectedRelativeId] = useState<string>("");
  const [formData, setFormData] = useState({
    HoTen: "",
    MoiQuanHe: "Cha",
    CCCD: "",
    NgaySinh: "",
    GioiTinh: "Nam",
    SoDienThoai: "",
    DiaChi: "",
  });

  // Modal Bệnh nền (Thêm & Sửa)
  const [isHistoryModalOpen, setIsHistoryModalOpen] = useState(false);
  const [editingHistoryId, setEditingHistoryId] = useState<string | null>(null);
  const [historyData, setHistoryData] = useState({
    TenBenh: "",
    MoTa: "",
    ThoiDiemMac: "",
    TrangThai: "Đang điều trị",
  });

  const [errorMsg, setErrorMsg] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // --- Xử lý Hồ sơ người thân ---
  const handleOpenAddRelative = () => {
    setIsEditingRelative(false);
    setErrorMsg("");
    setFormData({
      HoTen: "",
      MoiQuanHe: "Cha",
      CCCD: "",
      NgaySinh: "",
      GioiTinh: "Nam",
      SoDienThoai: "",
      DiaChi: "",
    });
    setIsModalOpen(true);
  };

  const handleOpenEditRelative = (profile: PatientProfile) => {
    setIsEditingRelative(true);
    setErrorMsg("");
    setSelectedRelativeId(
      profile.IdThongTinNguoiThan || profile.IdHoSoBenhNhan,
    );
    setFormData({
      HoTen: profile.HoTen || "",
      MoiQuanHe: profile.MoiQuanHe || "Cha",
      CCCD: profile.CCCD || "",
      NgaySinh: profile.NgaySinh ? profile.NgaySinh.split("T")[0] : "",
      GioiTinh: profile.GioiTinh || "Nam",
      SoDienThoai: profile.SoDienThoai || "",
      DiaChi: profile.DiaChi || "",
    });
    setIsModalOpen(true);
  };

  const handleDeleteProfile = async (id: string, isSelf: boolean) => {
    if (isSelf) return;
    if (
      window.confirm("Bạn có chắc chắn muốn xóa hồ sơ người thân này không?")
    ) {
      const res = await deleteProfile(id);
      if (!res.success) alert(res.error);
    }
  };

  const handleSubmitRelative = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSubmitting(true);

    const res = isEditingRelative
      ? await updateRelativeProfile({
          IdThongTinNguoiThan: selectedRelativeId,
          ...formData,
        })
      : await addRelativeProfile(formData);

    setSubmitting(false);
    if (res.success) {
      setIsModalOpen(false);
    } else {
      setErrorMsg(res.error || "Có lỗi xảy ra");
    }
  };

  // --- Xử lý Bệnh nền (Thêm & Cập nhật) ---
  const handleOpenAddHistory = () => {
    setEditingHistoryId(null);
    setHistoryData({
      TenBenh: "",
      MoTa: "",
      ThoiDiemMac: "",
      TrangThai: "Đang điều trị",
    });
    setIsHistoryModalOpen(true);
  };

  const handleOpenEditHistory = (item: ChronicDiseaseRecord) => {
    setEditingHistoryId(item.IdTienSuBenh);
    setHistoryData({
      TenBenh: item.TenBenh || "",
      MoTa: item.MoTa || "",
      ThoiDiemMac: item.ThoiDiemMac ? item.ThoiDiemMac.split("T")[0] : "",
      TrangThai: item.TrangThai || "Đang điều trị",
    });
    setIsHistoryModalOpen(true);
  };

  const handleSubmitHistory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const res = editingHistoryId
      ? await updateMedicalHistory(editingHistoryId, historyData)
      : await addMedicalHistory(historyData);
    setSubmitting(false);

    if (res.success) {
      setIsHistoryModalOpen(false);
      setEditingHistoryId(null);
      setHistoryData({
        TenBenh: "",
        MoTa: "",
        ThoiDiemMac: "",
        TrangThai: "Đang điều trị",
      });
    } else {
      alert(res.error);
    }
  };

  const handleDeleteHistory = async (idTienSu: string) => {
    if (window.confirm("Bạn có chắc muốn xóa thông tin bệnh nền này không?")) {
      const res = await deleteMedicalHistory(idTienSu);
      if (!res.success) alert(res.error);
    }
  };

  return (
    <DashboardLayout>
      <div className="max-w-300 mx-auto my-0 flex flex-col gap-6">
        <div>
          <h1 className="text-[24px] text-slate-900 mb-2">
            Hồ Sơ Sức Khỏe & Lịch Sử Khám Bệnh
          </h1>
          <p className="text-slate-500 text-[14px]">
            Quản lý hồ sơ người thân, khai báo bệnh nền trước khi khám và theo
            dõi chẩn đoán từ bác sĩ.
          </p>
        </div>

        <div className="grid grid-cols-[300px_1fr] gap-6 [align-items:start] max-[768.01px]:grid-cols-[1fr]">
          {/* CỘT TRÁI: DANH SÁCH HỒ SƠ */}
          <aside className="bg-white [border:1px_solid_#e2e8f0] rounded-[12px] p-5">
            <h2 className="text-[16px] font-bold text-slate-800 mb-4 flex justify-between items-center">
              Danh sách hồ sơ <span className="">{profiles.length}</span>
            </h2>

            <div className="">
              {profiles.map((p) => (
                <div
                  key={p.IdHoSoBenhNhan}
                  className={`group [padding:12px_16px] [border:1px_solid_#e2e8f0] rounded-[8px] mb-3 cursor-pointer [transition:all_0.2s] flex items-center gap-3 relative justify-start [&:hover]:border-sky-600 ${selectedProfileId === p.IdHoSoBenhNhan ? "border-sky-600! bg-sky-50!" : ""}`}
                  onClick={() => setSelectedProfileId(p.IdHoSoBenhNhan)}
                >
                  <div className="bg-sky-100 text-sky-600 w-10 h-10 rounded-full flex items-center justify-center shrink-0">
                    {p.LoaiThongTin === 0 ? (
                      <User size={20} />
                    ) : (
                      <Users size={20} />
                    )}
                  </div>
                  <div className="[&_h4]:m-0 [&_h4]:text-[14px] [&_h4]:text-slate-900 [&_p]:[margin:4px_0_0_0] [&_p]:text-[12px] [&_p]:text-slate-500 flex-1 min-w-0">
                    <h4>
                      {p.LoaiThongTin === 0 ? currentUser?.HoTen : p.HoTen}
                    </h4>
                    <p>
                      {p.LoaiThongTin === 0
                        ? "Bản thân"
                        : `Người thân (${p.MoiQuanHe})`}
                    </p>
                  </div>
                  {p.LoaiThongTin === 1 && (
                    <div
                      className="in-[.group]:ml-auto in-[.group]:shrink-0 in-[.group]:flex in-[.group]:gap-1.5 in-[.group]:opacity-85 group-hover:opacity-100 [&_button]:bg-slate-100 [&_button]:[border:1px_solid_#cbd5e1] [&_button]:rounded-[6px] [&_button]:w-7 [&_button]:h-7 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:cursor-pointer [&_button]:[transition:all_0.2s] [&_button:hover]:bg-slate-200 [&_button:hover]:border-slate-400"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        title="Sửa hồ sơ"
                        onClick={() => handleOpenEditRelative(p)}
                      >
                        <Edit size={14} color="#0284c7" />
                      </button>
                      <button
                        title="Xóa hồ sơ"
                        onClick={() =>
                          handleDeleteProfile(p.IdHoSoBenhNhan, false)
                        }
                      >
                        <Trash2 size={14} color="#ef4444" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <button
              className="w-full p-[10px] [background:transparent] [border:1px_dashed_#cbd5e1] rounded-[8px] text-sky-600 font-semibold cursor-pointer flex justify-center items-center gap-2 [&:hover]:bg-slate-50 [&:hover]:border-sky-600"
              onClick={handleOpenAddRelative}
            >
              <Plus size={16} /> Thêm hồ sơ người thân
            </button>
          </aside>

          {/* CỘT PHẢI: KHU VỰC 1 (BỆNH NỀN) & KHU VỰC 2 (LỊCH SỬ KHÁM) */}
          <section className="bg-white [border:1px_solid_#e2e8f0] rounded-[12px] p-6 min-h-100">
            {/* PHẦN 1: TIỀN SỬ BỆNH / BỆNH NỀN */}
            <div className="">
              <div className="flex justify-between items-center mb-4">
                <h2
                  className="text-[18px] text-slate-900 mb-5 flex items-center gap-2 [border-bottom:1px_solid_#f1f5f9] pb-4 [border:none]! m-0! p-0!"

                >
                  <ShieldAlert size={22} color="#d97706" /> Tiền Sử Bệnh & Bệnh
                  Nền
                </h2>
                <button
                  className="[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [font-size:0.85rem]! [padding:8px_14px]! flex! items-center! gap-[6px]!"

                  onClick={handleOpenAddHistory}
                >
                  <Plus size={16} /> Khai báo bệnh nền
                </button>
              </div>

              {loading ? (
                <div className="text-center [padding:40px_20px] text-slate-500 p-5!" >
                  Đang tải dữ liệu...
                </div>
              ) : chronicDiseases.length === 0 ? (
                <div className="bg-slate-50 [border:1px_dashed_#cbd5e1] rounded-[8px] p-4 text-center text-slate-500 text-[14px]">
                  Chưa có thông tin bệnh nền hoặc dị ứng thuốc nào được khai báo
                  cho hồ sơ này.
                </div>
              ) : (
                <div className="grid grid-cols-[repeat(auto-fill,_minmax(280px,_1fr))] gap-[14px]">
                  {chronicDiseases.map((item) => (
                    <div key={item.IdTienSuBenh} className="bg-amber-50 [border:1px_solid_#fde68a] rounded-[10px] [padding:14px_16px] flex flex-col gap-2">
                      <div className="flex justify-between items-start gap-2">
                        <div>
                          <div className="font-bold text-[15px] text-amber-800 mb-1">{item.TenBenh}</div>
                          <span className="inline-block text-[11px] font-semibold [padding:2px_8px] rounded-[999px] bg-amber-100 text-amber-700 [border:1px_solid_#fcd34d]">
                            {item.TrangThai || "Đang điều trị"}
                          </span>
                        </div>
                        <div className="in-[.group]:ml-auto in-[.group]:shrink-0 in-[.group]:flex in-[.group]:gap-1.5 in-[.group]:opacity-85 group-hover:opacity-100 [&_button]:bg-slate-100 [&_button]:[border:1px_solid_#cbd5e1] [&_button]:rounded-[6px] [&_button]:w-7 [&_button]:h-7 [&_button]:flex [&_button]:items-center [&_button]:justify-center [&_button]:cursor-pointer [&_button]:[transition:all_0.2s] [&_button:hover]:bg-slate-200 [&_button:hover]:border-slate-400">
                          <button
                            title="Sửa bệnh nền"
                            onClick={() => handleOpenEditHistory(item)}
                          >
                            <Edit size={14} color="#0284c7" />
                          </button>
                          <button
                            title="Xóa bệnh nền"
                            onClick={() =>
                              handleDeleteHistory(item.IdTienSuBenh)
                            }
                          >
                            <Trash2 size={14} color="#ef4444" />
                          </button>
                        </div>
                      </div>

                      {item.MoTa && <p className="m-0 text-[13px] text-amber-950 leading-[1.4]">{item.MoTa}</p>}

                      <div className="flex flex-wrap justify-between gap-[6px] [font-size:11.5px] text-amber-900 [border-top:1px_dashed_#fcd34d] pt-[6px] [margin-top:auto]">
                        {item.ThoiDiemMac && (
                          <span>
                            Phát hiện:{" "}
                            {new Date(item.ThoiDiemMac).toLocaleDateString(
                              "vi-VN",
                            )}
                          </span>
                        )}
                        <span>Ghi nhận: {item.TenNguoiGhiNhan}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <hr
               className="[border:none]! [border-top:1px_solid_#e2e8f0]! [margin:24px_0]!"
            />

            {/* PHẦN 2: LỊCH SỬ CÁC LẦN KHÁM BỆNH */}
            <div>
              <h2 className="text-[18px] text-slate-900 mb-5 flex items-center gap-2 [border-bottom:1px_solid_#f1f5f9] pb-4">
                <FileText size={22} color="#0284c7" /> Lịch Sử Khám Bệnh Tại
                Phòng Khám
              </h2>

              {loading ? (
                <div className="text-center [padding:40px_20px] text-slate-500">Đang tải lịch sử khám...</div>
              ) : examHistory.length === 0 ? (
                <div className="text-center [padding:40px_20px] text-slate-500">
                  <FileWarning
                    size={44}
                    color="#cbd5e1"
                     className="mb-[10px]!"
                  />
                  <p>Hồ sơ này chưa có lượt khám bệnh nào tại phòng khám.</p>
                </div>
              ) : (
                <div>
                  {examHistory.map((record) => (
                    <div
                      key={record.IdChiTietLD || record.IdLichDat}
                      className="[border:1px_solid_#e2e8f0] rounded-[8px] mb-5 overflow-hidden"
                    >
                      <div className="bg-slate-50 p-4 [border-bottom:1px_solid_#e2e8f0] flex justify-between items-center">
                        <div className="font-bold text-sky-600 flex items-center gap-[6px]">
                          <Calendar size={16} /> Ngày khám: {record.NgayKham}
                          {record.GioBatDau
                            ? ` (${record.GioBatDau.slice(0, 5)})`
                            : ""}
                        </div>
                        <div className="text-[13px] text-slate-600 flex items-center gap-1">
                          <Stethoscope size={16} color="#0d9488" /> BS Điều trị:{" "}
                          <strong>{record.TenBacSi}</strong>
                        </div>
                      </div>

                      <div className="p-4 grid grid-cols-[1fr_1fr] gap-5">
                        <div>
                          <div className="mb-4">
                            <div className="text-[12px] font-bold text-slate-400 uppercase mb-[6px]">Lý do khám</div>
                            <div className="text-[14px] text-slate-800 leading-[1.5]">
                              {record.LiDoKham || "Khám nha khoa tổng quát"}
                            </div>
                          </div>
                          {record.TrieuChung && (
                            <div className="mb-4">
                              <div className="text-[12px] font-bold text-slate-400 uppercase mb-[6px]">
                                Triệu chứng lâm sàng
                              </div>
                              <div className="text-[14px] text-slate-800 leading-[1.5]">
                                {record.TrieuChung}
                              </div>
                            </div>
                          )}
                          {(record.NhietDo || record.HuyetAp) && (
                            <div className="[background:#f0fdf4] [border:1px_solid_#bbf7d0] rounded-[6px] p-[10px] flex gap-4">
                              {record.NhietDo && (
                                <div className="text-[13px] [color:#166534] font-semibold flex items-center gap-[6px]">
                                  <Activity size={14} /> Nhiệt độ:{" "}
                                  {record.NhietDo}°C
                                </div>
                              )}
                              {record.HuyetAp && (
                                <div className="text-[13px] [color:#166534] font-semibold flex items-center gap-[6px]">
                                  <Activity size={14} /> Huyết áp:{" "}
                                  {record.HuyetAp}
                                </div>
                              )}
                            </div>
                          )}
                        </div>

                        <div>
                          <div className="mb-4">
                            <div className="text-[12px] font-bold text-slate-400 uppercase mb-[6px]">
                              Chẩn đoán (Bác sĩ)
                            </div>
                            <div
                              className="text-[14px] text-slate-800 leading-[1.5] text-amber-700! font-semibold!"

                            >
                              {record.ChuanDoan || "Chưa có chẩn đoán"}
                            </div>
                          </div>
                          <div className="mb-4">
                            <div className="text-[12px] font-bold text-slate-400 uppercase mb-[6px]">
                              Kết luận & Hướng điều trị
                            </div>
                            <div
                              className="text-[14px] text-slate-800 leading-[1.5] flex! gap-[6px]!"

                            >
                              <ClipboardCheck
                                size={16}
                                color="#16a34a"
                                 className="shrink-0! mt-[2px]!"
                              />
                              <span>
                                {record.KetLuan || "Chưa có kết luận"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* MODAL THÊM / SỬA HỒ SƠ NGƯỜI THÂN */}
      {isModalOpen && (
        <div className="fixed top-0 [left:0] [right:0] [bottom:0] [background:rgba(0,_0,_0,_0.5)] flex items-center justify-center [z-index:1000]">
          <div className="bg-white p-6 rounded-[12px] w-full max-w-125 [box-shadow:0_10px_25px_rgba(0,_0,_0,_0.1)]">
            <div className="flex justify-between items-center mb-5 [&_h3]:m-0 [&_h3]:[font-size:1.25rem] [&_h3]:text-slate-900">
              <h3>
                {isEditingRelative
                  ? "Cập nhật hồ sơ người thân"
                  : "Thêm hồ sơ người thân"}
              </h3>
              <button
                className="[background:none] [border:none] cursor-pointer text-slate-500"
                onClick={() => setIsModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRelative}>
              {errorMsg && <div className="bg-red-100 [color:#991b1b] p-[10px] rounded-[6px] [font-size:0.875rem] mb-[14px]">{errorMsg}</div>}

              <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)]">
                <label>Họ và tên người thân (*)</label>
                <input
                  type="text"
                  value={formData.HoTen}
                  onChange={(e) =>
                    setFormData({ ...formData, HoTen: e.target.value })
                  }
                  placeholder="Nhập họ tên đầy đủ"
                  required
                />
              </div>

              <div
                className="flex! gap-3!"

              >
                <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] flex-1!" >
                  <label>Mối quan hệ (*)</label>
                  <select
                    value={formData.MoiQuanHe}
                    onChange={(e) =>
                      setFormData({ ...formData, MoiQuanHe: e.target.value })
                    }
                  >
                    <option value="Cha">Cha</option>
                    <option value="Mẹ">Mẹ</option>
                    <option value="Vợ">Vợ</option>
                    <option value="Chồng">Chồng</option>
                    <option value="Con">Con</option>
                    <option value="Anh/Chị/Em">Anh/Chị/Em</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>

                <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] flex-1!" >
                  <label>Giới tính</label>
                  <select
                    value={formData.GioiTinh}
                    onChange={(e) =>
                      setFormData({ ...formData, GioiTinh: e.target.value })
                    }
                  >
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div
                className="flex! gap-3!"

              >
                <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] flex-1!" >
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.NgaySinh}
                    onChange={(e) =>
                      setFormData({ ...formData, NgaySinh: e.target.value })
                    }
                  />
                </div>

                <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] flex-1!" >
                  <label>Số điện thoại</label>
                  <input
                    type="text"
                    value={formData.SoDienThoai}
                    onChange={(e) =>
                      setFormData({ ...formData, SoDienThoai: e.target.value })
                    }
                    placeholder="Số điện thoại"
                  />
                </div>
              </div>

              <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)]">
                <label>CCCD / CMND</label>
                <input
                  type="text"
                  value={formData.CCCD}
                  onChange={(e) =>
                    setFormData({ ...formData, CCCD: e.target.value })
                  }
                  placeholder="Số căn cước công dân"
                />
              </div>

              <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)]">
                <label>Địa chỉ</label>
                <input
                  type="text"
                  value={formData.DiaChi}
                  onChange={(e) =>
                    setFormData({ ...formData, DiaChi: e.target.value })
                  }
                  placeholder="Địa chỉ cư trú"
                />
              </div>

              <div
                className="flex! justify-end! gap-[10px]! mt-4!"

              >
                <button
                  type="button"
                  className="[padding:10px_16px] bg-slate-100 [border:1px_solid_#cbd5e1] text-slate-700 rounded-[8px] cursor-pointer font-medium"
                  onClick={() => setIsModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700"
                  disabled={submitting}
                >
                  {submitting ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL THÊM / CẬP NHẬT BỆNH NỀN (TIỀN SỬ BỆNH) */}
      {isHistoryModalOpen && (
        <div className="fixed top-0 [left:0] [right:0] [bottom:0] [background:rgba(0,_0,_0,_0.5)] flex items-center justify-center [z-index:1000]">
          <div className="bg-white p-6 rounded-[12px] w-full max-w-125 [box-shadow:0_10px_25px_rgba(0,_0,_0,_0.1)]">
            <div className="flex justify-between items-center mb-5 [&_h3]:m-0 [&_h3]:[font-size:1.25rem] [&_h3]:text-slate-900">
              <h3>
                {editingHistoryId
                  ? "Cập nhật thông tin bệnh nền"
                  : "Khai báo bệnh nền (Tiền sử bệnh)"}
              </h3>
              <button
                className="[background:none] [border:none] cursor-pointer text-slate-500"
                onClick={() => setIsHistoryModalOpen(false)}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitHistory}>
              <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)]">
                <label>Tên bệnh / Tình trạng (*)</label>
                <input
                  type="text"
                  value={historyData.TenBenh}
                  onChange={(e) =>
                    setHistoryData({ ...historyData, TenBenh: e.target.value })
                  }
                  placeholder="VD: Tiểu đường, Cao huyết áp, Dị ứng thuốc tê..."
                  required
                />
              </div>

              <div
                className="flex! gap-3!"

              >
                <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] flex-1!" >
                  <label>Trạng thái</label>
                  <select
                    value={historyData.TrangThai}
                    onChange={(e) =>
                      setHistoryData({
                        ...historyData,
                        TrangThai: e.target.value,
                      })
                    }
                  >
                    <option value="Đang điều trị">Đang điều trị</option>
                    <option value="Ổn định">Ổn định</option>
                    <option value="Đã khỏi">Đã khỏi</option>
                  </select>
                </div>

                <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] flex-1!" >
                  <label>Thời điểm phát hiện (nếu nhớ)</label>
                  <input
                    type="date"
                    value={historyData.ThoiDiemMac}
                    onChange={(e) =>
                      setHistoryData({
                        ...historyData,
                        ThoiDiemMac: e.target.value,
                      })
                    }
                  />
                </div>
              </div>

              <div className="mb-[14px] [&_label]:block [&_label]:[font-size:0.875rem] [&_label]:font-medium [&_label]:text-slate-700 [&_label]:mb-[6px] [&_input]:w-full [&_input]:[padding:10px_12px] [&_input]:[border:1px_solid_#cbd5e1] [&_input]:rounded-[8px] [&_input]:[font-size:0.95rem] [&_input]:[outline:none] [&_input]:box-border [&_select]:w-full [&_select]:[padding:10px_12px] [&_select]:[border:1px_solid_#cbd5e1] [&_select]:rounded-[8px] [&_select]:[font-size:0.95rem] [&_select]:[outline:none] [&_select]:box-border [&_input:focus]:border-sky-600 [&_input:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)] [&_select:focus]:border-sky-600 [&_select:focus]:[box-shadow:0_0_0_2px_rgba(2,_132,_199,_0.15)]">
                <label>Mô tả chi tiết / Lưu ý cho bác sĩ</label>
                <textarea
                  rows={3}
                  value={historyData.MoTa}
                  onChange={(e) =>
                    setHistoryData({ ...historyData, MoTa: e.target.value })
                  }
                  placeholder="Nhập ghi chú thuốc đang dùng hoặc mức độ bệnh..."
                   className="w-full! p-[10px]! rounded-[8px]! [border:1px_solid_#cbd5e1]! box-border!"
                />
              </div>

              <div
                className="flex! justify-end! gap-[10px]! mt-4!"

              >
                <button
                  type="button"
                  className="[padding:10px_16px] bg-slate-100 [border:1px_solid_#cbd5e1] text-slate-700 rounded-[8px] cursor-pointer font-medium"
                  onClick={() => setIsHistoryModalOpen(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="[padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700"
                  disabled={submitting}
                >
                  {submitting
                    ? "Đang lưu..."
                    : editingHistoryId
                      ? "Cập nhật"
                      : "Lưu bệnh nền"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
