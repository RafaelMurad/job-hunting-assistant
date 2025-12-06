import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log(`Start seeding ...`);

  // Create a default user
  const user = await prisma.user.upsert({
    where: { email: "rafael.murad@example.com" },
    update: {},
    create: {
      email: "rafael.murad@example.com",
      name: "Rafael Murad",
      phone: "123-456-7890",
      location: "San Francisco, CA",
      summary: "A passionate software engineer with experience in building web applications.",
      experience: "Software Engineer at Tech Corp (2022-Present)",
      skills: "TypeScript, React, Next.js, Prisma, PostgreSQL",
    },
  });

  // eslint-disable-next-line no-console
  console.log(`Created user with id: ${user.id}`);
  // eslint-disable-next-line no-console
  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
     
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
