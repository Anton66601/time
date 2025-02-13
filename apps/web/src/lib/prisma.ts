import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

console.log("Prisma instance keys:", Object.keys(prisma));

export { prisma };
