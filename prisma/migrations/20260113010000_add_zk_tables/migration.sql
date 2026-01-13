-- CreateTable
CREATE TABLE "ZkUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "authKeyHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZkUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ZkVault" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "encryptedData" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "lastModified" TIMESTAMP(3) NOT NULL,
    "serverUpdatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ZkVault_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ZkUser_email_key" ON "ZkUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "ZkUser_authKeyHash_key" ON "ZkUser"("authKeyHash");

-- CreateIndex
CREATE UNIQUE INDEX "ZkVault_userId_key" ON "ZkVault"("userId");

-- AddForeignKey
ALTER TABLE "ZkVault" ADD CONSTRAINT "ZkVault_userId_fkey" FOREIGN KEY ("userId") REFERENCES "ZkUser"("id") ON DELETE CASCADE ON UPDATE CASCADE;
