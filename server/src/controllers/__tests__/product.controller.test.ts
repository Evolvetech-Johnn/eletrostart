import { Request, Response } from 'express';
import * as productController from '../product.controller';
import { prisma } from '../../lib/prisma';
import { importExportService } from '../../services/importExport.service';
import { googleSheetsService } from '../../services/googleSheets.service';
import { logAction } from '../../services/audit.service';

// Mocks
jest.mock('../../lib/prisma', () => ({
  prisma: {
    product: {
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
    },
    auditLog: {
      create: jest.fn(),
    },
  },
}));

jest.mock('../../services/importExport.service');
jest.mock('../../services/googleSheets.service');
jest.mock('../../services/audit.service');

describe('ProductController', () => {
  let req: Partial<Request>;
  let res: Partial<Response>;
  let json: jest.Mock;
  let status: jest.Mock;
  let send: jest.Mock;
  let setHeader: jest.Mock;

  beforeEach(() => {
    json = jest.fn();
    send = jest.fn();
    setHeader = jest.fn();
    status = jest.fn().mockReturnValue({ json, send });
    req = {
      body: {},
      params: {},
      query: {},
      user: { id: 'admin-id', role: 'ADMIN' } as any,
    };
    res = {
      json,
      status,
      send,
      setHeader,
    };
    jest.clearAllMocks();
  });

  describe('importProducts', () => {
    it('should return 400 if no file is uploaded', async () => {
      req.file = undefined;
      await productController.importProducts(req as Request, res as Response);
      expect(status).toHaveBeenCalledWith(400);
      expect(json).toHaveBeenCalledWith(expect.objectContaining({ success: false, message: 'Arquivo obrigatório' }));
    });

    it('should import products successfully', async () => {
      req.file = {
        buffer: Buffer.from('test'),
        mimetype: 'text/csv',
      } as any;

      (importExportService.parseImportFile as jest.Mock).mockResolvedValue([
        { sku: 'TEST-1', name: 'Product 1', price: 10, stock: 5 },
      ]);

      (prisma.product.findFirst as jest.Mock).mockResolvedValue(null); // No existing product
      (prisma.product.create as jest.Mock).mockResolvedValue({ id: 'new-p1', sku: 'TEST-1' });

      await productController.importProducts(req as Request, res as Response);

      expect(importExportService.parseImportFile).toHaveBeenCalled();
      expect(prisma.product.create).toHaveBeenCalled();
      expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'IMPORT' }));
      expect(json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        stats: expect.objectContaining({ created: 1, updated: 0 }),
      }));
    });
  });

  describe('exportProducts', () => {
    it('should export products as excel', async () => {
      const mockProducts = [{ id: 'p1', name: 'P1' }];
      (prisma.product.findMany as jest.Mock).mockResolvedValue(mockProducts);
      (importExportService.generateExport as jest.Mock).mockResolvedValue(Buffer.from('excel-data'));

      await productController.exportProducts(req as Request, res as Response);

      expect(prisma.product.findMany).toHaveBeenCalled();
      expect(importExportService.generateExport).toHaveBeenCalledWith(mockProducts);
      expect(setHeader).toHaveBeenCalledWith('Content-Type', expect.stringContaining('spreadsheetml'));
      expect(send).toHaveBeenCalled();
      expect(logAction).toHaveBeenCalledWith(expect.objectContaining({ action: 'EXPORT' }));
    });
  });
});
