import type { Prisma } from "@prisma/client";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const now = new Date();

// Generate some sample transactions across the current month
const sampleTransactions: Prisma.TransactionCreateInput[] = [
  // Income entries
];

async function main() {
  console.log("Start seeding...");

  // Create transactions
  for (const tx of sampleTransactions) {
    const transaction = await prisma.transaction.create({
      data: tx,
    });
    console.log(
      `Created transaction: ${transaction.type} - ${transaction.amount}`
    );
  }

  console.log("Seeding finished");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
