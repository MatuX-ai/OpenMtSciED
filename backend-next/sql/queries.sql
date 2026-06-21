-- ============================================================
-- OpenMTSciEd 学习路径闭包表 — 核心查询 SQL
-- 兼容: Neon PostgreSQL
-- 用法: psql $DATABASE_URL -f sql/queries.sql
--       或在 Neon SQL Editor 中替换参数后执行
-- ============================================================

-- 示例参数（psql）
-- \set target_id 42
-- \set start_id 3
-- \set from_id 3
-- \set to_id 42
-- \set path_type 'required'

-- ============================================================
-- Q1: 获取目标知识点的所有前置依赖
-- 场景: 「我该先学什么？」
-- 排序: depth DESC（最基础的知识点排最前）
-- 参数: :target_id, :path_type (默认 'required')
-- ============================================================

-- SELECT c.id, c.name, c.description, cp.depth
-- FROM concept_path cp
-- JOIN concept c ON cp.ancestor_id = c.id
-- WHERE cp.descendant_id = :target_id
--   AND cp.path_type = :path_type
--   AND cp.depth > 0
-- ORDER BY cp.depth DESC;

-- 示例（将 42 替换为目标知识点 ID）:
SELECT c.id, c.name, c.description, cp.depth
FROM concept_path cp
JOIN concept c ON cp.ancestor_id = c.id
WHERE cp.descendant_id = 42
  AND cp.path_type = 'required'
  AND cp.depth > 0
ORDER BY cp.depth DESC;

-- ============================================================
-- Q2: 获取已掌握知识点的所有后续可学节点
-- 场景: 「学了这个能做什么？」
-- 排序: depth ASC（距离越近越靠前）
-- 参数: :start_id, :path_type
-- ============================================================

SELECT c.id, c.name, c.description, cp.depth
FROM concept_path cp
JOIN concept c ON cp.descendant_id = c.id
WHERE cp.ancestor_id = 3
  AND cp.path_type = 'required'
  AND cp.depth > 0
ORDER BY cp.depth ASC;

-- ============================================================
-- Q3a: 路径存在性检查（闭包表，O(1) 索引查找）
-- 参数: :from_id, :to_id, :path_type
-- ============================================================

SELECT depth
FROM concept_path
WHERE ancestor_id = 3
  AND descendant_id = 42
  AND path_type = 'required'
  AND depth > 0
LIMIT 1;

-- ============================================================
-- Q3b: 完整路径链条重建（边表递归 CTE BFS）
-- 闭包表只存起终点与最短 depth；中间节点通过边表 BFS 重建
-- 参数: :from_id, :to_id, :path_type
-- ============================================================

WITH RECURSIVE route AS (
    SELECT
        cd.prerequisite_id AS node_id,
        cd.dependent_id AS next_id,
        ARRAY[cd.prerequisite_id, cd.dependent_id] AS path,
        1 AS depth
    FROM concept_dependency cd
    WHERE cd.prerequisite_id = 3
      AND cd.path_type = 'required'

    UNION ALL

    SELECT
        r.node_id,
        cd.dependent_id,
        r.path || cd.dependent_id,
        r.depth + 1
    FROM route r
    JOIN concept_dependency cd ON cd.prerequisite_id = r.next_id
    WHERE cd.path_type = 'required'
      AND NOT cd.dependent_id = ANY (r.path)
      AND r.depth < 20
)
SELECT path
FROM route
WHERE next_id = 42
ORDER BY depth ASC
LIMIT 1;

-- ============================================================
-- Q3c: 路径上各节点名称（配合 Q3b 结果）
-- ============================================================

-- 假设 path = ARRAY[3, 7, 15, 28, 42]
SELECT id, name
FROM concept
WHERE id = ANY (ARRAY[3, 7, 15, 28, 42])
ORDER BY array_position(ARRAY[3, 7, 15, 28, 42]::int[], id);

-- ============================================================
-- 辅助: 查找无前置依赖的根节点（学习路径生成）
-- ============================================================

SELECT c.id, c.name
FROM concept c
WHERE NOT EXISTS (
    SELECT 1 FROM concept_path cp
    WHERE cp.descendant_id = c.id
      AND cp.path_type = 'required'
      AND cp.depth > 0
)
ORDER BY c.id
LIMIT 10;
