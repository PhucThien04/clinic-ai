import API from './api';
export type MediaFolder='avatars'|'services'|'events';
export interface AvatarImage {publicId:string;url:string;createdAt?:string}
export const uploadService={
  async getAvatars(signal?:AbortSignal):Promise<AvatarImage[]>{return (await API.get<{images:AvatarImage[]}>('/upload/avatars',{signal})).data.images;},
  deleteImage:(data:{url?:string;publicId?:string})=>API.delete('/upload',{data}),
  async uploadAvatar(file:File):Promise<string>{
    const data=new FormData();data.append('file',file);
    return (await API.post<{url:string}>('/upload?type=avatar',data,{headers:{'Content-Type':undefined}})).data.url;
  },
  async upload(file:File,folder:MediaFolder,signal?:AbortSignal):Promise<string>{
    const data=new FormData();data.append('file',file);data.append('folder',folder);
    const response=await API.post<{url:string}>('/upload',data,{headers:{'Content-Type':undefined},signal});
    return response.data.url;
  },
};
