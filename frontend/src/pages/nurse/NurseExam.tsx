import DashboardLayout from '../../components/DashboardLayout/DashboardLayout';
import { ClinicalAccess } from '../../components/clinical/ClinicalAccess';
import { ClinicalQueuePanel } from '../../components/clinical/ClinicalQueuePanel';
import { PatientExamSummary } from '../../components/clinical/PatientExamSummary';
import { useNurseExam } from '../../hooks/useNurseExam';
import { vitalInputs } from '../../utils/clinicalExamUtils';

export default function NurseExam() {
  return <ClinicalAccess roles={['Y tá', 'Admin', 'Chủ phòng khám']}><NurseWorkspace /></ClinicalAccess>;
}

function NurseWorkspace() {
  const exam = useNurseExam();
  return <DashboardLayout>
    <div className="mx-auto max-w-7xl space-y-6">
      <header><h1 className="text-2xl font-bold text-slate-900">Bàn làm việc Y tá</h1>
        <p className="mt-2 text-sm text-slate-500">Chọn bệnh nhân theo lịch hẹn, ghi nhận sinh hiệu và triệu chứng trước khi bác sĩ khám.</p></header>
      <div className="grid items-start gap-6 xl:grid-cols-[340px_minmax(0,1fr)]">
        <ClinicalQueuePanel state={exam} selectedId={exam.patientRecord?.IdHoSoBenhNhan}
          busy={exam.saving || exam.loadingPatient} onSelect={id => void exam.selectPatient(id)} />
        <div className="min-w-0 space-y-5">
          {exam.loadingPatient && <p role="status" className="rounded-lg bg-sky-50 p-3 text-sm text-sky-700">Đang tải hồ sơ bệnh nhân...</p>}
          {exam.patientError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{exam.patientError}</p>}
          {exam.saveMessage && <p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{exam.saveMessage}</p>}
          {exam.saveError && <p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{exam.saveError}</p>}
          {exam.patientRecord ? <>
            <PatientExamSummary record={exam.patientRecord} onClose={exam.handleClosePatient} />
            <form onSubmit={exam.handleSubmitVitals} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 font-bold text-slate-900">Sinh hiệu & triệu chứng</h2>
              {!exam.canSave && <p className="mb-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">Chỉ được đo sinh hiệu khi lịch đã được nhân viên xác nhận hoặc đang khám. Hồ sơ này chỉ có thể xem dữ liệu.</p>}
              <fieldset disabled={exam.saving || exam.loadingPatient || !exam.canSave} className="space-y-4 disabled:opacity-70">
                <div className="grid gap-4 sm:grid-cols-2">
                  {vitalInputs.map(field => <label key={field.name} className="text-sm font-medium text-slate-700">{field.label}
                    <input type="number" min="0" max={field.max} step={field.step} value={exam.vitals[field.name]}
                      onChange={event => exam.setVitals({ ...exam.vitals, [field.name]: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5 focus:border-sky-600" />
                  </label>)}
                </div>
                <label className="block text-sm font-medium text-slate-700">Triệu chứng
                  <textarea maxLength={255} rows={3} value={exam.vitals.TrieuChung}
                    onChange={event => exam.setVitals({ ...exam.vitals, TrieuChung: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3 focus:border-sky-600" /></label>
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="text-sm font-medium text-slate-700">Thời điểm khởi phát
                    <input type="datetime-local" value={exam.vitals.ThoiDiemKhoiPhat}
                      onChange={event => exam.setVitals({ ...exam.vitals, ThoiDiemKhoiPhat: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 px-3 py-2.5" /></label>
                  <label className="text-sm font-medium text-slate-700">Mức độ triệu chứng
                    <select value={exam.vitals.MucDo} onChange={event => exam.setVitals({ ...exam.vitals, MucDo: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-slate-200 bg-white px-3 py-2.5">
                      <option value="">Chưa ghi nhận</option><option>Nhẹ</option><option>Trung bình</option><option>Nặng</option>
                    </select></label>
                </div>
                <label className="block text-sm font-medium text-slate-700">Ghi chú lâm sàng
                  <textarea rows={2} maxLength={255} value={exam.vitals.GhiChu}
                    onChange={event => exam.setVitals({ ...exam.vitals, GhiChu: event.target.value })}
                    className="mt-1 w-full rounded-lg border border-slate-200 p-3" /></label>
                <div className="flex justify-end"><button type="submit" className="rounded-lg bg-teal-600 px-5 py-2.5 font-semibold text-white hover:bg-teal-700">{exam.saving ? 'Đang lưu...' : 'Lưu sinh hiệu'}</button></div>
              </fieldset>
            </form>
          </> : !exam.loadingPatient && <p className="rounded-xl border border-dashed border-slate-200 p-6 text-center text-sm text-slate-500">Chọn một bệnh nhân từ danh sách lịch khám bên trái để bắt đầu.</p>}
        </div>
      </div>
    </div>
  </DashboardLayout>;
}
