import React, { useMemo, useState } from 'react';
import { Truck, Users, Plus, X, Calendar as CalendarIcon } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  CREW_OPTIONS,
  DELIVERY_STATUS_LABELS,
  JOB_TYPE_LABELS,
  TRUCK_OPTIONS,
  WEEKDAY_LABELS,
  formatDate,
  t,
} from '../../i18n/translations';
import { DeliveryStatus } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

const STATUS_ORDER: DeliveryStatus[] = [
  'Scheduled',
  'Out for Delivery',
  'Delivered',
  'Assembled',
];

export const DeliveriesView: React.FC = () => {
  const {
    lang,
    deliveries,
    units,
    updateDeliveryStatus,
    assignDeliveryTruckCrew,
    createDelivery,
  } = useShowroom();

  const [selectedDate, setSelectedDate] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<DeliveryStatus | 'All'>('All');
  const [newJobOpen, setNewJobOpen] = useState(false);

  // New Job State
  const [jobType, setJobType] = useState<'Retail Delivery' | 'Developer Staging'>('Retail Delivery');
  const [customerOrProject, setCustomerOrProject] = useState('');
  const [address, setAddress] = useState('');
  const [date, setDate] = useState('2026-11-28');
  const [timeSlot, setTimeSlot] = useState('10:00 - 13:00');
  const [unitId, setUnitId] = useState(units[0].id);
  const [itemsSummary, setItemsSummary] = useState('');
  const [truck, setTruck] = useState(TRUCK_OPTIONS[0].en);
  const [crew, setCrew] = useState(CREW_OPTIONS[0].en);

  // November 2026 Calendar Grid (Nov 1 2026 is Sunday)
  const calendarDays = useMemo(() => {
    const days: Array<{ iso: string; day: number }> = [];
    for (let d = 1; d <= 30; d++) {
      days.push({
        iso: `2026-11-${String(d).padStart(2, '0')}`,
        day: d,
      });
    }
    return days;
  }, []);

  const filteredDeliveries = useMemo(() => {
    return deliveries.filter((d) => {
      if (selectedDate !== 'all' && d.date !== selectedDate) return false;
      if (statusFilter !== 'All' && d.status !== statusFilter) return false;
      return true;
    });
  }, [deliveries, selectedDate, statusFilter]);

  const handleCreateJob = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerOrProject.trim() || !address.trim()) return;
    createDelivery({
      date,
      timeSlot,
      jobType,
      customerOrProject: customerOrProject.trim(),
      address: address.trim(),
      unitId,
      itemsSummary:
        itemsSummary.trim() || (lang === 'zh' ? '展厅精选家具配送清单' : 'Showroom Furniture Package'),
      truck,
      crew,
      status: 'Scheduled',
    });
    setNewJobOpen(false);
    setCustomerOrProject('');
    setAddress('');
    setItemsSummary('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
            {t(lang, 'deliveriesCalendar')}
          </h2>
          <p className="text-xs text-[#63554A]">{t(lang, 'deliveriesSubtitle')}</p>
        </div>

        <button
          onClick={() => setNewJobOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D281D] hover:bg-[#2A1B13] text-white text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t(lang, 'scheduleJob')}</span>
        </button>
      </div>

      {/* Calendar + Agenda Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Monthly Calendar Grid */}
        <div className="lg:col-span-5 bg-white border border-[#E3DACD] p-5 space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-[#E3DACD]">
            <div className="flex items-center gap-2 text-sm font-semibold text-[#241913]">
              <CalendarIcon className="w-4 h-4 text-[#8A6240]" />
              <span>{t(lang, 'calendarMonthYear')}</span>
            </div>
            {selectedDate !== 'all' && (
              <button
                onClick={() => setSelectedDate('all')}
                className="text-xs text-[#3D281D] underline underline-offset-4"
              >
                {t(lang, 'showAllDates')}
              </button>
            )}
          </div>

          <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-medium text-[#8C7D70] py-1">
            {WEEKDAY_LABELS[lang].map((dow) => (
              <div key={dow}>{dow}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((cell) => {
              const jobsOnDay = deliveries.filter((d) => d.date === cell.iso);
              const isSelected = selectedDate === cell.iso;
              const isToday = cell.iso === '2026-11-24';

              return (
                <button
                  key={cell.iso}
                  onClick={() => setSelectedDate(isSelected ? 'all' : cell.iso)}
                  className={`h-14 p-1.5 border text-left flex flex-col justify-between transition-colors ${
                    isSelected
                      ? 'bg-[#3D281D] text-white border-[#3D281D]'
                      : isToday
                      ? 'bg-[#F2ECE3] border-[#8A6240] text-[#241913]'
                      : 'bg-[#FAF8F5]/50 border-[#E3DACD] hover:border-[#8A6240] text-[#241913]'
                  }`}
                >
                  <span className="font-mono-tabular text-[11px] font-medium">
                    {cell.day}
                  </span>
                  {jobsOnDay.length > 0 && (
                    <span
                      className={`text-[10px] font-mono-tabular px-1 truncate ${
                        isSelected
                          ? 'bg-white/20 text-white'
                          : 'bg-[#3D281D] text-white'
                      }`}
                    >
                      {jobsOnDay.length}{' '}
                      {jobsOnDay.length > 1 ? t(lang, 'jobPlural') : t(lang, 'jobSingle')}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Job Cards & Crew Dispatch */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex flex-wrap items-center gap-1 border border-[#E3DACD] bg-white p-1 w-fit">
            {(['All', ...STATUS_ORDER] as const).map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  statusFilter === st
                    ? 'bg-[#3D281D] text-white'
                    : 'text-[#63554A] hover:text-[#241913]'
                }`}
              >
                {st === 'All' ? t(lang, 'allStatuses') : DELIVERY_STATUS_LABELS[st][lang]}
              </button>
            ))}
          </div>

          {filteredDeliveries.length === 0 ? (
            <div className="bg-white border border-[#E3DACD] p-10 text-center text-sm text-[#8C7D70]">
              {t(lang, 'noDeliveriesMatch')}
            </div>
          ) : (
            <div className="space-y-3">
              {filteredDeliveries.map((job) => {
                const originUnit = units.find((u) => u.id === job.unitId);
                return (
                  <div
                    key={job.id}
                    className="bg-white border border-[#E3DACD] p-4 space-y-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <div className="flex flex-wrap items-center gap-2 text-xs text-[#8A6240]">
                          <span className="font-mono-tabular font-semibold">{job.code}</span>
                          <span>·</span>
                          <span>{JOB_TYPE_LABELS[job.jobType][lang]}</span>
                          <span>·</span>
                          <span className="font-mono-tabular text-[#63554A]">
                            {formatDate(job.date, lang)} ({job.timeSlot})
                          </span>
                        </div>
                        <BilingualName
                          nameEn={job.customerOrProject}
                          nameZh={job.customerOrProjectZh}
                          primaryClassName="font-serif-display text-xl font-semibold text-[#241913] mt-0.5"
                        />
                        <p className="text-xs text-[#63554A] mt-0.5">
                          {lang === 'zh' ? job.addressZh : job.address}
                        </p>
                      </div>

                      <select
                        value={job.status}
                        onChange={(e) =>
                          updateDeliveryStatus(job.id, e.target.value as DeliveryStatus)
                        }
                        className={`px-2.5 py-1.5 border text-xs font-medium ${
                          job.status === 'Assembled' || job.status === 'Delivered'
                            ? 'border-[#1F6E43] text-[#1F6E43] bg-emerald-50/40'
                            : job.status === 'Out for Delivery'
                            ? 'border-[#B45309] text-[#B45309] bg-amber-50/40'
                            : 'border-[#E3DACD] text-[#3D281D] bg-[#FAF8F5]'
                        }`}
                      >
                        {STATUS_ORDER.map((s) => (
                          <option key={s} value={s}>
                            {DELIVERY_STATUS_LABELS[s][lang]}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="text-xs bg-[#FAF8F5] border border-[#E3DACD] px-3 py-2 text-[#241913]">
                      <strong>{t(lang, 'itemsLabel')}:</strong>{' '}
                      {lang === 'zh' ? job.itemsSummaryZh : job.itemsSummary} ·{' '}
                      <span className="text-[#63554A]">
                        {t(lang, 'originLabel')}:{' '}
                        {lang === 'zh' ? originUnit?.shortNameZh : originUnit?.shortNameEn}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div className="flex items-center gap-2 text-xs">
                        <Truck className="w-3.5 h-3.5 text-[#8A6240] shrink-0" />
                        <select
                          value={job.truck}
                          onChange={(e) =>
                            assignDeliveryTruckCrew(job.id, e.target.value, job.crew)
                          }
                          className="w-full px-2 py-1.5 border border-[#E3DACD] bg-white text-xs"
                        >
                          {TRUCK_OPTIONS.map((tr) => (
                            <option key={tr.en} value={tr.en}>
                              {lang === 'zh' ? tr.zh : tr.en}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div className="flex items-center gap-2 text-xs">
                        <Users className="w-3.5 h-3.5 text-[#8A6240] shrink-0" />
                        <select
                          value={job.crew}
                          onChange={(e) =>
                            assignDeliveryTruckCrew(job.id, job.truck, e.target.value)
                          }
                          className="w-full px-2 py-1.5 border border-[#E3DACD] bg-white text-xs"
                        >
                          <option value="Unassigned Crew">{t(lang, 'unassignedCrew')}</option>
                          {CREW_OPTIONS.map((cr) => (
                            <option key={cr.en} value={cr.en}>
                              {lang === 'zh' ? cr.zh : cr.en}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Schedule Job Modal */}
      {newJobOpen && (
        <div className="fixed inset-0 z-50 bg-[#241913]/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-md w-full shadow-2xl">
            <div className="px-5 py-4 bg-white border-b border-[#E3DACD] flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-semibold text-[#241913]">
                {t(lang, 'scheduleJob')}
              </h3>
              <button onClick={() => setNewJobOpen(false)} aria-label={t(lang, 'close')}>
                <X className="w-4 h-4 text-[#63554A]" />
              </button>
            </div>
            <form onSubmit={handleCreateJob} className="p-5 space-y-3.5 text-sm">
              <div className="grid grid-cols-2 border border-[#E3DACD] bg-white">
                {(['Retail Delivery', 'Developer Staging'] as const).map((jt) => (
                  <button
                    type="button"
                    key={jt}
                    onClick={() => setJobType(jt)}
                    className={`py-2 text-xs font-medium ${
                      jobType === jt ? 'bg-[#3D281D] text-white' : 'text-[#63554A]'
                    }`}
                  >
                    {JOB_TYPE_LABELS[jt][lang]}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={customerOrProject}
                onChange={(e) => setCustomerOrProject(e.target.value)}
                placeholder={t(lang, 'clientOrProjectReq')}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
              />
              <input
                type="text"
                required
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder={t(lang, 'siteAddressReq')}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-xs"
                />
                <input
                  type="text"
                  value={timeSlot}
                  onChange={(e) => setTimeSlot(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-xs"
                />
              </div>
              <select
                value={unitId}
                onChange={(e) => setUnitId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-xs"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {t(lang, 'dispatchFrom')}: {lang === 'zh' ? u.shortNameZh : u.shortNameEn}
                  </option>
                ))}
              </select>
              <input
                type="text"
                value={itemsSummary}
                onChange={(e) => setItemsSummary(e.target.value)}
                placeholder={t(lang, 'itemsSummaryPlaceholder')}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
              />
              <div className="grid grid-cols-2 gap-3">
                <select
                  value={truck}
                  onChange={(e) => setTruck(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-[#E3DACD] text-xs"
                >
                  {TRUCK_OPTIONS.map((tr) => (
                    <option key={tr.en} value={tr.en}>
                      {lang === 'zh' ? tr.zh : tr.en}
                    </option>
                  ))}
                </select>
                <select
                  value={crew}
                  onChange={(e) => setCrew(e.target.value)}
                  className="w-full px-2 py-2 bg-white border border-[#E3DACD] text-xs"
                >
                  {CREW_OPTIONS.map((cr) => (
                    <option key={cr.en} value={cr.en}>
                      {lang === 'zh' ? cr.zh : cr.en}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewJobOpen(false)}
                  className="px-4 py-2 border border-[#E3DACD] text-xs"
                >
                  {t(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3D281D] text-white text-xs font-medium"
                >
                  {t(lang, 'scheduleSubmit')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
