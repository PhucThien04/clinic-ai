import React, { useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {
  Search,
  Save,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Activity,
  Stethoscope,
} from "lucide-react";

interface PatientRecord {
  IdHoSoBenhNhan: string;
  NhietDo?: string;
  HuyetApTamThu?: string;
  HuyetApTamTruong?: string;
  NhipTim?: string;
  NhipTho?: string;
  CanNang?: string;
  ChieuCao?: string;
  TrieuChung?: string;
  MucDo?: string;
  GhiChu?: string;
}

interface DiagnosisForm {
  ChuanDoan: string;
  KetLuan: string;
}

export default function DoctorExam(): React.JSX.Element {
  const [idHoSoBenhNhan, setIdHoSoBenhNhan] = useState<string>("");
  const [patientRecord, setPatientRecord] = useState<PatientRecord | null>(
    null,
  );
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisForm>({
    ChuanDoan: "",
    KetLuan: "",
  });

  const [searchStatus, setSearchStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });
  const [saveStatus, setSaveStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });

  const [loadingSearch, setLoadingSearch] = useState(false);
  const [loadingSave, setLoadingSave] = useState(false);

  // Hàm tìm kiếm hồ sơ bệnh nhân do Y tá đã cập nhật sinh hiệu
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setSearchStatus({ type: "", msg: "" });
    setSaveStatus({ type: "", msg: "" });
    setLoadingSearch(true);
    setPatientRecord(null);

    try {
      // Gọi API lấy thông tin hồ sơ theo ID
      const res = await API.get(`/examinations/patient/${idHoSoBenhNhan}`);

      const rawData = res.data;

      // Xử lý đồng bộ chữ thường/PascalCase từ PostgreSQL
      const normalizedRecord: PatientRecord = {
        IdHoSoBenhNhan: rawData.IdHoSoBenhNhan || rawData.idhosobenhnhan,
        NhietDo: rawData.NhietDo || rawData.nhietdo,
        HuyetApTamThu: rawData.HuyetApTamThu || rawData.huyetaptamthu,
        HuyetApTamTruong: rawData.HuyetApTamTruong || rawData.huyetaptamtruong,
        NhipTim: rawData.NhipTim || rawData.nhiptim,
        NhipTho: rawData.NhipTho || rawData.nhiptho,
        CanNang: rawData.CanNang || rawData.cannang,
        ChieuCao: rawData.ChieuCao || rawData.chieucao,
        TrieuChung: rawData.TrieuChung || rawData.trieuchung,
        MucDo: rawData.MucDo || rawData.mucdo,
        GhiChu: rawData.GhiChu || rawData.ghichu,
      };

      setPatientRecord(normalizedRecord);

      setDiagnosisData({
        ChuanDoan: rawData.ChuanDoan || rawData.chuandoan || "",
        KetLuan: rawData.KetLuan || rawData.ketluan || "",
      });

      setSearchStatus({
        type: "success",
        msg: "Đã tải hồ sơ bệnh nhân thành công.",
      });
    } catch (err: any) {
      setSearchStatus({
        type: "error",
        msg:
          err.response?.data?.error ||
          "Không tìm thấy hồ sơ bệnh nhân hoặc có lỗi xảy ra!",
      });
    } finally {
      setLoadingSearch(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDiagnosisData({ ...diagnosisData, [e.target.name]: e.target.value });
  };

  // Hàm lưu chẩn đoán của Bác sĩ
  const handleSaveDiagnosis = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientRecord) return;

    setSaveStatus({ type: "", msg: "" });
    setLoadingSave(true);

    try {
      const res = await API.put("/examinations/diagnosis", {
        idHoSoBenhNhan: patientRecord.IdHoSoBenhNhan,
        ...diagnosisData,
      });
      setSaveStatus({
        type: "success",
        msg: res.data.message || "Cập nhật chẩn đoán và kết luận thành công!",
      });
    } catch (err: any) {
      setSaveStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi cập nhật chẩn đoán!",
      });
    } finally {
      setLoadingSave(false);
    }
  };

  return (
    <DashboardLayout>
      <div
         className="max-w-250! mx-auto! my-0! flex! flex-col! gap-6!"
      >
        {/* Header Title */}
        <div>
          <h1
             className="text-[24px]! text-slate-900! mb-2!"
          >
            Phòng Khám Bác Sĩ
          </h1>
          <p  className="text-slate-500! text-[14px]!">
            Tra cứu sinh hiệu từ Y tá, thực hiện chẩn đoán và tham khảo Trợ lý
            AI.
          </p>
        </div>

        {/* 1. Khu vực tìm kiếm hồ sơ */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2
             className="text-[16px]! text-slate-800! mb-4! flex! items-center! gap-2!"
          >
            <Search size={18} color="#0284c7" /> Tìm Kiếm Hồ Sơ Khám
          </h2>
          <form
            onSubmit={handleSearch}
             className="flex! gap-3!"
          >
            <div  className="flex-1! relative!">
              <input
                type="text"
                value={idHoSoBenhNhan}
                onChange={(e) => setIdHoSoBenhNhan(e.target.value)}
                placeholder="Nhập Mã Hồ Sơ Bệnh Nhân (VD: HS26100000001)..."
                required
                 className="w-full! [padding:10px_14px]! rounded-[8px]! [border:1px_solid_#cbd5e1]! text-[14px]! [outline:none]!"
              />
            </div>
            <button
              type="submit"
              disabled={loadingSearch}
              className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [padding:10px_24px]! [white-space:nowrap]!"

            >
              {loadingSearch ? "Đang tìm..." : "Tra cứu"}
            </button>
          </form>

          {searchStatus.msg && (
            <div
               className={"mt-4!" + " " + "text-[13px]!" + " " + (searchStatus.type === "success" ? "[color:#166534]!" : "[color:#991b1b]!") + " " + "flex!" + " " + "items-center!" + " " + "gap-[6px]!"}
            >
              {searchStatus.type === "success" ? (
                <CheckCircle2 size={16} />
              ) : (
                <AlertCircle size={16} />
              )}
              {searchStatus.msg}
            </div>
          )}
        </div>

        {/* 2. Khu vực hiển thị thông tin nếu tìm thấy hồ sơ */}
        {patientRecord && (
          <div
             className="grid! grid-cols-[1fr_300px]! gap-6! [align-items:start]!"
          >
            {/* Cột trái: Thông tin khám bệnh (Sinh hiệu + Chẩn đoán) */}
            <div
               className="flex! flex-col! gap-6!"
            >
              {/* Thông tin Sinh hiệu từ Y tá */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm [border-left:4px_solid_#0ea5e9]!" >
                <h3
                   className="text-[16px]! text-slate-900! mb-4! flex! items-center! gap-2!"
                >
                  <Activity size={18} color="#0ea5e9" /> Dữ liệu sinh hiệu lâm
                  sàng (Từ Y tá)
                </h3>
                <div
                   className="grid! grid-cols-[1fr_1fr_1fr]! gap-4! bg-slate-50! p-4! rounded-[8px]!"
                >
                  <div>
                    <div  className="text-[12px]! text-slate-500!">
                      Huyết áp
                    </div>
                    <div
                       className="text-[15px]! font-semibold! text-slate-900!"
                    >
                      {patientRecord.HuyetApTamThu || "--"}/
                      {patientRecord.HuyetApTamTruong || "--"} mmHg
                    </div>
                  </div>
                  <div>
                    <div  className="text-[12px]! text-slate-500!">
                      Nhịp tim
                    </div>
                    <div
                       className="text-[15px]! font-semibold! text-slate-900!"
                    >
                      {patientRecord.NhipTim || "--"} bpm
                    </div>
                  </div>
                  <div>
                    <div  className="text-[12px]! text-slate-500!">
                      Nhiệt độ
                    </div>
                    <div
                       className="text-[15px]! font-semibold! text-slate-900!"
                    >
                      {patientRecord.NhietDo || "--"} °C
                    </div>
                  </div>
                  <div>
                    <div  className="text-[12px]! text-slate-500!">
                      Cân nặng/Chiều cao
                    </div>
                    <div
                       className="text-[14px]! font-semibold! text-slate-900!"
                    >
                      {patientRecord.CanNang || "--"} kg /{" "}
                      {patientRecord.ChieuCao || "--"} cm
                    </div>
                  </div>
                </div>
                <div  className="mt-4! text-[14px]!">
                  <strong  className="text-slate-700!">
                    Triệu chứng khởi phát:
                  </strong>{" "}
                  <span  className="text-red-500! font-medium!">
                    {patientRecord.TrieuChung || "Không có ghi nhận"} (Mức độ:{" "}
                    {patientRecord.MucDo || "--"})
                  </span>
                </div>
                {patientRecord.GhiChu && (
                  <div
                     className="mt-2! text-[13px]! text-slate-500! [font-style:italic]!"
                  >
                    * Ghi chú Y tá: {patientRecord.GhiChu}
                  </div>
                )}
              </div>

              {/* Form Chẩn đoán của Bác sĩ */}
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm [border-left:4px_solid_#10b981]!" >
                <h3
                   className="text-[16px]! text-slate-900! mb-4! flex! items-center! gap-2!"
                >
                  <Stethoscope size={18} color="#10b981" /> Cập nhật Chẩn đoán &
                  Kết luận
                </h3>

                {saveStatus.msg && (
                  <div
                     className={"mb-4!" + " " + "text-[13px]!" + " " + (saveStatus.type === "success" ? "[color:#166534]!" : "[color:#991b1b]!") + " " + (saveStatus.type === "success" ? "[background:#dcfce7]!" : "bg-red-100!") + " " + "p-[10px]!" + " " + "rounded-[6px]!" + " " + "flex!" + " " + "items-center!" + " " + "gap-[6px]!"}
                  >
                    {saveStatus.type === "success" ? (
                      <CheckCircle2 size={16} />
                    ) : (
                      <AlertCircle size={16} />
                    )}
                    {saveStatus.msg}
                  </div>
                )}

                <form
                  onSubmit={handleSaveDiagnosis}
                   className="flex! flex-col! gap-4!"
                >
                  <div>
                    <label
                       className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                    >
                      Chẩn đoán Y khoa <span  className="[color:red]!">*</span>
                    </label>
                    <textarea
                      name="ChuanDoan"
                      value={diagnosisData.ChuanDoan}
                      onChange={handleChange}
                      rows={3}
                      required
                      placeholder="Nhập chẩn đoán chuyên môn..."
                       className="w-full! p-[10px]! rounded-[8px]! [border:1px_solid_#cbd5e1]! text-[14px]! [outline:none]! [resize:vertical]!"
                    ></textarea>
                  </div>
                  <div>
                    <label
                       className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                    >
                      Kết luận & Hướng điều trị{" "}
                      <span  className="[color:red]!">*</span>
                    </label>
                    <textarea
                      name="KetLuan"
                      value={diagnosisData.KetLuan}
                      onChange={handleChange}
                      rows={4}
                      required
                      placeholder="Đưa ra phác đồ điều trị, đơn thuốc hoặc lời khuyên..."
                       className="w-full! p-[10px]! rounded-[8px]! [border:1px_solid_#cbd5e1]! text-[14px]! [outline:none]! [resize:vertical]!"
                    ></textarea>
                  </div>
                  <div  className="flex! justify-end!">
                    <button
                      type="submit"
                      disabled={loadingSave}
                      className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [background:#10b981]! text-white! [padding:10px_24px]!"

                    >
                      <Save size={18} />{" "}
                      {loadingSave ? "Đang lưu..." : "Lưu Hồ Sơ Khám"}
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {/* Cột phải: Khu vực Trợ lý AI (Placeholder cho Tuần 11-12) */}
            <div
              className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm [background:linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_100%)]! [border:1px_solid_#e2e8f0]!"

            >
              <div
                 className="flex! items-center! gap-2! mb-4!"
              >
                <div
                   className="w-8! h-8! bg-teal-100! rounded-full! flex! items-center! justify-center!"
                >
                  <Sparkles size={16} color="#0d9488" />
                </div>
                <h3  className="text-[16px]! text-slate-900!">
                  Phân Tích AI
                </h3>
              </div>

              <div
                 className="text-[13px]! text-slate-500! leading-[1.6]! mb-5!"
              >
                Trợ lý AI giúp tổng hợp tiền sử bệnh án, phân tích chỉ số lâm
                sàng hiện tại và đưa ra cảnh báo sớm. (Tính năng sẽ được kích
                hoạt vào giai đoạn sau theo kế hoạch đồ án).
              </div>

              <button
                className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 border border-slate-300 bg-white text-slate-700 hover:border-sky-600 hover:bg-sky-50 hover:text-sky-600 w-full! justify-center! text-[13px]! [opacity:0.6]!"
                disabled

              >
                <Sparkles size={14} /> Tóm tắt tiền sử bệnh
              </button>

              <div
                 className="mt-3! text-[11px]! text-slate-400! [font-style:italic]! text-center!"
              >
                AI hỗ trợ lâm sàng, không thay thế quyết định chuyên môn của bác
                sĩ.
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
