import { importExportService } from '../importExport.service';
// Mock exceljs before import
const mockWorkbook = {
  csv: {
    read: jest.fn(),
  },
  xlsx: {
    load: jest.fn(),
    writeBuffer: jest.fn(),
  },
  getWorksheet: jest.fn(),
  addWorksheet: jest.fn(),
};

const mockWorksheet = {
  getRow: jest.fn(),
  eachRow: jest.fn(),
  columns: [],
  addRow: jest.fn(),
};

jest.mock('exceljs', () => {
  return {
    Workbook: jest.fn(() => mockWorkbook),
  };
});

describe('ImportExport Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset default behaviors
    mockWorkbook.getWorksheet.mockReturnValue(mockWorksheet);
    mockWorkbook.addWorksheet.mockReturnValue(mockWorksheet);
  });

  it('should parse a CSV buffer correctly', async () => {
    // Setup Header Row
    const headerRow = {
      eachCell: jest.fn((callback) => {
        callback({ text: 'SKU' }, 1);
        callback({ text: 'Nome' }, 2);
        callback({ text: 'Preço' }, 3);
        callback({ text: 'Estoque' }, 4);
      }),
    };
    mockWorksheet.getRow.mockReturnValue(headerRow);

    // Setup Data Rows
    mockWorksheet.eachRow.mockImplementation((callback) => {
      // Row 2 (Data)
      const row = {
        eachCell: jest.fn((cellCallback) => {
          cellCallback({ value: 'TEST-001' }, 1); // SKU
          cellCallback({ value: 'Produto Teste' }, 2); // Name
          cellCallback({ value: 10.5 }, 3); // Price
          cellCallback({ value: 100 }, 4); // Stock
        }),
      };
      callback(row, 2);
    });

    const buffer = Buffer.from('test', 'utf-8');
    const result = await importExportService.parseImportFile(buffer, 'text/csv');

    expect(mockWorkbook.csv.read).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toEqual({
      sku: 'TEST-001',
      name: 'Produto Teste',
      price: 10.5,
      stock: 100,
      active: true, // Default
    });
  });

  it('should parse an Excel buffer correctly', async () => {
    // Setup Header Row
    const headerRow = {
      eachCell: jest.fn((callback) => {
        callback({ text: 'SKU' }, 1);
        callback({ text: 'Nome' }, 2);
        callback({ text: 'Ativo' }, 3);
      }),
    };
    mockWorksheet.getRow.mockReturnValue(headerRow);

    // Setup Data Rows
    mockWorksheet.eachRow.mockImplementation((callback) => {
      const row = {
        eachCell: jest.fn((cellCallback) => {
          cellCallback({ value: 'TEST-XLSX' }, 1);
          cellCallback({ value: 'Excel Product' }, 2);
          cellCallback({ value: 'Sim' }, 3);
        }),
      };
      callback(row, 2);
    });

    const buffer = Buffer.from('test', 'utf-8');
    const result = await importExportService.parseImportFile(
      buffer,
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    );

    expect(mockWorkbook.xlsx.load).toHaveBeenCalled();
    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      sku: 'TEST-XLSX',
      name: 'Excel Product',
      active: true,
    });
  });

  it('should throw error if SKU is missing in header', async () => {
    // Setup Header Row with NO SKU
    const headerRow = {
      eachCell: jest.fn((callback) => {
        callback({ text: 'Nome' }, 1);
        callback({ text: 'Preço' }, 2);
      }),
    };
    mockWorksheet.getRow.mockReturnValue(headerRow);

    const buffer = Buffer.from('test', 'utf-8');

    await expect(
      importExportService.parseImportFile(buffer, 'text/csv')
    ).rejects.toThrow('Coluna SKU ou Código é obrigatória');
  });

   it('should generate an export buffer', async () => {
    mockWorkbook.xlsx.writeBuffer.mockResolvedValue(Buffer.from('excel-content'));

    const products: any[] = [
      { sku: 'P1', name: 'Product 1', price: 10, stock: 5, active: true },
    ];

    const result = await importExportService.generateExport(products);

    expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Produtos');
    expect(mockWorksheet.addRow).toHaveBeenCalledTimes(1);
    expect(result).toBeInstanceOf(Buffer);
  });
});
