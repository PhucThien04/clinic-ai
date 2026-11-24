import { useState } from 'react';
import { clinicalError } from '../utils/clinicalExamUtils';

export function useManagementAction(){
  const [saving,setSaving]=useState(false);
  const [error,setError]=useState('');const [message,setMessage]=useState('');
  const runAction=async(action:()=>Promise<unknown>,success:string)=>{
    if(saving)return false;
    setSaving(true);setError('');setMessage('');
    try{await action();setMessage(success);return true;}catch(error){setError(clinicalError(error));return false;}
    finally{setSaving(false);}
  };
  return {saving,error,message,setError,setMessage,runAction};
}
