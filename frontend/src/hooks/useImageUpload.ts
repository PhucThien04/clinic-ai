import {useEffect,useRef,useState} from 'react';
import {uploadService} from '../services/uploadService';
import type {MediaFolder} from '../services/uploadService';
import {clinicalError} from '../utils/clinicalExamUtils';
import {profileService} from '../services/profileService';
import {authService} from '../services/authService';
export function useImageUpload(folder:MediaFolder,onChange:(value:string)=>void,onBusyChange?:(busy:boolean)=>void,value?:string|null){
  const [uploading,setUploading]=useState(false);const [error,setError]=useState('');
  const request=useRef<AbortController|null>(null);const busyCallback=useRef(onBusyChange);
  useEffect(()=>{busyCallback.current=onBusyChange;},[onBusyChange]);
  useEffect(()=>()=>{request.current?.abort();busyCallback.current?.(false);},[]);
  const removeImage=async()=>{
    if(uploading||!value||!window.confirm('Xóa file ảnh này trên Cloudinary?'))return;
    setUploading(true);busyCallback.current?.(true);setError('');
    try{if(/^https?:\/\/res\.cloudinary\.com\//i.test(value)){
      await uploadService.deleteImage({url:value});
      if(folder==='avatars')authService.updateCurrentUser(await profileService.get());
    }onChange('');}
    catch(error){setError(clinicalError(error));}finally{setUploading(false);busyCallback.current?.(false);}
  };
  const upload=async(file?:File)=>{
    if(!file)return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024){setError('Chọn ảnh JPEG, PNG, WebP hoặc GIF không quá 5MB.');return;}
    request.current?.abort();const controller=new AbortController();request.current=controller;
    setUploading(true);busyCallback.current?.(true);setError('');
    try{const url=await uploadService.upload(file,folder,controller.signal);if(!controller.signal.aborted)onChange(url);}
    catch(error){if(!controller.signal.aborted)setError(clinicalError(error));}
    finally{if(request.current===controller){setUploading(false);busyCallback.current?.(false);request.current=null;}}
  };
  return {uploading,error,upload,removeImage};
}
