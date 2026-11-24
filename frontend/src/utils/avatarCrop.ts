const cropSize=256;
export interface CropPosition {x:number;y:number}
export function cropGeometry(width:number,height:number,zoom:number,position:CropPosition){
  const scale=Math.max(cropSize/width,cropSize/height)*zoom;
  const limitX=Math.max(0,(width*scale-cropSize)/2),limitY=Math.max(0,(height*scale-cropSize)/2);
  return {scale,width:width*scale,height:height*scale,x:Math.max(-limitX,Math.min(limitX,position.x)),y:Math.max(-limitY,Math.min(limitY,position.y))};
}
export async function exportAvatar(url:string,width:number,height:number,zoom:number,position:CropPosition):Promise<File>{
  const image=new Image();image.src=url;await image.decode();
  const crop=cropGeometry(width,height,zoom,position);const canvas=document.createElement('canvas');canvas.width=512;canvas.height=512;
  const context=canvas.getContext('2d');if(!context)throw new Error('Trình duyệt không hỗ trợ cắt ảnh.');
  context.drawImage(image,(width-cropSize/crop.scale)/2-crop.x/crop.scale,(height-cropSize/crop.scale)/2-crop.y/crop.scale,cropSize/crop.scale,cropSize/crop.scale,0,0,512,512);
  const blob=await new Promise<Blob>((resolve,reject)=>canvas.toBlob(value=>value?resolve(value):reject(new Error('Không thể xuất ảnh.')),'image/png'));
  return new File([blob],'avatar.png',{type:'image/png'});
}
