import React, { useMemo, useState } from 'react';
import { Search, SlidersHorizontal, ArrowUpRight, RotateCcw } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import {
  CATEGORY_LABELS,
  MATERIAL_GROUP_LABELS,
  formatPHP,
  t,
} from '../../i18n/translations';
import { Product, ProductCategory } from '../../types/showroom';
import { FurnitureIllustration } from '../common/FurnitureIllustration';

interface CatalogViewProps {
  activeCategory: ProductCategory | 'All';
  onSelectCategory: (cat: ProductCategory | 'All') => void;
  onSelectProduct: (product: Product) => void;
  onOpenConsultation: (type: 'Homeowner' | 'Developer') => void;
}

const CATEGORIES: Array<ProductCategory | 'All'> = [
  'All',
  'Living',
  'Dining',
  'Bedroom',
  'Office',
  'Outdoor',
];

const MATERIAL_GROUPS = [
  'All',
  'Walnut & Narra',
  'Bouclé & Molave',
  'Rattan & Walnut',
  'Travertine & Stone',
  'Leather & Brass',
  'Teak & Weatherproof',
];

export const CatalogView: React.FC<CatalogViewProps> = ({
  activeCategory,
  onSelectCategory,
  onSelectProduct,
  onOpenConsultation,
}) => {
  const { lang, products, units } = useShowroom();
  const [search, setSearch] = useState('');
  const [material, setMaterial] = useState('All');
  const [maxPrice, setMaxPrice] = useState(200000);
  const [availability, setAvailability] = useState<'all' | 'in_stock' | 'low_stock'>('all');
  const [unitFilter, setUnitFilter] = useState('all');

  const getPrimaryStockUnit = (p: Product) => {
    for (const u of units) {
      if ((p.unitStock[u.id] ?? 0) > 0) {
        return { unit: u, qty: p.unitStock[u.id] };
      }
    }
    return null;
  };

  const getTotalShowroomStock = (p: Product) =>
    Object.values(p.unitStock).reduce((sum, n) => sum + n, 0);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      if (activeCategory !== 'All' && p.category !== activeCategory) return false;
      if (material !== 'All' && p.materialGroup !== material) return false;
      if (p.price > maxPrice) return false;

      if (unitFilter !== 'all') {
        if ((p.unitStock[unitFilter] ?? 0) <= 0) return false;
      }

      const totalStock = getTotalShowroomStock(p) + p.warehouseStock;
      if (availability === 'in_stock' && getTotalShowroomStock(p) === 0) return false;
      if (availability === 'low_stock' && totalStock > p.reorderLevel) return false;

      if (search.trim()) {
        const q = search.toLowerCase();
        const hay = `${p.nameEn} ${p.nameZh} ${p.pinyin} ${p.sku} ${p.materialEn} ${p.materialZh}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }

      return true;
    });
  }, [products, activeCategory, material, maxPrice, availability, unitFilter, search]);

  const resetFilters = () => {
    onSelectCategory('All');
    setSearch('');
    setMaterial('All');
    setMaxPrice(200000);
    setAvailability('all');
    setUnitFilter('all');
  };

  const heroProduct = products[0];

  return (
    <div>
      {/* Editorial Hero Split */}
      <section className="border-b border-[#E3DACD] bg-[#F2ECE3]/60">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 md:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs font-medium tracking-wider uppercase text-[#8A6240]">
              {t(lang, 'heroKicker')}
            </p>
            <h1 className="font-serif-display text-4xl md:text-5xl font-semibold text-[#241913] leading-[1.08] text-balance">
              {t(lang, 'heroTitle')}
            </h1>
            <p className="text-base text-[#63554A] leading-relaxed max-w-xl">
              {t(lang, 'heroSubtitle')}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-4">
              <a
                href="#catalog-grid"
                className="px-6 py-3 bg-[#3D281D] hover:bg-[#2A1B13] text-[#FAF8F5] text-sm font-medium transition-colors whitespace-nowrap"
              >
                {t(lang, 'exploreCatalog')}
              </a>
              <button
                onClick={() => onOpenConsultation('Developer')}
                className="px-6 py-3 border border-[#3D281D] text-[#3D281D] hover:bg-[#3D281D] hover:text-[#FAF8F5] text-sm font-medium transition-colors whitespace-nowrap inline-flex items-center gap-2"
              >
                <span>{t(lang, 'requestStaging')}</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col">
            <button
              onClick={() => onSelectProduct(heroProduct)}
              className="group relative flex-1 min-h-[280px] border border-[#E3DACD] bg-[#EFE7DB] overflow-hidden text-left"
            >
              <FurnitureIllustration
                silhouette={heroProduct.silhouette}
                colorHex={heroProduct.colors[0].hex}
                angle="perspective"
                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 p-5 bg-gradient-to-t from-[#241913]/75 via-[#241913]/35 to-transparent text-[#FAF8F5] flex items-end justify-between gap-4">
                <div>
                  <div className="text-xs text-[#E3DACD]">
                    {CATEGORY_LABELS[heroProduct.category][lang]} · {heroProduct.sku}
                  </div>
                  <div className="font-serif-display text-2xl font-medium">
                    {lang === 'en' ? heroProduct.nameEn : heroProduct.nameZh}
                  </div>
                </div>
                <div className="font-mono-tabular text-sm font-medium whitespace-nowrap">
                  {formatPHP(heroProduct.price)}
                </div>
              </div>
            </button>
          </div>
        </div>
      </section>

      {/* Catalog Controls & Grid */}
      <section id="catalog-grid" className="max-w-7xl mx-auto px-4 md:px-8 py-10 space-y-8">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-5 border-b border-[#E3DACD]">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {CATEGORIES.map((cat) => {
              const active = activeCategory === cat;
              const label = cat === 'All' ? t(lang, 'allCategories') : CATEGORY_LABELS[cat][lang];
              return (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium whitespace-nowrap shrink-0 transition-colors ${
                    active
                      ? 'bg-[#3D281D] text-[#FAF8F5]'
                      : 'text-[#63554A] hover:text-[#241913] hover:bg-[#F2ECE3]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>

          <div className="relative w-full lg:w-80 shrink-0">
            <Search className="w-4 h-4 text-[#8C7D70] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t(lang, 'searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 bg-white border border-[#E3DACD] text-sm text-[#241913] placeholder:text-[#8C7D70] focus:outline-none focus:border-[#3D281D]"
            />
          </div>
        </div>

        {/* Multi-Facet Filter Bar */}
        <div className="bg-[#F2ECE3]/70 border border-[#E3DACD] p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end">
          <div>
            <label className="block text-xs font-medium text-[#63554A] mb-1.5">
              {t(lang, 'materialFilter')}
            </label>
            <select
              value={material}
              onChange={(e) => setMaterial(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm text-[#241913] focus:outline-none focus:border-[#3D281D]"
            >
              {MATERIAL_GROUPS.map((m) => (
                <option key={m} value={m}>
                  {MATERIAL_GROUP_LABELS[m][lang]}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#63554A] mb-1.5">
              {t(lang, 'showroomUnitFilter')}
            </label>
            <select
              value={unitFilter}
              onChange={(e) => setUnitFilter(e.target.value)}
              className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm text-[#241913] focus:outline-none focus:border-[#3D281D]"
            >
              <option value="all">{t(lang, 'allUnits')}</option>
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {lang === 'en' ? u.shortNameEn : u.shortNameZh}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-[#63554A] mb-1.5">
              {t(lang, 'availabilityFilter')}
            </label>
            <select
              value={availability}
              onChange={(e) => setAvailability(e.target.value as 'all' | 'in_stock' | 'low_stock')}
              className="w-full px-3 py-2 bg-white border border-[#E3DACD] text-sm text-[#241913] focus:outline-none focus:border-[#3D281D]"
            >
              <option value="all">{t(lang, 'allAvailability')}</option>
              <option value="in_stock">{t(lang, 'inStockOnly')}</option>
              <option value="low_stock">{t(lang, 'lowStockOnly')}</option>
            </select>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-medium text-[#63554A] mb-1.5">
              <span>{t(lang, 'priceRange')}</span>
              <span className="font-mono-tabular text-[#241913]">{formatPHP(maxPrice)}</span>
            </div>
            <input
              type="range"
              min={20000}
              max={200000}
              step={5000}
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
              className="w-full accent-[#3D281D] cursor-pointer"
            />
          </div>

          <div className="flex items-center justify-between lg:justify-end gap-3">
            <span className="text-xs text-[#63554A] tabular-nums">
              {t(lang, 'showingResults')}{' '}
              <strong className="text-[#241913]">{filteredProducts.length}</strong>{' '}
              {t(lang, 'piecesLabel')}
            </span>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#3D281D] border border-[#D4C8B8] bg-white hover:bg-[#FAF8F5] transition-colors whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t(lang, 'clearFilters')}</span>
            </button>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <div className="py-20 text-center border border-[#E3DACD] bg-[#F2ECE3]/40 space-y-3">
            <SlidersHorizontal className="w-6 h-6 mx-auto text-[#8C7D70]" />
            <p className="font-serif-display text-2xl text-[#241913]">
              {t(lang, 'noCatalogMatch')}
            </p>
            <button
              onClick={resetFilters}
              className="px-5 py-2 bg-[#3D281D] text-[#FAF8F5] text-xs font-medium"
            >
              {t(lang, 'clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
            {filteredProducts.map((product) => {
              const primaryStock =
                unitFilter !== 'all' && (product.unitStock[unitFilter] ?? 0) > 0
                  ? {
                      unit: units.find((u) => u.id === unitFilter)!,
                      qty: product.unitStock[unitFilter],
                    }
                  : getPrimaryStockUnit(product);

              return (
                <article
                  key={product.id}
                  onClick={() => onSelectProduct(product)}
                  className="group cursor-pointer bg-white border border-[#E3DACD] hover:border-[#8A6240] transition-all duration-200 hover:-translate-y-0.5 flex flex-col"
                >
                  <div className="aspect-[4/3] bg-[#EFE7DB] overflow-hidden border-b border-[#E3DACD]">
                    <FurnitureIllustration
                      silhouette={product.silhouette}
                      colorHex={product.colors[0].hex}
                      angle="front"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    />
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="text-xs text-[#8C7D70] flex items-center gap-1.5 truncate">
                        <span>{CATEGORY_LABELS[product.category][lang]}</span>
                        <span aria-hidden="true">·</span>
                        <span className="truncate">
                          {lang === 'en' ? product.materialEn : product.materialZh}
                        </span>
                      </div>
                      <h3 className="font-serif-display text-xl font-semibold text-[#241913] leading-snug group-hover:text-[#3D281D]">
                        {lang === 'en' ? product.nameEn : product.nameZh}
                      </h3>
                    </div>

                    <div className="pt-3 border-t border-[#F2ECE3] flex items-center justify-between gap-2">
                      <span className="font-mono-tabular text-base font-medium text-[#241913]">
                        {formatPHP(product.price)}
                      </span>
                      <span className="text-xs text-[#63554A] truncate">
                        {primaryStock
                          ? `${t(lang, 'inStockAt')} ${
                              lang === 'en'
                                ? primaryStock.unit.shortNameEn
                                : primaryStock.unit.shortNameZh
                            }`
                          : t(lang, 'outOfStockFloor')}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};
