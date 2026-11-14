import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const rows = await prisma.product.findMany({
  select: { slug: true, image: true },
  take: 8,
});
console.log(rows);
await prisma.$disconnect();
