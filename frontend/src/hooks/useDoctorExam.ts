import { useEffect,useRef, useState } from 'react';
import type { FormEvent } from 'react';
import { useClinicalQueue } from './useClinicalQueue';
import { useClinicalPatient } from './useClinicalPatient';
import { updateDoctorDiagnosis } from '../services/examinationService';
import { clinicalError } from '../utils/clinicalExamUtils';
import {getAIResults,analyzeExamWithAI} from '../services/aiService';
import type {AIResultRecord,VitalAlertItem,AIAnalyzeResponse} from '../services/aiService';
import {aiDisclaimer as defaultDisclaimer} from '../utils/aiConfig';

export function useDoctorExam() {
  const clinicalQueue = useClinicalQueue(true);
  const patient = useClinicalPatient();
  const [diagnosisData, setDiagnosisData] = useState({ ChuanDoan: '', KetLuan: '' });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState('');
  const [saveMessage, setSaveMessage] = useState('');
  const selectionVersion = useRef(0);
  const aiRequest=useRef(0);const analyzeOwner=useRef<number|null>(null);
  const [aiResults,setAIResults]=useState<AIResultRecord[]>([]);const [vitalAlerts,setVitalAlerts]=useState<VitalAlertItem[]>([]);
  const [aiDisclaimer,setAIDisclaimer]=useState(defaultDisclaimer);const [aiMetadata,setAIMetadata]=useState<AIAnalyzeResponse['metadata']|null>(null);
  const [loadingAI,setLoadingAI]=useState(false);const [analyzingAI,setAnalyzingAI]=useState(false);const [aiError,setAIError]=useState('');
  useEffect(()=>()=>{selectionVersion.current++;aiRequest.current++;},[]);
  const resetAI=()=>{aiRequest.current++;setAIResults([]);setVitalAlerts([]);setAIDisclaimer(defaultDisclaimer);setAIMetadata(null);setLoadingAI(false);setAnalyzingAI(false);setAIError('');};
  const handleClosePatient = () => {
    selectionVersion.current++;
    resetAI();
    patient.clearPatientExam();
    setDiagnosisData({ ChuanDoan: '', KetLuan: '' });
    setSaveError('');
    setSaveMessage('');
  };
  const fetchPatientExam = async (id: string) => {
    const version=++selectionVersion.current;resetAI();
    setDiagnosisData({ ChuanDoan: '', KetLuan: '' }); setSaveError(''); setSaveMessage('');
    const record = await patient.fetchPatientExam(id);
    if (!record||version!==selectionVersion.current)return;
    setDiagnosisData({ ChuanDoan: record.ChuanDoan ?? '', KetLuan: record.KetLuan ?? '' });
    if(record.IdChiTietLD){
      const request=++aiRequest.current;setLoadingAI(true);
      try{const results=await getAIResults(record.IdChiTietLD);if(version===selectionVersion.current&&request===aiRequest.current)setAIResults(results);}
      catch(error){if(version===selectionVersion.current&&request===aiRequest.current)setAIError(clinicalError(error));}
      finally{if(version===selectionVersion.current&&request===aiRequest.current)setLoadingAI(false);}
    }
  };
  const handleAnalyzeAI=async()=>{
    const record=patient.patientRecord;const version=selectionVersion.current;
    if(!record?.IdChiTietLD||record.TrangThaiLich==='Đã hủy'||analyzeOwner.current===version)return;
    analyzeOwner.current=version;const request=++aiRequest.current;setLoadingAI(false);setAnalyzingAI(true);setAIError('');
    try{
      const result=await analyzeExamWithAI(record.IdHoSoBenhNhan);
      if(version!==selectionVersion.current||request!==aiRequest.current)return;
      setAIResults(result.results);setVitalAlerts(result.canhBaoSinhHieu);setAIDisclaimer(result.nhanThamKhao);setAIMetadata(result.metadata);
    }catch(error){if(version===selectionVersion.current&&request===aiRequest.current)setAIError(clinicalError(error));}
    finally{if(analyzeOwner.current===version)analyzeOwner.current=null;if(version===selectionVersion.current&&request===aiRequest.current)setAnalyzingAI(false);}
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
    aiResults,vitalAlerts,aiDisclaimer,aiMetadata,loadingAI,analyzingAI,aiError,handleAnalyzeAI,
    fetchPatientExam, handleSaveDiagnosis, handleClosePatient };
}
