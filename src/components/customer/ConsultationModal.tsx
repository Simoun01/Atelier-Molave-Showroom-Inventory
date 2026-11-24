import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { BUDGET_OPTIONS, t } from '../../i18n/translations';
import { Product } from '../../types/showroom';

interface ConsultationModalProps {
  initialType?: 'Homeowner' | 'Developer';
  referencedProduct?: Product | null;
  onClose: () => void;
}

export const ConsultationModal: React.FC<ConsultationModalProps> = ({
  initialType = 'Homeowner',
  referencedProduct = null,
  onClose,
}) => {
  const { lang, createConsultationLead } = useShowroom();
  const [type, setType] = useState<'Homeowner' | 'Developer'>(initialType);
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [projectLocation, setProjectLocation] = useState('');
  const [numberOfUnits, setNumberOfUnits] = useState(initialType === 'Developer' ? 12 : 1);
  const [budgetRange, setBudgetRange] = useState(
    initialType === 'Developer' ? '₱2,000,000 – ₱5,000,000' : '₱150,000 – ₱500,000'
  );
  const [targetDate, setTargetDate] = useState('2026-12-15');
  const [notes, setNotes] = useState(
    referencedProduct
      ? lang === 'zh'
        ? `意向单品：${referencedProduct.nameZh} (${referencedProduct.sku}) 空间配置咨询。`
        : `Interested in ${referencedProduct.nameEn} (${referencedProduct.sku}) for space planning.`
      : ''
  );
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectLocation.trim()) return;
    createConsultationLead({
      type,
      name: name.trim(),
      company: company.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      projectLocation: projectLocation.trim(),
      numberOfUnits,
      budgetRange,
      targetDate,
      notes: notes.trim(),
      productId: referencedProduct?.id,
    });
    setSubmitted(true);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#241913]/65 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E3DACD] bg-white flex items-center justify-between">
          <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
            {t(lang, 'consultationTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#63554A] hover:text-[#241913]"
            aria-label={t(lang, 'close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {submitted ? (
          <div className="p-8 space-y-5 text-center">
            <CheckCircle2 className="w-10 h-10 text-[#1F6E43] mx-auto" />
            <h3 className="font-serif-display text-2xl font-semibold text-[#241913]">
              {t(lang, 'requestSubmitted')}
            </h3>
            <p className="text-sm text-[#63554A] max-w-md mx-auto">
              {t(lang, 'consultationSubmittedDesc')}
            </p>
            <button
              onClick={onClose}
              className="px-6 py-2.5 bg-[#3D281D] text-[#FAF8F5] text-sm font-medium"
            >
              {t(lang, 'done')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1.5">
                {t(lang, 'consultationType')}
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setType('Homeowner');
                    setNumberOfUnits(1);
                    setBudgetRange('₱150,000 – ₱500,000');
                  }}
                  className={`px-3 py-2.5 text-xs font-medium border text-left transition-colors ${
                    type === 'Homeowner'
                      ? 'bg-[#3D281D] text-[#FAF8F5] border-[#3D281D]'
                      : 'bg-white text-[#63554A] border-[#E3DACD] hover:border-[#8A6240]'
                  }`}
                >
                  {t(lang, 'homeownerConsult')}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setType('Developer');
                    setNumberOfUnits(12);
                    setBudgetRange('₱2,000,000 – ₱5,000,000');
                  }}
                  className={`px-3 py-2.5 text-xs font-medium border text-left transition-colors ${
                    type === 'Developer'
                      ? 'bg-[#3D281D] text-[#FAF8F5] border-[#3D281D]'
                      : 'bg-white text-[#63554A] border-[#E3DACD] hover:border-[#8A6240]'
                  }`}
                >
                  {t(lang, 'developerStaging')}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'customerName')} *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder={t(lang, 'placeholderName')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'companyOptional')}
                </label>
                <input
                  type="text"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                  placeholder={type === 'Developer' ? t(lang, 'placeholderCompany') : t(lang, 'optional')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'email')}
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={t(lang, 'placeholderEmail')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'phone')} *
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder={t(lang, 'placeholderPhone')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'projectLocation')} *
                </label>
                <input
                  type="text"
                  required
                  value={projectLocation}
                  onChange={(e) => setProjectLocation(e.target.value)}
                  placeholder={t(lang, 'placeholderLocation')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'numberOfUnits')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={numberOfUnits}
                  onChange={(e) => setNumberOfUnits(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm font-mono-tabular"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'budgetRange')}
                </label>
                <select
                  value={budgetRange}
                  onChange={(e) => setBudgetRange(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                >
                  {BUDGET_OPTIONS.map((b) => (
                    <option key={b.value} value={b.value}>
                      {lang === 'zh' ? b.zh : b.en}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'targetDate')}
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'notes')}
              </label>
              <textarea
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={t(lang, 'placeholderConsultNotes')}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#E3DACD] text-sm text-[#63554A]"
              >
                {t(lang, 'cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#3D281D] hover:bg-[#2A1B13] text-[#FAF8F5] text-sm font-medium"
              >
                {t(lang, 'submitRequest')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
