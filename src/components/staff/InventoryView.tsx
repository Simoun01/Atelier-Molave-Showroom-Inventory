import React, { useMemo, useState } from 'react';
import { ArrowLeftRight, PlusCircle, Search, History, X } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  CATEGORY_LABELS,
  STOCK_LOG_TYPE_LABELS,
  formatTimestamp,
  t,
} from '../../i18n/translations';
import { ProductCategory } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

export const InventoryView: React.FC = () => {
  const {
    lang,
    products,
    units,
    stockLogs,
    transferStock,
    adjustStock,
  } = useShowroom();

  const [tab, setTab] = useState<'matrix' | 'logs'>('matrix');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'All'>('All');
  const [lowStockOnly, setLowStockOnly] = useState(false);

  const [transferOpen, setTransferOpen] = useState(false);
  const [transferProdId, setTransferProdId] = useState(products[0].id);
  const [fromLoc, setFromLoc] = useState('warehouse');
  const [toLoc, setToLoc] = useState('unit-1');
  const [transferQty, setTransferQty] = useState(1);
  const [transferNote, setTransferNote] = useState('');

  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'Stock-In' | 'Stock-Out'>('Stock-In');
  const [adjustProdId, setAdjustProdId] = useState(products[0].id);
  const [adjustLoc, setAdjustLoc] = useState('warehouse');
  const [adjustQty, setAdjustQty] = useState(2);
  const [adjustNote, setAdjustNote] = useState('');

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      const total =
        Object.values(p.unitStock).reduce((a, b) => a + b, 0) + p.warehouseStock;
      if (lowStockOnly && total > p.reorderLevel) return false;
      if (search.trim()) {
        const q = search.toLowerCase();
        if (
          !`${p.sku} ${p.nameEn} ${p.nameZh} ${p.pinyin}`.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [products, categoryFilter, lowStockOnly, search]);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (transferStock(transferProdId, fromLoc, toLoc, transferQty, transferNote)) {
      setTransferOpen(false);
      setTransferNote('');
    }
  };

  const handleAdjustSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustStock(adjustProdId, adjustLoc, adjustType, adjustQty, adjustNote)) {
      setAdjustOpen(false);
      setAdjustNote('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-1 border border-[#E3DACD] bg-white p-1 self-start">
          <button
            onClick={() => setTab('matrix')}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              tab === 'matrix' ? 'bg-[#3D281D] text-white' : 'text-[#63554A] hover:text-[#241913]'
            }`}
          >
            {t(lang, 'inventoryGrid')}
          </button>
          <button
            onClick={() => setTab('logs')}
            className={`px-4 py-1.5 text-xs font-medium inline-flex items-center gap-1.5 transition-colors ${
              tab === 'logs' ? 'bg-[#3D281D] text-white' : 'text-[#63554A] hover:text-[#241913]'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>{t(lang, 'movementLog')} ({stockLogs.length})</span>
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setTransferOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D281D] hover:bg-[#2A1B13] text-white text-xs font-medium"
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>{t(lang, 'transferStock')}</span>
          </button>
          <button
            onClick={() => setAdjustOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 border border-[#3D281D] bg-white hover:bg-[#F2ECE3] text-[#3D281D] text-xs font-medium"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>{t(lang, 'stockInOut')}</span>
          </button>
        </div>
      </div>

      {tab === 'matrix' ? (
        <div className="bg-white border border-[#E3DACD] p-5 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative w-64">
                <Search className="w-3.5 h-3.5 text-[#8C7D70] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={t(lang, 'searchSkuProduct')}
                  className="w-full pl-9 pr-3 py-1.5 border border-[#E3DACD] text-xs focus:outline-none focus:border-[#3D281D]"
                />
              </div>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as ProductCategory | 'All')}
                className="px-3 py-1.5 border border-[#E3DACD] text-xs bg-white"
              >
                <option value="All">{t(lang, 'allCategories')}</option>
                {(['Living', 'Dining', 'Bedroom', 'Office', 'Outdoor'] as ProductCategory[]).map(
                  (c) => (
                    <option key={c} value={c}>
                      {CATEGORY_LABELS[c][lang]}
                    </option>
                  )
                )}
              </select>
              <label className="inline-flex items-center gap-2 text-xs text-[#63554A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={lowStockOnly}
                  onChange={(e) => setLowStockOnly(e.target.checked)}
                  className="accent-[#3D281D]"
                />
                <span>{t(lang, 'lowStock')}</span>
              </label>
            </div>
            <div className="text-xs text-[#8C7D70] font-mono-tabular">
              {filteredProducts.length} / {products.length} {t(lang, 'skuCountLabel')}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left border-collapse">
              <thead>
                <tr className="border-b border-[#E3DACD] bg-[#FAF8F5] text-[#63554A]">
                  <th className="py-2.5 px-3 font-medium whitespace-nowrap">{t(lang, 'sku')}</th>
                  <th className="py-2.5 px-3 font-medium min-w-[180px]">{t(lang, 'product')}</th>
                  <th className="py-2.5 px-3 font-medium whitespace-nowrap">{t(lang, 'category')}</th>
                  {units.map((u) => (
                    <th key={u.id} className="py-2.5 px-2 text-right font-medium whitespace-nowrap">
                      {lang === 'zh' ? u.codeZh : u.code}
                    </th>
                  ))}
                  <th className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                    {t(lang, 'warehouse')}
                  </th>
                  <th className="py-2.5 px-3 text-right font-medium whitespace-nowrap">
                    {t(lang, 'reorderLvl')}
                  </th>
                  <th className="py-2.5 px-3 font-medium whitespace-nowrap">{t(lang, 'status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE3]">
                {filteredProducts.map((p) => {
                  const floorTotal = Object.values(p.unitStock).reduce((a, b) => a + b, 0);
                  const grandTotal = floorTotal + p.warehouseStock;
                  const isOut = grandTotal === 0;
                  const isLow = grandTotal > 0 && grandTotal <= p.reorderLevel;

                  return (
                    <tr key={p.id} className="hover:bg-[#FAF8F5] h-10">
                      <td className="py-2 px-3 font-mono-tabular text-[#63554A] whitespace-nowrap">
                        {p.sku}
                      </td>
                      <td className="py-2 px-3 font-medium text-[#241913]">
                        {lang === 'en' ? p.nameEn : p.nameZh}
                      </td>
                      <td className="py-2 px-3 text-[#63554A] whitespace-nowrap">
                        {CATEGORY_LABELS[p.category][lang]}
                      </td>
                      {units.map((u) => {
                        const qty = p.unitStock[u.id] ?? 0;
                        return (
                          <td
                            key={u.id}
                            className={`py-2 px-2 text-right font-mono-tabular ${
                              qty === 0 ? 'text-[#C7B8A5]' : 'text-[#241913]'
                            }`}
                          >
                            {qty}
                          </td>
                        );
                      })}
                      <td className="py-2 px-3 text-right font-mono-tabular font-medium text-[#3D281D]">
                        {p.warehouseStock}
                      </td>
                      <td className="py-2 px-3 text-right font-mono-tabular text-[#8C7D70]">
                        {p.reorderLevel}
                      </td>
                      <td className="py-2 px-3 whitespace-nowrap">
                        <span
                          className={`font-medium ${
                            isOut
                              ? 'text-[#B91C1C]'
                              : isLow
                              ? 'text-[#B45309]'
                              : 'text-[#1F6E43]'
                          }`}
                        >
                          {isOut
                            ? t(lang, 'outOfStock')
                            : isLow
                            ? t(lang, 'lowStock')
                            : t(lang, 'nominal')}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white border border-[#E3DACD] p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E3DACD] bg-[#FAF8F5] text-[#63554A]">
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'timestamp')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'typeLabel')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'sku')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'product')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'fromLabel')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'toLabel')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'qtyLabel')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'byLabel')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'notesLabel')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE3]">
                {stockLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#FAF8F5]">
                    <td className="py-2.5 px-3 font-mono-tabular text-[#8C7D70] whitespace-nowrap">
                      {formatTimestamp(log.timestamp, lang)}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#3D281D] whitespace-nowrap">
                      {STOCK_LOG_TYPE_LABELS[log.type]?.[lang] ?? log.type}
                    </td>
                    <td className="py-2.5 px-3 font-mono-tabular text-[#63554A] whitespace-nowrap">
                      {log.sku}
                    </td>
                    <td className="py-2.5 px-3 font-medium text-[#241913]">
                      {lang === 'zh' ? log.productNameZh : log.productNameEn}
                    </td>
                    <td className="py-2.5 px-3 text-[#63554A]">
                      {lang === 'zh' ? log.fromLocationZh : log.fromLocation}
                    </td>
                    <td className="py-2.5 px-3 text-[#63554A]">
                      {lang === 'zh' ? log.toLocationZh : log.toLocation}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono-tabular font-semibold text-[#241913]">
                      {log.quantity}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <BilingualName
                        nameEn={log.performedBy}
                        nameZh={log.performedByZh}
                        primaryClassName="text-[#241913]"
                        secondaryClassName="text-[10px]"
                      />
                    </td>
                    <td className="py-2.5 px-3 text-[#63554A]">
                      {lang === 'zh' ? log.noteZh : log.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Transfer Stock Modal */}
      {transferOpen && (
        <div className="fixed inset-0 z-50 bg-[#241913]/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-md w-full shadow-2xl">
            <div className="px-5 py-4 bg-white border-b border-[#E3DACD] flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-semibold text-[#241913]">
                {t(lang, 'transferStock')}
              </h3>
              <button onClick={() => setTransferOpen(false)} className="text-[#63554A]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleTransferSubmit} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'product')}
                </label>
                <select
                  value={transferProdId}
                  onChange={(e) => setTransferProdId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} · {lang === 'zh' ? p.nameZh : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#63554A] mb-1">
                    {t(lang, 'fromLabel')}
                  </label>
                  <select
                    value={fromLoc}
                    onChange={(e) => setFromLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-xs"
                  >
                    <option value="warehouse">{t(lang, 'centralWarehouseShort')}</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'zh' ? u.shortNameZh : u.shortNameEn}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-[#63554A] mb-1">
                    {t(lang, 'toLabel')}
                  </label>
                  <select
                    value={toLoc}
                    onChange={(e) => setToLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-xs"
                  >
                    <option value="warehouse">{t(lang, 'centralWarehouseShort')}</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'zh' ? u.shortNameZh : u.shortNameEn}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'quantity')}
                </label>
                <input
                  type="number"
                  min={1}
                  value={transferQty}
                  onChange={(e) => setTransferQty(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm font-mono-tabular"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'notesLabel')}
                </label>
                <input
                  type="text"
                  value={transferNote}
                  onChange={(e) => setTransferNote(e.target.value)}
                  placeholder={t(lang, 'placeholderTransferNote')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setTransferOpen(false)}
                  className="px-4 py-2 border border-[#E3DACD] text-xs"
                >
                  {t(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3D281D] text-white text-xs font-medium"
                >
                  {t(lang, 'confirmTransfer')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Stock In/Out Modal */}
      {adjustOpen && (
        <div className="fixed inset-0 z-50 bg-[#241913]/60 flex items-center justify-center p-4">
          <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-md w-full shadow-2xl">
            <div className="px-5 py-4 bg-white border-b border-[#E3DACD] flex items-center justify-between">
              <h3 className="font-serif-display text-xl font-semibold text-[#241913]">
                {t(lang, 'stockInOut')}
              </h3>
              <button onClick={() => setAdjustOpen(false)} className="text-[#63554A]">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleAdjustSubmit} className="p-5 space-y-4">
              <div className="grid grid-cols-2 border border-[#E3DACD] bg-white">
                {(['Stock-In', 'Stock-Out'] as const).map((mode) => (
                  <button
                    type="button"
                    key={mode}
                    onClick={() => setAdjustType(mode)}
                    className={`py-2 text-xs font-medium ${
                      adjustType === mode ? 'bg-[#3D281D] text-white' : 'text-[#63554A]'
                    }`}
                  >
                    {mode === 'Stock-In' ? t(lang, 'stockInLabel') : t(lang, 'stockOutLabel')}
                  </button>
                ))}
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'product')}
                </label>
                <select
                  value={adjustProdId}
                  onChange={(e) => setAdjustProdId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                >
                  {products.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.sku} · {lang === 'zh' ? p.nameZh : p.nameEn}
                    </option>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[#63554A] mb-1">
                    {t(lang, 'locationLabel')}
                  </label>
                  <select
                    value={adjustLoc}
                    onChange={(e) => setAdjustLoc(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-xs"
                  >
                    <option value="warehouse">{t(lang, 'centralWarehouseShort')}</option>
                    {units.map((u) => (
                      <option key={u.id} value={u.id}>
                        {lang === 'zh' ? u.shortNameZh : u.shortNameEn}
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
                    value={adjustQty}
                    onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm font-mono-tabular"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-[#63554A] mb-1">
                  {t(lang, 'reasonBatchNote')}
                </label>
                <input
                  type="text"
                  value={adjustNote}
                  onChange={(e) => setAdjustNote(e.target.value)}
                  placeholder={t(lang, 'placeholderBatchNote')}
                  className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustOpen(false)}
                  className="px-4 py-2 border border-[#E3DACD] text-xs"
                >
                  {t(lang, 'cancel')}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#3D281D] text-white text-xs font-medium"
                >
                  {adjustType === 'Stock-In'
                    ? t(lang, 'recordStockIn')
                    : t(lang, 'recordStockOut')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
