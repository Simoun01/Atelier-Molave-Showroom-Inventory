import React, { useMemo } from 'react';
import { ArrowRight } from 'lucide-react';
import { useShowroom } from '../../context/ShowroomContext';
import { TODAY_ISO } from '../../data/mockDatabase';
import {
  CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
  formatPHP,
  formatTimestamp,
  t,
} from '../../i18n/translations';
import { ProductCategory } from '../../types/showroom';
import { BilingualName } from '../common/BilingualName';

export const DashboardView: React.FC = () => {
  const {
    lang,
    sales,
    reservations,
    products,
    clients,
    deliveries,
    setStaffPage,
  } = useShowroom();

  const metrics = useMemo(() => {
    const todaySalesList = sales.filter((s) => s.date === TODAY_ISO);
    const todaySalesTotal = todaySalesList.reduce((sum, s) => sum + s.total, 0);
    const activeResCount = reservations.filter((r) => r.status === 'Active').length;
    const lowStockCount = products.filter((p) => {
      const floor = Object.values(p.unitStock).reduce((a, b) => a + b, 0);
      return floor + p.warehouseStock <= p.reorderLevel;
    }).length;
    const openLeadsCount = clients.filter(
      (c) => c.stage !== 'Won' && c.stage !== 'Lost'
    ).length;
    const scheduledDeliveriesCount = deliveries.filter(
      (d) => d.status === 'Scheduled' || d.status === 'Out for Delivery'
    ).length;

    return {
      todaySalesTotal,
      todayOrdersCount: todaySalesList.length,
      activeResCount,
      lowStockCount,
      openLeadsCount,
      scheduledDeliveriesCount,
    };
  }, [sales, reservations, products, clients, deliveries]);

  const categorySales = useMemo(() => {
    const cats: ProductCategory[] = ['Living', 'Dining', 'Bedroom', 'Office', 'Outdoor'];
    const totals: Record<ProductCategory, number> = {
      Living: 0,
      Dining: 0,
      Bedroom: 0,
      Office: 0,
      Outdoor: 0,
    };

    for (const p of products) {
      totals[p.category] += p.soldCount * p.price * 0.12;
    }
    for (const s of sales) {
      for (const item of s.items) {
        const prod = products.find((p) => p.id === item.productId);
        if (prod) {
          totals[prod.category] += item.unitPrice * item.quantity;
        }
      }
    }

    const maxVal = Math.max(1, ...Object.values(totals));
    return cats.map((cat) => ({
      cat,
      amount: Math.round(totals[cat]),
      percent: Math.round((totals[cat] / maxVal) * 100),
    }));
  }, [products, sales]);

  const topProducts = useMemo(() => {
    return [...products]
      .sort((a, b) => b.soldCount * b.price - a.soldCount * a.price)
      .slice(0, 6);
  }, [products]);

  const kpiCards = [
    {
      label: t(lang, 'todaySales'),
      value: formatPHP(metrics.todaySalesTotal),
      sub: `${metrics.todayOrdersCount} ${t(lang, 'ordersTodayLabel')}`,
      page: 'pos' as const,
    },
    {
      label: t(lang, 'activeReservations'),
      value: String(metrics.activeResCount),
      sub: t(lang, 'downpaymentsLocked'),
      page: 'pos' as const,
    },
    {
      label: t(lang, 'lowStockItems'),
      value: String(metrics.lowStockCount),
      sub: t(lang, 'belowReorder'),
      page: 'inventory' as const,
      alert: metrics.lowStockCount > 0,
    },
    {
      label: t(lang, 'openLeads'),
      value: String(metrics.openLeadsCount),
      sub: t(lang, 'retailDevPipeline'),
      page: 'crm' as const,
    },
    {
      label: t(lang, 'deliveriesScheduled'),
      value: String(metrics.scheduledDeliveriesCount),
      sub: t(lang, 'upcomingDispatch'),
      page: 'deliveries' as const,
    },
  ];

  return (
    <div className="space-y-8">
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {kpiCards.map((card) => (
          <button
            key={card.label}
            onClick={() => setStaffPage(card.page)}
            className="text-left bg-white border border-[#E3DACD] hover:border-[#8A6240] p-5 transition-colors flex flex-col justify-between gap-3"
          >
            <div className="text-xs font-medium text-[#63554A]">{card.label}</div>
            <div
              className={`font-mono-tabular text-2xl font-semibold ${
                card.alert ? 'text-[#B45309]' : 'text-[#241913]'
              }`}
            >
              {card.value}
            </div>
            <div className="text-xs text-[#8C7D70] flex items-center justify-between">
              <span>{card.sub}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </button>
        ))}
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <section className="lg:col-span-6 bg-white border border-[#E3DACD] p-6 space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE3]">
            <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
              {t(lang, 'salesByCategory')}
            </h2>
            <span className="text-xs text-[#8C7D70]">{t(lang, 'currencyPhpLabel')}</span>
          </div>

          <div className="space-y-4">
            {categorySales.map((row) => (
              <div key={row.cat} className="space-y-1.5">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium text-[#241913]">
                    {CATEGORY_LABELS[row.cat][lang]}
                  </span>
                  <span className="font-mono-tabular text-[#3D281D] font-medium">
                    {formatPHP(row.amount)}
                  </span>
                </div>
                <div className="h-3 bg-[#F2ECE3] w-full overflow-hidden">
                  <div
                    className="h-full bg-[#3D281D] transition-all duration-500"
                    style={{ width: `${row.percent}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="lg:col-span-6 bg-white border border-[#E3DACD] p-6 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE3]">
            <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
              {t(lang, 'topSellingProducts')}
            </h2>
            <button
              onClick={() => setStaffPage('inventory')}
              className="text-xs font-medium text-[#3D281D] underline underline-offset-4"
            >
              {t(lang, 'navInventory')}
            </button>
          </div>

          <div className="divide-y divide-[#F2ECE3]">
            {topProducts.map((p, idx) => (
              <div key={p.id} className="py-2.5 flex items-center justify-between gap-4 text-sm">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="font-mono-tabular text-xs text-[#8C7D70] w-5">
                    0{idx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className="font-medium text-[#241913] truncate">
                      {lang === 'en' ? p.nameEn : p.nameZh}
                    </div>
                    <div className="text-xs text-[#8C7D70]">
                      {p.sku} · {CATEGORY_LABELS[p.category][lang]}
                    </div>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <div className="font-mono-tabular font-medium text-[#241913]">
                    {formatPHP(p.price * p.soldCount)}
                  </div>
                  <div className="font-mono-tabular text-xs text-[#63554A]">
                    {p.soldCount} {t(lang, 'unitsSold')}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      <section className="bg-white border border-[#E3DACD] p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#F2ECE3]">
          <h2 className="font-serif-display text-2xl font-semibold text-[#241913]">
            {t(lang, 'recentTransactions')}
          </h2>
          <button
            onClick={() => setStaffPage('pos')}
            className="text-xs font-medium text-[#3D281D] underline underline-offset-4"
          >
            {t(lang, 'navPos')}
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead>
              <tr className="border-b border-[#E3DACD] text-xs text-[#63554A]">
                <th className="py-2.5 pr-4 font-medium">{t(lang, 'receiptNo')}</th>
                <th className="py-2.5 pr-4 font-medium">{t(lang, 'customerName')}</th>
                <th className="py-2.5 pr-4 font-medium">{t(lang, 'paymentMethod')}</th>
                <th className="py-2.5 pr-4 font-medium">{t(lang, 'timestamp')}</th>
                <th className="py-2.5 text-right font-medium">{t(lang, 'total')}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F2ECE3]">
              {sales.slice(0, 6).map((sale) => (
                <tr key={sale.id} className="hover:bg-[#FAF8F5]">
                  <td className="py-2.5 pr-4 font-mono-tabular text-xs text-[#3D281D]">
                    {sale.receiptNo}
                  </td>
                  <td className="py-2.5 pr-4">
                    <BilingualName
                      nameEn={sale.customerNameEn}
                      nameZh={sale.customerNameZh}
                      primaryClassName="font-medium text-[#241913]"
                    />
                  </td>
                  <td className="py-2.5 pr-4 text-[#63554A]">
                    {PAYMENT_METHOD_LABELS[sale.paymentMethod][lang]}
                  </td>
                  <td className="py-2.5 pr-4 font-mono-tabular text-xs text-[#8C7D70]">
                    {formatTimestamp(sale.timestamp, lang)}
                  </td>
                  <td className="py-2.5 text-right font-mono-tabular font-medium text-[#241913]">
                    {formatPHP(sale.total)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
