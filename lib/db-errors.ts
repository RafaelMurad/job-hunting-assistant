export function isDatabaseUnavailableError(error: unknown): boolean {
  if (!error || typeof error !== "object") return false;

  const maybeCode = (error as { code?: unknown }).code;
  if (maybeCode === "P1001") return true;

  const maybeName = (error as { name?: unknown }).name;
  if (maybeName === "PrismaClientInitializationError") return true;

  const maybeMessage = (error as { message?: unknown }).message;
  if (typeof maybeMessage !== "string") return false;

  return (
    maybeMessage.includes("Can't reach database server") ||
    maybeMessage.includes("PrismaClientInitializationError")
  );
}

export function getDatabaseUnavailableMessage(_error: unknown): string {
  return "Database is not reachable. Check your DATABASE_URL in .env.local and confirm your database is running.";
}
