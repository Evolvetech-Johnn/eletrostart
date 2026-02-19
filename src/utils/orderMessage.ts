import { Order } from "../services/orderService";

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export type MessageItem = {
  name: string;
  quantity: number;
  unitPrice: number;
  code?: string;
};

export type MessageAddress = {
  street: string;
  number: string;
  comp?: string;
  city: string;
  state: string;
  zip: string;
};

export type MessageDetails = {
  id?: string;
  customerName: string;
  customerPhone?: string;
  customerEmail: string;
  address?: MessageAddress;
  items: MessageItem[];
  total: number;
  paymentMethod?: string;
};

export const buildWhatsappMessage = (d: MessageDetails): string => {
  const lines: string[] = [];
  const idSuffix = d.id ? ` ${d.id}` : "";
  lines.push(`🛒 *NOVO PEDIDO${idSuffix}*`);
  lines.push("");
  lines.push(`Cliente: ${d.customerName}`);
  lines.push(`Telefone: ${d.customerPhone || "-"}`);
  lines.push(`E-mail: ${d.customerEmail}`);
  if (d.address) {
    const addr = `${d.address.street}, ${d.address.number}${
      d.address.comp ? " - " + d.address.comp : ""
    } · ${d.address.city} - ${d.address.state} · CEP: ${d.address.zip}`;
    lines.push(addr);
  }
  lines.push("");
  lines.push("Itens:");
  d.items.forEach((item) => {
    const unit = formatBRL(item.unitPrice);
    const code = item.code ? ` (COD: ${item.code})` : "";
    lines.push(`- ${item.name}${code}`);
    lines.push(`  Qtd: ${item.quantity} | Unit: ${unit}`);
  });
  lines.push("");
  lines.push(`Total: ${formatBRL(d.total)}`);
  lines.push(`Forma de Pagamento: ${d.paymentMethod || "-"}`);
  return lines.join("\n");
};

export const orderToMessageDetails = (
  order: Order,
  codesByProductId?: Record<string, string | undefined>,
): MessageDetails => {
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    address: {
      street: order.addressStreet,
      number: order.addressNumber,
      comp: order.addressComp || undefined,
      city: order.addressCity,
      state: order.addressState,
      zip: order.addressZip,
    },
    items: order.items.map((i) => ({
      name: i.productName,
      quantity: i.quantity,
      unitPrice: i.unitPrice,
      code: codesByProductId ? codesByProductId[i.productId] : undefined,
    })),
    total: order.total,
    paymentMethod: order.paymentMethod,
  };
};
