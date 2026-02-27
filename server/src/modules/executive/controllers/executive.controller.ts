// Executive Module – Controller (sem lógica de negócio)

import { Request, Response } from 'express';
import { executiveService } from '../services/executive.service';
import { buildResponse } from '../dto/executive.dto';
import { logAction } from '../../../services/audit.service';
import { PeriodFilter } from '../types/executive.types';

/**
 * Extrai e valida filtro de período dos query params
 */
const parsePeriodFilter = (query: Record<string, any>): PeriodFilter => {
  const filter: PeriodFilter = {};

  if (query.startDate) {
    const d = new Date(query.startDate as string);
    if (!isNaN(d.getTime())) filter.startDate = d;
  }

  if (query.endDate) {
    const d = new Date(query.endDate as string);
    if (!isNaN(d.getTime())) {
      d.setHours(23, 59, 59, 999);
      filter.endDate = d;
    }
  }

  // Se não informado, usa os últimos N dias (padrão 30)
  if (!filter.startDate || !filter.endDate) {
    const days = parseInt(String(query.days ?? '30'), 10);
    filter.endDate = new Date();
    filter.startDate = new Date();
    filter.startDate.setDate(filter.startDate.getDate() - days);
    filter.startDate.setHours(0, 0, 0, 0);
  }

  return filter;
};

const auditAccess = async (req: Request, endpoint: string) => {
  const userId = (req as any).user?.id;
  try {
    await logAction({
      action: 'View',
      userId,
      targetType: 'SYSTEM',
      targetId: endpoint,
      details: { endpoint, query: req.query },
    });
  } catch {
    // Silencia falha de auditoria
  }
};

// GET /api/executive/overview
export const getOverview = async (req: Request, res: Response): Promise<void> => {
  try {
    await auditAccess(req, '/api/executive/overview');
    const data = await executiveService.getOverview();
    res.json(buildResponse(data));
  } catch (error) {
    console.error('[Executive] getOverview error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar overview executivo' });
  }
};

// GET /api/executive/financial
export const getFinancial = async (req: Request, res: Response): Promise<void> => {
  try {
    await auditAccess(req, '/api/executive/financial');
    const filter = parsePeriodFilter(req.query as Record<string, any>);
    const data = await executiveService.getFinancial(filter);
    res.json(buildResponse(data, { startDate: filter.startDate!, endDate: filter.endDate! }));
  } catch (error) {
    console.error('[Executive] getFinancial error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar dados financeiros' });
  }
};

// GET /api/executive/inventory
export const getInventory = async (req: Request, res: Response): Promise<void> => {
  try {
    await auditAccess(req, '/api/executive/inventory');
    const data = await executiveService.getInventory();
    res.json(buildResponse(data));
  } catch (error) {
    console.error('[Executive] getInventory error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar inteligência de estoque' });
  }
};

// GET /api/executive/customers
export const getCustomers = async (req: Request, res: Response): Promise<void> => {
  try {
    await auditAccess(req, '/api/executive/customers');
    const filter = parsePeriodFilter(req.query as Record<string, any>);
    const data = await executiveService.getCustomers(filter);
    res.json(buildResponse(data, { startDate: filter.startDate!, endDate: filter.endDate! }));
  } catch (error) {
    console.error('[Executive] getCustomers error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar insights de clientes' });
  }
};

// GET /api/executive/profitability
export const getProfitability = async (req: Request, res: Response): Promise<void> => {
  try {
    await auditAccess(req, '/api/executive/profitability');
    const filter = parsePeriodFilter(req.query as Record<string, any>);
    const data = await executiveService.getProfitability(filter);
    res.json(buildResponse(data, { startDate: filter.startDate!, endDate: filter.endDate! }));
  } catch (error) {
    console.error('[Executive] getProfitability error:', error);
    res.status(500).json({ success: false, message: 'Erro ao buscar análise de rentabilidade' });
  }
};
