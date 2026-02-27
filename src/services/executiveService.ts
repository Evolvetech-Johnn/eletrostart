// Executive Service – Integração com API backend

import apiClient from './apiClient';
import { ApiResponse } from './adminService';

// ─── Types ────────────────────────────────────────────────────────────────────

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
  topCustomers: { name: string; email: string; orders: number; totalSpent: number }[];
  repurchaseRate: number;
}

export interface ProfitabilityKPIs {
  topProductsByRevenue: { productId: string; name: string; quantitySold: number; revenue: number }[];
  topProductsByVolume: { productId: string; name: string; quantitySold: number; revenue: number }[];
}

export interface ExecutiveResponse<T> {
  success: boolean;
  data: T;
  period?: { startDate: string; endDate: string };
  generatedAt: string;
}

export interface PeriodParams {
  days?: number;
  startDate?: string;
  endDate?: string;
}

// ─── Service ─────────────────────────────────────────────────────────────────

const buildQuery = (params?: PeriodParams): string => {
  if (!params) return '';
  const q = new URLSearchParams();
  if (params.days) q.set('days', String(params.days));
  if (params.startDate) q.set('startDate', params.startDate);
  if (params.endDate) q.set('endDate', params.endDate);
  return q.toString() ? `?${q.toString()}` : '';
};

export const executiveService = {
  getOverview: async (): Promise<OverviewKPIs> => {
    const res = await apiClient.get<any, ApiResponse<OverviewKPIs>>('/executive/overview');
    return res.data;
  },

  getFinancial: async (params?: PeriodParams): Promise<ExecutiveResponse<FinancialKPIs>> => {
    const res = await apiClient.get<any, ExecutiveResponse<FinancialKPIs>>(
      `/executive/financial${buildQuery(params)}`
    );
    return res;
  },

  getInventory: async (): Promise<ExecutiveResponse<InventoryKPIs>> => {
    const res = await apiClient.get<any, ExecutiveResponse<InventoryKPIs>>('/executive/inventory');
    return res;
  },

  getCustomers: async (params?: PeriodParams): Promise<ExecutiveResponse<CustomerKPIs>> => {
    const res = await apiClient.get<any, ExecutiveResponse<CustomerKPIs>>(
      `/executive/customers${buildQuery(params)}`
    );
    return res;
  },

  getProfitability: async (params?: PeriodParams): Promise<ExecutiveResponse<ProfitabilityKPIs>> => {
    const res = await apiClient.get<any, ExecutiveResponse<ProfitabilityKPIs>>(
      `/executive/profitability${buildQuery(params)}`
    );
    return res;
  },
};
