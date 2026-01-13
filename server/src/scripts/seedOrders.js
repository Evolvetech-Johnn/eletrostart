import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const customers = [
  {
    name: "João Silva",
    email: "joao@email.com",
    phone: "11999999999",
    city: "São Paulo",
    state: "SP",
  },
  {
    name: "Maria Santos",
    email: "maria@email.com",
    phone: "21988888888",
    city: "Rio de Janeiro",
    state: "RJ",
  },
  {
    name: "Carlos Oliveira",
    email: "carlos@email.com",
    phone: "31977777777",
    city: "Belo Horizonte",
    state: "MG",
  },
  {
    name: "Ana Souza",
    email: "ana@email.com",
    phone: "41966666666",
    city: "Curitiba",
    state: "PR",
  },
  {
    name: "Pedro Lima",
    email: "pedro@email.com",
    phone: "51955555555",
    city: "Porto Alegre",
    state: "RS",
  },
  {
    name: "Fernanda Costa",
    email: "fernanda@email.com",
    phone: "61944444444",
    city: "Brasília",
    state: "DF",
  },
  {
    name: "Ricardo Pereira",
    email: "ricardo@email.com",
    phone: "71933333333",
    city: "Salvador",
    state: "BA",
  },
  {
    name: "Juliana Martins",
    email: "juliana@email.com",
    phone: "81922222222",
    city: "Recife",
    state: "PE",
  },
];

const statuses = ["PENDING", "PAID", "SHIPPED", "DELIVERED", "CANCELLED"];
const paymentMethods = ["PIX", "CREDIT_CARD", "BOLETO"];

function getRandomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  console.log("🌱 Seeding Orders...");

  // Get all products
  const products = await prisma.product.findMany();

  if (products.length === 0) {
    console.error("No products found! Please run seedProducts.js first.");
    return;
  }

  for (let i = 0; i < 12; i++) {
    const customer = getRandomItem(customers);
    const numItems = getRandomInt(1, 5);
    const orderItemsData = [];
    let subtotal = 0;

    for (let j = 0; j < numItems; j++) {
      const product = getRandomItem(products);
      const quantity = getRandomInt(1, 3);
      const unitPrice = Number(product.price);
      const totalPrice = unitPrice * quantity;

      orderItemsData.push({
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice,
        totalPrice,
      });

      subtotal += totalPrice;
    }

    const shippingCost = getRandomInt(15, 50);
    const total = subtotal + shippingCost;

    // Random date in last 30 days
    const date = new Date();
    date.setDate(date.getDate() - getRandomInt(0, 30));

    const status = getRandomItem(statuses);
    let paymentStatus = "PENDING";

    if (status === "PAID" || status === "SHIPPED" || status === "DELIVERED") {
      paymentStatus = "PAID";
    } else if (status === "CANCELLED") {
      paymentStatus = Math.random() > 0.5 ? "FAILED" : "REFUNDED";
    }

    await prisma.order.create({
      data: {
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone,
        addressCity: customer.city,
        addressState: customer.state,
        addressStreet: "Rua Exemplo",
        addressNumber: String(getRandomInt(10, 999)),
        addressZip: "00000-000",

        subtotal,
        shippingCost,
        total,

        status,
        paymentMethod: getRandomItem(paymentMethods),
        paymentStatus,

        createdAt: date,

        items: {
          create: orderItemsData,
        },
      },
    });

    console.log(
      `Created order for ${customer.name} - R$ ${total.toFixed(
        2
      )} - Status: ${status}`
    );
  }

  console.log("✅ Orders Seed Finished!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
