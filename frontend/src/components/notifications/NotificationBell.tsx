import {useId} from 'react';
import {Bell} from 'lucide-react';
import {useNotifications} from '../../hooks/useNotifications';
import {formatRelativeTime} from '../../utils/dateUtils';

export function NotificationBell({placement='header'}:{placement?:'header'|'sidebar'}){
  const state=useNotifications();const panelId=useId();
  if(!state.loggedIn)return null;
  return <div ref={state.containerRef} className={`${placement==='header'?'relative':'static'} shrink-0`}>
    <button ref={state.buttonRef} type="button" aria-label={`Thông báo, ${state.unreadCount} chưa đọc`} title="Thông báo" aria-expanded={state.open} aria-controls={panelId}
      onClick={state.toggleOpen} className="relative flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-sky-600 hover:bg-sky-50">
      <Bell size={20}/>{state.unreadCount>0&&<span className="absolute -right-1 -top-1 rounded-full bg-red-500 px-1.5 text-[10px] font-bold leading-4 text-white">{state.unreadCount}</span>}
    </button>
    {state.open&&<section id={panelId} aria-label="Danh sách thông báo" className={`absolute z-50 max-w-[calc(100vw-2rem)] rounded-xl border border-slate-200 bg-white text-left shadow-xl ${placement==='header'?'right-0 top-full mt-2 w-96':'bottom-full left-0 mb-2 w-80'}`}>
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 p-4"><h2 className="font-bold text-slate-900">Thông báo</h2>
        <button type="button" disabled={!state.unreadCount} onClick={state.markAllAsRead} className="text-xs font-semibold text-sky-600 hover:underline disabled:text-slate-400">Đánh dấu đã đọc tất cả</button></div>
      <div className="max-h-[min(28rem,65vh)] overflow-y-auto overscroll-contain">
        {state.error&&<p role="status" className="p-4 text-sm text-amber-800">{state.error}</p>}
        {!state.notifications.length&&<p className="p-5 text-sm text-slate-500">{state.loading?'Đang tải thông báo...':'Chưa có thông báo.'}</p>}
        {state.notifications.map(item=><button type="button" key={item.id} onClick={()=>state.selectNotification(item)} className={`block w-full border-b border-slate-100 p-4 text-left hover:bg-slate-100 ${state.isRead(item.id)?'bg-white':'bg-sky-50'}`}>
          <div className="flex items-start gap-2">{!state.isRead(item.id)&&<span aria-label="Chưa đọc" className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-sky-600"/>}<div>
            <p className={`text-sm font-semibold ${item.type==='warning'?'text-amber-800':item.type==='success'?'text-teal-600':'text-slate-900'}`}>{item.title}</p>
            <p className="mt-1 whitespace-normal text-xs leading-5 text-slate-600">{item.message}</p>
            <time dateTime={item.timestamp} className="mt-2 block text-[11px] text-slate-500">{formatRelativeTime(item.timestamp,state.now)}</time>
          </div></div>
        </button>)}
      </div>
    </section>}
  </div>;
}
