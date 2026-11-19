import {useEffect,useRef,useState} from 'react';
import type {PointerEvent,KeyboardEvent} from 'react';
import {uploadService} from '../services/uploadService';
import type {AvatarImage} from '../services/uploadService';
import {profileService} from '../services/profileService';
import {authService} from '../services/authService';
import {clinicalError} from '../utils/clinicalExamUtils';
import {cropGeometry,exportAvatar} from '../utils/avatarCrop';
import type {CropPosition} from '../utils/avatarCrop';
export function useAvatarManager(currentUrl:string|null|undefined,onSaved:(url:string|null)=>void){
  const [images,setImages]=useState<AvatarImage[]>([]);const [loading,setLoading]=useState(true);const [busy,setBusy]=useState(false);
  const [error,setError]=useState('');const [source,setSource]=useState<{url:string;width:number;height:number}|null>(null);
  const [zoom,setZoom]=useState(1);const [position,setPosition]=useState<CropPosition>({x:0,y:0});
  const fileRef=useRef<HTMLInputElement>(null);const objectUrl=useRef('');const locked=useRef(false);const cachedUpload=useRef<{key:string;url:string}|null>(null);
  const active=useRef(true);const drag=useRef<{id:number;x:number;y:number;position:CropPosition}|null>(null);
  useEffect(()=>{
    active.current=true;const controller=new AbortController();
    uploadService.getAvatars(controller.signal).then(items=>{if(!controller.signal.aborted)setImages(items);}).catch(error=>{if(!controller.signal.aborted)setError(clinicalError(error));}).finally(()=>{if(!controller.signal.aborted)setLoading(false);});
    return()=>{active.current=false;controller.abort();if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);};
  },[]);
  const run=async(action:()=>Promise<void>)=>{
    if(locked.current)return;locked.current=true;setBusy(true);setError('');
    try{await action();}catch(error){if(active.current)setError(clinicalError(error));}finally{locked.current=false;if(active.current)setBusy(false);}
  };
  const persist=async(url:string|null)=>{const profile=await profileService.saveAvatar(url);authService.updateCurrentUser(profile);onSaved(profile.AnhDaiDien);};
  const selectAvatar=(image:AvatarImage)=>run(()=>persist(image.url));
  const removeAvatar=()=>run(async()=>{
    if(!currentUrl||!window.confirm('Xóa ảnh đại diện và file ảnh trên Cloudinary?'))return;
    await persist(null);setImages(items=>items.filter(item=>item.url!==currentUrl));
  });
  const deleteImage=(image:AvatarImage)=>run(async()=>{
    if(!window.confirm('Xóa vĩnh viễn ảnh này khỏi thư viện?'))return;
    if(image.url===currentUrl)await persist(null);else {
      await uploadService.deleteImage({publicId:image.publicId});
      const profile=await profileService.get();authService.updateCurrentUser(profile);onSaved(profile.AnhDaiDien);
    }
    setImages(items=>items.filter(item=>item.publicId!==image.publicId));
  });
  const chooseFile=async(file?:File)=>{
    if(!file||locked.current)return;
    if(!['image/jpeg','image/png','image/webp','image/gif'].includes(file.type)||file.size>5*1024*1024){setError('Chọn ảnh JPEG, PNG, WebP hoặc GIF không quá 5MB.');return;}
    const url=URL.createObjectURL(file);if(objectUrl.current)URL.revokeObjectURL(objectUrl.current);objectUrl.current=url;
    try{const image=new Image();image.src=url;await image.decode();if(!active.current||objectUrl.current!==url)return;
      if(!image.naturalWidth||!image.naturalHeight)throw new Error();
      setSource({url,width:image.naturalWidth,height:image.naturalHeight});setZoom(1);setPosition({x:0,y:0});setError('');cachedUpload.current=null;
    }catch{if(active.current&&objectUrl.current===url)setError('Không thể đọc ảnh. Vui lòng chọn ảnh khác.');}
  };
  const geometry=source?cropGeometry(source.width,source.height,zoom,position):null;
  const changeZoom=(value:number)=>{
    if(!source||busy)return;const next=Math.max(1,Math.min(3,value));const crop=cropGeometry(source.width,source.height,next,position);setZoom(next);setPosition({x:crop.x,y:crop.y});
  };
  const pointerDown=(event:PointerEvent<HTMLDivElement>)=>{if(busy||!geometry)return;event.currentTarget.setPointerCapture(event.pointerId);drag.current={id:event.pointerId,x:event.clientX,y:event.clientY,position:{x:geometry.x,y:geometry.y}};};
  const pointerMove=(event:PointerEvent<HTMLDivElement>)=>{
    const origin=drag.current;if(!source||!origin||origin.id!==event.pointerId||busy)return;
    const crop=cropGeometry(source.width,source.height,zoom,{x:origin.position.x+event.clientX-origin.x,y:origin.position.y+event.clientY-origin.y});setPosition({x:crop.x,y:crop.y});
  };
  const pointerUp=()=>{drag.current=null;};
  const keyDown=(event:KeyboardEvent<HTMLDivElement>)=>{
    if(!source||busy||!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))return;event.preventDefault();
    const crop=cropGeometry(source.width,source.height,zoom,{x:position.x+(event.key==='ArrowLeft'?-10:event.key==='ArrowRight'?10:0),y:position.y+(event.key==='ArrowUp'?-10:event.key==='ArrowDown'?10:0)});setPosition({x:crop.x,y:crop.y});
  };
  const cancelCrop=()=>{setSource(null);cachedUpload.current=null;if(objectUrl.current){URL.revokeObjectURL(objectUrl.current);objectUrl.current='';}};
  const saveCrop=()=>run(async()=>{
    if(!source)return;
    const key=JSON.stringify([source.url,zoom,position]);
    if(cachedUpload.current?.key!==key){
      const file=await exportAvatar(source.url,source.width,source.height,zoom,position);
      cachedUpload.current={key,url:await uploadService.uploadAvatar(file)};
    }
    await persist(cachedUpload.current!.url);cancelCrop();setImages(await uploadService.getAvatars());
  });
  return {images,loading,busy,error,source,zoom,geometry,fileRef,chooseFile,selectAvatar,removeAvatar,deleteImage,changeZoom,pointerDown,pointerMove,pointerUp,keyDown,cancelCrop,saveCrop};
}
