import { Router } from "express";
import { getShippingQuote, getAddressByCep } from "./controllers/shipping.controller";

export const logisticsRoutes = Router();

logisticsRoutes.post("/shipping/quote", getShippingQuote);
logisticsRoutes.get("/shipping/cep/:cep", getAddressByCep);
