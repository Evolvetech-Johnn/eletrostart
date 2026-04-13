import * as ExcelJS from "exceljs";
import { Product } from "@prisma/client";
import { Readable } from "stream";

export type ProductImportData = {
  sku: string;
  name: string;
  price?: number;
  costPrice?: number;
  stock?: number;
  categoryName?: string;
  categorySlug?: string;
  subcategory?: string;
  description?: string;
  active?: boolean;
  image?: string;
  unit?: string;
  code?: string;
  slug?: string;
  brand?: string;
};

export class ImportExportService {
  private parsePtBrNumber(value: unknown): number | undefined {
    if (value === null || value === undefined) return undefined;
    if (typeof value === "number") return Number.isFinite(value) ? value : undefined;
    const str = String(value).trim();
    if (!str) return undefined;
    const normalized = str.replace(/\./g, "").replace(",", ".").replace(/[^\d.-]/g, "");
    const num = Number(normalized);
    return Number.isFinite(num) ? num : undefined;
  }

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
      const firstLine = buffer
        .toString("utf8")
        .split(/\r?\n/, 1)[0]
        ?.trim();
      const delimiter = firstLine && firstLine.includes(";") ? ";" : ",";
      await workbook.csv.read(stream, {
        delimiter,
        parserOptions: { delimiter },
      } as any);
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
      const header = cell.text?.toLowerCase().trim().replace(/^\uFEFF/, "");
      headers[colNumber] = header;
    });

    const hasSkuLike = Object.values(headers).some((h) => {
      return (
        h.includes("sku") ||
        h.includes("código") ||
        h === "id" ||
        h.includes("codigo") ||
        h.includes("cod")
      );
    });
    if (!hasSkuLike) {
      throw new Error("Coluna SKU/Código/ID é obrigatória");
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

        if (
          header.includes("sku") ||
          header.includes("código") ||
          header === "id" ||
          header.includes("codigo") ||
          header.includes("cod")
        ) {
          const code = String(value).trim();
          product.sku = code;
          product.code = code;
          product.slug = code;
          if (product.sku) isValidRow = true;
        } else if (header.includes("nome") || header.includes("produto")) {
          product.name = String(value).trim();
        } else if (header.includes("preço") || header.includes("valor")) {
          product.price = this.parsePtBrNumber(value) ?? 0;
        } else if (header.includes("custo")) {
          product.costPrice = this.parsePtBrNumber(value) ?? 0;
        } else if (header.includes("estoque")) {
          product.stock = Number(value) || 0;
        } else if (header.includes("subcat") || header.includes("subcategoria")) {
          product.subcategory = String(value).trim();
        } else if (
          header === "categoria" ||
          (header.includes("categoria") && !header.includes("subcategoria")) ||
          header === "cat"
        ) {
          const raw = String(value).trim();
          product.categoryName = raw;
          product.categorySlug = raw
            ? raw
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "")
                .replace(/ /g, "-")
                .replace(/[^\w-]+/g, "")
            : undefined;
        } else if (header.includes("unid") || header.includes("unidade") || header === "unidade") {
          product.unit = String(value).trim();
        } else if (header.includes("marca")) {
          product.brand = String(value).trim();
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
