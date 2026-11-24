import {isAxiosError} from 'axios';
export const getApiErrorMessage=(error:unknown,fallback:string)=>isAxiosError<{error?:string}>(error)?error.response?.data?.error||fallback:fallback;
