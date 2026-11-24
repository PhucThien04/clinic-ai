import { useState, useEffect } from 'react';
import {clinicService} from '../services/clinicService';
import type {ClinicInfo,ServiceItem,EventItem} from '../services/clinicService';

export function useClinic() {
  const [clinicInfo, setClinicInfo] = useState<ClinicInfo|null>(null);
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const fetchClinicData = async () => {
      try {
        setLoading(true);
        setError(null);

        const [infoRes, serviceRes, eventRes] = await Promise.all([
          clinicService.getInfo(),
          clinicService.getServices(),
          clinicService.getEvents()
        ]);

        if (isMounted) {
          setClinicInfo(infoRes.data || null);
          setServices(serviceRes.data || []);
          setEvents(eventRes.data || []);
        }
      } catch {
        if (isMounted) {
          setError('Chưa thể tải thông tin phòng khám. Vui lòng thử lại sau.');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchClinicData();

    return () => {
      isMounted = false;
    };
  }, []);

  return { clinicInfo, services, events, loading, error };
}
