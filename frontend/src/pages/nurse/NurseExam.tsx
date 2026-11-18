import React, { useState } from "react";
import API from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import { Search, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface VitalsForm {
  NhietDo: string;
  HuyetApTamThu: string;
  HuyetApTamTruong: string;
  NhipTim: string;
  NhipTho: string;
  CanNang: string;
  ChieuCao: string;
  TrieuChung: string;
  MucDo: string;
  GhiChu: string;
}

export default function NurseExam(): React.JSX.Element {
  const [idHoSoBenhNhan, setIdHoSoBenhNhan] = useState<string>("");
  const [vitals, setVitals] = useState<VitalsForm>({
    NhietDo: "",
    HuyetApTamThu: "",
    HuyetApTamTruong: "",
    NhipTim: "",
    NhipTho: "",
    CanNang: "",
    ChieuCao: "",
    TrieuChung: "",
    MucDo: "Trung bình",
    GhiChu: "",
  });
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    setVitals({ ...vitals, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setStatus({ type: "", msg: "" });
    setLoading(true);

    try {
      // Yêu cầu phải gửi lên endpoint ghi nhận sinh hiệu
      const res = await API.put("/examinations/vitals", {
        idHoSoBenhNhan,
        ...vitals,
      });
      setStatus({
        type: "success",
        msg: res.data.message || "Cập nhật sinh hiệu lâm sàng thành công!",
      });
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi cập nhật sinh hiệu!",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div  className="max-w-200! mx-auto! my-0!">
        <h1  className="text-[24px]! text-slate-900! mb-2!">
          Bàn Làm Việc Y Tá
        </h1>
        <p  className="text-slate-500! text-[14px]! mb-6!">
          Ghi nhận chỉ số sinh hiệu và triệu chứng khởi phát của bệnh nhân.
        </p>

        {status.msg && (
          <div
             className={"flex!" + " " + "items-center!" + " " + "gap-2!" + " " + "[padding:12px_16px]!" + " " + "rounded-[8px]!" + " " + "mb-5!" + " " + (status.type === "success" ? "[background:#dcfce7]!" : "bg-red-100!") + " " + (status.type === "success" ? "[color:#166534]!" : "[color:#991b1b]!") + " " + (status.type === "success" ? "[border:1px_solid_#bbf7d0]!" : "[border:1px_solid_#fecaca]!")}
          >
            {status.type === "success" ? (
              <CheckCircle2 size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            <span  className="text-[14px]! font-semibold!">
              {status.msg}
            </span>
          </div>
        )}

        <form
          onSubmit={handleSubmit}
          className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm flex! flex-col! gap-5!"

        >
          {/* Mã Hồ Sơ */}
          <div>
            <label
               className="block! text-[13px]! font-bold! text-slate-700! mb-2!"
            >
              Nhập Mã Hồ Sơ Bệnh Nhân <span  className="[color:red]!">*</span>
            </label>
            <div  className="relative!">
              <Search
                size={18}
                color="#94a3b8"
                 className="absolute! [left:12px]! [top:50%]! [transform:translateY(-50%)]!"
              />
              <input
                type="text"
                value={idHoSoBenhNhan}
                onChange={(e) => setIdHoSoBenhNhan(e.target.value)}
                placeholder="VD: HS26100000001"
                required
                 className="w-full! [padding:12px_12px_12px_38px]! rounded-[8px]! [border:1px_solid_#cbd5e1]! text-[14px]! [outline:none]!"
              />
            </div>
          </div>

          <div
             className="h-[1px]! bg-slate-200! [margin:4px_0]!"
          ></div>

          {/* Vitals Grid */}
          <div
             className="grid! grid-cols-[1fr_1fr]! gap-4!"
          >
            <div>
              <label
                 className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
              >
                Nhiệt độ (°C)
              </label>
              <input
                type="number"
                step="0.1"
                name="NhietDo"
                value={vitals.NhietDo}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                placeholder="Ví dụ: 37.0"
              />
            </div>
            <div>
              <label
                 className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
              >
                Nhịp tim (lần/phút)
              </label>
              <input
                type="number"
                name="NhipTim"
                value={vitals.NhipTim}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                placeholder="Ví dụ: 80"
              />
            </div>
            <div>
              <label
                 className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
              >
                Huyết áp tâm thu (mmHg)
              </label>
              <input
                type="number"
                name="HuyetApTamThu"
                value={vitals.HuyetApTamThu}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                placeholder="Ví dụ: 120"
              />
            </div>
            <div>
              <label
                 className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
              >
                Huyết áp tâm trương (mmHg)
              </label>
              <input
                type="number"
                name="HuyetApTamTruong"
                value={vitals.HuyetApTamTruong}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                placeholder="Ví dụ: 80"
              />
            </div>
            <div>
              <label
                 className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
              >
                Cân nặng (kg)
              </label>
              <input
                type="number"
                step="0.1"
                name="CanNang"
                value={vitals.CanNang}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                placeholder="Ví dụ: 65.5"
              />
            </div>
            <div>
              <label
                 className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
              >
                Chiều cao (cm)
              </label>
              <input
                type="number"
                step="0.1"
                name="ChieuCao"
                value={vitals.ChieuCao}
                onChange={handleChange}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                placeholder="Ví dụ: 170"
              />
            </div>
          </div>

          <div
             className="h-[1px]! bg-slate-200! [margin:4px_0]!"
          ></div>

          {/* Triệu chứng & Ghi chú */}
          <div>
            <label
               className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
            >
              Triệu chứng khởi phát
            </label>
            <input
              type="text"
              name="TrieuChung"
              value={vitals.TrieuChung}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
              placeholder="Mô tả triệu chứng bệnh nhân khai báo..."
            />
          </div>

          <div>
            <label
               className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
            >
              Mức độ đau / nghiêm trọng
            </label>
            <select
              name="MucDo"
              value={vitals.MucDo}
              onChange={handleChange}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 bg-white!"

            >
              <option value="Nhẹ">Nhẹ</option>
              <option value="Trung bình">Trung bình</option>
              <option value="Nặng">Nặng</option>
            </select>
          </div>

          <div>
            <label
               className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
            >
              Ghi chú lâm sàng
            </label>
            <textarea
              name="GhiChu"
              value={vitals.GhiChu}
              onChange={handleChange}
              rows={3}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
              placeholder="Các lưu ý khác của Y tá..."
            ></textarea>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 p-3! text-[15px]! justify-center!"

          >
            <Save size={18} />{" "}
            {loading ? "Đang lưu dữ liệu..." : "Lưu Sinh Hiệu & Triệu Chứng"}
          </button>
        </form>
      </div>
    </DashboardLayout>
  );
}
