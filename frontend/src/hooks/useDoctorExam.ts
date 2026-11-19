import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useClinicalQueue } from './useClinicalQueue';
import { useClinicalPatient } from './useClinicalPatient';
import { updateDoctorDiagnosis } from '../services/examinationService';
import { clinicalError } from '../utils/clinicalExamUtils';

export function useDoctorExam() {
  const clinicalQueue = useClinicalQueue(true);
  const patient = useClinicalPatient();
  const [diagnosisData, setDiagnosisData] = useState({ ChuanDoan: '', KetLuan: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const selectionVersion = useRef(0);
  const handleClosePatient = () => {
    selectionVersion.current++;
    patient.clearPatientExam();
    setDiagnosisData({ ChuanDoan: '', KetLuan: '' });
    setSaveError('');
    setSaveMessage('');
  };
  const fetchPatientExam = async (id: string) => {
    selectionVersion.current++;
    setDiagnosisData({ ChuanDoan: '', KetLuan: '' }); setSaveError(''); setSaveMessage('');
    const record = await patient.fetchPatientExam(id);
    if (record) setDiagnosisData({ ChuanDoan: record.ChuanDoan ?? '', KetLuan: record.KetLuan ?? '' });
  };
  const handleSaveDiagnosis = async (event: FormEvent) => {
    event.preventDefault();
    if (!patient.patientRecord || saving) return;
    const version = selectionVersion.current;
    setSaving(true); setSaveError(''); setSaveMessage('');
    try {
      const result = await updateDoctorDiagnosis({ idHoSoBenhNhan: patient.patientRecord.IdHoSoBenhNhan, ...diagnosisData });
      if (version === selectionVersion.current) setSaveMessage(result.message);
      await clinicalQueue.refreshQueue();
      if (version !== selectionVersion.current) return;
      const record = await patient.fetchPatientExam(patient.patientRecord.IdHoSoBenhNhan);
      if (record) setDiagnosisData({ ChuanDoan: record.ChuanDoan ?? '', KetLuan: record.KetLuan ?? '' });
    } catch (error) { if (version === selectionVersion.current) setSaveError(clinicalError(error)); }
    finally { setSaving(false); }
  };
  const canSave = !!patient.patientRecord?.IdChiTietLD && patient.patientRecord.TrangThaiLich !== 'Đã hủy';
  return { ...clinicalQueue, ...patient, diagnosisData, setDiagnosisData, saving, saveError, saveMessage, canSave,
    fetchPatientExam, handleSaveDiagnosis, handleClosePatient };
}
