-- M2: Creator credits, attribution, brand templates, concept-tutorial links

CREATE TABLE IF NOT EXISTS "resource_attribution" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "resource_type" VARCHAR(50) NOT NULL,
    "resource_id" VARCHAR(255) NOT NULL,
    "resource_title" TEXT,
    "source_url" TEXT NOT NULL,
    "license" VARCHAR(100),
    "author" VARCHAR(255),
    "retrieved_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "resource_attribution_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "resource_attribution_user_id_idx" ON "resource_attribution"("user_id");
CREATE INDEX IF NOT EXISTS "resource_attribution_resource_type_resource_id_idx"
  ON "resource_attribution"("resource_type", "resource_id");

CREATE TABLE IF NOT EXISTS "creator_profile" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "cc_total" INTEGER NOT NULL DEFAULT 0,
    "level" INTEGER NOT NULL DEFAULT 1,
    "badges" JSONB NOT NULL DEFAULT '[]',
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "creator_profile_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "creator_profile_user_id_key" ON "creator_profile"("user_id");

CREATE TABLE IF NOT EXISTS "credit_ledger" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "action" VARCHAR(50) NOT NULL,
    "cc_delta" INTEGER NOT NULL,
    "ref_type" VARCHAR(50) NOT NULL DEFAULT '',
    "ref_id" VARCHAR(255) NOT NULL DEFAULT '',
    "note" TEXT,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "credit_ledger_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "credit_ledger_user_id_created_at_idx" ON "credit_ledger"("user_id", "created_at");
CREATE INDEX IF NOT EXISTS "credit_ledger_user_id_action_idx" ON "credit_ledger"("user_id", "action");
CREATE UNIQUE INDEX IF NOT EXISTS "credit_ledger_user_id_action_ref_type_ref_id_key"
  ON "credit_ledger"("user_id", "action", "ref_type", "ref_id");

CREATE TABLE IF NOT EXISTS "brand_template" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" VARCHAR(100) NOT NULL DEFAULT '默认模板',
    "logo_path" TEXT,
    "watermark_text" TEXT,
    "footer" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "brand_template_pkey" PRIMARY KEY ("id")
);

CREATE INDEX IF NOT EXISTS "brand_template_user_id_idx" ON "brand_template"("user_id");

CREATE TABLE IF NOT EXISTS "concept_tutorial_link" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "concept_id" INTEGER NOT NULL,
    "local_tutorial_id" INTEGER NOT NULL,
    "tutorial_title" TEXT,
    "subject" VARCHAR(100),
    "created_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "concept_tutorial_link_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "concept_tutorial_link_user_id_local_tutorial_id_key"
  ON "concept_tutorial_link"("user_id", "local_tutorial_id");
CREATE INDEX IF NOT EXISTS "concept_tutorial_link_concept_id_idx" ON "concept_tutorial_link"("concept_id");

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'resource_attribution_user_id_fkey') THEN
    ALTER TABLE "resource_attribution"
      ADD CONSTRAINT "resource_attribution_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'creator_profile_user_id_fkey') THEN
    ALTER TABLE "creator_profile"
      ADD CONSTRAINT "creator_profile_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'credit_ledger_user_id_fkey') THEN
    ALTER TABLE "credit_ledger"
      ADD CONSTRAINT "credit_ledger_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'brand_template_user_id_fkey') THEN
    ALTER TABLE "brand_template"
      ADD CONSTRAINT "brand_template_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'concept_tutorial_link_user_id_fkey') THEN
    ALTER TABLE "concept_tutorial_link"
      ADD CONSTRAINT "concept_tutorial_link_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'concept_tutorial_link_concept_id_fkey') THEN
    ALTER TABLE "concept_tutorial_link"
      ADD CONSTRAINT "concept_tutorial_link_concept_id_fkey"
      FOREIGN KEY ("concept_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;
  END IF;
END $$;
