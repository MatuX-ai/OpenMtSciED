-- ============================================================
-- 学习路径闭包表迁移 (Neo4j → PostgreSQL)
-- 创建时间: 2026-06-18
-- 说明: 新增 concept / concept_dependency / concept_path 三表
-- ============================================================

-- 知识点表
CREATE TABLE "concept" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "legacy_neo4j_id" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "concept_pkey" PRIMARY KEY ("id")
);

-- 直接依赖关系表（边）
CREATE TABLE "concept_dependency" (
    "prerequisite_id" INTEGER NOT NULL,
    "dependent_id" INTEGER NOT NULL,
    "path_type" VARCHAR(50) NOT NULL DEFAULT 'required',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "concept_dependency_pkey" PRIMARY KEY ("prerequisite_id","dependent_id","path_type")
);

-- 传递闭包表
CREATE TABLE "concept_path" (
    "ancestor_id" INTEGER NOT NULL,
    "descendant_id" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "path_type" VARCHAR(50) NOT NULL,

    CONSTRAINT "concept_path_pkey" PRIMARY KEY ("ancestor_id","descendant_id","path_type")
);

-- ============================================================
-- 索引
-- ============================================================

CREATE INDEX "concept_name_idx" ON "concept"("name");
CREATE UNIQUE INDEX "concept_legacy_neo4j_id_key" ON "concept"("legacy_neo4j_id");

CREATE INDEX "concept_dependency_dependent_id_path_type_idx" ON "concept_dependency"("dependent_id", "path_type");
CREATE INDEX "concept_dependency_prerequisite_id_path_type_idx" ON "concept_dependency"("prerequisite_id", "path_type");

CREATE INDEX "concept_path_descendant_id_path_type_depth_idx" ON "concept_path"("descendant_id", "path_type", "depth");
CREATE INDEX "concept_path_ancestor_id_path_type_depth_idx" ON "concept_path"("ancestor_id", "path_type", "depth");

-- ============================================================
-- 外键约束
-- ============================================================

ALTER TABLE "concept_dependency" ADD CONSTRAINT "concept_dependency_prerequisite_id_fkey"
    FOREIGN KEY ("prerequisite_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "concept_dependency" ADD CONSTRAINT "concept_dependency_dependent_id_fkey"
    FOREIGN KEY ("dependent_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "concept_path" ADD CONSTRAINT "concept_path_ancestor_id_fkey"
    FOREIGN KEY ("ancestor_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "concept_path" ADD CONSTRAINT "concept_path_descendant_id_fkey"
    FOREIGN KEY ("descendant_id") REFERENCES "concept"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- ============================================================
-- CHECK 约束（Prisma 不直接支持）
-- ============================================================

ALTER TABLE "concept_dependency" ADD CONSTRAINT "chk_no_self_dependency"
    CHECK (prerequisite_id <> dependent_id);

ALTER TABLE "concept_path" ADD CONSTRAINT "chk_depth_non_negative"
    CHECK (depth >= 0);
