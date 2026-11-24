import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { getClinicalQueue } from '../services/examinationService';
import type { ClinicalQueueItem } from '../services/examinationService';
import { authService } from '../services/authService';
import { clinicalError, getVietnamToday, normalizeClinicalSearch } from '../utils/clinicalExamUtils';

export function useClinicalQueue(doctorView = false) {
  const user = authService.getCurrentUser();
  const isDoctor = doctorView && user?.VaiTro === 'Bác sĩ';
  const [queue, setQueue] = useState<ClinicalQueueItem[]>([]);
  const [date, setDate] = useState(getVietnamToday);
  const [all, setAll] = useState(false);
  const [onlyMine, setOnlyMine] = useState(isDoctor);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [loadingQueue, setLoadingQueue] = useState(false);
  const [queueError, setQueueError] = useState('');
  const requestId = useRef(0);
  const refreshQueue = useCallback(async () => {
    const request = ++requestId.current;
    setLoadingQueue(true);
    setQueueError('');
    try {
      const rows = await getClinicalQueue(all ? { all: true } : { date });
      if (request === requestId.current) setQueue(rows);
    } catch (error) {
      if (request === requestId.current) { setQueueError(clinicalError(error)); setQueue([]); }
    } finally {
      if (request === requestId.current) setLoadingQueue(false);
    }
  }, [date, all]);
  const invalidate=useCallback(()=>{requestId.current++;},[]);
  useEffect(() => { let active=true;queueMicrotask(()=>{if(active)void refreshQueue();});return()=>{active=false;invalidate();}; }, [refreshQueue,invalidate]);
  const filteredQueue = useMemo(() => {
    const keyword = normalizeClinicalSearch(search);
    return queue.filter(item => (!onlyMine || !isDoctor || item.LaCaCuaToi)
      && (!keyword || normalizeClinicalSearch(`${item.TenBenhNhan || ''} ${item.IdHoSoBenhNhan}`).includes(keyword))
      && (statusFilter === 'all'
        || (statusFilter === 'waiting' && !item.DaDoSinhHieu && item.TrangThaiLich !== 'Hoàn thành')
        || (statusFilter === 'inProgress' && (item.TrangThaiLich === 'Đang khám'
          || (item.DaDoSinhHieu && item.TrangThaiLich !== 'Hoàn thành')))
        || (statusFilter === 'completed' && item.TrangThaiLich === 'Hoàn thành')));
  }, [queue, onlyMine, isDoctor, search, statusFilter]);
  return { queue, filteredQueue, date, setDate, all, setAll, isDoctor, onlyMine, setOnlyMine,
    statusFilter, setStatusFilter, search, setSearch, loadingQueue, queueError, refreshQueue };
}
