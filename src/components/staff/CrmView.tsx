import React, { useMemo, useState } from 'react';
import { Plus, X, Phone, Mail, MapPin, Calendar, CheckSquare, Square, Search } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  CLIENT_TYPE_LABELS,
  PROPOSAL_STATUS_LABELS,
  RESERVATION_STATUS_LABELS,
  STAGE_LABELS,
  formatDate,
  formatPHP,
  t,
} from '../../i18n/translations';
import { Client, CRMStage } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

const STAGES: CRMStage[] = [
  'Inquiry',
  'Consultation',
  'Proposal Sent',
  'Negotiation',
  'Won',
  'Lost',
];

export const CrmView: React.FC = () => {
  const {
    lang,
    activeStaff,
    clients,
    proposals,
    reservations,
    sales,
    products,
    updateClientStage,
    addClientNote,
    addClientReminder,
    toggleReminderDone,
    createClient,
  } = useShowroom();

  const [typeFilter, setTypeFilter] = useState<'All' | 'Retail' | 'Developer'>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [noteInput, setNoteInput] = useState('');
  const [remTitle, setRemTitle] = useState('');
  const [remDate, setRemDate] = useState('2026-11-28');
  const [newClientModal, setNewClientModal] = useState(false);

  // New Client State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<'Retail' | 'Developer'>('Retail');
  const [newCompany, setNewCompany] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newEstValue, setNewEstValue] = useState(180000);

  const filteredClients = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return clients.filter((c) => {
      if (typeFilter !== 'All' && c.type !== typeFilter) return false;
      if (!q) return true;
      return (
        c.nameEn.toLowerCase().includes(q) ||
        c.nameZh.toLowerCase().includes(q) ||
        c.pinyin.toLowerCase().includes(q) ||
        (c.company && c.company.toLowerCase().includes(q)) ||
        (c.companyZh && c.companyZh.toLowerCase().includes(q)) ||
        c.location.toLowerCase().includes(q) ||
        c.locationZh.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q)
      );
    });
  }, [clients, typeFilter, searchQuery]);

  const selectedClient: Client | null = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  );

  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) return;
    const created = createClient({
      name: newName.trim(),
      type: newType,
      company: newType === 'Developer' ? newCompany.trim() : undefined,
      email: newEmail.trim(),
      phone: newPhone.trim(),
      location: newLocation.trim() || (lang === 'zh' ? '大马尼拉' : 'Metro Manila'),
      estimatedValue: newEstValue,
      assignedStaff: activeStaff.nameEn,
      assignedStaffZh: activeStaff.nameZh,
    });
    setNewClientModal(false);
    setNewName('');
    setNewCompany('');
    setNewEmail('');
    setNewPhone('');
    setNewLocation('');
    setSelectedClientId(created.id);
  };

  return (
    <div className="space-y-5">
      {/* Top Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 border border-[#E3DACD] bg-white p-1">
            {(['All', 'Retail', 'Developer'] as const).map((typeOpt) => (
              <button
                key={typeOpt}
                onClick={() => setTypeFilter(typeOpt)}
                className={`px-3.5 py-1.5 text-xs font-medium transition-colors ${
                  typeFilter === typeOpt
                    ? 'bg-[#3D281D] text-white'
                    : 'text-[#63554A] hover:text-[#241913]'
                }`}
              >
                {typeOpt === 'All'
                  ? `${t(lang, 'allClients')} (${clients.length})`
                  : CLIENT_TYPE_LABELS[typeOpt][lang]}
              </button>
            ))}
          </div>

          <div className="relative min-w-[260px]">
            <Search className="w-3.5 h-3.5 text-[#8C7D70] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t(lang, 'searchCrmPlaceholder')}
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-[#E3DACD] text-xs focus:outline-none focus:border-[#3D281D]"
            />
          </div>
        </div>

        <button
          onClick={() => setNewClientModal(true)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D281D] hover:bg-[#2A1B13] text-white text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t(lang, 'newClient')}</span>
        </button>
      </div>

      {/* 6-Column Kanban Pipeline */}
      <div className="overflow-x-auto pb-4">
        <div className="grid grid-cols-6 gap-4 min-w-[1180px]">
          {STAGES.map((stage) => {
            const laneClients = filteredClients.filter((c) => c.stage === stage);
            const laneValue = laneClients.reduce((sum, c) => sum + c.estimatedValue, 0);

            return (
              <div
                key={stage}
                className="bg-[#F2ECE3]/65 border border-[#E3DACD] flex flex-col min-h-[520px]"
              >
                <div className="p-3 bg-white border-b border-[#E3DACD] space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-[#241913]">
                      {STAGE_LABELS[stage][lang]}
                    </span>
                    <span className="font-mono-tabular text-xs text-[#8C7D70]">
                      {laneClients.length}
                    </span>
                  </div>
                  <div className="font-mono-tabular text-[11px] text-[#63554A]">
                    {formatPHP(laneValue)}
                  </div>
                </div>

                <div className="p-2.5 space-y-2.5 flex-1">
                  {laneClients.map((client) => (
                    <div
                      key={client.id}
                      onClick={() => setSelectedClientId(client.id)}
                      className="cursor-pointer bg-white border border-[#E3DACD] hover:border-[#3D281D] p-3 space-y-2 transition-colors"
                    >
                      <div className="flex items-center justify-between gap-2 text-[11px] text-[#8C7D70]">
                        <span className="font-medium text-[#8A6240]">
                          {CLIENT_TYPE_LABELS[client.type][lang]}
                        </span>
                        {client.unitInterestCount && client.unitInterestCount > 1 && (
                          <span className="font-mono-tabular">
                            {client.unitInterestCount} {t(lang, 'unitsUnitLabel')}
                          </span>
                        )}
                      </div>

                      <BilingualName
                        nameEn={client.nameEn}
                        nameZh={client.nameZh}
                        primaryClassName="font-medium text-sm text-[#241913] leading-snug"
                      />

                      {client.company && (
                        <div className="truncate">
                          <BilingualName
                            nameEn={client.company}
                            nameZh={client.companyZh || client.company}
                            inline
                            primaryClassName="text-xs text-[#63554A]"
                            secondaryClassName="text-[10px]"
                          />
                        </div>
                      )}

                      <div className="font-mono-tabular text-xs font-semibold text-[#3D281D] pt-1">
                        {formatPHP(client.estimatedValue)}
                      </div>

                      <div
                        className="pt-2 border-t border-[#F2ECE3]"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <select
                          value={client.stage}
                          onChange={(e) =>
                            updateClientStage(client.id, e.target.value as CRMStage)
                          }
                          aria-label={STAGE_LABELS[client.stage][lang]}
                          className="w-full px-2 py-1 text-[11px] bg-[#FAF8F5] border border-[#E3DACD] text-[#63554A]"
                        >
                          {STAGES.map((st) => (
                            <option key={st} value={st}>
                              {STAGE_LABELS[st][lang]}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Client Detail Slide-Over */}
      {selectedClient && (
        <div className="fixed inset-0 z-50 bg-[#241913]/55 flex justify-end">
          <div className="bg-[#FAF8F5] border-l border-[#E3DACD] w-full max-w-lg h-full overflow-y-auto shadow-2xl flex flex-col">
            <div className="px-6 py-4 bg-white border-b border-[#E3DACD] flex items-center justify-between sticky top-0 z-10">
              <div>
                <div className="text-xs text-[#8A6240] font-medium">
                  {CLIENT_TYPE_LABELS[selectedClient.type][lang]} ·{' '}
                  {STAGE_LABELS[selectedClient.stage][lang]}
                </div>
                <BilingualName
                  nameEn={selectedClient.nameEn}
                  nameZh={selectedClient.nameZh}
                  primaryClassName="font-serif-display text-2xl font-semibold text-[#241913]"
                />
              </div>
              <button
                onClick={() => setSelectedClientId(null)}
                className="p-1.5 text-[#63554A] hover:text-[#241913]"
                aria-label={t(lang, 'close')}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6 flex-1">
              {/* Contact & Value */}
              <div className="bg-white border border-[#E3DACD] p-4 space-y-2.5 text-xs">
                {selectedClient.company && (
                  <BilingualName
                    nameEn={selectedClient.company}
                    nameZh={selectedClient.companyZh || selectedClient.company}
                    primaryClassName="font-semibold text-sm text-[#241913]"
                  />
                )}
                <div className="flex items-center gap-2 text-[#63554A]">
                  <Phone className="w-3.5 h-3.5 text-[#8A6240]" />
                  <span className="font-mono-tabular">{selectedClient.phone || t(lang, 'notProvided')}</span>
                </div>
                <div className="flex items-center gap-2 text-[#63554A]">
                  <Mail className="w-3.5 h-3.5 text-[#8A6240]" />
                  <span>{selectedClient.email || t(lang, 'notProvided')}</span>
                </div>
                <div className="flex items-center gap-2 text-[#63554A]">
                  <MapPin className="w-3.5 h-3.5 text-[#8A6240]" />
                  <span>{lang === 'zh' ? selectedClient.locationZh : selectedClient.location}</span>
                </div>
                <div className="pt-2 border-t border-[#F2ECE3] flex items-center justify-between">
                  <span className="text-[#8C7D70]">{t(lang, 'estValueStage')}</span>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tabular font-semibold text-[#3D281D]">
                      {formatPHP(selectedClient.estimatedValue)}
                    </span>
                    <select
                      value={selectedClient.stage}
                      onChange={(e) =>
                        updateClientStage(selectedClient.id, e.target.value as CRMStage)
                      }
                      className="px-2 py-1 border border-[#E3DACD] bg-[#FAF8F5]"
                    >
                      {STAGES.map((st) => (
                        <option key={st} value={st}>
                          {STAGE_LABELS[st][lang]}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Linked Proposals */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#63554A] uppercase tracking-wider">
                  {t(lang, 'linkedProposals')}
                </h4>
                {proposals.filter((p) => p.clientId === selectedClient.id).length === 0 ? (
                  <p className="text-xs text-[#8C7D70]">{t(lang, 'noLinkedProposals')}</p>
                ) : (
                  <div className="space-y-2">
                    {proposals
                      .filter((p) => p.clientId === selectedClient.id)
                      .map((prop) => (
                        <div
                          key={prop.id}
                          className="bg-white border border-[#E3DACD] p-3 flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-mono-tabular text-[#8A6240]">{prop.code}</div>
                            <div className="font-medium text-[#241913]">
                              {lang === 'zh' ? prop.titleZh || prop.title : prop.title}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-mono-tabular font-semibold">
                              {formatPHP(prop.totalAmount)}
                            </div>
                            <div className="text-[#63554A]">
                              {PROPOSAL_STATUS_LABELS[prop.status][lang]}
                            </div>
                          </div>
                        </div>
                      ))}
                  </div>
                )}
              </div>

              {/* Linked Purchases & Reservations */}
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-[#63554A] uppercase tracking-wider">
                  {t(lang, 'reservationsAndPurchases')}
                </h4>
                {(() => {
                  const clientRes = reservations.filter(
                    (r) =>
                      r.clientId === selectedClient.id ||
                      r.customerNameEn.toLowerCase() === selectedClient.nameEn.toLowerCase()
                  );
                  const clientSales = sales.filter(
                    (s) =>
                      s.clientId === selectedClient.id ||
                      s.customerNameEn.toLowerCase() === selectedClient.nameEn.toLowerCase()
                  );
                  if (clientRes.length === 0 && clientSales.length === 0) {
                    return (
                      <p className="text-xs text-[#8C7D70]">{t(lang, 'noPurchasesRecorded')}</p>
                    );
                  }
                  return (
                    <div className="space-y-2">
                      {clientRes.map((r) => {
                        const prod = products.find((p) => p.id === r.productId);
                        return (
                          <div
                            key={r.id}
                            className="bg-white border border-[#E3DACD] p-3 flex justify-between text-xs"
                          >
                            <div>
                              <span className="font-mono-tabular text-[#8A6240]">{r.code}</span>
                              <div className="font-medium">
                                {r.quantity}× {lang === 'zh' ? prod?.nameZh : prod?.nameEn}
                              </div>
                            </div>
                            <div className="text-right font-mono-tabular">
                              <div>{formatPHP(r.totalAmount)}</div>
                              <div className="text-[#63554A]">
                                {RESERVATION_STATUS_LABELS[r.status][lang]}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                      {clientSales.map((s) => (
                        <div
                          key={s.id}
                          className="bg-white border border-[#E3DACD] p-3 flex justify-between text-xs"
                        >
                          <div>
                            <span className="font-mono-tabular text-[#1F6E43]">{s.receiptNo}</span>
                            <div className="font-medium">
                              {s.items
                                .map(
                                  (i) =>
                                    `${i.quantity}× ${
                                      lang === 'zh' ? i.productNameZh : i.productNameEn
                                    }`
                                )
                                .join('、')}
                            </div>
                          </div>
                          <div className="text-right font-mono-tabular font-semibold">
                            {formatPHP(s.total)}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* Follow-up Reminders */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-[#63554A] uppercase tracking-wider">
                  {t(lang, 'followUpReminders')}
                </h4>
                <div className="space-y-1.5">
                  {selectedClient.reminders.map((rem) => (
                    <button
                      key={rem.id}
                      onClick={() => toggleReminderDone(selectedClient.id, rem.id)}
                      className="w-full bg-white border border-[#E3DACD] px-3 py-2 flex items-center justify-between text-xs text-left gap-3"
                    >
                      <span className="flex items-center gap-2">
                        {rem.done ? (
                          <CheckSquare className="w-4 h-4 text-[#1F6E43] shrink-0" />
                        ) : (
                          <Square className="w-4 h-4 text-[#8C7D70] shrink-0" />
                        )}
                        <span className={rem.done ? 'line-through text-[#8C7D70]' : 'text-[#241913]'}>
                          {lang === 'zh' ? rem.titleZh || rem.title : rem.title}
                        </span>
                      </span>
                      <span className="font-mono-tabular text-[#8C7D70] flex items-center gap-1 shrink-0">
                        <Calendar className="w-3 h-3" />
                        {formatDate(rem.dueDate, lang)}
                      </span>
                    </button>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={remTitle}
                    onChange={(e) => setRemTitle(e.target.value)}
                    placeholder={t(lang, 'addFollowUpPlaceholder')}
                    className="flex-1 px-3 py-1.5 bg-white border border-[#E3DACD] text-xs"
                  />
                  <input
                    type="date"
                    value={remDate}
                    onChange={(e) => setRemDate(e.target.value)}
                    className="px-2 py-1.5 bg-white border border-[#E3DACD] text-xs"
                  />
                  <button
                    onClick={() => {
                      addClientReminder(selectedClient.id, remTitle, remDate);
                      setRemTitle('');
                    }}
                    className="px-3 py-1.5 bg-[#3D281D] text-white text-xs font-medium"
                  >
                    {t(lang, 'add')}
                  </button>
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2.5">
                <h4 className="text-xs font-semibold text-[#63554A] uppercase tracking-wider">
                  {t(lang, 'consultationNotes')}
                </h4>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={noteInput}
                    onChange={(e) => setNoteInput(e.target.value)}
                    placeholder={t(lang, 'logNotePlaceholder')}
                    className="flex-1 px-3 py-1.5 bg-white border border-[#E3DACD] text-xs"
                  />
                  <button
                    onClick={() => {
                      addClientNote(selectedClient.id, noteInput);
                      setNoteInput('');
                    }}
                    className="px-3 py-1.5 bg-[#3D281D] text-white text-xs font-medium"
                  >
                    {t(lang, 'save')}
                  </button>
                </div>
                <div className="space-y-2">
                  {selectedClient.notes.map((n) => (
                    <div key={n.id} className="bg-white border border-[#E3DACD] p-3 text-xs space-y-1">
                      <div className="flex justify-between items-center text-[11px] text-[#8C7D70]">
                        <BilingualName
                          nameEn={n.author}
                          nameZh={n.authorZh || n.author}
                          inline
                          primaryClassName="text-[#63554A] font-medium"
                          secondaryClassName="text-[10px]"
                        />
                        <span className="font-mono-tabular">{formatDate(n.date, lang)}</span>
                      </div>
                      <p className="text-[#241913] leading-relaxed">
                        {lang === 'zh' ? n.textZh || n.text : n.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Client Modal */}
      {newClientModal && (
        <div className="fixed inset-0 z-50 bg-[#241913]/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-md w-full shadow-2xl">
            <div className="px-5 py-4 bg-white border-b border-[#E3DACD] flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-semibold text-[#241913]">
                {t(lang, 'newClient')}
              </h3>
              <button onClick={() => setNewClientModal(false)} aria-label={t(lang, 'close')}>
                <X className="w-4 h-4 text-[#63554A]" />
              </button>
            </div>
            <form onSubmit={handleCreateClient} className="p-5 space-y-3.5 text-sm">
              <div className="grid grid-cols-2 border border-[#E3DACD] bg-white">
                {(['Retail', 'Developer'] as const).map((tOpt) => (
                  <button
                    type="button"
                    key={tOpt}
                    onClick={() => setNewType(tOpt)}
                    className={`py-2 text-xs font-medium ${
                      newType === tOpt ? 'bg-[#3D281D] text-white' : 'text-[#63554A]'
                    }`}
                  >
                    {CLIENT_TYPE_LABELS[tOpt][lang]}
                  </button>
                ))}
              </div>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder={t(lang, 'clientFullNameReq')}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
              />
              {newType === 'Developer' && (
                <input
                  type="text"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  placeholder={t(lang, 'companyDevPlaceholder')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              )}
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="tel"
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder={t(lang, 'phone')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
                <input
                  type="email"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  placeholder={t(lang, 'email')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={newLocation}
                  onChange={(e) => setNewLocation(e.target.value)}
                  placeholder={t(lang, 'projectCityPlaceholder')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
                <input
                  type="number"
                  min={0}
                  value={newEstValue}
                  onChange={(e) => setNewEstValue(Number(e.target.value))}
                  placeholder={t(lang, 'estValuePhpPlaceholder')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm font-mono-tabular"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setNewClientModal(false)}
                  className="px-4 py-2 border border-[#E3DACD] text-xs"
                >
                  {t(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3D281D] text-white text-xs font-medium"
                >
                  {t(lang, 'createLead')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
