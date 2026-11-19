import API from './api';
export type AIResultCategory='TOMTAT'|'PHANTICH'|'CANHBAO';
export interface AIResultRecord {IdAIKetQua:string;IdChiTietLD:string;LoaiKetQua:AIResultCategory;NoiDung:string;ThoiDiemTao:string}
export interface VitalAlertItem {chiSo:string;giaTri:string;mucDo:'Lưu ý'|'Cảnh báo';moTa:string}
export interface AIAnalyzeResponse {IdChiTietLD:string;nhanThamKhao:string;canhBaoSinhHieu:VitalAlertItem[];metadata:{ruleEngineVersion:'1.0';llmUsed:boolean;model:string|null};results:AIResultRecord[]}
export const getAIResults=async(idChiTietLD:string)=>(await API.get<AIResultRecord[]>('/ai/results',{params:{idChiTietLD}})).data;
export const analyzeExamWithAI=async(idHoSoBenhNhan:string)=>(await API.post<AIAnalyzeResponse>('/ai/analyze',{idHoSoBenhNhan},{timeout:30000})).data;
