import { useState, useEffect } from 'react';
import {clinicService} from '../services/clinicService';
import type {ServiceItem,EventItem} from '../services/clinicService';

export function useClinic() {
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

        const [serviceRes, eventRes] = await Promise.all([
          clinicService.getServices(),
          clinicService.getEvents()
        ]);

        if (isMounted) {
          setServices(serviceRes.data || []);
          setEvents(eventRes.data || []);
        }
      } catch (err: unknown) {
        if (isMounted) {
          console.error('Lỗi khi lấy dữ liệu phòng khám:', err);
          setError('Không thể kết nối đến cơ sở dữ liệu!');
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

  return { services, events, loading, error };
}
