import type {FormEvent,ReactNode} from 'react';
interface FormField {name:string;label:string;type?:string;required?:boolean;maxLength?:number;readOnly?:boolean;
  min?:string;step?:string;pattern?:string;fullWidth?:boolean;options?:{value:string;label:string}[]}
export function ManagementForm({title,fields,values,onChange,onSubmit,saving,onCancel,children,hideTitle=false,columns=1,submitLabel='Lưu thông tin'}:{title:string;fields:FormField[];values:object;
  onChange:(name:string,value:string)=>void;onSubmit:(event:FormEvent)=>void;saving:boolean;onCancel?:()=>void;children?:ReactNode;hideTitle?:boolean;columns?:1|2;submitLabel?:string}){
  return <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
    {!hideTitle&&<h2 className="mb-4 text-lg font-bold text-slate-900">{title}</h2>}
    {children}
    <form onSubmit={onSubmit}><fieldset disabled={saving} className="space-y-4 disabled:opacity-60">
      <div className={columns===2?'grid grid-cols-1 gap-5 md:grid-cols-2':'space-y-4'}>
      {fields.map(field=><label key={field.name} className={`block text-sm font-medium text-slate-700 ${columns===2&&field.fullWidth?'md:col-span-2':''}`}>{field.label}
        {field.options?<select value={String((values as Record<string,unknown>)[field.name]??'')} required={field.required!==false}
          onChange={event=>onChange(field.name,event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 bg-white p-2.5">
          {field.options.map(option=><option key={option.value} value={option.value}>{option.label}</option>)}</select>
        :field.type==='textarea'?<textarea value={String((values as Record<string,unknown>)[field.name]??'')} required={field.required!==false}
          maxLength={field.maxLength??255} rows={3} onChange={event=>onChange(field.name,event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5"/>
        :<input type={field.type||'text'} value={String((values as Record<string,unknown>)[field.name]??'')} required={field.required!==false}
          maxLength={field.maxLength??255} readOnly={field.readOnly} min={field.min} step={field.step} pattern={field.pattern}
          onChange={event=>onChange(field.name,event.target.value)} className="mt-1 w-full rounded-lg border border-slate-200 p-2.5 read-only:bg-slate-50 focus:border-sky-600"/>}
      </label>)}
      </div>
      <div className="flex justify-end gap-2">{onCancel&&<button type="button" onClick={onCancel} className="rounded-lg border border-slate-200 px-4 py-2 text-slate-600">Đóng</button>}
        <button className="rounded-lg bg-teal-600 px-4 py-2 font-semibold text-white hover:bg-teal-700">{saving?'Đang lưu...':submitLabel}</button></div>
    </fieldset></form>
  </section>;
}
export function ManagementMessages({error,message,loading}:{error:string;message:string;loading:boolean}){
  return <>{loading&&<p role="status" className="text-sm text-slate-500">Đang tải dữ liệu...</p>}
    {error&&<p role="alert" className="rounded-lg bg-amber-50 p-3 text-sm text-amber-900">{error}</p>}
    {message&&<p role="status" className="rounded-lg bg-teal-50 p-3 text-sm text-teal-800">{message}</p>}</>;
}
export function ManagementTabs({tabs,value,onChange,disabled}:{tabs:{value:string;label:string}[];value:string;onChange:(value:string)=>void;disabled?:boolean}){
  return <div className="flex flex-wrap gap-2">{tabs.map(tab=><button key={tab.value} type="button" disabled={disabled} onClick={()=>onChange(tab.value)}
    aria-pressed={value===tab.value} className={`rounded-lg border px-4 py-2 text-sm font-semibold disabled:opacity-50 ${value===tab.value?'border-sky-600 bg-sky-600 text-white':'border-slate-200 bg-white text-slate-600'}`}>{tab.label}</button>)}</div>;
}
