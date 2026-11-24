import React from 'react';
import { Globe, ShieldCheck } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { CATEGORY_LABELS, t } from '../../i18n/translations';
import { ProductCategory } from '../../types/showroom';

interface CustomerLayoutProps {
  activeCategory: ProductCategory | 'All';
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  onOpenConsultation: (defaultType?: 'Homeowner' | 'Developer') => void;
  children: React.ReactNode;
}

const CATEGORIES: ProductCategory[] = ['Living', 'Dining', 'Bedroom', 'Office', 'Outdoor'];

export const CustomerLayout: React.FC<CustomerLayoutProps> = ({
  activeCategory,
  onSelectCategory,
  onOpenConsultation,
  children,
}) => {
  const { lang, setLang, setRole, units } = useShowroom();

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#241913]">
      {/* Slim 36px Showroom Utility Strip */}
      <div className="h-9 bg-[#241913] text-[#EAE2D6] text-xs px-4 md:px-8 flex items-center justify-between">
        <p className="truncate">{t(lang, 'showroomTagline')}</p>
        <div className="flex items-center gap-4 shrink-0">
          <div className="flex items-center gap-1" role="group" aria-label="Language switch">
            <Globe className="w-3.5 h-3.5 text-[#C7B8A5] mr-1" />
            <button
              onClick={() => setLang('en')}
              className={`px-1.5 py-0.5 transition-colors whitespace-nowrap ${
                lang === 'en' ? 'text-white font-semibold underline underline-offset-4' : 'text-[#B5A898] hover:text-white'
              }`}
            >
              EN
            </button>
            <span className="text-[#63554A]">/</span>
            <button
              onClick={() => setLang('zh')}
              className={`px-1.5 py-0.5 transition-colors whitespace-nowrap ${
                lang === 'zh' ? 'text-white font-semibold underline underline-offset-4' : 'text-[#B5A898] hover:text-white'
              }`}
            >
              中文
            </button>
          </div>
          <span className="text-[#63554A]" aria-hidden="true">|</span>
          <button
            onClick={() => setRole('admin')}
            className="inline-flex items-center gap-1.5 text-[#EFE7DB] hover:text-white transition-colors whitespace-nowrap shrink-0 font-medium"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>{t(lang, 'staffPortal')}</span>
          </button>
        </div>
      </div>

      {/* Strict 3-Zone Top Header */}
      <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-sm border-b border-[#E3DACD]">
        <div className="max-w-7xl mx-auto px-4 md:px-8 h-16 flex items-center justify-between gap-8">
          <button
            onClick={() => onSelectCategory('All')}
            className="font-serif-display text-2xl font-semibold tracking-tight text-[#241913] whitespace-nowrap shrink-0 text-left"
          >
            {t(lang, 'brandName')}
          </button>

          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-[#63554A]">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat;
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 ${
                    isActive
                      ? 'text-[#241913] border-[#3D281D]'
                      : 'border-transparent hover:text-[#241913] hover:border-[#C7B8A5]'
                  }`}
                >
                  {CATEGORY_LABELS[cat][lang]}
                </button>
              );
            })}
          </nav>

          <div className="shrink-0">
            <button
              onClick={() => onOpenConsultation('Homeowner')}
              className="px-4 py-2 bg-[#3D281D] hover:bg-[#2A1B13] text-[#FAF8F5] text-xs md:text-sm font-medium transition-colors whitespace-nowrap shrink-0"
            >
              {t(lang, 'bookConsultation')}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1">{children}</main>

      {/* Editorial Footer */}
      <footer className="bg-[#F2ECE3] border-t border-[#E3DACD] mt-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 pb-10 border-b border-[#DED4C5]">
            <div className="lg:col-span-4 space-y-3">
              <div className="font-serif-display text-2xl font-semibold text-[#241913]">
                {t(lang, 'brandName')}
              </div>
              <p className="text-sm text-[#63554A] leading-relaxed max-w-sm">
                {t(lang, 'footerSummary')}
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <button
                  onClick={() => setRole('admin')}
                  className="text-xs font-medium text-[#3D281D] underline underline-offset-4 hover:text-[#241913]"
                >
                  {t(lang, 'roleAdmin')}
                </button>
                <span className="text-[#C7B8A5]">·</span>
                <button
                  onClick={() => setRole('sales')}
                  className="text-xs font-medium text-[#3D281D] underline underline-offset-4 hover:text-[#241913]"
                >
                  {t(lang, 'roleSales')}
                </button>
                <span className="text-[#C7B8A5]">·</span>
                <button
                  onClick={() => setRole('warehouse')}
                  className="text-xs font-medium text-[#3D281D] underline underline-offset-4 hover:text-[#241913]"
                >
                  {t(lang, 'roleWarehouse')}
                </button>
              </div>
            </div>

            <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-5">
              {units.map((u) => (
                <div key={u.id} className="space-y-1">
                  <div className="text-xs font-semibold text-[#241913]">
                    {lang === 'en' ? u.shortNameEn : u.shortNameZh}
                  </div>
                  <p className="text-xs text-[#63554A] leading-snug">
                    {lang === 'en' ? u.address : u.addressZh}
                  </p>
                  <p className="text-[11px] font-mono-tabular text-[#8C7D70]">{u.phone}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#8C7D70]">
            <span>
              © 2026 {t(lang, 'brandName')} · {t(lang, 'footerCopyright')}
            </span>
            <span>{t(lang, 'footerVatNote')}</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
