// Executive Module – Tipos centrais

export interface PeriodFilter {
  startDate?: Date;
  endDate?: Date;
}

export interface OverviewKPIs {
  totalRevenue: number;
  totalOrders: number;
  avgTicket: number;
  totalProducts: number;
  totalCustomers: number;
  pendingOrders: number;
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowthPct: number;
}

export interface FinancialKPIs {
  revenueByDay: { date: string; value: number }[];
  revenueByMonth: { month: string; value: number }[];
  totalRevenue: number;
  totalCost: number;
  grossProfit: number;
  grossMarginPct: number;
  avgTicket: number;
  growthPct: number;
}

export interface InventoryKPIs {
  totalProducts: number;
  totalStockValue: number;
  outOfStock: number;
  lowStock: number;
  noSalesLast30Days: { id: string; name: string; stock: number; price: number }[];
  topByStock: { id: string; name: string; stock: number }[];
}

export interface CustomerKPIs {
  totalCustomers: number;
  newCustomersThisPeriod: number;
  avgOrdersPerCustomer: number;
  topCustomers: {
    name: string;
    email: string;
    orders: number;
    totalSpent: number;
  }[];
  repurchaseRate: number;
}

export interface ProfitabilityKPIs {
  topProductsByRevenue: {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }[];
  topProductsByVolume: {
    productId: string;
    name: string;
    quantitySold: number;
    revenue: number;
  }[];
}

export interface SnapshotInput {
  periodType: 'daily' | 'monthly';
  periodRef: string;
  revenue: number;
  cost: number;
  grossProfit: number;
  ordersCount: number;
  avgTicket: number;
}
