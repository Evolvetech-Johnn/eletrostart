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

const formatBRL = (value: number) =>
  new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(
    value,
  );

export const buildOrderEmailTemplates = (d: MessageDetails) => {
  const subject = d.id ? `Novo Pedido ${d.id}` : `Novo Pedido`;

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
  const text = lines.join("\n");

  const htmlItems = d.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #eee;">
            ${item.name}${item.code ? ` <span style="color:#555">(COD: ${item.code})</span>` : ""}
          </td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${item.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #eee;text-align:right;">${formatBRL(item.unitPrice)}</td>
        </tr>`,
    )
    .join("");

  const htmlAddress = d.address
    ? `<p style="margin:4px 0;color:#333;">
        ${d.address.street}, ${d.address.number}${d.address.comp ? ` - ${d.address.comp}` : ""}
        <br/>${d.address.city} - ${d.address.state}
        <br/>CEP: ${d.address.zip}
      </p>`
    : "";

  const html = `<!doctype html>
<html>
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width, initial-scale=1"/>
  <title>${subject}</title>
</head>
<body style="font-family:Arial,Helvetica,sans-serif;background:#f6f7fb;padding:24px;">
  <div style="max-width:720px;margin:0 auto;background:#fff;border:1px solid #eee;border-radius:12px;overflow:hidden;">
    <div style="background:#f5f7ff;border-bottom:1px solid #e5e7ff;padding:16px 20px;">
      <h1 style="margin:0;font-size:18px;color:#1f2937;">Novo Pedido${d.id ? ` ${d.id}` : ""}</h1>
    </div>
    <div style="padding:20px;">
      <h2 style="margin:0 0 8px 0;font-size:16px;color:#111827;">Cliente</h2>
      <p style="margin:4px 0;color:#333;">${d.customerName}</p>
      <p style="margin:4px 0;color:#333;">${d.customerEmail}</p>
      <p style="margin:4px 0;color:#333;">${d.customerPhone || "-"}</p>

      <h2 style="margin:16px 0 8px 0;font-size:16px;color:#111827;">Endereço de Entrega</h2>
      ${htmlAddress}

      <h2 style="margin:16px 0 8px 0;font-size:16px;color:#111827;">Itens</h2>
      <table style="width:100%;border-collapse:collapse;">
        <thead>
          <tr style="background:#f9fafb;">
            <th style="padding:8px;text-align:left;color:#6b7280;font-size:12px;">Produto</th>
            <th style="padding:8px;text-align:right;color:#6b7280;font-size:12px;">Qtd</th>
            <th style="padding:8px;text-align:right;color:#6b7280;font-size:12px;">Unitário</th>
          </tr>
        </thead>
        <tbody>
          ${htmlItems}
        </tbody>
      </table>

      <div style="margin-top:16px;padding-top:12px;border-top:1px solid #eee;">
        <p style="margin:4px 0;color:#111827;">
          <strong>Total:</strong> ${formatBRL(d.total)}
        </p>
        <p style="margin:4px 0;color:#6b7280;">
          Forma de Pagamento: ${d.paymentMethod || "-"}
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

  return { subject, text, html };
};

export const orderToMessageDetails = (
  order: any,
  codesByProductId?: Record<string, string | undefined>,
): MessageDetails => {
  const address =
    order.addressStreet && order.addressCity && order.addressState
      ? {
          street: order.addressStreet,
          number: order.addressNumber,
          comp: order.addressComp || undefined,
          city: order.addressCity,
          state: order.addressState,
          zip: order.addressZip,
        }
      : undefined;
  return {
    id: order.id,
    customerName: order.customerName,
    customerPhone: order.customerPhone,
    customerEmail: order.customerEmail,
    address,
    items: (order.items || []).map((i: any) => ({
      name: i.productName || i.product?.name || "",
      quantity: Number(i.quantity),
      unitPrice: Number(i.unitPrice),
      code:
        codesByProductId?.[i.productId] ??
        (i.product && typeof i.product.code === "string"
          ? i.product.code
          : undefined),
    })),
    total: Number(order.total),
    paymentMethod: order.paymentMethod,
  };
};

export const sendEmail = async (details: MessageDetails) => {
  return;
};
