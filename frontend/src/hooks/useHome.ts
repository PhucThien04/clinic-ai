import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {useClinic} from './useClinic';
import {useCurrentUser} from './useCurrentUser';
import {getActorWorkspace} from '../utils/managementConfig';

export function useHome() {
  const clinic = useClinic();
  const user = useCurrentUser();
  const navigate = useNavigate();
  const [serviceIndex, setServiceIndex] = useState(0);
  const totalSlides = Math.max(1, Math.ceil(clinic.services.length / 4));
  const currentSlide = Math.min(serviceIndex, totalSlides - 1);
  const handleBooking = (defaultReason = 'Đăng ký khám tổng quát') => {
    if (!user) navigate('/login');
    else if (user.VaiTro === 'Bệnh nhân') navigate('/patient-appointments', {state: {defaultReason}});
    else navigate(getActorWorkspace(user.VaiTro)?.path || '/profile');
  };
  return {...clinic, canBook: !user || user.VaiTro === 'Bệnh nhân', handleBooking, currentSlide, totalSlides,
    handleEvent: (title: string) => {
      if (user && user.VaiTro !== 'Bệnh nhân') navigate('/su-kien');
      else handleBooking(`Tham gia sự kiện: ${title}`);
    },
    visibleServices: clinic.services.slice(currentSlide * 4, (currentSlide + 1) * 4),
    nextServices: () => setServiceIndex((currentSlide + 1) % totalSlides),
    previousServices: () => setServiceIndex((currentSlide - 1 + totalSlides) % totalSlides)};
}
