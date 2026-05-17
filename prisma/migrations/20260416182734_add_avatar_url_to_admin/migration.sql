-- AlterTable
ALTER TABLE "Admin" ADD COLUMN     "avatarUrl" TEXT;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "active" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "SiteSettings" ADD COLUMN     "googleAnalyticsId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "metaPixelId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoDescription" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoKeywords" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "seoTitle" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "tiktokPixelId" TEXT NOT NULL DEFAULT '';
