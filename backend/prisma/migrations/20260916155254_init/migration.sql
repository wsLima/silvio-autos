-- CreateEnum
CREATE TYPE "ListingStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SOLD');

-- CreateTable
CREATE TABLE "Admin" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Admin_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarListing" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "manufacturingYear" INTEGER NOT NULL,
    "locality" TEXT NOT NULL,
    "price" DECIMAL(12,2) NOT NULL,
    "mileage" INTEGER NOT NULL,
    "description" TEXT NOT NULL,
    "features" TEXT[],
    "status" "ListingStatus" NOT NULL DEFAULT 'ACTIVE',
    "isHighlight" BOOLEAN NOT NULL DEFAULT false,
    "contactName" TEXT NOT NULL,
    "contactPhone" TEXT NOT NULL,
    "contactWhatsapp" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CarListing_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CarListingImage" (
    "id" TEXT NOT NULL,
    "listingId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "CarListingImage_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Admin_email_key" ON "Admin"("email");

-- CreateIndex
CREATE INDEX "CarListing_status_idx" ON "CarListing"("status");

-- CreateIndex
CREATE INDEX "CarListing_brand_idx" ON "CarListing"("brand");

-- CreateIndex
CREATE INDEX "CarListingImage_listingId_idx" ON "CarListingImage"("listingId");

-- AddForeignKey
ALTER TABLE "CarListingImage" ADD CONSTRAINT "CarListingImage_listingId_fkey" FOREIGN KEY ("listingId") REFERENCES "CarListing"("id") ON DELETE CASCADE ON UPDATE CASCADE;
