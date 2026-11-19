import {createPortal} from 'react-dom';
import type {ReactNode} from 'react';
import {X} from 'lucide-react';
import {useModalDialog} from '../../hooks/useModalDialog';

export function ManagementModal({title,onClose,busy=false,children}:{title:string;onClose:()=>void;busy?:boolean;children:ReactNode}){
  const modal=useModalDialog(onClose,busy);
  return createPortal(<div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4" onClick={modal.onBackdropClick}>
    <div ref={modal.dialogRef} role="dialog" aria-modal="true" aria-labelledby={modal.titleId} aria-busy={busy} tabIndex={-1}
      className="max-h-[calc(100dvh-2rem)] w-full max-w-xl overflow-y-auto rounded-xl bg-white shadow-xl outline-none">
      <div className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4">
        <h2 id={modal.titleId} className="text-lg font-bold text-slate-900">{title}</h2>
        <button type="button" disabled={busy} title="Đóng" aria-label="Đóng" onClick={onClose}
          className="rounded-lg border border-slate-200 p-2 text-slate-500 hover:bg-slate-100 disabled:opacity-50"><X size={18}/></button>
      </div>
      {children}
    </div>
  </div>,document.body);
}
