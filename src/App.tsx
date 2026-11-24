import React, { useState } from 'react';
import { ShowroomProvider, useShowroom } from './context/ShowroomContext';
import { ToastContainer } from './components/common/ToastContainer';
import { CustomerLayout } from './components/customer/CustomerLayout';
import { CatalogView } from './components/customer/CatalogView';
import { ProductDetailModal } from './components/customer/ProductDetailModal';
import { ReservationModal } from './components/customer/ReservationModal';
import { ConsultationModal } from './components/customer/ConsultationModal';
import { StaffLayout } from './components/staff/StaffLayout';
import { DashboardView } from './components/staff/DashboardView';
import { InventoryView } from './components/staff/InventoryView';
import { PosView } from './components/staff/PosView';
import { CrmView } from './components/staff/CrmView';
import { ProposalsView } from './components/staff/ProposalsView';
import { DeliveriesView } from './components/staff/DeliveriesView';
import { SettingsView } from './components/staff/SettingsView';
import { Product, ProductCategory } from './types/showroom';

const ShowroomAppShell: React.FC = () => {
  const { role, staffPage } = useShowroom();

  // Customer Storefront UI state
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'All'>('All');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [reserveTarget, setReserveTarget] = useState<{
    product: Product;
    colorNameEn: string;
    unitId: string;
  } | null>(null);
  const [consultationModal, setConsultationModal] = useState<{
    open: boolean;
    type: 'Homeowner' | 'Developer';
    product?: Product | null;
  }>({ open: false, type: 'Homeowner', product: null });

  const handleOpenConsultation = (
    type: 'Homeowner' | 'Developer' = 'Homeowner',
    product: Product | null = null
  ) => {
    setSelectedProduct(null);
    setConsultationModal({ open: true, type, product });
  };

  const renderStaffPage = () => {
    // Role-based guardrails
    if (role === 'warehouse') {
      return staffPage === 'deliveries' ? <DeliveriesView /> : <InventoryView />;
    }
    if (role === 'sales') {
      switch (staffPage) {
        case 'inventory':
          return <InventoryView />;
        case 'pos':
          return <PosView />;
        case 'crm':
          return <CrmView />;
        case 'proposals':
          return <ProposalsView />;
        case 'deliveries':
          return <DeliveriesView />;
        case 'dashboard':
        default:
          return <DashboardView />;
      }
    }
    // Admin has full access
    switch (staffPage) {
      case 'inventory':
        return <InventoryView />;
      case 'pos':
        return <PosView />;
      case 'crm':
        return <CrmView />;
      case 'proposals':
        return <ProposalsView />;
      case 'deliveries':
        return <DeliveriesView />;
      case 'settings':
        return <SettingsView />;
      case 'dashboard':
      default:
        return <DashboardView />;
    }
  };

  if (role !== 'customer') {
    return (
      <>
        <StaffLayout>{renderStaffPage()}</StaffLayout>
        <ToastContainer />
      </>
    );
  }

  return (
    <>
      <CustomerLayout
        activeCategory={activeCategory}
        onSelectCategory={(cat) => {
          setActiveCategory(cat);
          const el = document.getElementById('catalog-grid');
          if (el) el.scrollIntoView({ behavior: 'smooth' });
        }}
        onOpenConsultation={(type) => handleOpenConsultation(type, null)}
      >
        <CatalogView
          activeCategory={activeCategory}
          onSelectCategory={setActiveCategory}
          onSelectProduct={(p) => setSelectedProduct(p)}
          onOpenConsultation={(type) => handleOpenConsultation(type, null)}
        />
      </CustomerLayout>

      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onReserve={(product, colorNameEn, unitId) => {
            setSelectedProduct(null);
            setReserveTarget({ product, colorNameEn, unitId });
          }}
          onBookConsultation={(product) => handleOpenConsultation('Homeowner', product)}
        />
      )}

      {reserveTarget && (
        <ReservationModal
          product={reserveTarget.product}
          initialColorNameEn={reserveTarget.colorNameEn}
          initialUnitId={reserveTarget.unitId}
          onClose={() => setReserveTarget(null)}
        />
      )}

      {consultationModal.open && (
        <ConsultationModal
          initialType={consultationModal.type}
          referencedProduct={consultationModal.product}
          onClose={() =>
            setConsultationModal({ open: false, type: 'Homeowner', product: null })
          }
        />
      )}

      <ToastContainer />
    </>
  );
};

export default function App() {
  return (
    <ShowroomProvider>
      <ShowroomAppShell />
    </ShowroomProvider>
  );
}
