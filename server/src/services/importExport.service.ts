import ExcelJS from "exceljs";
import { Product } from "@prisma/client";
import { Readable } from "stream";

export type ProductImportData = {
  sku: string;
  name: string;
  price?: number;
  stock?: number;
  categoryName?: string;
  description?: string;
  active?: boolean;
  image?: string;
};

export class ImportExportService {
  /**
   * Parse an Excel or CSV file buffer into product data
   */
  async parseImportFile(
    buffer: Buffer,
    mimetype: string,
  ): Promise<ProductImportData[]> {
    const workbook = new ExcelJS.Workbook();

    if (mimetype.includes("csv") || mimetype.includes("text/plain")) {
      const stream = Readable.from(buffer);
      await workbook.csv.read(stream);
    } else {
      await workbook.xlsx.load(buffer as any);
    }

    const worksheet = workbook.getWorksheet(1);
    if (!worksheet) {
      throw new Error("Arquivo vazio ou inválido");
    }

    const products: ProductImportData[] = [];

    // Assumes header is in row 1
    // We'll map headers to keys dynamically or assume standard columns
    // Columns: SKU, Nome, Preço, Estoque, Categoria, Ativo, Imagem, Descrição

    const headers: { [col: number]: string } = {};
    const headerRow = worksheet.getRow(1);
    headerRow.eachCell((cell, colNumber) => {
      const header = cell.text?.toLowerCase().trim();
      headers[colNumber] = header;
    });

    // Validate minimal headers
    const hasSku = Object.values(headers).some(
      (h) => h.includes("sku") || h.includes("código"),
    );
    if (!hasSku) {
      throw new Error("Coluna SKU ou Código é obrigatória");
    }

    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return; // Skip header

      const product: any = {};
      let isValidRow = false;

      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber];
        if (!header) return;

        let value = cell.value;
        // ExcelJS sometimes returns objects for links/formulas, simplify to text/result
        if (typeof value === "object" && value !== null) {
          if ("text" in value) value = (value as any).text;
          else if ("result" in value) value = (value as any).result;
        }

        if (header.includes("sku") || header.includes("código")) {
          product.sku = String(value).trim();
          if (product.sku) isValidRow = true;
        } else if (header.includes("nome") || header.includes("produto")) {
          product.name = String(value).trim();
        } else if (header.includes("preço") || header.includes("valor")) {
          product.price = Number(value) || 0;
        } else if (header.includes("estoque")) {
          product.stock = Number(value) || 0;
        } else if (header.includes("cat")) {
          product.categoryName = String(value).trim();
        } else if (header.includes("desc")) {
          product.description = String(value).trim();
        } else if (header.includes("img") || header.includes("foto")) {
          product.image = String(value).trim();
        } else if (header.includes("ativo")) {
          const valStr = String(value).toLowerCase();
          product.active = ["sim", "yes", "true", "1"].includes(valStr);
        }
      });

      if (isValidRow && product.sku) {
        // Defaults
        if (product.active === undefined) product.active = true;

        products.push(product);
      }
    });

    return products;
  }

  /**
   * Generates an Excel buffer from products
   */
  async generateExport(products: Product[]): Promise<Buffer> {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Produtos");

    worksheet.columns = [
      { header: "SKU", key: "sku", width: 15 },
      { header: "Nome", key: "name", width: 30 },
      { header: "Preço", key: "price", width: 15 },
      { header: "Estoque", key: "stock", width: 10 },
      { header: "Categoria", key: "categoryName", width: 20 },
      { header: "Ativo", key: "active", width: 10 },
      { header: "Link Imagem", key: "image", width: 30 },
      { header: "Descrição", key: "description", width: 40 },
    ];

    products.forEach((p) => {
      worksheet.addRow({
        sku: p.sku || "",
        name: p.name,
        price: p.price,
        stock: p.stock,
        categoryName: (p as any).category?.name || "",
        active: p.active ? "Sim" : "Não",
        image: p.image || "",
        description: p.description || "",
      });
    });

    return (await workbook.xlsx.writeBuffer()) as any as Buffer;
  }
}

export const importExportService = new ImportExportService();
