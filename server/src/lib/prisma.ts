import { PrismaClient } from "@prisma/client";

const isProduction = process.env.NODE_ENV === "production";

export const prisma = new PrismaClient({
  log: isProduction
    ? [
        { emit: "stdout", level: "error" },
        { emit: "stdout", level: "warn" },
      ]
    : [
        { emit: "stdout", level: "query" },
        { emit: "stdout", level: "info" },
        { emit: "stdout", level: "warn" },
        { emit: "stdout", level: "error" },
      ],
});
