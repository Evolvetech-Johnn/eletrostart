
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🔄 Checking for inconsistent Admin Roles...");

  // Find users with lowercase 'admin' or mixed case
  const users = await prisma.adminUser.findMany();

  let fixedCount = 0;

  for (const user of users) {
    if (user.role === "admin" || (user.role !== "ADMIN" && user.role.toUpperCase() === "ADMIN")) {
      console.log(`Fixing role for user: ${user.email} (${user.role} -> ADMIN)`);
      
      await prisma.adminUser.update({
        where: { id: user.id },
        data: { role: "ADMIN" },
      });
      
      fixedCount++;
    }
  }

  if (fixedCount > 0) {
    console.log(`✅ Fixed ${fixedCount} users.`);
  } else {
    console.log("✅ All users already have correct role format.");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
