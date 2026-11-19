import API from './api';
export type MediaFolder='avatars'|'services'|'events';
export const uploadService={
  async upload(file:File,folder:MediaFolder,signal?:AbortSignal):Promise<string>{
    const data=new FormData();data.append('file',file);data.append('folder',folder);
    const response=await API.post<{url:string}>('/upload',data,{headers:{'Content-Type':undefined},signal});
    return response.data.url;
  },
};
