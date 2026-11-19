import {useEffect,useRef,useState} from 'react';
import {uploadService} from '../services/uploadService';
import type {MediaFolder} from '../services/uploadService';
import {clinicalError} from '../utils/clinicalExamUtils';
export function useImageUpload(folder:MediaFolder,onChange:(value:string)=>void,onBusyChange?:(busy:boolean)=>void){
  const [uploading,setUploading]=useState(false);const [error,setError]=useState('');
  const request=useRef<AbortController|null>(null);const busyCallback=useRef(onBusyChange);
  useEffect(()=>{busyCallback.current=onBusyChange;},[onBusyChange]);
  useEffect(()=>()=>{request.current?.abort();busyCallback.current?.(false);},[]);
  const changeUrl=(value:string)=>{request.current?.abort();request.current=null;setUploading(false);busyCallback.current?.(false);setError('');onChange(value);};
  const upload=async(file?:File)=>{
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024){setError('Chọn ảnh JPEG, PNG, WebP hoặc GIF không quá 5MB.');return;}
    request.current?.abort();const controller=new AbortController();request.current=controller;
    setUploading(true);busyCallback.current?.(true);setError('');
    try{const url=await uploadService.upload(file,folder,controller.signal);if(!controller.signal.aborted)onChange(url);}
    catch(error){if(!controller.signal.aborted)setError(clinicalError(error));}
    finally{if(request.current===controller){setUploading(false);busyCallback.current?.(false);request.current=null;}}
  };
  return {uploading,error,upload,changeUrl};
}
