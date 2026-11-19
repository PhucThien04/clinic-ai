import { Sparkles } from 'lucide-react';
import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { ClinicalAccess } from '../../components/clinical/ClinicalAccess';
import { ClinicalQueuePanel } from '../../components/clinical/ClinicalQueuePanel';
import { PatientExamSummary } from '../../components/clinical/PatientExamSummary';
import { useDoctorExam } from '../../hooks/useDoctorExam';
import { vitalInputs } from '../../utils/clinicalExamUtils';
import { formatDate } from '../../utils/dateUtils';

export default function DoctorExam() {
  return <ClinicalAccess roles={['Bác sĩ', 'Admin', 'Chủ phòng khám']}><DoctorWorkspace /></ClinicalAccess>;
}

function DoctorWorkspace() {
  const exam = useDoctorExam();
  const record = exam.patientRecord;
  return <DashboardLayout>
    <div className="mx-auto max-w-[1600px] space-y-6">
      <header><h1 className="text-2xl font-bold text-slate-900">Phòng khám Bác sĩ</h1>
        <p className="mt-2 text-sm text-slate-500">Tra cứu hồ sơ, lưu ý bệnh nền và xem các lần điều trị trước khi kết luận lượt khám hiện tại.</p></header>
      <div className="grid items-start gap-6 2xl:grid-cols-[320px_minmax(0,1fr)_260px] xl:grid-cols-[300px_minmax(0,1fr)]">
        <ClinicalQueuePanel state={exam} selectedId={record?.IdHoSoBenhNhan}
          busy={exam.saving || exam.loadingPatient} onSelect={id => void exam.fetchPatientExam(id)} />
        <div className="min-w-0 space-y-5">
          {exam.loadingPatient && <p role="status" className="rounded-lg bg-sky-50 p-3 text-sm text-sky-700">Đang tải hồ sơ bệnh nhân...</p>}
          {exam.patientError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{exam.patientError}</p>}
          {exam.saveMessage && <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{exam.saveMessage}</p>}
          {exam.saveError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{exam.saveError}</p>}
          {record ? <>
            <PatientExamSummary record={record} />
            <section className="rounded-xl border border-amber-200 bg-amber-50 p-5">
              <h2 className="font-bold text-amber-900">Lưu ý bệnh nền / Tiền sử bệnh</h2>
              {record.tienSuBenh.length ? <ul className="mt-3 space-y-3">
                {record.tienSuBenh.map(item => <li key={item.IdTienSuBenh} className="rounded-lg border border-amber-200 bg-white/70 p-3 text-sm text-amber-950">
                  <div className="flex flex-wrap justify-between gap-2"><strong>{item.TenBenh}</strong><span className="text-xs">{item.TrangThai || 'Chưa ghi trạng thái'}</span></div>
                  {item.MoTa && <p className="mt-1 whitespace-pre-wrap">{item.MoTa}</p>}
                  <p className="mt-2 text-xs text-amber-800">{formatDate(item.ThoiDiemMac || '') || 'Chưa rõ thời điểm'} · {item.TenNguoiGhiNhan || 'Chưa rõ người ghi nhận'}</p>
                </li>)}
              </ul> : <p className="mt-2 text-sm text-amber-800">Chưa có bệnh nền được khai báo. Cần hỏi lại bệnh nhân khi thăm khám.</p>}
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-slate-900">Sinh hiệu & triệu chứng từ Y tá</h2>
              <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {vitalInputs.map(field => <div key={field.name} className="rounded-lg bg-slate-50 p-3">
                  <dt className="text-xs text-slate-500">{field.label}</dt><dd className="mt-1 font-semibold text-slate-900">{record[field.name] ?? 'Chưa đo'}</dd>
                </div>)}
              </dl>
              <p className="mt-4 whitespace-pre-wrap text-sm text-slate-700"><strong>Triệu chứng: </strong>{record.TrieuChung || 'Chưa ghi nhận'}</p>
              <p className="mt-2 text-sm text-slate-700"><strong>Mức độ: </strong>{record.MucDo || 'Chưa ghi nhận'}</p>
              <p className="mt-2 text-sm text-slate-700"><strong>Khởi phát: </strong>{record.ThoiDiemKhoiPhat ? `${formatDate(record.ThoiDiemKhoiPhat)} ${record.ThoiDiemKhoiPhat.slice(11, 16)}` : 'Chưa ghi nhận'}</p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700"><strong>Ghi chú: </strong>{record.GhiChu || 'Không có'}</p>
            </section>
            <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="font-bold text-slate-900">Lịch sử khám trước ({record.lichSuKhamTruoc.length})</h2>
              {!record.lichSuKhamTruoc.length && <p className="mt-3 text-sm text-slate-500">Chưa có lượt khám trước đã ghi chẩn đoán/kết luận.</p>}
              <div className="mt-3 space-y-3">{record.lichSuKhamTruoc.map(item => <article key={item.IdChiTietLD} className="rounded-lg border border-slate-200 p-4 text-sm">
                <h3 className="font-semibold text-sky-700">{formatDate(item.NgayLamViec)} · {item.GioBatDau.slice(0, 5)} · BS. {item.TenBacSi}</h3>
                <p className="mt-2 text-slate-700"><strong>Lý do khám: </strong>{item.LiDoKham || 'Chưa ghi nhận'}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700"><strong>Triệu chứng: </strong>{item.TrieuChung || 'Chưa ghi nhận'}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700"><strong>Chẩn đoán: </strong>{item.ChuanDoan || 'Chưa ghi nhận'}</p>
                <p className="mt-1 whitespace-pre-wrap text-slate-700"><strong>Kết luận: </strong>{item.KetLuan || 'Chưa ghi nhận'}</p>
              </article>)}</div>
            </section>
            <form onSubmit={exam.handleSaveDiagnosis} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-slate-900">Chẩn đoán & kết luận</h2>
              {!exam.canSave && <p className="mb-4 text-sm text-amber-800">Hồ sơ chưa gắn lịch hoặc lịch đã hủy. Chỉ có thể xem dữ liệu.</p>}
              <fieldset disabled={!exam.canSave || exam.saving || exam.loadingPatient} className="space-y-4 disabled:opacity-70">
                <label className="block text-sm font-medium text-slate-700">Chẩn đoán
                  <textarea required maxLength={255} rows={3} value={exam.diagnosisData.ChuanDoan}
                    onChange={event => exam.setDiagnosisData({ ...exam.diagnosisData, ChuanDoan: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:border-sky-600" /></label>
                <label className="block text-sm font-medium text-slate-700">Kết luận & hướng điều trị
                  <textarea required maxLength={255} rows={4} value={exam.diagnosisData.KetLuan}
                    onChange={event => exam.setDiagnosisData({ ...exam.diagnosisData, KetLuan: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:border-sky-600" /></label>
                <div className="flex justify-end"><button className="rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white hover:bg-teal-700">{exam.saving ? 'Đang lưu...' : 'Lưu & hoàn thành lượt khám'}</button></div>
              </fieldset>
            </form>
          </> : !exam.loadingPatient && <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Chọn một bệnh nhân từ danh sách lịch khám bên trái để bắt đầu.</p>}
        </div>
        <aside className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-start-2 2xl:col-start-auto">
          <h2 className="flex items-center gap-2 font-bold text-slate-900"><Sparkles size={18} className="text-teal-600" />Phân Tích AI</h2>
          <p className="mt-3 text-sm leading-6 text-slate-500">Khu vực dành cho tóm tắt tiền sử, phân tích sinh hiệu và cảnh báo hỗ trợ bác sĩ.</p>
          <button disabled className="mt-4 w-full rounded-lg border border-slate-200 p-3 text-sm text-slate-400">Chưa kích hoạt</button>
          <p className="mt-3 text-xs leading-5 text-slate-500">AI chỉ hỗ trợ tham khảo, không thay thế quyết định chuyên môn của bác sĩ.</p>
        </aside>
      </div>
    </div>
  </DashboardLayout>;
}
