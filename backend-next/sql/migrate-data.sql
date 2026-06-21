-- ============================================================
-- OpenMTSciEd 学习路径闭包表 — 数据迁移模板
-- 兼容: Neon PostgreSQL
--
-- 推荐流程（幂等、含 legacy ID 映射）:
--   cd backend-next
--   npx tsx scripts/export-from-json.ts
--   npx tsx scripts/migrate-knowledge-graph.ts
--   npx tsx scripts/verify-closure.ts
--
-- 本文件为手工/Neon Console 备用方案。
-- 数据源: scripts/migration-output/exported_concepts.json
--         scripts/migration-output/exported_dependencies.json
-- ============================================================

-- ============================================================
-- Step 0: 确保 schema 已创建
-- ============================================================
-- \i schema.sql

-- ============================================================
-- Step 1: 导入知识点（示例单行）
-- legacy_neo4j_id 保留原 Neo4j/JSON 节点 ID 便于对账
-- ============================================================

INSERT INTO concept (name, description, legacy_neo4j_id, updated_at)
VALUES (
    '牛顿第一定律',
    '惯性定律',
    'KP-Phys-001',
    NOW()
)
ON CONFLICT (legacy_neo4j_id) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    updated_at = NOW();

-- 批量导入建议使用 psql \copy（需先将 JSON 转为 CSV）:
--
-- CREATE TEMP TABLE staging_concept (
--     legacy_id VARCHAR(255),
--     name VARCHAR(255),
--     description TEXT
-- );
--
-- \copy staging_concept FROM 'concepts.csv' WITH (FORMAT csv, HEADER true);
--
-- INSERT INTO concept (name, description, legacy_neo4j_id, updated_at)
-- SELECT name, description, legacy_id, NOW()
-- FROM staging_concept
-- ON CONFLICT (legacy_neo4j_id) DO UPDATE SET
--     name = EXCLUDED.name,
--     description = EXCLUDED.description,
--     updated_at = NOW();

-- ============================================================
-- Step 2: 导入直接依赖（需先解析 legacy ID → concept.id）
-- PROGRESSES_TO → path_type = 'required'
-- ============================================================

-- 示例: 已知 prerequisite legacy_id='KP-A', dependent legacy_id='KP-B'
INSERT INTO concept_dependency (prerequisite_id, dependent_id, path_type)
SELECT pre.id, dep.id, 'required'
FROM concept pre
JOIN concept dep ON dep.legacy_neo4j_id = 'KP-B'
WHERE pre.legacy_neo4j_id = 'KP-A'
ON CONFLICT (prerequisite_id, dependent_id, path_type) DO NOTHING;

-- ============================================================
-- Step 3: 初始化闭包表（全量重建）
-- ============================================================

-- SELECT * FROM rebuild_closure('required');
-- 若存在 optional 类型:
-- SELECT * FROM rebuild_closure('optional');

-- ============================================================
-- Step 4: 验证（快速检查）
-- ============================================================

SELECT
    (SELECT COUNT(*) FROM concept) AS concepts,
    (SELECT COUNT(*) FROM concept_dependency) AS dependencies,
    (SELECT COUNT(*) FROM concept_path) AS closure_rows,
    (SELECT COUNT(*) FROM concept_path WHERE depth = 0) AS self_refs;

-- 检查每条边在闭包表中是否有 depth=1 记录:
SELECT cd.prerequisite_id, cd.dependent_id, cd.path_type
FROM concept_dependency cd
LEFT JOIN concept_path cp
    ON cp.ancestor_id = cd.prerequisite_id
   AND cp.descendant_id = cd.dependent_id
   AND cp.path_type = cd.path_type
   AND cp.depth = 1
WHERE cp.ancestor_id IS NULL
LIMIT 10;
