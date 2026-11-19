import { useCallback, useEffect, useRef, useState } from 'react';
import { getPatientExamInfo } from '../services/examinationService';
import type { PatientExamDetail } from '../services/examinationService';
import { clinicalError } from '../utils/clinicalExamUtils';

export function useClinicalPatient() {
  const [patientRecord, setPatientRecord] = useState<PatientExamDetail | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [patientError, setPatientError] = useState('');
  const requestId = useRef(0);
  useEffect(() => () => { requestId.current++; }, []);
  const fetchPatientExam = useCallback(async (id: string) => {
    const request = ++requestId.current;
    setLoadingPatient(true);
    setPatientError('');
    setPatientRecord(null);
    try {
      const record = await getPatientExamInfo(id.trim());
      if (request !== requestId.current) return null;
      setPatientRecord(record);
      return record;
    } catch (error) {
      if (request === requestId.current) setPatientError(clinicalError(error));
      return null;
    } finally {
      if (request === requestId.current) setLoadingPatient(false);
    }
  }, []);
  return { patientRecord, loadingPatient, patientError, fetchPatientExam };
}
