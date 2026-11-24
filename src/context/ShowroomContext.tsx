import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import {
  INITIAL_CATEGORIES,
  INITIAL_CLIENTS,
  INITIAL_DELIVERIES,
  INITIAL_PAYMENT_METHODS,
  INITIAL_PRODUCTS,
  INITIAL_PROPOSALS,
  INITIAL_RESERVATIONS,
  INITIAL_SALES,
  INITIAL_STAFF,
  INITIAL_STOCK_LOGS,
  INITIAL_UNITS,
  TODAY_ISO,
} from '../data/mockDatabase';
import {
  CREW_OPTIONS,
  DELIVERY_STATUS_LABELS,
  PROPOSAL_STATUS_LABELS,
  STAGE_LABELS,
  STOCK_LOG_TYPE_LABELS,
  TRUCK_OPTIONS,
  t,
} from '../i18n/translations';
import {
  CategorySetting,
  Client,
  CRMStage,
  DeliveryJob,
  DeliveryStatus,
  Language,
  PaymentMethod,
  PaymentMethodConfig,
  Product,
  ProductCategory,
  Proposal,
  ProposalPackage,
  Reservation,
  SaleLineItem,
  SaleTransaction,
  ShowroomUnit,
  StaffAccount,
  StaffPage,
  StaffRole,
  StockLogEntry,
  UserRole,
} from '../types/showroom';

export interface ToastItem {
  id: string;
  message: string;
  tone?: 'success' | 'info' | 'warning';
}

interface ShowroomState {
  units: ShowroomUnit[];
  products: Product[];
  clients: Client[];
  reservations: Reservation[];
  sales: SaleTransaction[];
  proposals: Proposal[];
  stockLogs: StockLogEntry[];
  deliveries: DeliveryJob[];
  categories: CategorySetting[];
  paymentMethods: PaymentMethodConfig[];
  staffAccounts: StaffAccount[];
}

const STORAGE_KEY = 'atelier_molave_showroom_v1';
const LANG_STORAGE_KEY = 'atelier_molave_lang_v1';

function migrateShowroomState(parsed: Partial<ShowroomState>): ShowroomState {
  const unitMap = new Map(INITIAL_UNITS.map((u) => [u.id, u]));
  const prodMap = new Map(INITIAL_PRODUCTS.map((p) => [p.id, p]));
  const clientMap = new Map(INITIAL_CLIENTS.map((c) => [c.id, c]));
  const resMap = new Map(INITIAL_RESERVATIONS.map((r) => [r.id, r]));
  const saleMap = new Map(INITIAL_SALES.map((s) => [s.id, s]));
  const propMap = new Map(INITIAL_PROPOSALS.map((p) => [p.id, p]));
  const logMap = new Map(INITIAL_STOCK_LOGS.map((l) => [l.id, l]));
  const delMap = new Map(INITIAL_DELIVERIES.map((d) => [d.id, d]));
  const pmMap = new Map(INITIAL_PAYMENT_METHODS.map((pm) => [pm.id, pm]));
  const staffMap = new Map(INITIAL_STAFF.map((st) => [st.id, st]));

  const units: ShowroomUnit[] = (parsed.units ?? INITIAL_UNITS).map((u) => {
    const seed = unitMap.get(u.id);
    return {
      ...u,
      codeZh: u.codeZh || seed?.codeZh || u.code,
      addressZh: u.addressZh || seed?.addressZh || u.address,
      managerZh: u.managerZh || seed?.managerZh || u.manager,
    };
  });

  const products: Product[] = (parsed.products ?? INITIAL_PRODUCTS).map((p) => {
    const seed = prodMap.get(p.id);
    return {
      ...p,
      pinyin: p.pinyin || seed?.pinyin || '',
    };
  });

  const clients: Client[] = (parsed.clients ?? INITIAL_CLIENTS).map((c) => {
    const seed = clientMap.get(c.id);
    const nameEn = c.nameEn || c.name || seed?.nameEn || '';
    const nameZh = c.nameZh || seed?.nameZh || nameEn;
    return {
      ...c,
      name: nameEn,
      nameEn,
      nameZh,
      pinyin: c.pinyin || seed?.pinyin || nameEn.toLowerCase(),
      companyZh: c.companyZh || seed?.companyZh || c.company,
      locationZh: c.locationZh || seed?.locationZh || c.location,
      assignedStaffZh: c.assignedStaffZh || seed?.assignedStaffZh || c.assignedStaff,
      notes: (c.notes ?? []).map((n) => {
        const seedNote = seed?.notes.find((sn) => sn.id === n.id);
        return {
          ...n,
          authorZh: n.authorZh || seedNote?.authorZh || n.author,
          textZh: n.textZh || seedNote?.textZh || n.text,
        };
      }),
      reminders: (c.reminders ?? []).map((r) => {
        const seedRem = seed?.reminders.find((sr) => sr.id === r.id);
        return {
          ...r,
          titleZh: r.titleZh || seedRem?.titleZh || r.title,
        };
      }),
    };
  });

  const reservations: Reservation[] = (parsed.reservations ?? INITIAL_RESERVATIONS).map((r) => {
    const seed = resMap.get(r.id);
    const matchedClient = clients.find(
      (c) => c.id === r.clientId || c.nameEn === r.customerName
    );
    const prod = prodMap.get(r.productId);
    const matchedColor = prod?.colors.find((col) => col.nameEn === r.colorNameEn);
    return {
      ...r,
      customerNameEn: r.customerNameEn || r.customerName || seed?.customerNameEn || '',
      customerNameZh:
        r.customerNameZh || seed?.customerNameZh || matchedClient?.nameZh || r.customerName,
      customerAddressZh:
        r.customerAddressZh || seed?.customerAddressZh || r.customerAddress,
      colorNameZh: r.colorNameZh || seed?.colorNameZh || matchedColor?.nameZh || r.colorNameEn,
    };
  });

  const sales: SaleTransaction[] = (parsed.sales ?? INITIAL_SALES).map((s) => {
    const seed = saleMap.get(s.id);
    const matchedClient = clients.find(
      (c) => c.id === s.clientId || c.nameEn === s.customerName
    );
    const matchedStaff = INITIAL_STAFF.find((st) => st.nameEn === s.staffName);
    return {
      ...s,
      customerNameEn: s.customerNameEn || s.customerName || seed?.customerNameEn || '',
      customerNameZh:
        s.customerNameZh ||
        seed?.customerNameZh ||
        matchedClient?.nameZh ||
        (s.customerName === 'Walk-In Showroom Guest' || s.customerName === 'Showroom Walk-In Guest'
          ? '展厅散客'
          : s.customerName),
      staffNameZh: s.staffNameZh || seed?.staffNameZh || matchedStaff?.nameZh || s.staffName,
    };
  });

  const proposals: Proposal[] = (parsed.proposals ?? INITIAL_PROPOSALS).map((pr) => {
    const seed = propMap.get(pr.id);
    const matchedClient = clients.find((c) => c.id === pr.clientId);
    return {
      ...pr,
      titleZh: pr.titleZh || seed?.titleZh || pr.title,
      clientNameZh: pr.clientNameZh || seed?.clientNameZh || matchedClient?.nameZh || pr.clientName,
      companyNameZh:
        pr.companyNameZh || seed?.companyNameZh || matchedClient?.companyZh || pr.companyName,
      projectLocationZh:
        pr.projectLocationZh || seed?.projectLocationZh || pr.projectLocation,
      notesZh: pr.notesZh || seed?.notesZh || pr.notes,
      packages: (pr.packages ?? []).map((pk) => {
        const seedPk = seed?.packages.find((sp) => sp.id === pk.id);
        return {
          ...pk,
          roomTypeZh: pk.roomTypeZh || seedPk?.roomTypeZh || pk.roomType,
        };
      }),
    };
  });

  const stockLogs: StockLogEntry[] = (parsed.stockLogs ?? INITIAL_STOCK_LOGS).map((l) => {
    const seed = logMap.get(l.id);
    const prod = prodMap.get(l.productId);
    const matchedStaff = INITIAL_STAFF.find((st) => st.nameEn === l.performedBy);
    return {
      ...l,
      productNameZh: l.productNameZh || seed?.productNameZh || prod?.nameZh || l.productNameEn,
      fromLocationZh: l.fromLocationZh || seed?.fromLocationZh || l.fromLocation,
      toLocationZh: l.toLocationZh || seed?.toLocationZh || l.toLocation,
      performedByZh: l.performedByZh || seed?.performedByZh || matchedStaff?.nameZh || l.performedBy,
      noteZh: l.noteZh || seed?.noteZh || l.note,
    };
  });

  const deliveries: DeliveryJob[] = (parsed.deliveries ?? INITIAL_DELIVERIES).map((d) => {
    const seed = delMap.get(d.id);
    const matchedTruck = TRUCK_OPTIONS.find((tr) => tr.en === d.truck);
    const matchedCrew = CREW_OPTIONS.find((cr) => cr.en === d.crew);
    return {
      ...d,
      customerOrProjectZh:
        d.customerOrProjectZh || seed?.customerOrProjectZh || d.customerOrProject,
      addressZh: d.addressZh || seed?.addressZh || d.address,
      itemsSummaryZh: d.itemsSummaryZh || seed?.itemsSummaryZh || d.itemsSummary,
      truckZh: d.truckZh || seed?.truckZh || matchedTruck?.zh || d.truck,
      crewZh:
        d.crewZh ||
        seed?.crewZh ||
        matchedCrew?.zh ||
        (d.crew === 'Unassigned Crew' ? '待指派安装组' : d.crew),
    };
  });

  const paymentMethods: PaymentMethodConfig[] = (
    parsed.paymentMethods ?? INITIAL_PAYMENT_METHODS
  ).map((pm) => {
    const seed = pmMap.get(pm.id);
    return {
      ...pm,
      accountInfoZh: pm.accountInfoZh || seed?.accountInfoZh || pm.accountInfo,
    };
  });

  const staffAccounts: StaffAccount[] = (parsed.staffAccounts ?? INITIAL_STAFF).map((st) => {
    const seed = staffMap.get(st.id);
    const nameEn = st.nameEn || st.name || seed?.nameEn || '';
    const nameZh = st.nameZh || seed?.nameZh || nameEn;
    return {
      ...st,
      name: nameEn,
      nameEn,
      nameZh,
      pinyin: st.pinyin || seed?.pinyin || nameEn.toLowerCase(),
    };
  });

  return {
    units,
    products,
    clients,
    reservations,
    sales,
    proposals,
    stockLogs,
    deliveries,
    categories: parsed.categories ?? INITIAL_CATEGORIES,
    paymentMethods,
    staffAccounts,
  };
}

function loadInitialState(): ShowroomState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<ShowroomState>;
      if (parsed && Array.isArray(parsed.products) && parsed.products.length >= 30) {
        return migrateShowroomState(parsed);
      }
    }
  } catch {
    // ignore storage errors
  }
  return migrateShowroomState({});
}

function loadInitialLang(): Language {
  try {
    const saved = localStorage.getItem(LANG_STORAGE_KEY);
    if (saved === 'zh' || saved === 'en') return saved;
  } catch {
    // ignore
  }
  return 'en';
}

interface CreateReservationInput {
  productId: string;
  colorNameEn: string;
  unitId: string;
  quantity: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  downpaymentPercent: number;
  paymentMethod: PaymentMethod;
  fulfillment: 'Pickup' | 'Delivery';
  preferredDate: string;
}

interface CreateConsultationInput {
  type: 'Homeowner' | 'Developer';
  name: string;
  company?: string;
  email: string;
  phone: string;
  projectLocation: string;
  numberOfUnits: number;
  budgetRange: string;
  targetDate: string;
  notes: string;
  productId?: string;
}

interface ShowroomContextValue extends ShowroomState {
  lang: Language;
  setLang: (l: Language) => void;
  role: UserRole;
  setRole: (r: UserRole) => void;
  activeStaff: StaffAccount;
  staffPage: StaffPage;
  setStaffPage: (p: StaffPage) => void;
  toasts: ToastItem[];
  pushToast: (message: string, tone?: 'success' | 'info' | 'warning') => void;
  dismissToast: (id: string) => void;
  createReservation: (input: CreateReservationInput) => Reservation;
  createConsultationLead: (input: CreateConsultationInput) => Client;
  transferStock: (
    productId: string,
    fromLoc: string,
    toLoc: string,
    qty: number,
    note: string
  ) => boolean;
  adjustStock: (
    productId: string,
    locationId: string,
    type: 'Stock-In' | 'Stock-Out',
    qty: number,
    note: string
  ) => boolean;
  completeSale: (params: {
    items: SaleLineItem[];
    discountAmount: number;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerNameZh?: string;
    customerEmail?: string;
    clientId?: string;
  }) => SaleTransaction;
  settleReservationToSale: (
    reservationId: string,
    paymentMethod: PaymentMethod
  ) => SaleTransaction | null;
  updateClientStage: (clientId: string, stage: CRMStage) => void;
  addClientNote: (clientId: string, text: string) => void;
  addClientReminder: (clientId: string, title: string, dueDate: string) => void;
  toggleReminderDone: (clientId: string, reminderId: string) => void;
  createClient: (client: {
    name: string;
    nameZh?: string;
    type: 'Retail' | 'Developer';
    company?: string;
    companyZh?: string;
    email: string;
    phone: string;
    location: string;
    estimatedValue: number;
    assignedStaff: string;
    assignedStaffZh?: string;
  }) => Client;
  createProposal: (params: {
    title: string;
    clientId: string;
    projectLocation: string;
    packages: ProposalPackage[];
    discountPercent: number;
    validUntil: string;
    notes: string;
    status: Proposal['status'];
  }) => Proposal;
  updateProposalStatus: (proposalId: string, status: Proposal['status']) => void;
  updateDeliveryStatus: (deliveryId: string, status: DeliveryStatus) => void;
  assignDeliveryTruckCrew: (deliveryId: string, truck: string, crew: string) => void;
  createDelivery: (job: {
    date: string;
    timeSlot: string;
    jobType: 'Retail Delivery' | 'Developer Staging';
    customerOrProject: string;
    address: string;
    unitId: string;
    itemsSummary: string;
    truck: string;
    crew: string;
    status: DeliveryStatus;
  }) => DeliveryJob;
  toggleUnitActive: (unitId: string) => void;
  toggleCategoryActive: (catId: ProductCategory) => void;
  togglePaymentMethod: (pmId: string) => void;
  updateStaffRole: (staffId: string, role: StaffRole, active: boolean) => void;
  addStaffMember: (member: {
    name: string;
    nameZh?: string;
    email: string;
    role: StaffRole;
    assignedUnitId: string;
    active: boolean;
  }) => void;
  resetDemoData: () => void;
}

const ShowroomContext = createContext<ShowroomContextValue | null>(null);

export const ShowroomProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<ShowroomState>(loadInitialState);
  const [lang, setLangState] = useState<Language>(loadInitialLang);
  const [role, setRoleState] = useState<UserRole>('customer');
  const [staffPage, setStaffPage] = useState<StaffPage>('dashboard');
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const setLang = (nextLang: Language) => {
    setLangState(nextLang);
    try {
      localStorage.setItem(LANG_STORAGE_KEY, nextLang);
    } catch {
      // ignore
    }
  };

  useEffect(() => {
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  }, [lang]);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // ignore quota errors
    }
  }, [state]);

  const activeStaff = useMemo(() => {
    const targetRole: StaffRole =
      role === 'sales' || role === 'warehouse' ? role : 'admin';
    return (
      state.staffAccounts.find((s) => s.role === targetRole && s.active) ??
      state.staffAccounts[0]
    );
  }, [role, state.staffAccounts]);

  const pushToast = (message: string, tone: 'success' | 'info' | 'warning' = 'success') => {
    const id = 'toast-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
    setToasts((prev) => [...prev, { id, message, tone }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const dismissToast = (id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  };

  const setRole = (newRole: UserRole) => {
    setRoleState(newRole);
    if (newRole === 'warehouse') {
      setStaffPage('inventory');
    } else if (newRole === 'sales' || newRole === 'admin') {
      setStaffPage('dashboard');
    }
  };

  const locationLabel = (locId: string, units: ShowroomUnit[], targetLang: Language) => {
    if (locId === 'warehouse') {
      return targetLang === 'zh' ? '中心总仓' : 'Central Warehouse';
    }
    const found = units.find((u) => u.id === locId);
    if (!found) return locId;
    return targetLang === 'zh' ? found.shortNameZh : found.shortNameEn;
  };

  const createReservation = (input: CreateReservationInput): Reservation => {
    const product = state.products.find((p) => p.id === input.productId)!;
    const matchedColor = product.colors.find((c) => c.nameEn === input.colorNameEn);
    const totalAmount = product.price * input.quantity;
    const downpaymentAmount = Math.round((totalAmount * downpaymentVal(input.downpaymentPercent)) / 100);
    const balanceDue = totalAmount - downpaymentAmount;
    const resCode = `RES-2611-${String(state.reservations.length + 1).padStart(2, '0')}`;

    const matchedExisting = state.clients.find(
      (c) =>
        c.nameEn.toLowerCase() === input.customerName.toLowerCase() ||
        c.nameZh === input.customerName
    );

    const custNameEn = matchedExisting?.nameEn ?? input.customerName;
    const custNameZh = matchedExisting?.nameZh ?? input.customerName;
    const custAddr = input.customerAddress || 'Metro Manila Pickup';
    const custAddrZh = input.customerAddress || '大马尼拉展厅自提';

    const newClientId = matchedExisting?.id ?? `cli-${Date.now()}`;
    const newClient: Client | null = matchedExisting
      ? null
      : {
          id: newClientId,
          name: custNameEn,
          nameEn: custNameEn,
          nameZh: custNameZh,
          pinyin: custNameEn.toLowerCase(),
          type: 'Retail',
          email: input.customerEmail,
          phone: input.customerPhone,
          location: custAddr,
          locationZh: custAddrZh,
          stage: 'Negotiation',
          estimatedValue: totalAmount,
          unitInterestCount: 1,
          targetDate: input.preferredDate,
          assignedStaff: 'Lorenzo Mendoza',
          assignedStaffZh: '洛伦佐·门多萨',
          notes: [
            {
              id: `n-${Date.now()}`,
              date: TODAY_ISO,
              author: 'Online Storefront',
              authorZh: '线上展厅商城',
              text: `Reserved ${input.quantity}× ${product.nameEn} (${input.colorNameEn}) with ${input.downpaymentPercent}% downpayment (${resCode}).`,
              textZh: `已支付 ${input.downpaymentPercent}% 定金预订 ${input.quantity} 件 ${product.nameZh}（${matchedColor?.nameZh ?? input.colorNameEn}），预订单号 ${resCode}。`,
            },
          ],
          reminders: [
            {
              id: `r-${Date.now()}`,
              dueDate: input.preferredDate,
              title: `Confirm ${input.fulfillment} & settle balance for ${resCode}`,
              titleZh: `确认${input.fulfillment === 'Delivery' ? '配送' : '自提'}并结清 ${resCode} 尾款`,
              done: false,
            },
          ],
          createdAt: TODAY_ISO,
        };

    const newRes: Reservation = {
      id: `res-${Date.now()}`,
      code: resCode,
      productId: input.productId,
      colorNameEn: input.colorNameEn,
      colorNameZh: matchedColor?.nameZh ?? input.colorNameEn,
      unitId: input.unitId,
      quantity: input.quantity,
      customerName: custNameEn,
      customerNameEn: custNameEn,
      customerNameZh: custNameZh,
      customerEmail: input.customerEmail,
      customerPhone: input.customerPhone,
      customerAddress: custAddr,
      customerAddressZh: custAddrZh,
      totalAmount,
      downpaymentPercent: input.downpaymentPercent,
      downpaymentAmount,
      balanceDue,
      paymentMethod: input.paymentMethod,
      fulfillment: input.fulfillment,
      preferredDate: input.preferredDate,
      status: 'Active',
      createdAt: TODAY_ISO,
      clientId: newClientId,
    };

    setState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        if (p.id !== input.productId) return p;
        const unitQty = p.unitStock[input.unitId] ?? 0;
        if (unitQty >= input.quantity) {
          return {
            ...p,
            unitStock: {
              ...p.unitStock,
              [input.unitId]: unitQty - input.quantity,
            },
          };
        }
        return {
          ...p,
          warehouseStock: Math.max(0, p.warehouseStock - input.quantity),
        };
      });

      const logEntry: StockLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: `${TODAY_ISO} 12:00`,
        type: 'Reservation',
        productId: product.id,
        sku: product.sku,
        productNameEn: product.nameEn,
        productNameZh: product.nameZh,
        fromLocation: locationLabel(input.unitId, prev.units, 'en'),
        fromLocationZh: locationLabel(input.unitId, prev.units, 'zh'),
        toLocation: `Reserved (${resCode})`,
        toLocationZh: `已预订锁货 (${resCode})`,
        quantity: input.quantity,
        performedBy: custNameEn,
        performedByZh: custNameZh,
        note: `${input.downpaymentPercent}% downpayment via ${input.paymentMethod}`,
        noteZh: `已通过${input.paymentMethod}支付 ${input.downpaymentPercent}% 定金`,
      };

      const maybeDelivery: DeliveryJob[] =
        input.fulfillment === 'Delivery'
          ? [
              {
                id: `del-${Date.now()}`,
                code: `DEL-2611-${106 + prev.deliveries.length}`,
                date: input.preferredDate,
                timeSlot: '10:00 - 13:00',
                jobType: 'Retail Delivery',
                customerOrProject: custNameEn,
                customerOrProjectZh: custNameZh,
                address: custAddr,
                addressZh: custAddrZh,
                unitId: input.unitId,
                itemsSummary: `${input.quantity}× ${product.nameEn}`,
                itemsSummaryZh: `${input.quantity}件 ${product.nameZh}`,
                truck: TRUCK_OPTIONS[1].en,
                truckZh: TRUCK_OPTIONS[1].zh,
                crew: 'Unassigned Crew',
                crewZh: '待指派安装组',
                status: 'Scheduled',
                linkedReservationId: newRes.id,
              },
            ]
          : [];

      return {
        ...prev,
        products: updatedProducts,
        reservations: [newRes, ...prev.reservations],
        clients: newClient ? [newClient, ...prev.clients] : prev.clients,
        stockLogs: [logEntry, ...prev.stockLogs],
        deliveries: [...maybeDelivery, ...prev.deliveries],
      };
    });

    pushToast(t(lang, 'toastReservationConfirmed', { code: resCode }));
    return newRes;
  };

  const createConsultationLead = (input: CreateConsultationInput): Client => {
    const budgetNumeric =
      input.budgetRange.includes('2M') || input.budgetRange.includes('5M') || input.budgetRange.includes('5,000,000')
        ? 2500000
        : input.budgetRange.includes('500,000')
        ? 750000
        : 220000;

    const linkedProduct = input.productId
      ? state.products.find((p) => p.id === input.productId)
      : undefined;

    const newClient: Client = {
      id: `cli-${Date.now()}`,
      name: input.name,
      nameEn: input.name,
      nameZh: input.name,
      pinyin: input.name.toLowerCase(),
      type: input.type === 'Developer' ? 'Developer' : 'Retail',
      company: input.company || undefined,
      companyZh: input.company || undefined,
      email: input.email,
      phone: input.phone,
      location: input.projectLocation,
      locationZh: input.projectLocation,
      stage: 'Inquiry',
      estimatedValue: budgetNumeric,
      unitInterestCount: input.numberOfUnits,
      targetDate: input.targetDate,
      assignedStaff: input.type === 'Developer' ? 'Lorenzo Mendoza' : 'Clarissa Tan',
      assignedStaffZh: input.type === 'Developer' ? '洛伦佐·门多萨' : '陈嘉莉',
      notes: [
        {
          id: `n-${Date.now()}`,
          date: TODAY_ISO,
          author: 'Online Inquiry',
          authorZh: '线上预约咨询',
          text: `${input.type === 'Developer' ? 'Developer / Model Unit Staging' : 'Homeowner Design Consultation'} · Units: ${input.numberOfUnits} · Budget: ${input.budgetRange}${
            linkedProduct ? ` · Ref Piece: ${linkedProduct.nameEn}` : ''
          }. Notes: ${input.notes || 'None'}`,
          textZh: `${input.type === 'Developer' ? '地产开发商 / 样板间整体配置' : '私宅业主设计咨询'} · 套数：${input.numberOfUnits} 套 · 预算：${input.budgetRange}${
            linkedProduct ? ` · 意向单品：${linkedProduct.nameZh}` : ''
          }。备注：${input.notes || '无'}`,
        },
      ],
      reminders: [
        {
          id: `r-${Date.now()}`,
          dueDate: TODAY_ISO,
          title: `Contact ${input.name} for consultation schedule`,
          titleZh: `联系 ${input.name} 安排展厅咨询时间`,
          done: false,
        },
      ],
      createdAt: TODAY_ISO,
    };

    setState((prev) => ({
      ...prev,
      clients: [newClient, ...prev.clients],
    }));
    pushToast(t(lang, 'toastConsultationRegistered'));
    return newClient;
  };

  const transferStock = (
    productId: string,
    fromLoc: string,
    toLoc: string,
    qty: number,
    note: string
  ): boolean => {
    if (qty <= 0 || fromLoc === toLoc) return false;
    const product = state.products.find((p) => p.id === productId);
    if (!product) return false;

    const available =
      fromLoc === 'warehouse' ? product.warehouseStock : product.unitStock[fromLoc] ?? 0;
    if (available < qty) {
      pushToast(
        t(lang, 'toastInsufficientStock', { loc: locationLabel(fromLoc, state.units, lang) }),
        'warning'
      );
      return false;
    }

    setState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        if (p.id !== productId) return p;
        const nextUnitStock = { ...p.unitStock };
        let nextWarehouse = p.warehouseStock;

        if (fromLoc === 'warehouse') nextWarehouse -= qty;
        else nextUnitStock[fromLoc] = (nextUnitStock[fromLoc] ?? 0) - qty;

        if (toLoc === 'warehouse') nextWarehouse += qty;
        else nextUnitStock[toLoc] = (nextUnitStock[toLoc] ?? 0) + qty;

        return {
          ...p,
          unitStock: nextUnitStock,
          warehouseStock: nextWarehouse,
        };
      });

      const log: StockLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: `${TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`,
        type: 'Transfer',
        productId: product.id,
        sku: product.sku,
        productNameEn: product.nameEn,
        productNameZh: product.nameZh,
        fromLocation: locationLabel(fromLoc, prev.units, 'en'),
        fromLocationZh: locationLabel(fromLoc, prev.units, 'zh'),
        toLocation: locationLabel(toLoc, prev.units, 'en'),
        toLocationZh: locationLabel(toLoc, prev.units, 'zh'),
        quantity: qty,
        performedBy: activeStaff.nameEn,
        performedByZh: activeStaff.nameZh,
        note: note || 'Inter-unit showroom transfer',
        noteZh: note || '展厅间现货调拨',
      };

      return {
        ...prev,
        products: updatedProducts,
        stockLogs: [log, ...prev.stockLogs],
      };
    });

    pushToast(t(lang, 'toastTransferred', { qty, sku: product.sku }));
    return true;
  };

  const adjustStock = (
    productId: string,
    locationId: string,
    type: 'Stock-In' | 'Stock-Out',
    qty: number,
    note: string
  ): boolean => {
    if (qty <= 0) return false;
    const product = state.products.find((p) => p.id === productId);
    if (!product) return false;

    if (type === 'Stock-Out') {
      const available =
        locationId === 'warehouse' ? product.warehouseStock : product.unitStock[locationId] ?? 0;
      if (available < qty) {
        pushToast(t(lang, 'toastExceedStock'), 'warning');
        return false;
      }
    }

    setState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        if (p.id !== productId) return p;
        const delta = type === 'Stock-In' ? qty : -qty;
        if (locationId === 'warehouse') {
          return { ...p, warehouseStock: Math.max(0, p.warehouseStock + delta) };
        }
        return {
          ...p,
          unitStock: {
            ...p.unitStock,
            [locationId]: Math.max(0, (p.unitStock[locationId] ?? 0) + delta),
          },
        };
      });

      const locEn = locationLabel(locationId, prev.units, 'en');
      const locZh = locationLabel(locationId, prev.units, 'zh');
      const log: StockLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: `${TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`,
        type,
        productId: product.id,
        sku: product.sku,
        productNameEn: product.nameEn,
        productNameZh: product.nameZh,
        fromLocation: type === 'Stock-In' ? 'Workshop / Supplier' : locEn,
        fromLocationZh: type === 'Stock-In' ? '木作工坊 / 供应商' : locZh,
        toLocation: type === 'Stock-In' ? locEn : 'Adjustment / Staging',
        toLocationZh: type === 'Stock-In' ? locZh : '盘点调整 / 样板间提货',
        quantity: qty,
        performedBy: activeStaff.nameEn,
        performedByZh: activeStaff.nameZh,
        note: note || `${type} adjustment`,
        noteZh: note || `${STOCK_LOG_TYPE_LABELS[type].zh}登记`,
      };

      return {
        ...prev,
        products: updatedProducts,
        stockLogs: [log, ...prev.stockLogs],
      };
    });

    pushToast(
      t(lang, 'toastAdjusted', {
        type: STOCK_LOG_TYPE_LABELS[type][lang],
        qty,
        sku: product.sku,
      })
    );
    return true;
  };

  const completeSale = (params: {
    items: SaleLineItem[];
    discountAmount: number;
    paymentMethod: PaymentMethod;
    customerName: string;
    customerNameZh?: string;
    customerEmail?: string;
    clientId?: string;
  }): SaleTransaction => {
    const subtotal = params.items.reduce((sum, i) => sum + i.unitPrice * i.quantity, 0);
    const total = Math.max(0, subtotal - params.discountAmount);
    const receiptNo = `OR-2026-${8843 + state.sales.length}`;

    const matchedClient = params.clientId
      ? state.clients.find((c) => c.id === params.clientId)
      : undefined;
    const custEn = params.customerName || matchedClient?.nameEn || 'Showroom Walk-In Guest';
    const custZh =
      params.customerNameZh ||
      matchedClient?.nameZh ||
      (params.customerName ? params.customerName : '展厅散客');

    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      receiptNo,
      date: TODAY_ISO,
      timestamp: `${TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`,
      clientId: params.clientId,
      customerName: custEn,
      customerNameEn: custEn,
      customerNameZh: custZh,
      customerEmail: params.customerEmail,
      items: params.items,
      subtotal,
      discountAmount: params.discountAmount,
      total,
      paymentMethod: params.paymentMethod,
      staffName: activeStaff.nameEn,
      staffNameZh: activeStaff.nameZh,
    };

    setState((prev) => {
      const updatedProducts = prev.products.map((p) => {
        const matchingItems = params.items.filter((i) => i.productId === p.id);
        if (matchingItems.length === 0) return p;
        const nextUnitStock = { ...p.unitStock };
        let nextWarehouse = p.warehouseStock;
        let soldDelta = 0;

        for (const item of matchingItems) {
          soldDelta += item.quantity;
          if ((nextUnitStock[item.unitId] ?? 0) >= item.quantity) {
            nextUnitStock[item.unitId] -= item.quantity;
          } else {
            nextWarehouse = Math.max(0, nextWarehouse - item.quantity);
          }
        }
        return {
          ...p,
          unitStock: nextUnitStock,
          warehouseStock: nextWarehouse,
          soldCount: p.soldCount + soldDelta,
        };
      });

      const newLogs: StockLogEntry[] = params.items.map((item, idx) => ({
        id: `log-${Date.now()}-${idx}`,
        timestamp: `${TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`,
        type: 'Sale',
        productId: item.productId,
        sku: item.sku,
        productNameEn: item.productNameEn,
        productNameZh: item.productNameZh,
        fromLocation: locationLabel(item.unitId, prev.units, 'en'),
        fromLocationZh: locationLabel(item.unitId, prev.units, 'zh'),
        toLocation: `Customer (${receiptNo})`,
        toLocationZh: `客户成交 (${receiptNo})`,
        quantity: item.quantity,
        performedBy: activeStaff.nameEn,
        performedByZh: activeStaff.nameZh,
        note: `POS Checkout via ${params.paymentMethod}`,
        noteZh: `POS 收银成交 · ${params.paymentMethod}`,
      }));

      return {
        ...prev,
        products: updatedProducts,
        sales: [newSale, ...prev.sales],
        stockLogs: [...newLogs, ...prev.stockLogs],
      };
    });

    pushToast(t(lang, 'toastSaleCompleted', { receipt: receiptNo }));
    return newSale;
  };

  const settleReservationToSale = (
    reservationId: string,
    paymentMethod: PaymentMethod
  ): SaleTransaction | null => {
    const res = state.reservations.find((r) => r.id === reservationId);
    if (!res || res.status !== 'Active') return null;
    const product = state.products.find((p) => p.id === res.productId);
    if (!product) return null;

    const receiptNo = `OR-2026-${8843 + state.sales.length}`;
    const newSale: SaleTransaction = {
      id: `sale-${Date.now()}`,
      receiptNo,
      date: TODAY_ISO,
      timestamp: `${TODAY_ISO} ${new Date().toTimeString().slice(0, 5)}`,
      clientId: res.clientId,
      customerName: res.customerNameEn,
      customerNameEn: res.customerNameEn,
      customerNameZh: res.customerNameZh,
      customerEmail: res.customerEmail,
      items: [
        {
          productId: product.id,
          productNameEn: product.nameEn,
          productNameZh: product.nameZh,
          sku: product.sku,
          unitId: res.unitId,
          quantity: res.quantity,
          unitPrice: product.price,
          colorNameEn: res.colorNameEn,
          colorNameZh: res.colorNameZh,
        },
      ],
      subtotal: res.totalAmount,
      discountAmount: 0,
      total: res.balanceDue,
      paymentMethod,
      convertedFromReservationId: res.id,
      staffName: activeStaff.nameEn,
      staffNameZh: activeStaff.nameZh,
    };

    setState((prev) => ({
      ...prev,
      reservations: prev.reservations.map((r) =>
        r.id === reservationId ? { ...r, status: 'Settled', balanceDue: 0 } : r
      ),
      products: prev.products.map((p) =>
        p.id === product.id ? { ...p, soldCount: p.soldCount + res.quantity } : p
      ),
      clients: prev.clients.map((c) =>
        c.id === res.clientId ? { ...c, stage: 'Won' } : c
      ),
      sales: [newSale, ...prev.sales],
    }));

    pushToast(t(lang, 'toastReservationSettled', { code: res.code, receipt: receiptNo }));
    return newSale;
  };

  const updateClientStage = (clientId: string, stage: CRMStage) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) => (c.id === clientId ? { ...c, stage } : c)),
    }));
    pushToast(t(lang, 'toastStageMoved', { stage: STAGE_LABELS[stage][lang] }));
  };

  const addClientNote = (clientId: string, text: string) => {
    if (!text.trim()) return;
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              notes: [
                {
                  id: `note-${Date.now()}`,
                  date: TODAY_ISO,
                  author: activeStaff.nameEn,
                  authorZh: activeStaff.nameZh,
                  text: text.trim(),
                  textZh: text.trim(),
                },
                ...c.notes,
              ],
            }
          : c
      ),
    }));
    pushToast(t(lang, 'toastNoteAdded'));
  };

  const addClientReminder = (clientId: string, title: string, dueDate: string) => {
    if (!title.trim()) return;
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              reminders: [
                ...c.reminders,
                {
                  id: `rem-${Date.now()}`,
                  title: title.trim(),
                  titleZh: title.trim(),
                  dueDate,
                  done: false,
                },
              ],
            }
          : c
      ),
    }));
    pushToast(t(lang, 'toastReminderSaved'));
  };

  const toggleReminderDone = (clientId: string, reminderId: string) => {
    setState((prev) => ({
      ...prev,
      clients: prev.clients.map((c) =>
        c.id === clientId
          ? {
              ...c,
              reminders: c.reminders.map((r) =>
                r.id === reminderId ? { ...r, done: !r.done } : r
              ),
            }
          : c
      ),
    }));
  };

  const createClient = (client: {
    name: string;
    nameZh?: string;
    type: 'Retail' | 'Developer';
    company?: string;
    companyZh?: string;
    email: string;
    phone: string;
    location: string;
    estimatedValue: number;
    assignedStaff: string;
    assignedStaffZh?: string;
  }): Client => {
    const nameEn = client.name;
    const nameZh = client.nameZh?.trim() || client.name;
    const created: Client = {
      id: `cli-${Date.now()}`,
      name: nameEn,
      nameEn,
      nameZh,
      pinyin: `${nameEn} ${nameZh}`.toLowerCase(),
      type: client.type,
      company: client.company,
      companyZh: client.companyZh?.trim() || client.company,
      email: client.email,
      phone: client.phone,
      location: client.location,
      locationZh: client.location,
      stage: 'Inquiry',
      estimatedValue: client.estimatedValue,
      assignedStaff: client.assignedStaff,
      assignedStaffZh: client.assignedStaffZh || '洛伦佐·门多萨',
      notes: [],
      reminders: [],
      createdAt: TODAY_ISO,
    };
    setState((prev) => ({ ...prev, clients: [created, ...prev.clients] }));
    pushToast(t(lang, 'toastClientAdded', { name: lang === 'zh' ? nameZh : nameEn }));
    return created;
  };

  const createProposal = (params: {
    title: string;
    clientId: string;
    projectLocation: string;
    packages: ProposalPackage[];
    discountPercent: number;
    validUntil: string;
    notes: string;
    status: Proposal['status'];
  }): Proposal => {
    const client = state.clients.find((c) => c.id === params.clientId);
    const subtotal = params.packages.reduce((pkgAcc, pkg) => {
      const perUnitSum = pkg.items.reduce(
        (itemAcc, item) => itemAcc + item.unitPrice * item.qtyPerUnit,
        0
      );
      return pkgAcc + perUnitSum * pkg.unitCount;
    }, 0);
    const discountAmount = Math.round((subtotal * params.discountPercent) / 100);
    const totalAmount = subtotal - discountAmount;
    const code = `PROP-2026-${String(42 + state.proposals.length).padStart(3, '0')}`;

    const created: Proposal = {
      id: `prop-${Date.now()}`,
      code,
      title: params.title,
      titleZh: params.title,
      clientId: params.clientId,
      clientName: client?.nameEn || 'Developer Client',
      clientNameZh: client?.nameZh || '开发商客户',
      companyName: client?.company || client?.nameEn || 'Developer Partner',
      companyNameZh: client?.companyZh || client?.nameZh || '合作开发商',
      projectLocation: params.projectLocation,
      projectLocationZh: params.projectLocation,
      packages: params.packages,
      discountPercent: params.discountPercent,
      subtotal,
      discountAmount,
      totalAmount,
      validUntil: params.validUntil,
      status: params.status,
      createdAt: TODAY_ISO,
      notes: params.notes,
      notesZh: params.notes,
    };

    setState((prev) => ({
      ...prev,
      proposals: [created, ...prev.proposals],
      clients: prev.clients.map((c) =>
        c.id === params.clientId && (c.stage === 'Inquiry' || c.stage === 'Consultation')
          ? { ...c, stage: 'Proposal Sent', estimatedValue: totalAmount }
          : c
      ),
    }));

    pushToast(t(lang, 'toastProposalSaved', { code }));
    return created;
  };

  const updateProposalStatus = (proposalId: string, status: Proposal['status']) => {
    setState((prev) => ({
      ...prev,
      proposals: prev.proposals.map((p) => (p.id === proposalId ? { ...p, status } : p)),
    }));
    pushToast(
      t(lang, 'toastProposalStatus', { status: PROPOSAL_STATUS_LABELS[status][lang] })
    );
  };

  const updateDeliveryStatus = (deliveryId: string, status: DeliveryStatus) => {
    setState((prev) => ({
      ...prev,
      deliveries: prev.deliveries.map((d) => (d.id === deliveryId ? { ...d, status } : d)),
    }));
    pushToast(
      t(lang, 'toastDeliveryStatus', { status: DELIVERY_STATUS_LABELS[status][lang] })
    );
  };

  const assignDeliveryTruckCrew = (deliveryId: string, truck: string, crew: string) => {
    const matchedTruck = TRUCK_OPTIONS.find((tr) => tr.en === truck);
    const matchedCrew = CREW_OPTIONS.find((cr) => cr.en === crew);
    setState((prev) => ({
      ...prev,
      deliveries: prev.deliveries.map((d) =>
        d.id === deliveryId
          ? {
              ...d,
              truck,
              truckZh: matchedTruck?.zh || truck,
              crew,
              crewZh:
                matchedCrew?.zh || (crew === 'Unassigned Crew' ? '待指派安装组' : crew),
            }
          : d
      ),
    }));
    pushToast(t(lang, 'toastCrewAssigned'));
  };

  const createDelivery = (job: {
    date: string;
    timeSlot: string;
    jobType: 'Retail Delivery' | 'Developer Staging';
    customerOrProject: string;
    address: string;
    unitId: string;
    itemsSummary: string;
    truck: string;
    crew: string;
    status: DeliveryStatus;
  }): DeliveryJob => {
    const matchedTruck = TRUCK_OPTIONS.find((tr) => tr.en === job.truck);
    const matchedCrew = CREW_OPTIONS.find((cr) => cr.en === job.crew);
    const created: DeliveryJob = {
      ...job,
      id: `del-${Date.now()}`,
      code: `DEL-2611-${106 + state.deliveries.length}`,
      customerOrProjectZh: job.customerOrProject,
      addressZh: job.address,
      itemsSummaryZh: job.itemsSummary,
      truckZh: matchedTruck?.zh || job.truck,
      crewZh: matchedCrew?.zh || job.crew,
    };
    setState((prev) => ({
      ...prev,
      deliveries: [created, ...prev.deliveries],
    }));
    pushToast(t(lang, 'toastDeliveryScheduled', { code: created.code }));
    return created;
  };

  const toggleUnitActive = (unitId: string) => {
    setState((prev) => ({
      ...prev,
      units: prev.units.map((u) => (u.id === unitId ? { ...u, active: !u.active } : u)),
    }));
  };

  const toggleCategoryActive = (catId: ProductCategory) => {
    setState((prev) => ({
      ...prev,
      categories: prev.categories.map((c) => (c.id === catId ? { ...c, active: !c.active } : c)),
    }));
  };

  const togglePaymentMethod = (pmId: string) => {
    setState((prev) => ({
      ...prev,
      paymentMethods: prev.paymentMethods.map((pm) =>
        pm.id === pmId ? { ...pm, enabled: !pm.enabled } : pm
      ),
    }));
  };

  const updateStaffRole = (staffId: string, newRole: StaffRole, active: boolean) => {
    setState((prev) => ({
      ...prev,
      staffAccounts: prev.staffAccounts.map((s) =>
        s.id === staffId ? { ...s, role: newRole, active } : s
      ),
    }));
    pushToast(t(lang, 'toastStaffUpdated'));
  };

  const addStaffMember = (member: {
    name: string;
    nameZh?: string;
    email: string;
    role: StaffRole;
    assignedUnitId: string;
    active: boolean;
  }) => {
    const nameEn = member.name;
    const nameZh = member.nameZh?.trim() || member.name;
    setState((prev) => ({
      ...prev,
      staffAccounts: [
        ...prev.staffAccounts,
        {
          id: `stf-${Date.now()}`,
          name: nameEn,
          nameEn,
          nameZh,
          pinyin: `${nameEn} ${nameZh}`.toLowerCase(),
          email: member.email,
          role: member.role,
          assignedUnitId: member.assignedUnitId,
          active: member.active,
        },
      ],
    }));
    pushToast(t(lang, 'toastStaffAdded'));
  };

  const resetDemoData = () => {
    localStorage.removeItem(STORAGE_KEY);
    setState(migrateShowroomState({}));
    pushToast(t(lang, 'toastDemoReset'));
  };

  const value = useMemo<ShowroomContextValue>(
    () => ({
      ...state,
      lang,
      setLang,
      role,
      setRole,
      activeStaff,
      staffPage,
      setStaffPage,
      toasts,
      pushToast,
      dismissToast,
      createReservation,
      createConsultationLead,
      transferStock,
      adjustStock,
      completeSale,
      settleReservationToSale,
      updateClientStage,
      addClientNote,
      addClientReminder,
      toggleReminderDone,
      createClient,
      createProposal,
      updateProposalStatus,
      updateDeliveryStatus,
      assignDeliveryTruckCrew,
      createDelivery,
      toggleUnitActive,
      toggleCategoryActive,
      togglePaymentMethod,
      updateStaffRole,
      addStaffMember,
      resetDemoData,
    }),
    [state, lang, role, activeStaff, staffPage, toasts]
  );

  return <ShowroomContext.Provider value={value}>{children}</ShowroomContext.Provider>;
};

function downpaymentVal(pct: number): number {
  return Math.min(100, Math.max(10, pct));
}

export function useShowroom() {
  const ctx = useContext(ShowroomContext);
  if (!ctx) throw new Error('useShowroom must be used inside ShowroomProvider');
  return ctx;
}
