import {LoaderCircle,Sparkles} from 'lucide-react';
import type {AIAnalyzeResponse,AIResultRecord,VitalAlertItem} from '../../services/aiService';
import {aiSections} from '../../utils/aiConfig';
export function ClinicalAIPanel({selected,canAnalyze,results,alerts,disclaimer,metadata,loading,analyzing,error,onAnalyze}:{
  selected:boolean;canAnalyze:boolean;results:AIResultRecord[];alerts:VitalAlertItem[];disclaimer:string;
  metadata:AIAnalyzeResponse['metadata']|null;loading:boolean;analyzing:boolean;error:string;onAnalyze:()=>void;
}){
  return <aside className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 shadow-sm xl:col-start-2 2xl:col-start-auto">
    <h2 className="flex items-center gap-2 font-bold text-slate-900"><Sparkles size={18} className="text-teal-600"/>Phân Tích AI</h2>
    {!selected&&<p className="mt-3 text-sm leading-6 text-slate-500">Chọn một bệnh nhân từ danh sách lịch khám bên trái để bắt đầu.</p>}
    {selected&&!canAnalyze&&<p className="mt-3 text-sm text-amber-800">Lượt khám đã hủy hoặc chưa gắn lịch; chỉ được xem kết quả đã lưu.</p>}
    <button type="button" disabled={!canAnalyze||loading||analyzing} onClick={onAnalyze} className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
      {(loading||analyzing)&&<LoaderCircle size={16} className="animate-spin"/>}{analyzing?'Đang phân tích...':loading?'Đang tải kết quả...':results.length?'Phân tích lại':'Phân tích hồ sơ bằng AI'}
    </button>
    {error&&<p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {metadata&&<p className="mt-3 text-xs text-slate-500">{metadata.llmUsed?`LLM: ${metadata.model}`:'Tổng hợp an toàn từ hồ sơ và rule engine; chưa sử dụng LLM.'} · Rule {metadata.ruleEngineVersion}</p>}
    {!!alerts.length&&<section className="mt-4 space-y-2"><h3 className="text-sm font-bold text-amber-900">Cảnh báo sinh hiệu định lượng</h3>{alerts.map((item,index)=><div key={`${item.chiSo}-${index}`} className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><strong>{item.chiSo}: {item.giaTri} · {item.mucDo}</strong><p className="mt-1">{item.moTa}</p></div>)}</section>}
    <div className="mt-4 space-y-4">{aiSections.map(section=>{
      const records=results.filter(item=>item.LoaiKetQua===section.type);
      return <section key={section.type} className={`rounded-lg border p-3 ${section.type==='CANHBAO'?'border-amber-200 bg-amber-50':'border-slate-200 bg-slate-50'}`}>
        <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
        {records.length?records.map(item=><p key={item.IdAIKetQua} className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700">{item.NoiDung}</p>):<p className="mt-2 text-xs text-slate-500">Chưa có kết quả.</p>}
      </section>;
    })}</div>
    <p className="mt-4 border-t border-slate-200 pt-3 text-xs leading-5 text-slate-500">{disclaimer}</p>
  </aside>;
}
