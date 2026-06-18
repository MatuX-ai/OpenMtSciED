/**
 * 为 concept_dependency 和 concept_path 表添加 CHECK 约束
 * Prisma 不直接支持 CHECK 约束，需手动通过 pg 驱动执行
 *
 * 运行方式: npx ts-node scripts/add-check-constraints.ts
 */

import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import * as path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

async function main() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  try {
    console.log('🔧 添加 CHECK 约束...');

    // concept_dependency: 禁止自环
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_no_self_dependency'
        ) THEN
          ALTER TABLE concept_dependency
            ADD CONSTRAINT chk_no_self_dependency CHECK (prerequisite_id <> dependent_id);
          RAISE NOTICE 'Added chk_no_self_dependency';
        ELSE
          RAISE NOTICE 'chk_no_self_dependency already exists';
        END IF;
      END $$;
    `);
    console.log('  ✅ concept_dependency: prerequisite_id <> dependent_id');

    // concept_path: depth 必须 >= 0
    await pool.query(`
      DO $$
      BEGIN
        IF NOT EXISTS (
          SELECT 1 FROM pg_constraint WHERE conname = 'chk_depth_non_negative'
        ) THEN
          ALTER TABLE concept_path
            ADD CONSTRAINT chk_depth_non_negative CHECK (depth >= 0);
          RAISE NOTICE 'Added chk_depth_non_negative';
        ELSE
          RAISE NOTICE 'chk_depth_non_negative already exists';
        END IF;
      END $$;
    `);
    console.log('  ✅ concept_path: depth >= 0');

    console.log('\n🎉 CHECK 约束添加完成！');
  } catch (error) {
    console.error('❌ 添加 CHECK 约束失败:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
