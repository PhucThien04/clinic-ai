import type {ComponentType,ButtonHTMLAttributes} from 'react';
import type {LucideProps} from 'lucide-react';

type Props=Omit<ButtonHTMLAttributes<HTMLButtonElement>,'children'|'title'> & {
  label:string;icon:ComponentType<LucideProps>;spinning?:boolean;tone?:'primary'|'danger'|'success'|'default';
};
export function IconButton({label,icon:Icon,spinning=false,tone='default',className='',...props}:Props){
  const color=tone==='primary'?'border-sky-600 bg-sky-600 text-white hover:bg-sky-700':tone==='danger'?'border-slate-200 bg-white text-red-500 hover:bg-red-50':tone==='success'?'border-teal-200 bg-white text-teal-600 hover:bg-teal-50':'border-slate-200 bg-white text-sky-600 hover:bg-sky-50';
  return <button type="button" title={label} aria-label={label} {...props}
    className={`inline-flex shrink-0 items-center justify-center rounded-lg border p-2.5 transition disabled:cursor-not-allowed disabled:opacity-50 ${color} ${className}`}>
    <Icon size={18} aria-hidden="true" className={spinning?'animate-spin':''}/>
  </button>;
}
