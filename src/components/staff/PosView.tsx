import React, { useMemo, useState } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Mail, CheckCircle2, X } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  PAYMENT_METHOD_LABELS,
  RESERVATION_STATUS_LABELS,
  formatPHP,
  formatTimestamp,
  t,
} from '../../i18n/translations';
import { PaymentMethod, Product, SaleLineItem, SaleTransaction } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

export const PosView: React.FC = () => {
  const {
    lang,
    products,
    units,
    clients,
    reservations,
    paymentMethods,
    completeSale,
    settleReservationToSale,
    pushToast,
  } = useShowroom();

  const [tab, setTab] = useState<'pos' | 'reservations'>('pos');
  const [search, setSearch] = useState('');
  const [selectedUnitId, setSelectedUnitId] = useState(units[0].id);
  const [cart, setCart] = useState<SaleLineItem[]>([]);
  const [discountType, setDiscountType] = useState<'percent' | 'fixed'>('percent');
  const [discountValue, setDiscountValue] = useState(0);

  // Bilingual Client Picker + Walk-in
  const [customerSearch, setCustomerSearch] = useState('');
  const [selectedClientId, setSelectedClientId] = useState<string>('');
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Card');
  const [receiptModal, setReceiptModal] = useState<SaleTransaction | null>(null);
  const [settleMethodMap, setSettleMethodMap] = useState<Record<string, PaymentMethod>>({});

  const enabledPayments = paymentMethods.filter((pm) => pm.enabled);

  const filteredProducts = useMemo(() => {
    const q = search.trim().toLowerCase();
    return products.filter((p) => {
      if (!q) return true;
      return `${p.sku} ${p.nameEn} ${p.nameZh} ${p.pinyin}`.toLowerCase().includes(q);
    });
  }, [products, search]);

  const matchingClients = useMemo(() => {
    const q = customerSearch.trim().toLowerCase();
    return clients.filter((c) => {
      if (!q) return true;
      return `${c.nameEn} ${c.nameZh} ${c.pinyin} ${c.company ?? ''} ${c.companyZh ?? ''}`
        .toLowerCase()
        .includes(q);
    });
  }, [clients, customerSearch]);

  const selectedClient = useMemo(
    () => clients.find((c) => c.id === selectedClientId) ?? null,
    [clients, selectedClientId]
  );

  const addToCart = (p: Product) => {
    setCart((prev) => {
      const existing = prev.find(
        (item) => item.productId === p.id && item.unitId === selectedUnitId
      );
      if (existing) {
        return prev.map((item) =>
          item.productId === p.id && item.unitId === selectedUnitId
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: p.id,
          productNameEn: p.nameEn,
          productNameZh: p.nameZh,
          sku: p.sku,
          unitId: selectedUnitId,
          quantity: 1,
          unitPrice: p.price,
          colorNameEn: p.colors[0].nameEn,
          colorNameZh: p.colors[0].nameZh,
        },
      ];
    });
  };

  const updateCartQty = (idx: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item, i) => (i === idx ? { ...item, quantity: item.quantity + delta } : item))
        .filter((item) => item.quantity > 0)
    );
  };

  const subtotal = cart.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
  const discountAmount =
    discountType === 'percent'
      ? Math.round((subtotal * Math.min(100, Math.max(0, discountValue))) / 100)
      : Math.min(subtotal, Math.max(0, discountValue));
  const total = Math.max(0, subtotal - discountAmount);

  const handleSelectClient = (clientId: string) => {
    setSelectedClientId(clientId);
    const found = clients.find((c) => c.id === clientId);
    if (found) {
      setCustomerName(found.nameEn);
      setCustomerEmail(found.email);
    } else {
      setCustomerName('');
      setCustomerEmail('');
    }
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const tx = completeSale({
      items: cart,
      discountAmount,
      paymentMethod,
      customerName:
        selectedClient?.nameEn || customerName.trim() || 'Showroom Walk-In Guest',
      customerNameZh:
        selectedClient?.nameZh || (customerName.trim() ? customerName.trim() : '展厅散客'),
      customerEmail: customerEmail.trim() || undefined,
      clientId: selectedClient?.id,
    });
    setCart([]);
    setDiscountValue(0);
    setSelectedClientId('');
    setCustomerSearch('');
    setCustomerName('');
    setCustomerEmail('');
    setReceiptModal(tx);
  };

  const handleConvertReservation = (resId: string) => {
    const method = settleMethodMap[resId] ?? 'Bank Transfer';
    const tx = settleReservationToSale(resId, method);
    if (tx) {
      setReceiptModal(tx);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-1 border border-[#E3DACD] bg-white p-1 self-start w-fit">
        <button
          onClick={() => setTab('pos')}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            tab === 'pos' ? 'bg-[#3D281D] text-white' : 'text-[#63554A] hover:text-[#241913]'
          }`}
        >
          {t(lang, 'posTerminal')}
        </button>
        <button
          onClick={() => setTab('reservations')}
          className={`px-4 py-1.5 text-xs font-medium transition-colors ${
            tab === 'reservations' ? 'bg-[#3D281D] text-white' : 'text-[#63554A] hover:text-[#241913]'
          }`}
        >
          {t(lang, 'convertReservation')} ({reservations.filter((r) => r.status === 'Active').length})
        </button>
      </div>

      {tab === 'pos' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left: Product Search & Picker */}
          <div className="lg:col-span-7 bg-white border border-[#E3DACD] p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#8C7D70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t(lang, 'searchPlaceholder')}
                  className="w-full pl-9 pr-3 py-2 border border-[#E3DACD] text-sm focus:outline-none focus:border-[#3D281D]"
                />
              </div>
              <select
                value={selectedUnitId}
                onChange={(e) => setSelectedUnitId(e.target.value)}
                className="px-3 py-2 border border-[#E3DACD] text-xs bg-[#FAF8F5]"
              >
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {lang === 'en' ? u.shortNameEn : u.shortNameZh}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[540px] overflow-y-auto pr-1">
              {filteredProducts.map((p) => {
                const stockAtUnit = p.unitStock[selectedUnitId] ?? 0;
                return (
                  <button
                    key={p.id}
                    onClick={() => addToCart(p)}
                    className="p-3 border border-[#E3DACD] hover:border-[#3D281D] text-left bg-[#FAF8F5]/60 hover:bg-[#F2ECE3]/60 transition-colors flex flex-col justify-between gap-2"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-mono-tabular text-[#8C7D70]">
                        <span>{p.sku}</span>
                        <span>
                          {stockAtUnit > 0
                            ? `${stockAtUnit} ${t(lang, 'atUnitLabel')}`
                            : `${t(lang, 'whLabel')}: ${p.warehouseStock}`}
                        </span>
                      </div>
                      <div className="font-medium text-sm text-[#241913] mt-0.5 line-clamp-1">
                        {lang === 'en' ? p.nameEn : p.nameZh}
                      </div>
                    </div>
                    <div className="flex items-center justify-between pt-1 border-t border-[#E3DACD]">
                      <span className="font-mono-tabular text-sm font-semibold text-[#3D281D]">
                        {formatPHP(p.price)}
                      </span>
                      <span className="text-xs font-medium text-[#3D281D]">
                        {t(lang, 'addBtn')}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Cart & Checkout */}
          <div className="lg:col-span-5 bg-white border border-[#E3DACD] p-5 space-y-4">
            <h3 className="font-serif-display text-2xl font-semibold text-[#241913] pb-2 border-b border-[#E3DACD]">
              {t(lang, 'orderSummary')}
            </h3>

            {cart.length === 0 ? (
              <p className="py-10 text-center text-sm text-[#8C7D70]">{t(lang, 'cartEmpty')}</p>
            ) : (
              <div className="divide-y divide-[#F2ECE3] max-h-56 overflow-y-auto">
                {cart.map((item, idx) => {
                  const unitObj = units.find((u) => u.id === item.unitId);
                  return (
                    <div key={`${item.productId}-${item.unitId}`} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-[#241913] truncate">
                          {lang === 'en' ? item.productNameEn : item.productNameZh}
                        </div>
                        <div className="text-[11px] text-[#8C7D70] font-mono-tabular">
                          {formatPHP(item.unitPrice)} ·{' '}
                          {unitObj ? (lang === 'zh' ? unitObj.codeZh : unitObj.code) : ''}
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => updateCartQty(idx, -1)}
                          className="p-1 border border-[#E3DACD] hover:bg-[#F2ECE3]"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="w-6 text-center text-xs font-mono-tabular">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateCartQty(idx, 1)}
                          className="p-1 border border-[#E3DACD] hover:bg-[#F2ECE3]"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => updateCartQty(idx, -item.quantity)}
                          className="p-1 text-[#8C7D70] hover:text-[#B91C1C]"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Bilingual Customer Picker (EN + ZH + Pinyin search) */}
            <div className="space-y-2 pt-2 border-t border-[#E3DACD]">
              <label className="block text-xs text-[#63554A]">
                {t(lang, 'selectCustomerOptional')}
              </label>
              <input
                type="text"
                value={customerSearch}
                onChange={(e) => setCustomerSearch(e.target.value)}
                placeholder={t(lang, 'searchCustomerPlaceholder')}
                className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs"
              />
              <select
                value={selectedClientId}
                onChange={(e) => handleSelectClient(e.target.value)}
                className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs bg-white"
              >
                <option value="">{t(lang, 'walkInGuest')}</option>
                {matchingClients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {lang === 'zh' ? `${c.nameZh} (${c.nameEn})` : `${c.nameEn} (${c.nameZh})`}
                  </option>
                ))}
              </select>
            </div>

            {!selectedClient && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-[#63554A] mb-1">
                    {t(lang, 'customerName')}
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder={t(lang, 'walkInGuest')}
                    className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs text-[#63554A] mb-1">{t(lang, 'email')}</label>
                  <input
                    type="email"
                    value={customerEmail}
                    onChange={(e) => setCustomerEmail(e.target.value)}
                    placeholder={t(lang, 'forEReceipt')}
                    className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-[#63554A] mb-1">
                  {t(lang, 'discount')}
                </label>
                <div className="flex border border-[#E3DACD]">
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as 'percent' | 'fixed')}
                    className="px-2 py-1.5 bg-[#FAF8F5] text-xs border-r border-[#E3DACD]"
                  >
                    <option value="percent">%</option>
                    <option value="fixed">₱</option>
                  </select>
                  <input
                    type="number"
                    min={0}
                    value={discountValue}
                    onChange={(e) => setDiscountValue(Math.max(0, Number(e.target.value)))}
                    className="w-full px-2.5 py-1.5 text-xs font-mono-tabular focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs text-[#63554A] mb-1">
                  {t(lang, 'paymentMethod')}
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
                  className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs bg-white"
                >
                  {enabledPayments.map((pm) => (
                    <option key={pm.id} value={pm.name}>
                      {PAYMENT_METHOD_LABELS[pm.name][lang]}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="p-3.5 bg-[#FAF8F5] border border-[#E3DACD] space-y-1.5 text-sm">
              <div className="flex justify-between text-[#63554A]">
                <span>{t(lang, 'subtotal')}</span>
                <span className="font-mono-tabular">{formatPHP(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#63554A]">
                <span>{t(lang, 'discount')}</span>
                <span className="font-mono-tabular text-[#B45309]">
                  -{formatPHP(discountAmount)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-base text-[#241913] pt-1.5 border-t border-[#E3DACD]">
                <span>{t(lang, 'total')}</span>
                <span className="font-mono-tabular text-[#3D281D]">{formatPHP(total)}</span>
              </div>
            </div>

            <button
              disabled={cart.length === 0}
              onClick={handleCheckout}
              className="w-full py-3 bg-[#3D281D] hover:bg-[#2A1B13] disabled:opacity-40 text-white text-sm font-medium transition-colors"
            >
              {t(lang, 'completeSale')}
            </button>
          </div>
        </div>
      ) : (
        /* Convert Reservation to Sale */
        <div className="bg-white border border-[#E3DACD] p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E3DACD] bg-[#FAF8F5] text-[#63554A]">
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'codeLabel')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'customerName')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'product')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'unitLabel')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'total')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'paidLabel')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'balanceDueLabel')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'status')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'actionLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE3]">
                {reservations.map((res) => {
                  const prod = products.find((p) => p.id === res.productId);
                  const unit = units.find((u) => u.id === res.unitId);
                  return (
                    <tr key={res.id} className="hover:bg-[#FAF8F5]">
                      <td className="py-3 px-3 font-mono-tabular font-medium text-[#3D281D]">
                        {res.code}
                      </td>
                      <td className="py-3 px-3">
                        <BilingualName
                          nameEn={res.customerNameEn}
                          nameZh={res.customerNameZh}
                          primaryClassName="font-medium text-[#241913]"
                        />
                        <div className="text-[#8C7D70] font-mono-tabular text-[11px] mt-0.5">
                          {res.customerPhone}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        {res.quantity}× {prod ? (lang === 'en' ? prod.nameEn : prod.nameZh) : res.productId}
                      </td>
                      <td className="py-3 px-3 text-[#63554A]">
                        {unit ? (lang === 'zh' ? unit.shortNameZh : unit.shortNameEn) : ''}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-tabular">
                        {formatPHP(res.totalAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-tabular text-[#1F6E43]">
                        {formatPHP(res.downpaymentAmount)}
                      </td>
                      <td className="py-3 px-3 text-right font-mono-tabular font-semibold text-[#241913]">
                        {formatPHP(res.balanceDue)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`font-medium ${
                            res.status === 'Active' ? 'text-[#B45309]' : 'text-[#1F6E43]'
                          }`}
                        >
                          {RESERVATION_STATUS_LABELS[res.status][lang]}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        {res.status === 'Active' ? (
                          <div className="inline-flex items-center gap-2">
                            <select
                              value={settleMethodMap[res.id] ?? 'Bank Transfer'}
                              onChange={(e) =>
                                setSettleMethodMap((prev) => ({
                                  ...prev,
                                  [res.id]: e.target.value as PaymentMethod,
                                }))
                              }
                              className="px-2 py-1 border border-[#E3DACD] bg-white text-xs"
                            >
                              {enabledPayments.map((pm) => (
                                <option key={pm.id} value={pm.name}>
                                  {PAYMENT_METHOD_LABELS[pm.name][lang]}
                                </option>
                              ))}
                            </select>
                            <button
                              onClick={() => handleConvertReservation(res.id)}
                              className="px-3 py-1.5 bg-[#3D281D] hover:bg-[#2A1B13] text-white text-xs font-medium"
                            >
                              {t(lang, 'settleBalance')}
                            </button>
                          </div>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[#1F6E43]">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>{t(lang, 'paidStatus')}</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Official Receipt Preview Modal */}
      {receiptModal && (
        <div className="fixed inset-0 z-50 bg-[#241913]/65 flex items-center justify-center p-4">
          <div className="print-only-container bg-white border border-[#E3DACD] max-w-md w-full p-6 space-y-5 shadow-2xl">
            <div className="no-print flex items-center justify-between pb-3 border-b border-[#E3DACD]">
              <span className="text-xs font-medium text-[#63554A]">
                {t(lang, 'officialReceiptTitle')}
              </span>
              <button onClick={() => setReceiptModal(null)} className="text-[#63554A]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-1">
              <div className="font-serif-display text-2xl font-semibold text-[#241913]">
                Atelier Molave
              </div>
              <div className="text-xs text-[#63554A]">{t(lang, 'metroManilaGalleries')}</div>
              <div className="font-mono-tabular text-xs text-[#3D281D] pt-1">
                {receiptModal.receiptNo} · {formatTimestamp(receiptModal.timestamp, lang)}
              </div>
            </div>

            <div className="border-y border-[#E3DACD] py-3 space-y-2 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-[#63554A]">{t(lang, 'clientLabel')}：</span>
                <BilingualName
                  nameEn={receiptModal.customerNameEn}
                  nameZh={receiptModal.customerNameZh}
                  inline
                  primaryClassName="font-medium"
                />
              </div>
              <div className="flex justify-between">
                <span className="text-[#63554A]">{t(lang, 'paymentLabel')}：</span>
                <span>{PAYMENT_METHOD_LABELS[receiptModal.paymentMethod][lang]}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[#63554A]">{t(lang, 'consultantLabel')}：</span>
                <BilingualName
                  nameEn={receiptModal.staffName}
                  nameZh={receiptModal.staffNameZh}
                  inline
                />
              </div>
            </div>

            <div className="space-y-2 text-xs">
              {receiptModal.items.map((item, i) => (
                <div key={i} className="flex justify-between gap-2">
                  <span>
                    {item.quantity}× {lang === 'zh' ? item.productNameZh : item.productNameEn}
                  </span>
                  <span className="font-mono-tabular">
                    {formatPHP(item.unitPrice * item.quantity)}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-[#E3DACD] pt-3 space-y-1 text-sm">
              {receiptModal.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-[#63554A]">
                  <span>{t(lang, 'discount')}</span>
                  <span className="font-mono-tabular">-{formatPHP(receiptModal.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between font-semibold text-[#241913]">
                <span>{t(lang, 'amountPaidLabel')}</span>
                <span className="font-mono-tabular">{formatPHP(receiptModal.total)}</span>
              </div>
            </div>

            <div className="no-print flex gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 bg-[#3D281D] text-white text-xs font-medium"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>{t(lang, 'printReceipt')}</span>
              </button>
              <button
                onClick={() => {
                  const target =
                    receiptModal.customerEmail ||
                    (lang === 'zh' ? receiptModal.customerNameZh : receiptModal.customerNameEn);
                  pushToast(
                    t(lang, 'toastEReceiptQueued', {
                      receipt: receiptModal.receiptNo,
                      target,
                    })
                  );
                  setReceiptModal(null);
                }}
                className="flex-1 inline-flex items-center justify-center gap-2 py-2.5 border border-[#3D281D] text-[#3D281D] text-xs font-medium"
              >
                <Mail className="w-3.5 h-3.5" />
                <span>{t(lang, 'emailReceipt')}</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
