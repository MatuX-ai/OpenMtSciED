-- ============================================================
-- OpenMTSciEd 学习路径闭包表 — 数据库初始化
-- 兼容: Neon PostgreSQL (Serverless Postgres)
-- 用法: psql $DATABASE_URL -f sql/schema.sql
-- 说明: 幂等设计，可重复执行；若 Prisma 已迁移则跳过已存在对象
-- ============================================================

-- 知识点表
CREATE TABLE IF NOT EXISTS "concept" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "legacy_neo4j_id" VARCHAR(255),
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "concept_pkey" PRIMARY KEY ("id")
);

-- 直接依赖关系表（边）
CREATE TABLE IF NOT EXISTS "concept_dependency" (
    "prerequisite_id" INTEGER NOT NULL,
    "dependent_id" INTEGER NOT NULL,
    "path_type" VARCHAR(50) NOT NULL DEFAULT 'required',
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    CONSTRAINT "concept_dependency_pkey" PRIMARY KEY ("prerequisite_id", "dependent_id", "path_type")
);

-- 传递闭包表
CREATE TABLE IF NOT EXISTS "concept_path" (
    "ancestor_id" INTEGER NOT NULL,
    "descendant_id" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "path_type" VARCHAR(50) NOT NULL,
    CONSTRAINT "concept_path_pkey" PRIMARY KEY ("ancestor_id", "descendant_id", "path_type")
);

-- ============================================================
-- 索引
-- ============================================================

CREATE INDEX IF NOT EXISTS "concept_name_idx" ON "concept" ("name");
CREATE UNIQUE INDEX IF NOT EXISTS "concept_legacy_neo4j_id_key" ON "concept" ("legacy_neo4j_id");

CREATE INDEX IF NOT EXISTS "concept_dependency_dependent_id_path_type_idx"
    ON "concept_dependency" ("dependent_id", "path_type");
CREATE INDEX IF NOT EXISTS "concept_dependency_prerequisite_id_path_type_idx"
    ON "concept_dependency" ("prerequisite_id", "path_type");

CREATE INDEX IF NOT EXISTS "concept_path_descendant_id_path_type_depth_idx"
    ON "concept_path" ("descendant_id", "path_type", "depth");
CREATE INDEX IF NOT EXISTS "concept_path_ancestor_id_path_type_depth_idx"
    ON "concept_path" ("ancestor_id", "path_type", "depth");

-- ============================================================
-- 外键约束（DO 块避免重复添加）
-- ============================================================

DO $$ BEGIN
    ALTER TABLE "concept_dependency"
        ADD CONSTRAINT "concept_dependency_prerequisite_id_fkey"
        FOREIGN KEY ("prerequisite_id") REFERENCES "concept" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "concept_dependency"
        ADD CONSTRAINT "concept_dependency_dependent_id_fkey"
        FOREIGN KEY ("dependent_id") REFERENCES "concept" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "concept_path"
        ADD CONSTRAINT "concept_path_ancestor_id_fkey"
        FOREIGN KEY ("ancestor_id") REFERENCES "concept" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "concept_path"
        ADD CONSTRAINT "concept_path_descendant_id_fkey"
        FOREIGN KEY ("descendant_id") REFERENCES "concept" ("id")
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- CHECK 约束
-- ============================================================

DO $$ BEGIN
    ALTER TABLE "concept_dependency"
        ADD CONSTRAINT "chk_no_self_dependency"
        CHECK (prerequisite_id <> dependent_id);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    ALTER TABLE "concept_path"
        ADD CONSTRAINT "chk_depth_non_negative"
        CHECK (depth >= 0);
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;
