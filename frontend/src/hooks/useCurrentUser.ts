import {useEffect,useState} from 'react';
import {authService} from '../services/authService';
export function useCurrentUser(){
  const [user,setUser]=useState(()=>authService.getCurrentUser());
  useEffect(()=>{
    const sync=()=>setUser(authService.getCurrentUser());
    window.addEventListener('auth-user-updated',sync);window.addEventListener('storage',sync);
    return()=>{window.removeEventListener('auth-user-updated',sync);window.removeEventListener('storage',sync);};
  },[]);
  return user;
}
