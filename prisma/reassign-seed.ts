/**
 * Script to reassign seed data to the currently logged-in user
 * Run with: npx ts-node prisma/reassign-seed.ts test@oi.com
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Guard: Only allow seeding in development/staging
const ALLOWED_ENVS = ["development", "test", "staging"];
const currentEnv = process.env.NODE_ENV || "development";

if (!ALLOWED_ENVS.includes(currentEnv)) {
  console.error(`❌ Seed reassignment is not allowed in ${currentEnv} environment.`);
  console.error(`   Allowed environments: ${ALLOWED_ENVS.join(", ")}`);
  process.exit(1);
}

async function main(): Promise<void> {
  const targetEmail = process.argv[2] || "test@oi.com";

  // eslint-disable-next-line no-console
  console.log(`Reassigning seed data to user: ${targetEmail}`);

  // Get the target user
  const targetUser = await prisma.user.findFirst({
    where: { email: targetEmail },
  });

  if (!targetUser) {
    console.error(`User with email ${targetEmail} not found`);
    process.exit(1);
  }

  // eslint-disable-next-line no-console
  console.log(`Found target user: ${targetUser.id} (${targetUser.name})`);

  // Get the seed user (created by seed.ts)
  const seedUser = await prisma.user.findFirst({
    where: { email: "rafael.murad@example.com" },
  });

  if (!seedUser) {
    // eslint-disable-next-line no-console
    console.log("Seed user not found - seed data may already be reassigned");
    return;
  }

  // eslint-disable-next-line no-console
  console.log(`Found seed user: ${seedUser.id}`);

  // Reassign CVs
  const cvs = await prisma.cV.updateMany({
    where: { userId: seedUser.id },
    data: { userId: targetUser.id },
  });
  // eslint-disable-next-line no-console
  console.log(`Reassigned ${cvs.count} CVs`);

  // Reassign applications
  const apps = await prisma.application.updateMany({
    where: { userId: seedUser.id },
    data: { userId: targetUser.id },
  });
  // eslint-disable-next-line no-console
  console.log(`Reassigned ${apps.count} applications`);

  // Delete the seed user
  await prisma.user.delete({ where: { id: seedUser.id } });
  // eslint-disable-next-line no-console
  console.log("Deleted seed user");

  // eslint-disable-next-line no-console
  console.log("Done! Refresh your browser to see the data.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
