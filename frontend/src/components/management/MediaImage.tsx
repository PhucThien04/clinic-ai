import type {ReactNode} from 'react';
import {Image,UserRound} from 'lucide-react';
export function MediaImage({src,alt,className='',fallback}:{src?:string|null;alt:string;className?:string;fallback?:ReactNode}){
  return <div className={`relative flex shrink-0 items-center justify-center overflow-hidden bg-slate-100 text-sky-600 ${className}`}>
    {fallback||<Image size={28} aria-hidden="true"/>}
    {src&&<img key={src} src={src} alt={alt} loading="lazy" referrerPolicy="no-referrer" onError={event=>{event.currentTarget.hidden=true;}} className="absolute inset-0 h-full w-full object-cover"/>}
  </div>;
}
export function UserAvatar({src,name,className='h-9 w-9'}:{src?:string|null;name:string;className?:string}){
  return <MediaImage src={src} alt={`Ảnh đại diện ${name}`} className={`rounded-full ${className}`} fallback={<UserRound size={22} aria-hidden="true"/>}/>;
}
