import React, { useState } from 'react';
import {
  LayoutDashboard,
  Boxes,
  CreditCard,
  Users,
  FileText,
  Truck,
  Settings,
  Store,
  Menu,
  X,
  Globe,
} from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { t, TranslationKey } from '../../i18n/translations';
import { StaffPage, StaffRole } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

interface StaffLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  id: StaffPage;
  labelKey: TranslationKey;
  icon: React.FC<{ className?: string }>;
  roles: StaffRole[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', labelKey: 'navDashboard', icon: LayoutDashboard, roles: ['admin', 'sales'] },
  { id: 'inventory', labelKey: 'navInventory', icon: Boxes, roles: ['admin', 'sales', 'warehouse'] },
  { id: 'pos', labelKey: 'navPos', icon: CreditCard, roles: ['admin', 'sales'] },
  { id: 'crm', labelKey: 'navCrm', icon: Users, roles: ['admin', 'sales'] },
  { id: 'proposals', labelKey: 'navProposals', icon: FileText, roles: ['admin', 'sales'] },
  { id: 'deliveries', labelKey: 'navDeliveries', icon: Truck, roles: ['admin', 'sales', 'warehouse'] },
  { id: 'settings', labelKey: 'navSettings', icon: Settings, roles: ['admin'] },
];

export const StaffLayout: React.FC<StaffLayoutProps> = ({ children }) => {
  const { lang, setLang, role, setRole, activeStaff, staffPage, setStaffPage } = useShowroom();
  const [mobileOpen, setMobileOpen] = useState(false);

  const currentStaffRole: StaffRole =
    role === 'sales' || role === 'warehouse' ? role : 'admin';

  const visibleNav = NAV_ITEMS.filter((item) => item.roles.includes(currentStaffRole));
  const activeNav = visibleNav.find((n) => n.id === staffPage) ?? visibleNav[0];

  const initials = (lang === 'zh' ? activeStaff.nameZh : activeStaff.nameEn)
    .slice(0, 2)
    .toUpperCase();

  const SidebarContent = () => (
    <div className="flex flex-col h-full bg-[#241913] text-[#FAF8F5]">
      <div className="px-5 py-5 border-b border-[#3D281D]">
        <div className="font-serif-display text-xl font-semibold tracking-tight text-white">
          {t(lang, 'brandName')}
        </div>
        <div className="text-[11px] text-[#B5A898] mt-0.5">
          {t(lang, 'staffOpsTitle')}
        </div>
      </div>

      {/* Role Switcher */}
      <div className="px-4 py-4 border-b border-[#3D281D] space-y-2">
        <div className="text-[11px] text-[#B5A898]">
          {t(lang, 'activeStaffRole')}
        </div>
        <select
          value={currentStaffRole}
          onChange={(e) => setRole(e.target.value as StaffRole)}
          className="w-full px-2.5 py-1.5 bg-[#3D281D] border border-[#5A3F30] text-xs text-white focus:outline-none"
        >
          <option value="admin">{t(lang, 'roleAdmin')}</option>
          <option value="sales">{t(lang, 'roleSales')}</option>
          <option value="warehouse">{t(lang, 'roleWarehouse')}</option>
        </select>
        <div className="pt-1 text-xs">
          <BilingualName
            nameEn={activeStaff.nameEn}
            nameZh={activeStaff.nameZh}
            primaryClassName="text-[#FAF8F5] font-medium text-xs"
            secondaryClassName="!text-[#B5A898] text-[10px]"
          />
        </div>
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {visibleNav.map((item) => {
          const Icon = item.icon;
          const active = (activeNav?.id ?? staffPage) === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setStaffPage(item.id);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 text-sm transition-colors text-left ${
                active
                  ? 'bg-[#3D281D] text-white font-medium'
                  : 'text-[#C7B8A5] hover:text-white hover:bg-[#322219]'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="truncate">{t(lang, item.labelKey)}</span>
            </button>
          );
        })}
      </nav>

      <div className="p-4 border-t border-[#3D281D] space-y-2.5">
        <div className="flex items-center justify-between text-xs text-[#C7B8A5]">
          <span className="inline-flex items-center gap-1.5">
            <Globe className="w-3.5 h-3.5" />
            <span>{t(lang, 'languageLabel')}</span>
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setLang('en')}
              className={`px-2 py-0.5 ${
                lang === 'en' ? 'bg-[#3D281D] text-white font-medium' : 'hover:text-white'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLang('zh')}
              className={`px-2 py-0.5 ${
                lang === 'zh' ? 'bg-[#3D281D] text-white font-medium' : 'hover:text-white'
              }`}
            >
              中文
            </button>
          </div>
        </div>
        <button
          onClick={() => setRole('customer')}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 border border-[#5A3F30] text-xs font-medium text-[#FAF8F5] hover:bg-[#3D281D] transition-colors"
        >
          <Store className="w-3.5 h-3.5" />
          <span>{t(lang, 'returnToStorefront')}</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex bg-[#FAF8F5] text-[#241913]">
      <aside className="no-print hidden lg:block w-64 shrink-0 border-r border-[#E3DACD] sticky top-0 h-screen">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="no-print fixed inset-0 z-50 lg:hidden flex">
          <div className="w-64 h-full shadow-2xl">
            <SidebarContent />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      <div className="flex-1 min-w-0 flex flex-col">
        <header className="no-print h-14 bg-white border-b border-[#E3DACD] px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-1.5 text-[#3D281D] border border-[#E3DACD]"
              aria-label="Toggle navigation"
            >
              {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-[#8C7D70] whitespace-nowrap">{t(lang, 'staffPortal')}</span>
              <span className="text-[#C7B8A5]">/</span>
              <span className="font-semibold text-[#241913] truncate">
                {activeNav ? t(lang, activeNav.labelKey) : ''}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 shrink-0">
            {/* Active Logged-In Staff Avatar + Bilingual Name */}
            <div className="hidden sm:flex items-center gap-2.5 pr-3 border-r border-[#E3DACD]">
              <div className="w-7 h-7 bg-[#3D281D] text-[#FAF8F5] text-[11px] font-medium flex items-center justify-center shrink-0">
                {initials}
              </div>
              <BilingualName
                nameEn={activeStaff.nameEn}
                nameZh={activeStaff.nameZh}
                primaryClassName="text-xs font-medium text-[#241913]"
                secondaryClassName="text-[10px]"
              />
            </div>

            <button
              onClick={() => setRole('customer')}
              className="px-3 py-1.5 text-xs font-medium border border-[#E3DACD] bg-[#FAF8F5] hover:bg-[#F2ECE3] text-[#241913] whitespace-nowrap"
            >
              {t(lang, 'returnToStorefront')}
            </button>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-8 max-w-[1440px] w-full mx-auto">{children}</main>
      </div>
    </div>
  );
};
