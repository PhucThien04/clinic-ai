import {Camera,Trash2} from 'lucide-react';
import {useAvatarManager} from '../../hooks/useAvatarManager';
import {ManagementModal} from './ManagementModal';
import {MediaImage} from './MediaImage';
export function AvatarManagerModal({currentUrl,onSaved,onClose}:{currentUrl?:string|null;onSaved:(url:string|null)=>void;onClose:()=>void}){
  const state=useAvatarManager(currentUrl,onSaved);
  return <ManagementModal title={state.source?'Cắt & Căn chỉnh ảnh':'Quản lý ảnh đại diện'} busy={state.busy} onClose={onClose}><div className="space-y-4 p-5">
    {state.error&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-800">{state.error}</p>}
    {state.source&&state.geometry?<>
      <p className="text-sm text-slate-600">Kéo ảnh bằng chuột hoặc chạm để căn chỉnh. Có thể dùng phím mũi tên trong khung ảnh.</p>
      <div role="group" aria-label="Vùng cắt ảnh, dùng phím mũi tên để di chuyển" tabIndex={0} onKeyDown={state.keyDown} onPointerDown={state.pointerDown} onPointerMove={state.pointerMove} onPointerUp={state.pointerUp} onPointerCancel={state.pointerUp} onLostPointerCapture={state.pointerUp} className="relative mx-auto h-64 w-64 touch-none overflow-hidden rounded-full bg-slate-100 outline-none ring-4 ring-sky-600 focus:ring-sky-300">
        <img src={state.source.url} alt="Ảnh đang căn chỉnh" draggable={false} className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none" style={{width:state.geometry.width,height:state.geometry.height,transform:`translate(calc(-50% + ${state.geometry.x}px),calc(-50% + ${state.geometry.y}px))`}}/>
      </div>
      <label className="block text-sm font-semibold text-slate-700">Phóng to / Thu nhỏ<input type="range" min="1" max="3" step="0.01" value={state.zoom} disabled={state.busy} onChange={event=>state.changeZoom(Number(event.target.value))} className="mt-2 block w-full accent-sky-600"/></label>
      <div className="flex justify-end gap-2"><button type="button" disabled={state.busy} onClick={state.cancelCrop} className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600">Quay lại</button><button type="button" disabled={state.busy} onClick={()=>void state.saveCrop()} className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white disabled:opacity-50">{state.busy?'Đang lưu...':'Xác nhận & Lưu'}</button></div>
    </>:<>
      <div className="flex flex-wrap gap-2"><button type="button" disabled={state.busy||!currentUrl} onClick={()=>void state.removeAvatar()} className="inline-flex items-center gap-2 rounded-lg border border-red-200 px-3 py-2 text-sm font-semibold text-red-500 disabled:opacity-50"><Trash2 size={16}/>Xóa ảnh đại diện</button><button type="button" disabled={state.busy} onClick={()=>state.fileRef.current?.click()} className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-3 py-2 text-sm font-semibold text-white disabled:opacity-50"><Camera size={16}/>Thay ảnh đại diện mới</button></div>
      <input ref={state.fileRef} aria-label="Chọn ảnh đại diện mới" type="file" accept="image/jpeg,image/png,image/webp,image/gif" className="hidden" onChange={event=>{void state.chooseFile(event.target.files?.[0]);event.target.value='';}}/>
      <h3 className="font-semibold text-slate-800">Thư viện ảnh của bạn</h3>
      {state.loading?<p className="text-sm text-slate-500">Đang tải thư viện...</p>:!state.images.length&&<p className="text-sm text-slate-500">Chưa có ảnh trong thư viện.</p>}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">{state.images.map(image=><div key={image.publicId} className="space-y-1"><button type="button" aria-label="Dùng ảnh này làm ảnh đại diện" aria-pressed={image.url===currentUrl} disabled={state.busy} onClick={()=>void state.selectAvatar(image)} className={`w-full rounded-lg border-2 p-1 ${image.url===currentUrl?'border-sky-600':'border-slate-200'}`}><MediaImage src={image.url} alt="Ảnh trong thư viện" className="aspect-square w-full rounded-full"/></button><button type="button" title="Xóa ảnh khỏi thư viện" aria-label="Xóa ảnh khỏi thư viện" disabled={state.busy} onClick={()=>void state.deleteImage(image)} className="rounded p-1 text-red-500 hover:bg-red-50"><Trash2 size={16}/></button></div>)}</div>
    </>}
  </div></ManagementModal>;
}
