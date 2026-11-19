import API from './api';
export interface Notification {
  id:string;title:string;message:string;type:'info'|'warning'|'success';category:string;link:string;timestamp:string|null;
}
export const notificationService={
  async getNotifications(signal?:AbortSignal):Promise<Notification[]>{
    const response=await API.get<{notifications:Notification[]}>('/notifications',{signal});
    return response.data.notifications;
  },
};
