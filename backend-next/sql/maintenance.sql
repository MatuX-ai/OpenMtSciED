-- ============================================================
-- OpenMTSciEd 学习路径闭包表 — 维护 SQL
-- 兼容: Neon PostgreSQL
-- 用法: psql $DATABASE_URL -f sql/maintenance.sql
-- 说明: 与应用层 lib/concept-path.ts 逻辑等价
-- ============================================================

-- ============================================================
-- 1. 插入直接依赖并维护闭包表
-- 参数: pre_id, dep_id, path_type (如 'required')
-- 步骤: 环检测 → 写边 → 自引用 → 直接路径 → 组合传递路径
-- ============================================================

-- 示例变量（执行前替换）:
-- pre_id = 10, dep_id = 20, path_type = 'required'

BEGIN;

-- 1.1 环检测: 若 dep 能到达 pre，则添加 pre→dep 会形成环
SELECT 1 AS cycle_detected
FROM concept_path
WHERE ancestor_id = 20   -- dep_id
  AND descendant_id = 10 -- pre_id
  AND path_type = 'required'
  AND depth > 0
LIMIT 1;
-- 若返回行，则不应继续插入

-- 1.2 插入直接依赖边
INSERT INTO concept_dependency (prerequisite_id, dependent_id, path_type)
VALUES (10, 20, 'required')
ON CONFLICT (prerequisite_id, dependent_id, path_type) DO NOTHING;

-- 1.3 自引用
INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
VALUES (10, 10, 0, 'required')
ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING;

INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
VALUES (20, 20, 0, 'required')
ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING;

-- 1.4 直接路径 (depth = 1)
INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
VALUES (10, 20, 1, 'required')
ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING;

-- 1.5 组合: ancestors_of(pre) × descendants_of(dep)
INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
SELECT
    cp1.ancestor_id,
    cp2.descendant_id,
    cp1.depth + cp2.depth + 1,
    'required'
FROM concept_path cp1
CROSS JOIN concept_path cp2
WHERE cp1.descendant_id = 10  -- pre_id
  AND cp2.ancestor_id = 20    -- dep_id
  AND cp1.path_type = 'required'
  AND cp2.path_type = 'required'
ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING;

COMMIT;

-- ============================================================
-- 2. 删除直接依赖 (MVP: 删边后全量重建该 path_type)
-- ============================================================

BEGIN;

DELETE FROM concept_dependency
WHERE prerequisite_id = 10
  AND dependent_id = 20
  AND path_type = 'required';

-- 调用下方 rebuild_closure 函数或内联重建
-- SELECT rebuild_closure('required');

COMMIT;

-- ============================================================
-- 3. PL/pgSQL: 全量重建指定 path_type 的闭包表
-- 与 lib/concept-path.ts rebuildClosureForTypeInTx 等价
-- ============================================================

CREATE OR REPLACE FUNCTION rebuild_closure(p_path_type TEXT)
RETURNS TABLE(rows_inserted BIGINT, elapsed_ms BIGINT)
LANGUAGE plpgsql
AS $$
DECLARE
    v_start TIMESTAMPTZ := clock_timestamp();
    v_count BIGINT;
BEGIN
    DELETE FROM concept_path WHERE path_type = p_path_type;

    INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
    SELECT id, id, 0, p_path_type
    FROM concept
    ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING;

    WITH RECURSIVE transitive AS (
        SELECT
            cd.prerequisite_id AS ancestor_id,
            cd.dependent_id AS descendant_id,
            1 AS depth,
            cd.path_type
        FROM concept_dependency cd
        WHERE cd.path_type = p_path_type

        UNION ALL

        SELECT
            t.ancestor_id,
            cd.dependent_id,
            t.depth + 1,
            cd.path_type
        FROM transitive t
        JOIN concept_dependency cd
            ON cd.prerequisite_id = t.descendant_id
           AND cd.path_type = t.path_type
        WHERE t.depth < 20
    )
    INSERT INTO concept_path (ancestor_id, descendant_id, depth, path_type)
    SELECT ancestor_id, descendant_id, MIN(depth), path_type
    FROM transitive
    GROUP BY ancestor_id, descendant_id, path_type
    ON CONFLICT (ancestor_id, descendant_id, path_type) DO NOTHING;

    GET DIAGNOSTICS v_count = ROW_COUNT;

    rows_inserted := v_count;
    elapsed_ms := EXTRACT(MILLISECONDS FROM clock_timestamp() - v_start)::BIGINT;
    RETURN NEXT;
END;
$$;

-- 使用示例:
-- SELECT * FROM rebuild_closure('required');
-- SELECT * FROM rebuild_closure('optional');

-- ============================================================
-- 4. 删除依赖 + 重建（完整 MVP 流程）
-- ============================================================

-- DELETE FROM concept_dependency
-- WHERE prerequisite_id = :pre_id AND dependent_id = :dep_id AND path_type = :path_type;
-- SELECT * FROM rebuild_closure(:path_type);
