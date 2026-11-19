import { useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useClinicalQueue } from './useClinicalQueue';
import { useClinicalPatient } from './useClinicalPatient';
import { updateClinicalVitals } from '../services/examinationService';
import { clinicalError, emptyVitals, recordToVitals, vitalsToPayload } from '../utils/clinicalExamUtils';
import type { VitalsForm } from '../utils/clinicalExamUtils';

export function useNurseExam() {
  const clinicalQueue = useClinicalQueue();
  const patient = useClinicalPatient();
  const [vitals, setVitals] = useState<VitalsForm>(emptyVitals);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const selectionVersion = useRef(0);
  const handleClosePatient = () => {
    selectionVersion.current++;
    patient.clearPatientExam();
    setVitals(emptyVitals);
    setSaveError('');
    setSaveMessage('');
  };
  const selectPatient = async (id: string) => {
    selectionVersion.current++;
    setVitals(emptyVitals); setSaveError(''); setSaveMessage('');
    const record = await patient.fetchPatientExam(id);
    if (record) setVitals(recordToVitals(record));
  };
  const handleSubmitVitals = async (event: FormEvent) => {
    event.preventDefault();
    if (!patient.patientRecord || saving) return;
    const version = selectionVersion.current;
    setSaving(true); setSaveError(''); setSaveMessage('');
    try {
      const result = await updateClinicalVitals(vitalsToPayload(patient.patientRecord.IdHoSoBenhNhan, vitals));
      if (version === selectionVersion.current) setSaveMessage(result.message);
      await clinicalQueue.refreshQueue();
      if (version !== selectionVersion.current) return;
      const record = await patient.fetchPatientExam(patient.patientRecord.IdHoSoBenhNhan);
      if (record) setVitals(recordToVitals(record));
    } catch (error) { if (version === selectionVersion.current) setSaveError(clinicalError(error)); }
    finally { setSaving(false); }
  };
  const canSave = !!patient.patientRecord?.IdChiTietLD
    && !['Đã hủy', 'Hoàn thành'].includes(patient.patientRecord.TrangThaiLich || '');
  return { ...clinicalQueue, ...patient, vitals, setVitals, saving, saveError, saveMessage, canSave,
    selectPatient, handleSubmitVitals, handleClosePatient };
}
