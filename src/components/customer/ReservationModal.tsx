import React, { useState } from 'react';
import { X, CheckCircle2 } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  PAYMENT_METHOD_LABELS,
  formatDate,
  formatPHP,
  t,
} from '../../i18n/translations';
import { PaymentMethod, Product, Reservation } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

interface ReservationModalProps {
  product: Product;
  initialColorNameEn: string;
  initialUnitId: string;
  onClose: () => void;
}

export const ReservationModal: React.FC<ReservationModalProps> = ({
  product,
  initialColorNameEn,
  initialUnitId,
  onClose,
}) => {
  const { lang, units, paymentMethods, createReservation } = useShowroom();
  const [unitId, setUnitId] = useState(initialUnitId || units[0].id);
  const [colorNameEn, setColorNameEn] = useState(initialColorNameEn || product.colors[0].nameEn);
  const [quantity, setQuantity] = useState(1);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [downpaymentPercent, setDownpaymentPercent] = useState(30);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Bank Transfer');
  const [fulfillment, setFulfillment] = useState<'Pickup' | 'Delivery'>('Delivery');
  const [preferredDate, setPreferredDate] = useState('2026-11-30');
  const [confirmed, setConfirmed] = useState<Reservation | null>(null);
  const [error, setError] = useState('');

  const totalAmount = product.price * quantity;
  const downpaymentAmount = Math.round((totalAmount * downpaymentPercent) / 100);
  const balanceDue = totalAmount - downpaymentAmount;

  const enabledPayments = paymentMethods.filter((pm) => pm.enabled);
  const matchedColor = product.colors.find((c) => c.nameEn === colorNameEn);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || !customerPhone.trim()) {
      setError(t(lang, 'reservationValidationError'));
      return;
    }
    setError('');
    const created = createReservation({
      productId: product.id,
      colorNameEn,
      unitId,
      quantity,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim(),
      customerPhone: customerPhone.trim(),
      customerAddress: customerAddress.trim(),
      downpaymentPercent,
      paymentMethod,
      fulfillment,
      preferredDate,
    });
    setConfirmed(created);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#241913]/65 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="px-6 py-4 border-b border-[#E3DACD] flex items-center justify-between bg-white">
          <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
            {confirmed ? t(lang, 'reservationConfirmed') : t(lang, 'reservationTitle')}
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 text-[#63554A] hover:text-[#241913]"
            aria-label={t(lang, 'close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmed ? (
          <div className="p-8 space-y-6">
            <div className="flex items-start gap-4 p-5 bg-[#F2ECE3] border border-[#E3DACD]">
              <CheckCircle2 className="w-6 h-6 text-[#1F6E43] shrink-0 mt-0.5" />
              <div className="space-y-1">
                <div className="text-xs font-mono-tabular text-[#63554A]">{confirmed.code}</div>
                <div className="font-serif-display text-2xl font-semibold text-[#241913]">
                  {lang === 'en' ? product.nameEn : product.nameZh}
                </div>
                <p className="text-sm text-[#63554A]">
                  {t(lang, 'reservationConfirmedDesc')}
                </p>
              </div>
            </div>

            <div className="border border-[#E3DACD] bg-white divide-y divide-[#F2ECE3] text-sm">
              <div className="px-4 py-3 flex justify-between items-center">
                <span className="text-[#63554A]">{t(lang, 'customerName')}</span>
                <BilingualName
                  nameEn={confirmed.customerNameEn}
                  nameZh={confirmed.customerNameZh}
                  inline
                  primaryClassName="font-medium"
                />
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-[#63554A]">{t(lang, 'preferredShowroom')}</span>
                <span>
                  {(() => {
                    const u = units.find((unit) => unit.id === confirmed.unitId);
                    return u ? (lang === 'zh' ? u.nameZh : u.nameEn) : '';
                  })()}
                </span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-[#63554A]">{t(lang, 'fulfillmentMethod')}</span>
                <span>
                  {confirmed.fulfillment === 'Delivery'
                    ? t(lang, 'scheduledDelivery')
                    : t(lang, 'pickupShowroom')}{' '}
                  · {formatDate(confirmed.preferredDate, lang)}
                </span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-[#63554A]">{t(lang, 'paymentMethod')}</span>
                <span>{PAYMENT_METHOD_LABELS[confirmed.paymentMethod][lang]}</span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-[#63554A]">{t(lang, 'downpaymentDue')}</span>
                <span className="font-mono-tabular font-semibold text-[#1F6E43]">
                  {formatPHP(confirmed.downpaymentAmount)} ({confirmed.downpaymentPercent}%)
                </span>
              </div>
              <div className="px-4 py-3 flex justify-between">
                <span className="text-[#63554A]">{t(lang, 'remainingBalance')}</span>
                <span className="font-mono-tabular font-medium">
                  {formatPHP(confirmed.balanceDue)}
                </span>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#3D281D] hover:bg-[#2A1B13] text-[#FAF8F5] text-sm font-medium"
            >
              {t(lang, 'returnToCatalog')}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div className="p-4 bg-[#F2ECE3] border border-[#E3DACD] flex flex-wrap items-center justify-between gap-4">
              <div>
                <div className="text-xs font-mono-tabular text-[#8C7D70]">{product.sku}</div>
                <div className="font-serif-display text-xl font-semibold text-[#241913]">
                  {lang === 'en' ? product.nameEn : product.nameZh}
                </div>
                <div className="text-xs text-[#63554A] mt-0.5">
                  {lang === 'zh' ? matchedColor?.nameZh ?? colorNameEn : colorNameEn}
                </div>
              </div>
              <div className="font-mono-tabular text-lg font-medium text-[#3D281D]">
                {formatPHP(product.price)}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'preferredShowroom')}
                </label>
                <select
                  value={unitId}
                  onChange={(e) => setUnitId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                >
                  {units.map((u) => (
                    <option key={u.id} value={u.id}>
                      {lang === 'en' ? u.shortNameEn : u.shortNameZh} ({product.unitStock[u.id] ?? 0})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'availableFinishes')}
                </label>
                <select
                  value={colorNameEn}
                  onChange={(e) => setColorNameEn(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                >
                  {product.colors.map((c) => (
                    <option key={c.nameEn} value={c.nameEn}>
                      {lang === 'en' ? c.nameEn : c.nameZh}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'quantity')}
                </label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm font-mono-tabular"
                />
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
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder={t(lang, 'placeholderName')}
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
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder={t(lang, 'placeholderPhone')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'email')}
                </label>
                <input
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder={t(lang, 'placeholderEmail')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'preferredDate')}
                </label>
                <input
                  type="date"
                  value={preferredDate}
                  onChange={(e) => setPreferredDate(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'address')}
              </label>
              <input
                type="text"
                value={customerAddress}
                onChange={(e) => setCustomerAddress(e.target.value)}
                placeholder={t(lang, 'placeholderAddress')}
                className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'downpaymentRatio')}
                </label>
                <div className="grid grid-cols-3 border border-[#E3DACD] bg-white">
                  {[30, 50, 100].map((pct) => (
                    <button
                      type="button"
                      key={pct}
                      onClick={() => setDownpaymentPercent(pct)}
                      className={`py-2 text-xs font-mono-tabular font-medium transition-colors ${
                        downpaymentPercent === pct
                          ? 'bg-[#3D281D] text-white'
                          : 'text-[#63554A] hover:bg-[#F2ECE3]'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'paymentMethod')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                >
                  {enabledPayments.map((pm) => (
                    <option key={pm.id} value={pm.name}>
                      {PAYMENT_METHOD_LABELS[pm.name][lang]}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'fulfillmentMethod')}
                </label>
                <div className="grid grid-cols-2 border border-[#E3DACD] bg-white">
                  {(['Delivery', 'Pickup'] as const).map((mode) => (
                    <button
                      type="button"
                      key={mode}
                      onClick={() => setFulfillment(mode)}
                      className={`py-2 text-xs font-medium transition-colors ${
                        fulfillment === mode
                          ? 'bg-[#3D281D] text-white'
                          : 'text-[#63554A] hover:bg-[#F2ECE3]'
                      }`}
                    >
                      {mode === 'Delivery'
                        ? t(lang, 'scheduledDelivery')
                        : t(lang, 'pickupShowroom')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 bg-white border border-[#E3DACD] space-y-2 text-sm">
              <div className="flex justify-between text-[#63554A]">
                <span>{t(lang, 'totalPrice')}</span>
                <span className="font-mono-tabular">{formatPHP(totalAmount)}</span>
              </div>
              <div className="flex justify-between font-semibold text-[#241913]">
                <span>
                  {t(lang, 'downpaymentDue')} ({downpaymentPercent}%)
                </span>
                <span className="font-mono-tabular text-[#3D281D]">
                  {formatPHP(downpaymentAmount)}
                </span>
              </div>
              <div className="flex justify-between text-xs text-[#8C7D70] pt-1 border-t border-[#F2ECE3]">
                <span>{t(lang, 'remainingBalance')}</span>
                <span className="font-mono-tabular">{formatPHP(balanceDue)}</span>
              </div>
            </div>

            {error && <p className="text-xs text-[#B91C1C]">{error}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 border border-[#E3DACD] text-sm font-medium text-[#63554A] hover:text-[#241913]"
              >
                {t(lang, 'cancel')}
              </button>
              <button
                type="submit"
                className="px-6 py-2.5 bg-[#3D281D] hover:bg-[#2A1B13] text-[#FAF8F5] text-sm font-medium"
              >
                {t(lang, 'confirmReservation')}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
