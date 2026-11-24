import {useEffect,useId,useRef} from 'react';
import type {MouseEvent} from 'react';

export function useModalDialog(onClose:()=>void,busy:boolean){
  const dialogRef=useRef<HTMLDivElement>(null);
  const latest=useRef({onClose,busy});
  const titleId=useId();
  useEffect(()=>{latest.current={onClose,busy};},[onClose,busy]);
  useEffect(()=>{
    const previous=document.activeElement instanceof HTMLElement?document.activeElement:null;
    const overflow=document.body.style.overflow;
    document.body.style.overflow='hidden';
    const dialog=dialogRef.current;
    const focusable=()=>Array.from(dialog?.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex="0"]')||[]).filter(control=>control.getClientRects().length>0);
    (focusable().find(control=>control.matches('input:not([readonly]),select,textarea'))||focusable()[0]||dialog)?.focus();
    const handleKey=(event:KeyboardEvent)=>{
      if(event.key==='Escape'){event.preventDefault();if(!latest.current.busy)latest.current.onClose();}
      if(event.key!=='Tab'||!dialog)return;
      const controls=focusable();
      if(!controls.length){event.preventDefault();dialog.focus();return;}
      const first=controls[0],last=controls[controls.length-1];
      if(event.shiftKey&&(document.activeElement===first||document.activeElement===dialog)){event.preventDefault();last.focus();}
      else if(!event.shiftKey&&(document.activeElement===last||document.activeElement===dialog)){event.preventDefault();first.focus();}
    };
    document.addEventListener('keydown',handleKey);
    return()=>{document.removeEventListener('keydown',handleKey);document.body.style.overflow=overflow;previous?.focus();};
  },[]);
  const onBackdropClick=(event:MouseEvent<HTMLDivElement>)=>{
    if(event.target===event.currentTarget&&!busy)onClose();
  };
  return {dialogRef,titleId,onBackdropClick};
}
