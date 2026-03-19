import { calcularPrecoPrazo, consultarCep } from "correios-brasil";

export const CEP_ORIGIN_DEFAULT = process.env.CEP_ORIGIN || "86010000"; // Londrina-PR as default

export interface QuoteRequest {
  cepDestino: string;
  pesoGramos: number;
  comprimentoCm: number;
  alturaCm: number;
  larguraCm: number;
}

export const calculateShipping = async (data: QuoteRequest) => {
  try {
    const rawCep = data.cepDestino.replace(/\D/g, "");
    if (rawCep.length !== 8) throw new Error("CEP_INVALID");

    // Correios requires KG as string, minimum 1
    const pesoKg = Math.max(1, Math.ceil(data.pesoGramos / 1000)).toString();

    // Limits
    const length = Math.max(16, data.comprimentoCm).toString();
    const height = Math.max(2, data.alturaCm).toString();
    const width = Math.max(11, data.larguraCm).toString();

    const args = {
      sCepOrigem: CEP_ORIGIN_DEFAULT,
      sCepDestino: rawCep,
      nVlPeso: pesoKg,
      nCdFormato: "1", // 1 = Caixa/Pacote
      nVlComprimento: length,
      nVlAltura: height,
      nVlLargura: width,
      nCdServico: ["04510", "04014"], // 04510 = PAC, 04014 = SEDEX
      nVlDiametro: "0",
    };

    const results = await calcularPrecoPrazo(args);

    if (!Array.isArray(results)) {
       throw new Error("SHIPPING_ERROR");
    }

    return results.map((r: any) => ({
      name: r.Codigo === "04510" ? "PAC" : r.Codigo === "04014" ? "SEDEX" : "Transportadora",
      price: parseFloat(r.Valor.replace(",", ".")),
      deadline: parseInt(r.PrazoEntrega, 10),
      error: r.Erro !== "0" ? r.MsgErro : null,
    }));
  } catch (err: any) {
    if (err.message === "CEP_INVALID") throw err;
    console.error("Shipping API Error:", err);
    throw new Error("SHIPPING_ERROR");
  }
};

export const getCepInfo = async (cep: string) => {
  const rawCep = cep.replace(/\D/g, "");
  if (rawCep.length !== 8) throw new Error("CEP_INVALID");
  return consultarCep(rawCep);
};
