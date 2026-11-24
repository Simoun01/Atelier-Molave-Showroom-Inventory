import React, { useState } from 'react';
import { X, Check, MapPin, Ruler, Layers } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { CATEGORY_LABELS, formatDimensions, formatPHP, t } from '../../i18n/translations';
import { Product } from '../../types/showroom';
import { FurnitureIllustration } from '../common/FurnitureIllustration';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onReserve: (product: Product, colorNameEn: string, preferredUnitId: string) => void;
  onBookConsultation: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onReserve,
  onBookConsultation,
}) => {
  const { lang, units } = useShowroom();
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedAngle, setSelectedAngle] = useState<'front' | 'perspective' | 'detail'>('front');

  const firstAvailableUnit =
    units.find((u) => (product.unitStock[u.id] ?? 0) > 0)?.id ?? units[0].id;
  const [selectedUnitId, setSelectedUnitId] = useState(firstAvailableUnit);

  const selectedColor = product.colors[selectedColorIdx] ?? product.colors[0];

  const angles: Array<{ id: 'front' | 'perspective' | 'detail'; label: string }> = [
    { id: 'front', label: t(lang, 'angleFront') },
    { id: 'perspective', label: t(lang, 'anglePerspective') },
    { id: 'detail', label: t(lang, 'angleDetail') },
  ];

  return (
    <div className="fixed inset-0 z-40 bg-[#241913]/60 backdrop-blur-[2px] flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#FAF8F5] border border-[#E3DACD] max-w-5xl w-full max-h-[92vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 z-10 bg-[#FAF8F5] border-b border-[#E3DACD] px-6 py-4 flex items-center justify-between">
          <div className="text-xs text-[#63554A] flex items-center gap-2">
            <span>{CATEGORY_LABELS[product.category][lang]}</span>
            <span aria-hidden="true">/</span>
            <span className="font-mono-tabular">{product.sku}</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#63554A] hover:text-[#241913] transition-colors"
            aria-label={t(lang, 'close')}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-[4/3] bg-[#EFE7DB] border border-[#E3DACD] overflow-hidden">
              <FurnitureIllustration
                silhouette={product.silhouette}
                colorHex={selectedColor.hex}
                angle={selectedAngle}
                className="w-full h-full object-cover"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              {angles.map((ang) => (
                <button
                  key={ang.id}
                  onClick={() => setSelectedAngle(ang.id)}
                  className={`border text-left transition-all ${
                    selectedAngle === ang.id
                      ? 'border-[#3D281D] bg-white'
                      : 'border-[#E3DACD] bg-[#F2ECE3]/60 hover:border-[#8A6240]'
                  }`}
                >
                  <div className="aspect-[4/3] overflow-hidden">
                    <FurnitureIllustration
                      silhouette={product.silhouette}
                      colorHex={selectedColor.hex}
                      angle={ang.id}
                      className="w-full h-full"
                    />
                  </div>
                  <div className="px-2.5 py-1.5 text-[11px] font-medium text-[#63554A]">
                    {ang.label}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="space-y-2 pb-5 border-b border-[#E3DACD]">
              <h2 className="font-serif-display text-3xl font-semibold text-[#241913] leading-tight">
                {lang === 'en' ? product.nameEn : product.nameZh}
              </h2>
              <div className="font-mono-tabular text-2xl font-medium text-[#3D281D]">
                {formatPHP(product.price)}
              </div>
              <p className="text-sm text-[#63554A] leading-relaxed pt-1">
                {lang === 'en' ? product.descriptionEn : product.descriptionZh}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3 text-sm">
              <div className="flex items-start gap-3">
                <Ruler className="w-4 h-4 text-[#8A6240] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-[#8C7D70]">{t(lang, 'dimensions')}</div>
                  <div className="font-mono-tabular text-[#241913]">
                    {formatDimensions(product.dimensions, lang)}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Layers className="w-4 h-4 text-[#8A6240] mt-0.5 shrink-0" />
                <div>
                  <div className="text-xs text-[#8C7D70]">{t(lang, 'materials')}</div>
                  <div className="text-[#241913]">
                    {lang === 'en' ? product.materialEn : product.materialZh}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="text-xs font-medium text-[#63554A]">
                {t(lang, 'availableFinishes')}：{' '}
                <span className="text-[#241913]">
                  {lang === 'en' ? selectedColor.nameEn : selectedColor.nameZh}
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {product.colors.map((c, idx) => (
                  <button
                    key={c.nameEn}
                    onClick={() => setSelectedColorIdx(idx)}
                    className={`flex items-center gap-2 px-3 py-1.5 border text-xs transition-colors ${
                      idx === selectedColorIdx
                        ? 'border-[#3D281D] bg-white font-medium text-[#241913]'
                        : 'border-[#E3DACD] bg-[#F2ECE3]/60 text-[#63554A] hover:border-[#8A6240]'
                    }`}
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full border border-black/20 shrink-0"
                      style={{ backgroundColor: c.hex }}
                    />
                    <span>{lang === 'en' ? c.nameEn : c.nameZh}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-[#63554A]">
                <MapPin className="w-3.5 h-3.5 text-[#8A6240]" />
                <span>{t(lang, 'showroomAvailability')}</span>
              </div>
              <div className="border border-[#E3DACD] bg-white divide-y divide-[#F2ECE3]">
                {units.map((u) => {
                  const qty = product.unitStock[u.id] ?? 0;
                  const selected = selectedUnitId === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => setSelectedUnitId(u.id)}
                      className={`w-full px-3.5 py-2 flex items-center justify-between text-xs text-left transition-colors ${
                        selected ? 'bg-[#F2ECE3] font-medium' : 'hover:bg-[#FAF8F5]'
                      }`}
                    >
                      <span className="flex items-center gap-2 text-[#241913]">
                        {selected && <Check className="w-3.5 h-3.5 text-[#3D281D]" />}
                        <span>{lang === 'en' ? u.nameEn : u.nameZh}</span>
                      </span>
                      <span
                        className={`font-mono-tabular ${
                          qty > 0 ? 'text-[#1F6E43]' : 'text-[#8C7D70]'
                        }`}
                      >
                        {qty > 0 ? `${qty} ${t(lang, 'unitsLeft')}` : t(lang, 'outOfStock')}
                      </span>
                    </button>
                  );
                })}
                <div className="px-3.5 py-2 flex items-center justify-between text-xs bg-[#FAF8F5] text-[#63554A]">
                  <span>{t(lang, 'centralWarehouse')}</span>
                  <span className="font-mono-tabular font-medium text-[#241913]">
                    {product.warehouseStock} {t(lang, 'unitsLeft')}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-3">
              <button
                onClick={() => onReserve(product, selectedColor.nameEn, selectedUnitId)}
                className="w-full py-3.5 px-5 bg-[#3D281D] hover:bg-[#2A1B13] text-[#FAF8F5] text-sm font-medium transition-colors"
              >
                {t(lang, 'reserveDownpayment')}
              </button>
              <button
                onClick={() => onBookConsultation(product)}
                className="w-full py-3 px-5 border border-[#3D281D] text-[#3D281D] hover:bg-[#F2ECE3] text-sm font-medium transition-colors"
              >
                {t(lang, 'bookDesignConsult')}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
