import {ArrowRight,Clock} from 'lucide-react';
import {MediaImage} from './MediaImage';
export function PublicEventCard({event,timeLabel,actionLabel,onAction}:{event:{HinhAnh?:string|null;TieuDe:string;NoiDung:string};timeLabel:string;actionLabel:string;onAction:()=>void}){
  return <article className="flex flex-col items-start gap-5 rounded-xl border border-slate-200 border-l-4 border-l-sky-600 bg-linear-to-r from-sky-50 to-white p-5 sm:flex-row sm:items-center">
    {event.HinhAnh&&<MediaImage src={event.HinhAnh} alt={event.TieuDe} className="h-36 w-full shrink-0 rounded-xl sm:w-56"/>}
    <div className="min-w-0 flex-1">
      <span className="mb-2 inline-flex items-center gap-1.5 rounded-full bg-sky-600 px-3 py-1 text-xs font-bold text-white"><Clock size={12} className="shrink-0"/>{timeLabel}</span>
      <h3 className="mb-2 break-words text-lg font-semibold text-sky-700">{event.TieuDe}</h3>
      <p className="break-words text-sm leading-6 text-slate-600">{event.NoiDung}</p>
    </div>
    <button type="button" onClick={onAction} className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-lg bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">{actionLabel}<ArrowRight size={16}/></button>
  </article>;
}
