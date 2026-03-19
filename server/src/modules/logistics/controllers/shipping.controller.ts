import { Request, Response } from "express";
import { calculateShipping, QuoteRequest, getCepInfo } from "../services/shipping.service";
import { prisma } from "../../../lib/prisma";

export const getShippingQuote = async (req: Request, res: Response) => {
  try {
    const { cep, cartItems } = req.body;
    
    if (!cep) {
      return res.status(400).json({ success: false, message: "CEP é obrigatório." });
    }

    // Para o MVP Eletrostart: assumimos pacote de tamanho padrão.
    // Numa versão V2 avançada, faríamos a cubagem dinâmica iterando sobre cartItems.
    const quoteData: QuoteRequest = {
      cepDestino: cep as string,
      pesoGramos: 1000,
      comprimentoCm: 20,
      alturaCm: 20,
      larguraCm: 20,
    };

    const rates = await calculateShipping(quoteData);

    res.json({ success: true, data: rates });
  } catch (error: any) {
    if (error.message === "CEP_INVALID") {
      return res.status(400).json({ success: false, message: "CEP inválido. Deve conter 8 dígitos." });
    }
    res.status(500).json({ success: false, message: "Erro de comunicação ao cotar frete." });
  }
};

export const getAddressByCep = async (req: Request, res: Response) => {
  try {
    const cep = req.params.cep as string;
    const address = await getCepInfo(cep);
    res.json({ success: true, data: address });
  } catch (error: any) {
    res.status(400).json({ success: false, message: "Endereço ou CEP não localizado." });
  }
};
