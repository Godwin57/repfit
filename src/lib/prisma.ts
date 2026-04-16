import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

// Instantiate a connection pool using your .env string
const connectionString = process.env.DATABASE_URL;
const pool = new Pool({ connectionString });

// Wrap the pool in the Prisma 7 Adapter
const adapter = new PrismaPg(pool);

// Establish the Global Singleton to prevent hot-reload connection limits
const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({ adapter });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
