import {LoaderCircle,Sparkles,X} from 'lucide-react';
import {createPortal} from 'react-dom';
import type {AIAnalyzeResponse,AIResultRecord,VitalAlertItem} from '../../services/aiService';
import {aiSections} from '../../utils/aiConfig';
export function ClinicalAIPanel({open,onToggle,onClose,patientName,selected,canAnalyze,results,alerts,disclaimer,metadata,loading,analyzing,error,onAnalyze}:{
  open:boolean;onToggle:()=>void;onClose:()=>void;patientName?:string|null;
  selected:boolean;canAnalyze:boolean;results:AIResultRecord[];alerts:VitalAlertItem[];disclaimer:string;
  metadata:AIAnalyzeResponse['metadata']|null;loading:boolean;analyzing:boolean;error:string;onAnalyze:()=>void;
}){
  return createPortal(<>
    {!open&&<button id="clinical-ai-trigger" type="button" onClick={onToggle} aria-expanded={open} aria-controls="clinical-ai-popup"
      className="fixed bottom-6 right-6 z-40 inline-flex h-12 items-center gap-2 rounded-full bg-teal-600 px-5 font-semibold text-white shadow-lg hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-teal-600">
      <Sparkles size={21}/>Trợ lý AI
      {selected&&(results.length>0||alerts.length>0)&&<span className="absolute right-0 top-0 h-3 w-3 rounded-full border-2 border-white bg-amber-400"><span className="sr-only">Có kết quả hoặc cảnh báo AI</span></span>}
    </button>}
    {open&&<section id="clinical-ai-popup" role="dialog" aria-modal="false" aria-labelledby="clinical-ai-title"
      className="fixed bottom-6 right-6 z-50 flex max-h-[calc(100dvh-3rem)] w-[min(430px,calc(100vw-2rem))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
    <header className="flex shrink-0 items-start gap-3 bg-teal-600 p-4 text-white">
      <Sparkles size={22} className="mt-0.5 shrink-0"/>
      <div className="min-w-0 flex-1"><h2 id="clinical-ai-title" className="font-bold">Trợ lý AI Lâm sàng</h2><p className="mt-1 truncate text-sm text-teal-50" title={patientName??undefined}>{selected?patientName||'Bệnh nhân đang chọn':'Chưa chọn hồ sơ'}</p></div>
      <button id="clinical-ai-close" type="button" onClick={onClose} aria-label="Đóng trợ lý AI" className="rounded-lg p-1.5 hover:bg-teal-700 focus-visible:outline-2 focus-visible:outline-white"><X size={19}/></button>
    </header>
    <div className="shrink-0 border-b border-slate-200 p-3">
    <button type="button" disabled={!canAnalyze||loading||analyzing} onClick={onAnalyze} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-3 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50">
      {(loading||analyzing)&&<LoaderCircle size={16} className="animate-spin"/>}{analyzing?'Đang phân tích...':loading?'Đang tải kết quả...':results.length?'Phân tích lại':'Phân tích hồ sơ bằng AI'}
    </button>
    </div>
    <div className="min-h-0 flex-1 space-y-3 overflow-y-auto overscroll-contain p-4" aria-busy={loading||analyzing}>
    {!selected&&<p className="mt-3 text-sm leading-6 text-slate-500">Chọn một bệnh nhân từ danh sách lịch khám bên trái để bắt đầu.</p>}
    {selected&&!canAnalyze&&<p className="mt-3 text-sm text-amber-800">Lượt khám đã hủy hoặc chưa gắn lịch; chỉ được xem kết quả đã lưu.</p>}
    {error&&<p role="alert" className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {metadata&&<p className="mt-3 text-xs text-slate-500">{metadata.llmUsed?`LLM: ${metadata.model}`:'Tổng hợp an toàn từ hồ sơ và rule engine; chưa sử dụng LLM.'} · Rule {metadata.ruleEngineVersion}</p>}
    {!!alerts.length&&<section className="mt-4 space-y-2"><h3 className="text-sm font-bold text-amber-900">Cảnh báo sinh hiệu định lượng</h3>{alerts.map((item,index)=><div key={`${item.chiSo}-${index}`} className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-950"><span className="mb-2 inline-block rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold">{item.mucDo}</span><p className="font-semibold">{item.chiSo}: {item.giaTri}</p><p className="mt-1">{item.moTa}</p></div>)}</section>}
    <div className="mt-4 space-y-4">{aiSections.map(section=>{
      const records=results.filter(item=>item.LoaiKetQua===section.type);
      return <section key={section.type} className={`rounded-2xl rounded-tl-sm border p-3 ${section.type==='CANHBAO'?'border-amber-200 bg-amber-50':'border-slate-200 bg-slate-50'}`}>
        <h3 className="text-sm font-bold text-slate-900">{section.title}</h3>
        {records.length?records.map(item=><p key={item.IdAIKetQua} className="mt-2 whitespace-pre-line break-words text-sm leading-6 text-slate-700">{item.NoiDung}</p>):<p className="mt-2 text-xs text-slate-500">Chưa có kết quả.</p>}
      </section>;
    })}</div>
    </div>
    <footer className="shrink-0 border-t border-slate-200 bg-white px-4 py-3 text-xs leading-5 text-slate-500">{disclaimer}</footer>
    </section>}
  </>, document.body);
}
