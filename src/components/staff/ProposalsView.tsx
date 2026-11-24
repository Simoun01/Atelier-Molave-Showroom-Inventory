import React, { useState } from 'react';
import { FileText, Plus, Trash2, Printer, X } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { PROPOSAL_STATUS_LABELS, formatDate, formatPHP, t } from '../../i18n/translations';
import { Proposal, ProposalPackage } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

export const ProposalsView: React.FC = () => {
  const {
    lang,
    proposals,
    clients,
    products,
    createProposal,
    updateProposalStatus,
  } = useShowroom();

  const developerClients = clients.filter((c) => c.type === 'Developer');
  const [builderOpen, setBuilderOpen] = useState(false);
  const [previewProposal, setPreviewProposal] = useState<Proposal | null>(null);

  // Builder State
  const [title, setTitle] = useState(
    lang === 'zh' ? '新建高层公寓样板间与行政套房方案' : 'New Tower Model & Executive Unit Package'
  );
  const [clientId, setClientId] = useState(developerClients[0]?.id ?? clients[0].id);
  const [projectLocation, setProjectLocation] = useState(
    lang === 'zh' ? 'BGC / 马卡蒂' : 'BGC / Makati'
  );
  const [discountPercent, setDiscountPercent] = useState(10);
  const [validUntil, setValidUntil] = useState('2026-12-31');
  const [notes, setNotes] = useState(
    lang === 'zh'
      ? '含专车白色手套配送、分室精准摆放安装及2年结构实木质保。'
      : 'Includes white-glove delivery, room-by-room placement, and 2-year structural timber warranty.'
  );
  const [packages, setPackages] = useState<ProposalPackage[]>([
    {
      id: 'pkg-new-1',
      roomType: lang === 'zh' ? '一居室客餐厅整装套餐' : '1-Bedroom Living & Dining Suite',
      roomTypeZh: '一居室客餐厅整装套餐',
      unitCount: 10,
      items: [
        { productId: products[0].id, qtyPerUnit: 1, unitPrice: products[0].price },
        { productId: products[7].id, qtyPerUnit: 4, unitPrice: products[7].price },
      ],
    },
  ]);

  const addPackage = () => {
    setPackages((prev) => [
      ...prev,
      {
        id: `pkg-${Date.now()}`,
        roomType: lang === 'zh' ? '卧室与书房套餐' : 'Bedroom / Study Package',
        roomTypeZh: '卧室与书房套餐',
        unitCount: 10,
        items: [{ productId: products[12].id, qtyPerUnit: 1, unitPrice: products[12].price }],
      },
    ]);
  };

  const updatePackageField = (
    pkgIdx: number,
    field: 'roomType' | 'unitCount',
    val: string | number
  ) => {
    setPackages((prev) =>
      prev.map((pkg, idx) =>
        idx === pkgIdx
          ? field === 'roomType'
            ? { ...pkg, roomType: String(val), roomTypeZh: String(val) }
            : { ...pkg, unitCount: Number(val) }
          : pkg
      )
    );
  };

  const addItemToPackage = (pkgIdx: number) => {
    setPackages((prev) =>
      prev.map((pkg, idx) =>
        idx === pkgIdx
          ? {
              ...pkg,
              items: [
                ...pkg.items,
                { productId: products[1].id, qtyPerUnit: 1, unitPrice: products[1].price },
              ],
            }
          : pkg
      )
    );
  };

  const updatePackageItem = (
    pkgIdx: number,
    itemIdx: number,
    productId: string,
    qtyPerUnit: number
  ) => {
    const prod = products.find((p) => p.id === productId);
    setPackages((prev) =>
      prev.map((pkg, idx) =>
        idx === pkgIdx
          ? {
              ...pkg,
              items: pkg.items.map((item, i) =>
                i === itemIdx
                  ? {
                      productId,
                      qtyPerUnit: Math.max(1, qtyPerUnit),
                      unitPrice: prod ? prod.price : item.unitPrice,
                    }
                  : item
              ),
            }
          : pkg
      )
    );
  };

  const removePackageItem = (pkgIdx: number, itemIdx: number) => {
    setPackages((prev) =>
      prev.map((pkg, idx) =>
        idx === pkgIdx
          ? { ...pkg, items: pkg.items.filter((_, i) => i !== itemIdx) }
          : pkg
      )
    );
  };

  const builderSubtotal = packages.reduce((sum, pkg) => {
    const perUnit = pkg.items.reduce((s, it) => s + it.unitPrice * it.qtyPerUnit, 0);
    return sum + perUnit * pkg.unitCount;
  }, 0);
  const builderDiscount = Math.round((builderSubtotal * discountPercent) / 100);
  const builderTotal = builderSubtotal - builderDiscount;

  const handleSaveProposal = (e: React.FormEvent) => {
    e.preventDefault();
    const saved = createProposal({
      title,
      clientId,
      projectLocation,
      packages,
      discountPercent,
      validUntil,
      notes,
      status: 'Sent',
    });
    setBuilderOpen(false);
    setPreviewProposal(saved);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
            {t(lang, 'proposalsBuilder')}
          </h2>
          <p className="text-xs text-[#63554A]">{t(lang, 'proposalsSubtitle')}</p>
        </div>

        <button
          onClick={() => setBuilderOpen(!builderOpen)}
          className="inline-flex items-center gap-2 px-4 py-2 bg-[#3D281D] hover:bg-[#2A1B13] text-white text-xs font-medium"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{builderOpen ? t(lang, 'closeBuilder') : t(lang, 'newProposal')}</span>
        </button>
      </div>

      {/* Proposal Builder Form */}
      {builderOpen && (
        <form
          onSubmit={handleSaveProposal}
          className="bg-white border border-[#E3DACD] p-6 space-y-6"
        >
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'proposalTitleLabel')}
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3DACD] text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'developerClientLabel')}
              </label>
              <select
                value={clientId}
                onChange={(e) => setClientId(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3DACD] text-sm bg-white"
              >
                {clients.map((c) => {
                  const displayCompany = lang === 'zh' ? c.companyZh || c.company : c.company;
                  const displayClient = lang === 'zh' ? c.nameZh : c.nameEn;
                  return (
                    <option key={c.id} value={c.id}>
                      {displayCompany ? `${displayCompany} (${displayClient})` : displayClient}
                    </option>
                  );
                })}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'projectLocation')}
              </label>
              <input
                type="text"
                value={projectLocation}
                onChange={(e) => setProjectLocation(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3DACD] text-sm"
              />
            </div>
          </div>

          {/* Room / Unit Type Packages */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-[#241913]">
                {t(lang, 'roomPackagesTitle')}
              </h3>
              <button
                type="button"
                onClick={addPackage}
                className="px-3 py-1.5 border border-[#3D281D] text-xs font-medium text-[#3D281D] hover:bg-[#F2ECE3]"
              >
                {t(lang, 'addUnitPackage')}
              </button>
            </div>

            {packages.map((pkg, pkgIdx) => {
              const perUnitCost = pkg.items.reduce(
                (s, it) => s + it.unitPrice * it.qtyPerUnit,
                0
              );
              const pkgTotal = perUnitCost * pkg.unitCount;

              return (
                <div
                  key={pkg.id}
                  className="border border-[#E3DACD] bg-[#FAF8F5] p-4 space-y-3"
                >
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-end">
                    <div className="sm:col-span-6">
                      <label className="block text-[11px] text-[#63554A] mb-1">
                        {t(lang, 'roomUnitTypeLabel')}
                      </label>
                      <input
                        type="text"
                        value={pkg.roomType}
                        onChange={(e) =>
                          updatePackageField(pkgIdx, 'roomType', e.target.value)
                        }
                        className="w-full px-3 py-1.5 bg-white border border-[#E3DACD] text-sm"
                      />
                    </div>
                    <div className="sm:col-span-3">
                      <label className="block text-[11px] text-[#63554A] mb-1">
                        {t(lang, 'buildingUnitsLabel')}
                      </label>
                      <input
                        type="number"
                        min={1}
                        value={pkg.unitCount}
                        onChange={(e) =>
                          updatePackageField(
                            pkgIdx,
                            'unitCount',
                            Math.max(1, Number(e.target.value))
                          )
                        }
                        className="w-full px-3 py-1.5 bg-white border border-[#E3DACD] text-sm font-mono-tabular"
                      />
                    </div>
                    <div className="sm:col-span-3 text-right">
                      <div className="text-[11px] text-[#8C7D70]">{t(lang, 'packageSubtotal')}</div>
                      <div className="font-mono-tabular text-sm font-semibold text-[#3D281D]">
                        {formatPHP(pkgTotal)}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    {pkg.items.map((item, itemIdx) => (
                      <div
                        key={itemIdx}
                        className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-center bg-white p-2 border border-[#E3DACD]"
                      >
                        <select
                          value={item.productId}
                          onChange={(e) =>
                            updatePackageItem(
                              pkgIdx,
                              itemIdx,
                              e.target.value,
                              item.qtyPerUnit
                            )
                          }
                          className="sm:col-span-6 px-2.5 py-1.5 border border-[#E3DACD] text-xs bg-white"
                        >
                          {products.map((p) => (
                            <option key={p.id} value={p.id}>
                              {p.sku} · {lang === 'zh' ? p.nameZh : p.nameEn} ({formatPHP(p.price)})
                            </option>
                          ))}
                        </select>
                        <div className="sm:col-span-2 flex items-center gap-1.5 text-xs">
                          <span className="text-[#8C7D70]">{t(lang, 'qtyPerUnit')}:</span>
                          <input
                            type="number"
                            min={1}
                            value={item.qtyPerUnit}
                            onChange={(e) =>
                              updatePackageItem(
                                pkgIdx,
                                itemIdx,
                                item.productId,
                                Number(e.target.value)
                              )
                            }
                            className="w-16 px-2 py-1 border border-[#E3DACD] font-mono-tabular"
                          />
                        </div>
                        <div className="sm:col-span-3 text-right font-mono-tabular text-xs text-[#241913]">
                          {item.qtyPerUnit * pkg.unitCount} {t(lang, 'totalQtySummary')} ·{' '}
                          <strong>
                            {formatPHP(item.unitPrice * item.qtyPerUnit * pkg.unitCount)}
                          </strong>
                        </div>
                        <div className="sm:col-span-1 text-right">
                          <button
                            type="button"
                            onClick={() => removePackageItem(pkgIdx, itemIdx)}
                            className="p-1 text-[#8C7D70] hover:text-[#B91C1C]"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    onClick={() => addItemToPackage(pkgIdx)}
                    className="text-xs font-medium text-[#3D281D] underline underline-offset-4"
                  >
                    {t(lang, 'addPieceToPackage')}
                  </button>
                </div>
              );
            })}
          </div>

          {/* Discount & Totals */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-3 border-t border-[#E3DACD]">
            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'volumeDiscountLabel')}
              </label>
              <input
                type="number"
                min={0}
                max={40}
                value={discountPercent}
                onChange={(e) => setDiscountPercent(Math.max(0, Number(e.target.value)))}
                className="w-full px-3 py-2 border border-[#E3DACD] text-sm font-mono-tabular"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[#63554A] mb-1">
                {t(lang, 'validUntilLabel')}
              </label>
              <input
                type="date"
                value={validUntil}
                onChange={(e) => setValidUntil(e.target.value)}
                className="w-full px-3 py-2 border border-[#E3DACD] text-sm"
              />
            </div>
            <div className="bg-[#F2ECE3] border border-[#E3DACD] p-3 text-right space-y-1">
              <div className="text-xs text-[#63554A]">
                {t(lang, 'subtotal')}:{' '}
                <span className="font-mono-tabular">{formatPHP(builderSubtotal)}</span> ·{' '}
                {t(lang, 'discount')}:{' '}
                <span className="font-mono-tabular">-{formatPHP(builderDiscount)}</span>
              </div>
              <div className="font-mono-tabular text-lg font-semibold text-[#3D281D]">
                {t(lang, 'grandTotal')}: {formatPHP(builderTotal)}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#63554A] mb-1">
              {t(lang, 'termsStagingNotes')}
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-[#E3DACD] text-xs"
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setBuilderOpen(false)}
              className="px-4 py-2 border border-[#E3DACD] text-xs"
            >
              {t(lang, 'cancel')}
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#3D281D] text-white text-xs font-medium"
            >
              {t(lang, 'savePreviewPdf')}
            </button>
          </div>
        </form>
      )}

      {/* Proposals Table */}
      <div className="bg-white border border-[#E3DACD] p-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E3DACD] bg-[#FAF8F5] text-[#63554A]">
                <th className="py-2.5 px-3 font-medium">{t(lang, 'codeLabel')}</th>
                <th className="py-2.5 px-3 font-medium">{t(lang, 'proposalProjectCol')}</th>
                <th className="py-2.5 px-3 font-medium">{t(lang, 'developerCol')}</th>
                <th className="py-2.5 px-3 font-medium">{t(lang, 'packagesCol')}</th>
                <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'totalPhpCol')}</th>
                <th className="py-2.5 px-3 font-medium">{t(lang, 'status')}</th>
                <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'documentCol')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3]">
              {proposals.map((prop) => (
                <tr key={prop.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-3 px-3 font-mono-tabular font-medium text-[#3D281D]">
                    {prop.code}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-[#241913]">
                      {lang === 'zh' ? prop.titleZh || prop.title : prop.title}
                    </div>
                    <div className="text-[#8C7D70]">
                      {lang === 'zh'
                        ? prop.projectLocationZh || prop.projectLocation
                        : prop.projectLocation}
                    </div>
                  </td>
                  <td className="py-3 px-3 space-y-1">
                    <BilingualName
                      nameEn={prop.companyName}
                      nameZh={prop.companyNameZh}
                      primaryClassName="font-medium text-[#241913]"
                      secondaryClassName="text-[10px]"
                    />
                    <BilingualName
                      nameEn={prop.clientName}
                      nameZh={prop.clientNameZh}
                      inline
                      primaryClassName="text-[#63554A]"
                      secondaryClassName="text-[10px]"
                    />
                  </td>
                  <td className="py-3 px-3 font-mono-tabular text-[#63554A]">
                    {prop.packages.reduce((s, pk) => s + pk.unitCount, 0)}{' '}
                    {t(lang, 'unitsUnitLabel')} ({prop.packages.length} {t(lang, 'unitTypesLabel')})
                  </td>
                  <td className="py-3 px-3 text-right font-mono-tabular font-semibold text-[#241913]">
                    {formatPHP(prop.totalAmount)}
                  </td>
                  <td className="py-3 px-3">
                    <select
                      value={prop.status}
                      onChange={(e) =>
                        updateProposalStatus(
                          prop.id,
                          e.target.value as Proposal['status']
                        )
                      }
                      className="px-2 py-1 border border-[#E3DACD] bg-white text-xs"
                    >
                      {(['Draft', 'Sent', 'Approved', 'Revised'] as const).map((st) => (
                        <option key={st} value={st}>
                          {PROPOSAL_STATUS_LABELS[st][lang]}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => setPreviewProposal(prop)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 border border-[#3D281D] text-[#3D281D] hover:bg-[#3D281D] hover:text-white text-xs font-medium transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>{t(lang, 'generatePdf')}</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Print-Ready PDF Proposal Preview Modal */}
      {previewProposal && (
        <div className="fixed inset-0 z-50 bg-[#241913]/65 flex items-center justify-center p-4 overflow-y-auto">
          <div className="print-only-container bg-white border border-[#E3DACD] max-w-3xl w-full max-h-[92vh] overflow-y-auto p-8 space-y-6 shadow-2xl">
            <div className="no-print flex items-center justify-between pb-4 border-b border-[#E3DACD]">
              <span className="text-xs font-medium text-[#63554A]">
                {t(lang, 'pdfPreviewTitle')}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-[#3D281D] text-white text-xs font-medium"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>{t(lang, 'printSavePdf')}</span>
                </button>
                <button
                  onClick={() => setPreviewProposal(null)}
                  className="p-1.5 text-[#63554A]"
                  aria-label={t(lang, 'close')}
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Letterhead */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-6 border-b-2 border-[#3D281D]">
              <div>
                <h2 className="font-serif-display text-3xl font-semibold text-[#241913]">
                  {t(lang, 'brandName')}
                </h2>
                <p className="text-xs text-[#63554A] mt-1">{t(lang, 'pdfSubheader')}</p>
              </div>
              <div className="text-left sm:text-right text-xs space-y-1">
                <div className="font-mono-tabular font-semibold text-[#3D281D]">
                  {previewProposal.code}
                </div>
                <div className="text-[#63554A]">
                  {t(lang, 'issuedLabel')}: {formatDate(previewProposal.createdAt, lang)}
                </div>
                <div className="text-[#63554A]">
                  {t(lang, 'validUntilShort')}: {formatDate(previewProposal.validUntil, lang)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs bg-[#FAF8F5] p-4 border border-[#E3DACD]">
              <div className="space-y-1">
                <div className="text-[#8C7D70]">{t(lang, 'preparedFor')}</div>
                <BilingualName
                  nameEn={previewProposal.companyName}
                  nameZh={previewProposal.companyNameZh}
                  primaryClassName="font-semibold text-sm text-[#241913]"
                />
                <div className="text-[#63554A] flex items-baseline gap-1.5">
                  <span>{t(lang, 'attnLabel')}:</span>
                  <BilingualName
                    nameEn={previewProposal.clientName}
                    nameZh={previewProposal.clientNameZh}
                    inline
                  />
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-[#8C7D70]">{t(lang, 'projectScope')}</div>
                <div className="font-semibold text-sm text-[#241913]">
                  {lang === 'zh'
                    ? previewProposal.titleZh || previewProposal.title
                    : previewProposal.title}
                </div>
                <div className="text-[#63554A]">
                  {lang === 'zh'
                    ? previewProposal.projectLocationZh || previewProposal.projectLocation
                    : previewProposal.projectLocation}
                </div>
              </div>
            </div>

            {/* Packages Breakdown */}
            <div className="space-y-5">
              {previewProposal.packages.map((pkg) => {
                const perUnit = pkg.items.reduce(
                  (s, it) => s + it.unitPrice * it.qtyPerUnit,
                  0
                );
                return (
                  <div key={pkg.id} className="border border-[#E3DACD]">
                    <div className="px-4 py-2.5 bg-[#F2ECE3] flex justify-between text-xs font-semibold text-[#241913]">
                      <span>
                        {lang === 'zh' ? pkg.roomTypeZh || pkg.roomType : pkg.roomType} (
                        {pkg.unitCount} {t(lang, 'unitsUnitLabel')})
                      </span>
                      <span className="font-mono-tabular">
                        {formatPHP(perUnit * pkg.unitCount)}
                      </span>
                    </div>
                    <table className="w-full text-xs text-left">
                      <thead>
                        <tr className="border-b border-[#E3DACD] text-[#63554A]">
                          <th className="py-2 px-4 font-medium">{t(lang, 'pieceCol')}</th>
                          <th className="py-2 px-3 text-right font-medium">
                            {t(lang, 'qtyPerUnit')}
                          </th>
                          <th className="py-2 px-3 text-right font-medium">
                            {t(lang, 'totalQtyCol')}
                          </th>
                          <th className="py-2 px-3 text-right font-medium">
                            {t(lang, 'unitPriceCol')}
                          </th>
                          <th className="py-2 px-4 text-right font-medium">
                            {t(lang, 'lineTotalCol')}
                          </th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#F2ECE3]">
                        {pkg.items.map((item, i) => {
                          const prod = products.find((p) => p.id === item.productId);
                          const totalQty = item.qtyPerUnit * pkg.unitCount;
                          return (
                            <tr key={i}>
                              <td className="py-2 px-4 font-medium">
                                {lang === 'zh' ? prod?.nameZh : prod?.nameEn} ({prod?.sku})
                              </td>
                              <td className="py-2 px-3 text-right font-mono-tabular">
                                {item.qtyPerUnit}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-tabular">
                                {totalQty}
                              </td>
                              <td className="py-2 px-3 text-right font-mono-tabular">
                                {formatPHP(item.unitPrice)}
                              </td>
                              <td className="py-2 px-4 text-right font-mono-tabular font-medium">
                                {formatPHP(item.unitPrice * totalQty)}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                );
              })}
            </div>

            {/* Grand Totals */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pt-4 border-t border-[#E3DACD]">
              <div className="text-xs text-[#63554A] max-w-sm">
                <strong>{t(lang, 'termsStagingNotes')}:</strong>{' '}
                {lang === 'zh'
                  ? previewProposal.notesZh || previewProposal.notes
                  : previewProposal.notes}
              </div>
              <div className="w-full sm:w-72 space-y-1.5 text-sm">
                <div className="flex justify-between text-[#63554A]">
                  <span>{t(lang, 'grossSubtotal')}</span>
                  <span className="font-mono-tabular">{formatPHP(previewProposal.subtotal)}</span>
                </div>
                <div className="flex justify-between text-[#63554A]">
                  <span>
                    {t(lang, 'discount')} ({previewProposal.discountPercent}%)
                  </span>
                  <span className="font-mono-tabular text-[#B45309]">
                    -{formatPHP(previewProposal.discountAmount)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold text-base text-[#241913] pt-2 border-t border-[#3D281D]">
                  <span>{t(lang, 'netContractTotal')}</span>
                  <span className="font-mono-tabular text-[#3D281D]">
                    {formatPHP(previewProposal.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
