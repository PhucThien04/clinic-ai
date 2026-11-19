import {useId} from 'react';
import {useImageUpload} from '../../hooks/useImageUpload';
import type {MediaFolder} from '../../services/uploadService';
import {MediaImage} from './MediaImage';
export function ImageUploadField({value,onChange,folder,label='Hình ảnh',disabled=false,onBusyChange}:{value?:string|null;onChange:(value:string)=>void;folder:MediaFolder;label?:string;disabled?:boolean;onBusyChange?:(busy:boolean)=>void}){
  const state=useImageUpload(folder,onChange,onBusyChange);const id=useId();
  return <div className="mb-4 space-y-3 rounded-lg border border-slate-200 p-4">
    <p className="text-sm font-semibold text-slate-700">{label}</p>
    <MediaImage src={value} alt={label} className="h-28 w-40 rounded-lg"/>
    <label className="block text-sm text-slate-600">Chọn ảnh từ máy<input type="file" accept="image/jpeg,image/png,image/webp,image/gif" disabled={disabled||state.uploading} onChange={event=>{void state.upload(event.target.files?.[0]);event.target.value='';}} className="mt-1 block w-full text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-sky-50 file:px-3 file:py-2 file:text-sky-700"/></label>
    <label htmlFor={id} className="block text-sm text-slate-600">Hoặc dán URL ảnh</label>
    <input id={id} type="url" maxLength={500} value={value||''} disabled={disabled} onChange={event=>state.changeUrl(event.target.value)} placeholder="https://..." className="w-full rounded-lg border border-slate-200 p-2 text-sm"/>
    <button type="button" disabled={disabled||(!value&&!state.uploading)} onClick={()=>state.changeUrl('')} className="text-sm font-semibold text-red-500 disabled:opacity-50">Xóa ảnh</button>
    {state.uploading&&<p role="status" className="text-sm text-sky-600">Đang tải ảnh...</p>}
    {state.error&&<p role="alert" className="text-sm text-amber-800">{state.error}</p>}
  </div>;
}
