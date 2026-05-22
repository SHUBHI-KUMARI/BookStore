-- Add new enum value for richer admin order tracking
ALTER TYPE "OrderStatus" ADD VALUE IF NOT EXISTS 'PROCESSING';

-- Extend book listings with seller-only operational notes
ALTER TABLE "Book"
ADD COLUMN "sellerNotes" TEXT;

-- Extend orders with shipping and mock payment metadata
ALTER TABLE "Order"
ADD COLUMN "subtotalAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "shippingFee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN "paymentMethod" TEXT,
ADD COLUMN "paymentReference" TEXT,
ADD COLUMN "paymentNote" TEXT,
ADD COLUMN "deliveryMethod" TEXT NOT NULL DEFAULT 'STANDARD',
ADD COLUMN "shippingFullName" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shippingEmail" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shippingPhone" TEXT,
ADD COLUMN "shippingAddressLine1" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shippingAddressLine2" TEXT,
ADD COLUMN "shippingCity" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shippingState" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shippingPostalCode" TEXT NOT NULL DEFAULT '',
ADD COLUMN "shippingCountry" TEXT NOT NULL DEFAULT 'United States',
ADD COLUMN "orderNotes" TEXT;

-- Backfill existing orders with sensible defaults
UPDATE "Order"
SET
  "subtotalAmount" = "totalAmount",
  "shippingFee" = 0,
  "paymentMethod" = COALESCE("paymentMethod", 'UPI'),
  "paymentNote" = COALESCE(
    "paymentNote",
    CASE
      WHEN "paymentStatus" = 'REFUNDED' THEN 'Legacy order refunded before marketplace upgrade'
      WHEN "paymentStatus" = 'COMPLETED' THEN 'Legacy order imported as mock-paid'
      WHEN "paymentStatus" = 'FAILED' THEN 'Legacy order marked as failed before marketplace upgrade'
      ELSE 'Legacy order awaiting payment'
    END
  ),
  "deliveryMethod" = COALESCE(NULLIF("deliveryMethod", ''), 'STANDARD'),
  "shippingFullName" = COALESCE(NULLIF("shippingFullName", ''), 'Legacy Customer'),
  "shippingEmail" = COALESCE(NULLIF("shippingEmail", ''), 'legacy@example.com'),
  "shippingAddressLine1" = COALESCE(NULLIF("shippingAddressLine1", ''), 'Legacy Address'),
  "shippingCity" = COALESCE(NULLIF("shippingCity", ''), 'Legacy City'),
  "shippingState" = COALESCE(NULLIF("shippingState", ''), 'Legacy State'),
  "shippingPostalCode" = COALESCE(NULLIF("shippingPostalCode", ''), '00000'),
  "shippingCountry" = COALESCE(NULLIF("shippingCountry", ''), 'United States');

-- Match Prisma schema defaults after backfill
ALTER TABLE "Order"
ALTER COLUMN "subtotalAmount" DROP DEFAULT,
ALTER COLUMN "shippingFullName" DROP DEFAULT,
ALTER COLUMN "shippingEmail" DROP DEFAULT,
ALTER COLUMN "shippingAddressLine1" DROP DEFAULT,
ALTER COLUMN "shippingCity" DROP DEFAULT,
ALTER COLUMN "shippingState" DROP DEFAULT,
ALTER COLUMN "shippingPostalCode" DROP DEFAULT;
