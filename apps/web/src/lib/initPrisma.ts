// apps/web/src/lib/initPrisma.ts
import { prisma } from "./prisma";

// Esperamos a que Prisma se conecte antes de continuar
await prisma.$connect();
console.log("Prisma connected (initPrisma.ts)");
