-- M3: Publish workflow, public library, plagiarism reports

ALTER TABLE "creator_profile"
  ADD COLUMN IF NOT EXISTS "publish_frozen_until" TIMESTAMPTZ(3);

CREATE TABLE IF NOT EXISTS "tutorial_package" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "topic_draft_id" INTEGER,
    "local_tutorial_id" INTEGER,
    "title" TEXT NOT NULL,
    "subject" VARCHAR(100),
    "grade_level" VARCHAR(50),
    "package_json" JSONB NOT NULL,
    "scope" VARCHAR(20) NOT NULL DEFAULT 'private',
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "is_featured" BOOLEAN NOT NULL DEFAULT false,
    "published_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "tutorial_package_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "tutorial_package_user_id_idx" ON "tutorial_package"("user_id");
CREATE INDEX IF NOT EXISTS "tutorial_package_scope_status_idx" ON "tutorial_package"("scope", "status");
CREATE INDEX IF NOT EXISTS "tutorial_package_published_at_idx" ON "tutorial_package"("published_at");

CREATE TABLE IF NOT EXISTS "publish_request" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER NOT NULL,
    "user_id" INTEGER NOT NULL,
    "scope" VARCHAR(20) NOT NULL,
    "status" VARCHAR(30) NOT NULL DEFAULT 'pending',
    "copyright_confirmed" BOOLEAN NOT NULL DEFAULT false,
    "copyright_type" VARCHAR(30),
    "auto_review_score" DOUBLE PRECISION,
    "auto_review_notes" JSONB,
    "reviewer_id" INTEGER,
    "review_note" TEXT,
    "reviewed_at" TIMESTAMPTZ(3),
    "scheduled_payout_at" TIMESTAMPTZ(3),
    "payout_status" VARCHAR(20) NOT NULL DEFAULT 'none',
    "payout_paid_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "publish_request_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "publish_request_user_id_idx" ON "publish_request"("user_id");
CREATE INDEX IF NOT EXISTS "publish_request_status_idx" ON "publish_request"("status");
CREATE INDEX IF NOT EXISTS "publish_request_scope_status_idx" ON "publish_request"("scope", "status");
CREATE INDEX IF NOT EXISTS "publish_request_scheduled_payout_idx" ON "publish_request"("scheduled_payout_at", "payout_status");

CREATE TABLE IF NOT EXISTS "plagiarism_report" (
    "id" SERIAL NOT NULL,
    "package_id" INTEGER,
    "reporter_id" INTEGER NOT NULL,
    "target_user_id" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,
    "evidence" TEXT,
    "status" VARCHAR(20) NOT NULL DEFAULT 'pending',
    "admin_id" INTEGER,
    "admin_note" TEXT,
    "resolved_at" TIMESTAMPTZ(3),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "plagiarism_report_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "plagiarism_report_status_idx" ON "plagiarism_report"("status");
CREATE INDEX IF NOT EXISTS "plagiarism_report_target_user_id_idx" ON "plagiarism_report"("target_user_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tutorial_package_user_id_fkey') THEN
    ALTER TABLE "tutorial_package"
      ADD CONSTRAINT "tutorial_package_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'tutorial_package_topic_draft_id_fkey') THEN
    ALTER TABLE "tutorial_package"
      ADD CONSTRAINT "tutorial_package_topic_draft_id_fkey"
      FOREIGN KEY ("topic_draft_id") REFERENCES "topic_draft"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publish_request_package_id_fkey') THEN
    ALTER TABLE "publish_request"
      ADD CONSTRAINT "publish_request_package_id_fkey"
      FOREIGN KEY ("package_id") REFERENCES "tutorial_package"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publish_request_user_id_fkey') THEN
    ALTER TABLE "publish_request"
      ADD CONSTRAINT "publish_request_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'publish_request_reviewer_id_fkey') THEN
    ALTER TABLE "publish_request"
      ADD CONSTRAINT "publish_request_reviewer_id_fkey"
      FOREIGN KEY ("reviewer_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plagiarism_report_package_id_fkey') THEN
    ALTER TABLE "plagiarism_report"
      ADD CONSTRAINT "plagiarism_report_package_id_fkey"
      FOREIGN KEY ("package_id") REFERENCES "tutorial_package"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plagiarism_report_reporter_id_fkey') THEN
    ALTER TABLE "plagiarism_report"
      ADD CONSTRAINT "plagiarism_report_reporter_id_fkey"
      FOREIGN KEY ("reporter_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plagiarism_report_target_user_id_fkey') THEN
    ALTER TABLE "plagiarism_report"
      ADD CONSTRAINT "plagiarism_report_target_user_id_fkey"
      FOREIGN KEY ("target_user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'plagiarism_report_admin_id_fkey') THEN
    ALTER TABLE "plagiarism_report"
      ADD CONSTRAINT "plagiarism_report_admin_id_fkey"
      FOREIGN KEY ("admin_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
