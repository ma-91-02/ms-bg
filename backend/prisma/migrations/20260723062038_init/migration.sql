-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- CreateExtension
CREATE EXTENSION IF NOT EXISTS "unaccent";

-- CreateEnum
CREATE TYPE "AdvertisementType" AS ENUM ('lost', 'found');

-- CreateEnum
CREATE TYPE "ItemCategory" AS ENUM ('passport', 'national_id', 'driving_license', 'other');

-- CreateEnum
CREATE TYPE "Governorate" AS ENUM ('baghdad', 'basra', 'erbil', 'sulaymaniyah', 'duhok', 'nineveh', 'kirkuk', 'diyala', 'anbar', 'babil', 'karbala', 'najaf', 'wasit', 'muthanna', 'diwaniyah', 'maysan', 'dhiqar', 'saladin');

-- CreateEnum
CREATE TYPE "AdvertisementStatus" AS ENUM ('pending', 'approved', 'rejected', 'resolved');

-- CreateEnum
CREATE TYPE "MatchStatus" AS ENUM ('pending', 'approved', 'rejected', 'completed');

-- CreateEnum
CREATE TYPE "ContactRequestStatus" AS ENUM ('pending', 'approved', 'rejected');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('advertisement', 'admin_message', 'contact_request', 'contact_approved', 'contact_rejected', 'system');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('superadmin', 'admin', 'moderator');

-- CreateEnum
CREATE TYPE "PointsReason" AS ENUM ('ad_created', 'contact_confirmed', 'item_returned', 'monthly_active', 'admin_adjustment', 'reward_redeemed');

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "phone_number" TEXT NOT NULL,
    "full_name" TEXT,
    "last_name" TEXT,
    "email" TEXT,
    "password" TEXT,
    "birth_date" TIMESTAMP(3),
    "address" TEXT,
    "profile_image" TEXT,
    "is_blocked" BOOLEAN NOT NULL DEFAULT false,
    "is_admin" BOOLEAN NOT NULL DEFAULT false,
    "is_profile_complete" BOOLEAN NOT NULL DEFAULT false,
    "block_reason" TEXT,
    "blocked_at" TIMESTAMP(3),
    "blocked_by" VARCHAR(36),
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_at" TIMESTAMP(3),
    "deleted_by" VARCHAR(36),
    "points" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admins" (
    "id" VARCHAR(36) NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'admin',
    "last_login" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "admins_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisements" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "type" "AdvertisementType" NOT NULL,
    "category" "ItemCategory" NOT NULL,
    "governorate" "Governorate" NOT NULL,
    "owner_name" TEXT,
    "item_number" TEXT,
    "description" TEXT NOT NULL,
    "images" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "contact_phone" TEXT NOT NULL,
    "status" "AdvertisementStatus" NOT NULL DEFAULT 'pending',
    "is_approved" BOOLEAN NOT NULL DEFAULT false,
    "approved_at" TIMESTAMP(3),
    "approved_by" VARCHAR(36),
    "rejection_reason" TEXT,
    "is_resolved" BOOLEAN NOT NULL DEFAULT false,
    "resolved_at" TIMESTAMP(3),
    "hide_contact_info" BOOLEAN NOT NULL DEFAULT true,
    "is_archived" BOOLEAN NOT NULL DEFAULT false,
    "archived_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisements_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "advertisement_matches" (
    "id" VARCHAR(36) NOT NULL,
    "lost_advertisement_id" VARCHAR(36) NOT NULL,
    "found_advertisement_id" VARCHAR(36) NOT NULL,
    "match_score" INTEGER NOT NULL,
    "matching_fields" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "MatchStatus" NOT NULL DEFAULT 'pending',
    "approved_by" VARCHAR(36),
    "approved_at" TIMESTAMP(3),
    "notification_sent" BOOLEAN NOT NULL DEFAULT false,
    "notification_sent_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "advertisement_matches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "contact_requests" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "advertisement_id" VARCHAR(36) NOT NULL,
    "advertiser_user_id" VARCHAR(36) NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "ContactRequestStatus" NOT NULL DEFAULT 'pending',
    "approved_by" VARCHAR(36),
    "approved_at" TIMESTAMP(3),
    "rejection_reason" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "favorites" (
    "user_id" VARCHAR(36) NOT NULL,
    "advertisement_id" VARCHAR(36) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "favorites_pkey" PRIMARY KEY ("user_id","advertisement_id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "title" TEXT NOT NULL,
    "body" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "reference_id" VARCHAR(36),
    "data" JSONB,
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" VARCHAR(36) NOT NULL,
    "phone_number" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "is_used" BOOLEAN NOT NULL DEFAULT false,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "is_for_password_reset" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "points_entries" (
    "id" VARCHAR(36) NOT NULL,
    "user_id" VARCHAR(36) NOT NULL,
    "amount" INTEGER NOT NULL,
    "reason" "PointsReason" NOT NULL,
    "reference_id" VARCHAR(36),
    "note" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "points_entries_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_number_key" ON "users"("phone_number");

-- CreateIndex
CREATE INDEX "users_is_blocked_idx" ON "users"("is_blocked");

-- CreateIndex
CREATE UNIQUE INDEX "admins_username_key" ON "admins"("username");

-- CreateIndex
CREATE UNIQUE INDEX "admins_email_key" ON "admins"("email");

-- CreateIndex
CREATE INDEX "advertisements_type_category_is_approved_is_resolved_idx" ON "advertisements"("type", "category", "is_approved", "is_resolved");

-- CreateIndex
CREATE INDEX "advertisements_governorate_status_idx" ON "advertisements"("governorate", "status");

-- CreateIndex
CREATE INDEX "advertisements_user_id_created_at_idx" ON "advertisements"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "advertisements_owner_name_idx" ON "advertisements" USING GIN ("owner_name" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "advertisements_item_number_idx" ON "advertisements" USING GIN ("item_number" gin_trgm_ops);

-- CreateIndex
CREATE INDEX "advertisement_matches_status_created_at_idx" ON "advertisement_matches"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "advertisement_matches_lost_advertisement_id_found_advertise_key" ON "advertisement_matches"("lost_advertisement_id", "found_advertisement_id");

-- CreateIndex
CREATE INDEX "contact_requests_status_created_at_idx" ON "contact_requests"("status", "created_at");

-- CreateIndex
CREATE UNIQUE INDEX "contact_requests_user_id_advertisement_id_key" ON "contact_requests"("user_id", "advertisement_id");

-- CreateIndex
CREATE INDEX "favorites_advertisement_id_idx" ON "favorites"("advertisement_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "otps_phone_number_is_used_expires_at_idx" ON "otps"("phone_number", "is_used", "expires_at");

-- CreateIndex
CREATE INDEX "otps_expires_at_idx" ON "otps"("expires_at");

-- CreateIndex
CREATE INDEX "points_entries_user_id_created_at_idx" ON "points_entries"("user_id", "created_at");

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisements" ADD CONSTRAINT "advertisements_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_matches" ADD CONSTRAINT "advertisement_matches_lost_advertisement_id_fkey" FOREIGN KEY ("lost_advertisement_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_matches" ADD CONSTRAINT "advertisement_matches_found_advertisement_id_fkey" FOREIGN KEY ("found_advertisement_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "advertisement_matches" ADD CONSTRAINT "advertisement_matches_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_advertisement_id_fkey" FOREIGN KEY ("advertisement_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_advertiser_user_id_fkey" FOREIGN KEY ("advertiser_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_requests" ADD CONSTRAINT "contact_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "admins"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "favorites" ADD CONSTRAINT "favorites_advertisement_id_fkey" FOREIGN KEY ("advertisement_id") REFERENCES "advertisements"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "points_entries" ADD CONSTRAINT "points_entries_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
