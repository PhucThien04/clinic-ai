import React, { useState, useEffect } from "react";
import API from "../../services/api";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import { User, Save, AlertCircle, CheckCircle2 } from "lucide-react";

interface UserProfile {
  IdTaiKhoan: string;
  TenTaiKhoan: string;
  HoTen: string;
  CCCD: string;
  NgaySinh: string | null;
  GioiTinh: string | null;
  Email: string | null;
  SoDienThoai: string;
  DiaChi: string | null;
  VaiTro: string;
}

export default function Profile(): React.JSX.Element {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [status, setStatus] = useState<{
    type: "success" | "error" | "";
    msg: string;
  }>({ type: "", msg: "" });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const res = await API.get("/profile");

      // Xử lý map dữ liệu chữ thường/PascalCase từ PostgreSQL
      const rawData = res.data;
      const normalizedProfile: UserProfile = {
        IdTaiKhoan: rawData.IdTaiKhoan || rawData.idtaikhoan,
        TenTaiKhoan: rawData.TenTaiKhoan || rawData.tentaikhoan,
        HoTen: rawData.HoTen || rawData.hoten,
        CCCD: rawData.CCCD || rawData.cccd,
        NgaySinh:
          rawData.NgaySinh || rawData.ngaysinh
            ? new Date(rawData.NgaySinh || rawData.ngaysinh)
                .toISOString()
                .split("T")[0]
            : "", // Chuyển đổi để hiển thị trên input type="date"
        GioiTinh: rawData.GioiTinh || rawData.gioitinh || "",
        Email: rawData.Email || rawData.email || "",
        SoDienThoai: rawData.SoDienThoai || rawData.sodienthoai,
        DiaChi: rawData.DiaChi || rawData.diachi || "",
        VaiTro: rawData.VaiTro || rawData.vaitro,
      };

      setProfile(normalizedProfile);
    } catch (err: any) {
      setStatus({ type: "error", msg: "Lỗi khi tải thông tin cá nhân." });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    if (profile) {
      setProfile({ ...profile, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setStatus({ type: "", msg: "" });
    setSaving(true);

    try {
      const res = await API.put("/profile", {
        HoTen: profile.HoTen,
        NgaySinh: profile.NgaySinh || null,
        GioiTinh: profile.GioiTinh || null,
        Email: profile.Email || null,
        SoDienThoai: profile.SoDienThoai,
        DiaChi: profile.DiaChi || null,
      });

      setStatus({ type: "success", msg: res.data.message });

      // Cập nhật lại thông tin lưu trên localStorage để Header/Sidebar hiển thị đúng
      const userStr = sessionStorage.getItem("user");
      if (userStr) {
        const userData = JSON.parse(userStr);
        userData.HoTen = profile.HoTen;
        sessionStorage.setItem("user", JSON.stringify(userData));
      }
    } catch (err: any) {
      setStatus({
        type: "error",
        msg: err.response?.data?.error || "Lỗi khi cập nhật thông tin cá nhân.",
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout>
      <div  className="max-w-175! mx-auto! my-0!">
        <h1  className="text-[24px]! text-slate-900! mb-2!">
          Thông Tin Cá Nhân
        </h1>
        <p  className="text-slate-500! text-[14px]! mb-6!">
          Quản lý và cập nhật thông tin tài khoản của bạn trên hệ thống.
        </p>

        {loading ? (
          <div
             className="text-center! p-10! text-slate-500!"
          >
            Đang tải dữ liệu...
          </div>
        ) : profile ? (
          <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm p-[30px]!" >
            <div
               className="flex! items-center! gap-4! mb-[30px]! [border-bottom:1px_solid_#e2e8f0]! pb-5!"
            >
              <div
                 className="w-16! h-16! bg-sky-100! rounded-full! flex! items-center! justify-center!"
              >
                <User size={32} color="#0284c7" />
              </div>
              <div>
                <h2  className="text-[20px]! text-slate-900! m-0!">
                  {profile.HoTen}
                </h2>
                <div
                   className="inline-block! bg-slate-100! [padding:4px_10px]! rounded-[20px]! text-[12px]! font-bold! text-slate-600! mt-[6px]!"
                >
                  Vai trò: {profile.VaiTro}
                </div>
              </div>
            </div>

            {status.msg && (
              <div
                 className={"flex!" + " " + "items-center!" + " " + "gap-2!" + " " + "[padding:12px_16px]!" + " " + "rounded-[8px]!" + " " + "mb-6!" + " " + (status.type === "success" ? "[background:#dcfce7]!" : "bg-red-100!") + " " + (status.type === "success" ? "[color:#166534]!" : "[color:#991b1b]!") + " " + (status.type === "success" ? "[border:1px_solid_#bbf7d0]!" : "[border:1px_solid_#fecaca]!")}
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
               className="flex! flex-col! gap-5!"
            >
              {/* Các trường Không cho phép sửa */}
              <div
                 className="grid! grid-cols-[1fr_1fr]! gap-5!"
              >
                <div>
                  <label
                     className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                  >
                    Tên đăng nhập (Username)
                  </label>
                  <input
                    type="text"
                    value={profile.TenTaiKhoan}
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 bg-slate-100! cursor-not-allowed!"

                  />
                </div>
                <div>
                  <label
                     className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                  >
                    Số CCCD
                  </label>
                  <input
                    type="text"
                    value={profile.CCCD}
                    disabled
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15 bg-slate-100! cursor-not-allowed!"

                  />
                </div>
              </div>

              <div
                 className="h-[1px]! bg-slate-200! [margin:4px_0]!"
              ></div>

              {/* Các trường Cho phép sửa */}
              <div>
                <label
                   className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                >
                  Họ và Tên <span  className="[color:red]!">*</span>
                </label>
                <input
                  type="text"
                  name="HoTen"
                  value={profile.HoTen}
                  onChange={handleChange}
                  required
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                />
              </div>

              <div
                 className="grid! grid-cols-[1fr_1fr]! gap-5!"
              >
                <div>
                  <label
                     className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                  >
                    Ngày sinh
                  </label>
                  <input
                    type="date"
                    name="NgaySinh"
                    value={profile.NgaySinh || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                  />
                </div>
                <div>
                  <label
                     className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                  >
                    Giới tính
                  </label>
                  <select
                    name="GioiTinh"
                    value={profile.GioiTinh || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                  >
                    <option value="">-- Chọn giới tính --</option>
                    <option value="Nam">Nam</option>
                    <option value="Nữ">Nữ</option>
                    <option value="Khác">Khác</option>
                  </select>
                </div>
              </div>

              <div
                 className="grid! grid-cols-[1fr_1fr]! gap-5!"
              >
                <div>
                  <label
                     className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                  >
                    Số điện thoại <span  className="[color:red]!">*</span>
                  </label>
                  <input
                    type="text"
                    name="SoDienThoai"
                    value={profile.SoDienThoai}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                  />
                </div>
                <div>
                  <label
                     className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                  >
                    Email
                  </label>
                  <input
                    type="email"
                    name="Email"
                    value={profile.Email || ""}
                    onChange={handleChange}
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                  />
                </div>
              </div>

              <div>
                <label
                   className="block! text-[13px]! font-semibold! text-slate-600! mb-[6px]!"
                >
                  Địa chỉ
                </label>
                <input
                  type="text"
                  name="DiaChi"
                  value={profile.DiaChi || ""}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-[14px] outline-none focus:border-sky-600 focus:ring-2 focus:ring-sky-600/15"
                />
              </div>

              <div
                 className="flex! justify-end! mt-[10px]!"
              >
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-[14px] font-semibold no-underline cursor-pointer transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60 [padding:10px_20px] bg-sky-600 [border:none] text-white rounded-[8px] cursor-pointer font-medium [&:hover]:bg-sky-700 [padding:12px_30px]!"

                >
                  <Save size={18} /> {saving ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div
             className="text-center! p-10! text-red-500!"
          >
            Không tải được thông tin tài khoản!
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
