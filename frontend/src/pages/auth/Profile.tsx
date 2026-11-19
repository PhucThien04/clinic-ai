import type React from "react";
import {useProfile} from "../../hooks/useProfile";
import {ImageUploadField} from "../../components/management/ImageUploadField";
import {UserAvatar} from "../../components/management/MediaImage";
import DashboardLayout from "../../components/DashboardLayout/DashboardLayout";
import {Save, AlertCircle, CheckCircle2} from "lucide-react";
export default function Profile(): React.JSX.Element {
  const {profile,loading,saving,status,handleChange,handleSubmit,changeImage,setUploadingMedia}=useProfile();
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
                <UserAvatar src={profile.AnhDaiDien} name={profile.HoTen} className="h-16 w-16"/>
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
              <ImageUploadField folder="avatars" label="Ảnh đại diện" value={profile.AnhDaiDien} onChange={changeImage} disabled={saving} onBusyChange={setUploadingMedia}/>
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
