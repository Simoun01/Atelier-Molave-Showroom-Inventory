import React, { useState } from 'react';
import { RotateCcw, Plus } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { STAFF_ROLE_LABELS, t } from '../../i18n/translations';
import { StaffRole } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

export const SettingsView: React.FC = () => {
  const {
    lang,
    units,
    categories,
    paymentMethods,
    staffAccounts,
    toggleUnitActive,
    toggleCategoryActive,
    togglePaymentMethod,
    updateStaffRole,
    addStaffMember,
    resetDemoData,
  } = useShowroom();

  const [activeTab, setActiveTab] = useState<'units' | 'categories' | 'payments' | 'staff'>(
    'units'
  );
  const [staffName, setStaffName] = useState('');
  const [staffEmail, setStaffEmail] = useState('');
  const [staffRole, setStaffRole] = useState<StaffRole>('sales');
  const [staffUnit, setStaffUnit] = useState(units[0].id);

  const handleAddStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!staffName.trim() || !staffEmail.trim()) return;
    addStaffMember({
      name: staffName.trim(),
      email: staffEmail.trim(),
      role: staffRole,
      assignedUnitId: staffUnit,
      active: true,
    });
    setStaffName('');
    setStaffEmail('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
          {t(lang, 'settingsTitle')}
        </h2>
        <button
          onClick={resetDemoData}
          className="inline-flex items-center gap-2 px-4 py-2 border border-[#B91C1C] text-[#B91C1C] hover:bg-red-50 text-xs font-medium transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>{t(lang, 'resetDemo')}</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1 border border-[#E3DACD] bg-white p-1 w-fit">
        {(
          [
            ['units', 'unitsTab'],
            ['categories', 'categoriesTab'],
            ['payments', 'paymentsTab'],
            ['staff', 'staffTab'],
          ] as const
        ).map(([key, labelKey]) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`px-4 py-1.5 text-xs font-medium transition-colors ${
              activeTab === key
                ? 'bg-[#3D281D] text-white'
                : 'text-[#63554A] hover:text-[#241913]'
            }`}
          >
            {t(lang, labelKey)}
          </button>
        ))}
      </div>

      {/* Units */}
      {activeTab === 'units' && (
        <div className="bg-white border border-[#E3DACD] p-5">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E3DACD] bg-[#FAF8F5] text-[#63554A]">
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'galleryCol')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'addressCol')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'managerCol')}</th>
                  <th className="py-2.5 px-3 text-right font-medium">{t(lang, 'areaSqmCol')}</th>
                  <th className="py-2.5 px-3 font-medium">{t(lang, 'status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE3]">
                {units.map((u) => (
                  <tr key={u.id}>
                    <td className="py-3 px-3 font-medium text-[#241913]">
                      {lang === 'en' ? u.nameEn : u.nameZh}
                    </td>
                    <td className="py-3 px-3 text-[#63554A]">
                      {lang === 'zh' ? u.addressZh : u.address}
                    </td>
                    <td className="py-3 px-3 text-[#241913]">
                      <BilingualName
                        nameEn={u.manager}
                        nameZh={u.managerZh}
                        primaryClassName="font-medium text-[#241913]"
                        secondaryClassName="text-[10px]"
                      />
                      <div className="font-mono-tabular text-[#8C7D70] mt-0.5">{u.phone}</div>
                    </td>
                    <td className="py-3 px-3 text-right font-mono-tabular">{u.sqm}</td>
                    <td className="py-3 px-3">
                      <button
                        onClick={() => toggleUnitActive(u.id)}
                        className={`px-2.5 py-1 border text-xs font-medium ${
                          u.active
                            ? 'border-[#1F6E43] text-[#1F6E43]'
                            : 'border-[#8C7D70] text-[#8C7D70]'
                        }`}
                      >
                        {u.active ? t(lang, 'activeStatus') : t(lang, 'inactiveStatus')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Categories */}
      {activeTab === 'categories' && (
        <div className="bg-white border border-[#E3DACD] divide-y divide-[#F2ECE3]">
          {categories.map((cat) => (
            <div key={cat.id} className="p-4 flex items-center justify-between text-sm">
              <div>
                <div className="font-medium text-[#241913]">
                  {lang === 'zh' ? cat.nameZh : cat.nameEn}
                </div>
              </div>
              <button
                onClick={() => toggleCategoryActive(cat.id)}
                className={`px-3 py-1 border text-xs font-medium ${
                  cat.active
                    ? 'border-[#1F6E43] text-[#1F6E43]'
                    : 'border-[#8C7D70] text-[#8C7D70]'
                }`}
              >
                {cat.active ? t(lang, 'visibleCatalog') : t(lang, 'hiddenCatalog')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Methods */}
      {activeTab === 'payments' && (
        <div className="bg-white border border-[#E3DACD] divide-y divide-[#F2ECE3]">
          {paymentMethods.map((pm) => (
            <div
              key={pm.id}
              className="p-4 flex flex-wrap items-center justify-between gap-4 text-sm"
            >
              <div>
                <div className="font-medium text-[#241913]">
                  {lang === 'zh' ? pm.nameZh : pm.name}
                </div>
                <div className="text-xs text-[#63554A]">
                  {lang === 'zh' ? pm.accountInfoZh : pm.accountInfo}
                </div>
              </div>
              <button
                onClick={() => togglePaymentMethod(pm.id)}
                className={`px-3 py-1 border text-xs font-medium ${
                  pm.enabled
                    ? 'border-[#1F6E43] text-[#1F6E43]'
                    : 'border-[#8C7D70] text-[#8C7D70]'
                }`}
              >
                {pm.enabled ? t(lang, 'enabledStatus') : t(lang, 'disabledStatus')}
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Staff Accounts */}
      {activeTab === 'staff' && (
        <div className="space-y-4">
          <form
            onSubmit={handleAddStaff}
            className="bg-white border border-[#E3DACD] p-4 grid grid-cols-1 sm:grid-cols-5 gap-3 items-end"
          >
            <div>
              <label className="block text-[11px] text-[#63554A] mb-1">
                {t(lang, 'staffNameLabel')}
              </label>
              <input
                type="text"
                required
                value={staffName}
                onChange={(e) => setStaffName(e.target.value)}
                placeholder={t(lang, 'staffFullNamePlaceholder')}
                className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#63554A] mb-1">
                {t(lang, 'email')}
              </label>
              <input
                type="email"
                required
                value={staffEmail}
                onChange={(e) => setStaffEmail(e.target.value)}
                placeholder={t(lang, 'placeholderEmail')}
                className="w-full px-3 py-1.5 border border-[#E3DACD] text-xs"
              />
            </div>
            <div>
              <label className="block text-[11px] text-[#63554A] mb-1">
                {t(lang, 'roleLabel')}
              </label>
              <select
                value={staffRole}
                onChange={(e) => setStaffRole(e.target.value as StaffRole)}
                className="w-full px-2.5 py-1.5 border border-[#E3DACD] text-xs bg-white"
              >
                {(['admin', 'sales', 'warehouse'] as const).map((r) => (
                  <option key={r} value={r}>
                    {STAFF_ROLE_LABELS[r][lang]}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] text-[#63554A] mb-1">
                {t(lang, 'assignedUnitLabel')}
              </label>
              <select
                value={staffUnit}
                onChange={(e) => setStaffUnit(e.target.value)}
                className="w-full px-2.5 py-1.5 border border-[#E3DACD] text-xs bg-white"
              >
                <option value="warehouse">{t(lang, 'centralWarehouseShort')}</option>
                {units.map((u) => (
                  <option key={u.id} value={u.id}>
                    {lang === 'zh' ? u.shortNameZh : u.shortNameEn}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center gap-1.5 px-4 py-1.5 bg-[#3D281D] text-white text-xs font-medium h-[30px]"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>{t(lang, 'addStaffBtn')}</span>
            </button>
          </form>

          <div className="bg-white border border-[#E3DACD] overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E3DACD] bg-[#FAF8F5] text-[#63554A]">
                  <th className="py-2.5 px-4 font-medium">{t(lang, 'nameCol')}</th>
                  <th className="py-2.5 px-4 font-medium">{t(lang, 'email')}</th>
                  <th className="py-2.5 px-4 font-medium">{t(lang, 'assignedUnitLabel')}</th>
                  <th className="py-2.5 px-4 font-medium">{t(lang, 'roleLabel')}</th>
                  <th className="py-2.5 px-4 font-medium">{t(lang, 'status')}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#F2ECE3]">
                {staffAccounts.map((stf) => {
                  const assignedUnit = units.find((u) => u.id === stf.assignedUnitId);
                  return (
                    <tr key={stf.id}>
                      <td className="py-3 px-4 font-medium text-[#241913]">
                        <BilingualName
                          nameEn={stf.nameEn}
                          nameZh={stf.nameZh}
                          primaryClassName="font-medium text-[#241913]"
                          secondaryClassName="text-[10px]"
                        />
                      </td>
                      <td className="py-3 px-4 text-[#63554A]">{stf.email}</td>
                      <td className="py-3 px-4 text-[#63554A]">
                        {stf.assignedUnitId === 'warehouse'
                          ? t(lang, 'centralWarehouseShort')
                          : lang === 'zh'
                          ? assignedUnit?.shortNameZh
                          : assignedUnit?.shortNameEn}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={stf.role}
                          onChange={(e) =>
                            updateStaffRole(stf.id, e.target.value as StaffRole, stf.active)
                          }
                          className="px-2 py-1 border border-[#E3DACD] bg-white text-xs"
                        >
                          {(['admin', 'sales', 'warehouse'] as const).map((r) => (
                            <option key={r} value={r}>
                              {STAFF_ROLE_LABELS[r][lang]}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="py-3 px-4">
                        <button
                          onClick={() => updateStaffRole(stf.id, stf.role, !stf.active)}
                          className={`px-2.5 py-1 border text-xs font-medium ${
                            stf.active
                              ? 'border-[#1F6E43] text-[#1F6E43]'
                              : 'border-[#8C7D70] text-[#8C7D70]'
                          }`}
                        >
                          {stf.active ? t(lang, 'activeStatus') : t(lang, 'suspendedStatus')}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
