// Executive Module – DTOs de saída

import {
  OverviewKPIs,
  FinancialKPIs,
  InventoryKPIs,
  CustomerKPIs,
  ProfitabilityKPIs,
} from '../types/executive.types';

export interface OverviewResponseDTO {
  success: true;
  data: OverviewKPIs;
  generatedAt: string;
}

export interface FinancialResponseDTO {
  success: true;
  data: FinancialKPIs;
  period: { startDate: string; endDate: string };
  generatedAt: string;
}

export interface InventoryResponseDTO {
  success: true;
  data: InventoryKPIs;
  generatedAt: string;
}

export interface CustomerResponseDTO {
  success: true;
  data: CustomerKPIs;
  period: { startDate: string; endDate: string };
  generatedAt: string;
}

export interface ProfitabilityResponseDTO {
  success: true;
  data: ProfitabilityKPIs;
  period: { startDate: string; endDate: string };
  generatedAt: string;
}

export const buildResponse = <T>(data: T, period?: { startDate: Date; endDate: Date }) => ({
  success: true as const,
  data,
  ...(period && {
    period: {
      startDate: period.startDate.toISOString(),
      endDate: period.endDate.toISOString(),
    },
  }),
  generatedAt: new Date().toISOString(),
});
