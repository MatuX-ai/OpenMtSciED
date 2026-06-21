-- CreateTable
CREATE TABLE IF NOT EXISTS "topic_draft" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER,
    "title" TEXT NOT NULL,
    "subject" VARCHAR(100),
    "grade_level" VARCHAR(50),
    "goals" TEXT,
    "duration_hours" DOUBLE PRECISION,
    "max_budget" DOUBLE PRECISION,
    "needs_hardware" BOOLEAN NOT NULL DEFAULT false,
    "outline_json" JSONB,
    "matched_resources_json" JSONB,
    "status" VARCHAR(30) NOT NULL DEFAULT 'draft',
    "current_step" INTEGER NOT NULL DEFAULT 0,
    "local_tutorial_id" INTEGER,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "topic_draft_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "topic_draft_user_id_idx" ON "topic_draft"("user_id");
CREATE INDEX IF NOT EXISTS "topic_draft_status_idx" ON "topic_draft"("status");

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'topic_draft_user_id_fkey'
  ) THEN
    ALTER TABLE "topic_draft"
      ADD CONSTRAINT "topic_draft_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
  END IF;
END $$;
