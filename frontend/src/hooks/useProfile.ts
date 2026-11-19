import {useEffect,useState} from 'react';
import type {ChangeEvent,FormEvent} from 'react';
import {profileService} from '../services/profileService';
import type {UserProfile} from '../services/profileService';
import {authService} from '../services/authService';
import {clinicalError} from '../utils/clinicalExamUtils';
export function useProfile(){
  const [profile,setProfile]=useState<UserProfile|null>(null);const [loading,setLoading]=useState(true);const [saving,setSaving]=useState(false);
  const [avatarOpen,setAvatarOpen]=useState(false);
  const [status,setStatus]=useState<{type:'success'|'error'|'';msg:string}>({type:'',msg:''});
  useEffect(()=>{let active=true;profileService.get().then(data=>{if(active)setProfile(data);}).catch(()=>{if(active)setStatus({type:'error',msg:'Lỗi khi tải thông tin cá nhân.'});}).finally(()=>{if(active)setLoading(false);});return()=>{active=false;};},[]);
  const avatarSaved=(value:string|null)=>setProfile(previous=>previous?{...previous,AnhDaiDien:value}:null);
  const handleChange=(event:ChangeEvent<HTMLInputElement|HTMLSelectElement>)=>{const {name,value}=event.target;setProfile(previous=>previous?{...previous,[name]:value}:null);};
  const handleSubmit=async(event:FormEvent)=>{
    event.preventDefault();if(!profile||saving||avatarOpen)return;setSaving(true);setStatus({type:'',msg:''});
    try{const result=await profileService.save({...profile,NgaySinh:profile.NgaySinh||null});
      authService.updateCurrentUser(result.profile);setProfile(result.profile);setStatus({type:'success',msg:result.message});
    }catch(error){setStatus({type:'error',msg:clinicalError(error)});}finally{setSaving(false);}
  };
  return {profile,loading,saving,status,handleChange,handleSubmit,avatarOpen,setAvatarOpen,avatarSaved};
}
