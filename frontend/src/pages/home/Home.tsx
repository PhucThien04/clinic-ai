import {Link} from 'react-router-dom';
import {ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, Heart, MapPin, PhoneCall, Stethoscope, Tag} from 'lucide-react';
import {PublicEventCard} from '../../components/management/PublicEventCard';
import {MediaImage} from '../../components/management/MediaImage';
import {useHome} from '../../hooks/useHome';
import {formatDateTime} from '../../utils/dateUtils';
import {formatServicePrice, getClinicDisplay} from '../../utils/clinicDisplay';

export default function Home() {
  const home = useHome();
  const clinic = getClinicDisplay(home.clinicInfo);
  return <div className="space-y-14 sm:space-y-16">
    <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-sky-600 to-teal-600 px-6 py-10 text-white shadow-xl shadow-sky-600/15 sm:p-10 lg:p-12">
      <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full border-40 border-white/5"/>
      <div className="relative grid items-center gap-10 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="min-w-0">
          <span className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 text-xs font-semibold"><Heart size={15}/>Chăm sóc nụ cười, đồng hành cùng bạn</span>
          <p className="mb-3 text-sm font-semibold tracking-wide text-sky-100">{clinic.name}</p>
          <h1 className="max-w-2xl text-3xl font-extrabold leading-tight sm:text-4xl lg:text-5xl">Nụ cười khỏe mạnh.<br/>An tâm mỗi lần thăm khám.</h1>
          <p className="mt-5 max-w-xl text-base leading-7 text-sky-50">{clinic.description}</p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            {home.canBook && <button type="button" onClick={() => home.handleBooking()} className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-6 py-3 font-bold text-sky-600 shadow-sm transition hover:-translate-y-0.5 hover:bg-sky-50"><CalendarDays size={19}/>Đặt lịch khám ngay</button>}
            <Link to="/dich-vu" className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 font-semibold text-white transition hover:bg-white/20">Khám phá dịch vụ<ArrowRight size={18}/></Link>
          </div>
        </div>
        <div className="min-w-0 rounded-2xl border border-white/20 bg-white/10 p-6 backdrop-blur-sm">
          <div className="mb-6 flex items-center gap-3"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white text-sky-600"><PhoneCall size={23}/></span><div className="min-w-0"><p className="text-sm text-sky-100">Liên hệ phòng khám</p><a href={`tel:${clinic.phone}`} className="break-words text-2xl font-bold text-white">{clinic.phone}</a></div></div>
          <div className="space-y-4 border-t border-white/20 pt-5 text-sm">
            <p className="flex items-start gap-3"><Clock size={18} className="shrink-0"/><span><span className="block text-sky-100">Giờ làm việc</span><strong className="mt-1 block text-base">{clinic.hours}</strong></span></p>
            <p className="flex items-start gap-3 leading-6"><MapPin size={18} className="mt-1 shrink-0"/>{clinic.address}</p>
            <p className="rounded-xl bg-white/10 p-3 leading-6 text-sky-50">Đặt lịch trước để phòng khám sắp xếp thời gian tiếp đón và tư vấn cho bạn.</p>
          </div>
        </div>
      </div>
    </section>

    {home.error && <p role="alert" className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">{home.error} Bạn vẫn có thể liên hệ phòng khám để được hỗ trợ.</p>}

    <section aria-labelledby="home-services-title">
      <div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div><p className="mb-2 text-xs font-bold uppercase tracking-widest text-teal-600">Chăm sóc phù hợp với bạn</p><h2 id="home-services-title" className="text-2xl font-bold text-slate-900 sm:text-3xl">Dịch vụ nha khoa</h2><p className="mt-2 text-sm leading-6 text-slate-500">Tìm hiểu dịch vụ và chi phí trước khi đặt lịch thăm khám.</p></div>
        <Link to="/dich-vu" className="inline-flex shrink-0 items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700">Xem tất cả dịch vụ<ArrowRight size={17}/></Link>
      </div>
      {home.loading ? <p role="status" className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Đang tải danh mục dịch vụ...</p> : !home.services.length ? <p className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-slate-500">Danh mục dịch vụ đang được cập nhật. Vui lòng liên hệ phòng khám để được tư vấn.</p> : <>
        <div className="grid auto-rows-fr gap-5 sm:grid-cols-2 xl:grid-cols-4" aria-live="polite">
          {home.visibleServices.map(service => <article key={service.IdDichVu} className="flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
            <MediaImage src={service.HinhAnh} alt={service.TenDichVu} className="aspect-video w-full" fallback={<Stethoscope size={36}/>}/>
            <div className="flex flex-1 flex-col p-5"><h3 className="min-h-14 text-lg font-bold leading-7 text-slate-900">{service.TenDichVu}</h3><p className="mt-2 line-clamp-3 text-sm leading-6 text-slate-500">{service.MoTa || 'Liên hệ phòng khám để được tư vấn chi tiết về dịch vụ.'}</p>
              <div className="mt-auto pt-5"><div className="mb-4 border-t border-slate-100 pt-4"><p className="text-xs text-slate-500">Chi phí tham khảo</p><p className="mt-1 break-words text-lg font-bold text-teal-600">{formatServicePrice(service.Gia)}</p></div>
                {home.canBook ? <button type="button" onClick={() => home.handleBooking(`Đăng ký dịch vụ: ${service.TenDichVu}`)} className="w-full rounded-xl bg-sky-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-sky-700">Đặt lịch dịch vụ</button> : <Link to="/dich-vu" className="block rounded-xl bg-sky-50 px-4 py-2.5 text-center text-sm font-semibold text-sky-600 hover:bg-sky-100">Xem dịch vụ</Link>}
              </div>
            </div>
          </article>)}
        </div>
        {home.totalSlides > 1 && <div className="mt-6 flex items-center justify-center gap-4"><button type="button" onClick={home.previousServices} aria-label="Dịch vụ trước" className="rounded-full border border-slate-200 bg-white p-2.5 text-sky-600 hover:bg-sky-50"><ChevronLeft size={20}/></button><span className="text-sm text-slate-500">{home.currentSlide + 1} / {home.totalSlides}</span><button type="button" onClick={home.nextServices} aria-label="Dịch vụ tiếp theo" className="rounded-full border border-slate-200 bg-white p-2.5 text-sky-600 hover:bg-sky-50"><ChevronRight size={20}/></button></div>}
      </>}
    </section>

    {!!home.events.length && <section aria-labelledby="home-events-title"><div className="mb-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="mb-2 flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-teal-600"><Tag size={15}/>Dành cho bạn</p><h2 id="home-events-title" className="text-2xl font-bold text-slate-900">Chương trình ưu đãi & Sự kiện</h2></div><Link to="/su-kien" className="inline-flex items-center gap-2 text-sm font-semibold text-sky-600 hover:text-sky-700">Xem tất cả sự kiện<ArrowRight size={17}/></Link></div>
      <div className="space-y-4">{home.events.slice(0, 3).map(event => {
        const start = formatDateTime(event.ThoiGianBatDau);
        const end = formatDateTime(event.ThoiGianKetThuc);
        return <PublicEventCard key={event.IdSuKien} event={event} timeLabel={start && end ? `Từ ${start} đến ${end}` : start ? `Từ ${start}` : end ? `Đến ${end}` : 'Liên hệ để biết thời gian áp dụng'} actionLabel={home.canBook ? 'Nhận ưu đãi ngay' : 'Xem sự kiện'} onAction={() => home.handleEvent(event.TieuDe)}/>;
      })}</div>
    </section>}
  </div>;
}
