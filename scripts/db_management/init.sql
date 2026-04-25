-- OpenMTSciEd PostgreSQL 数据库初始化脚本
-- 此脚本在容器首次启动时自动执行

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建表
CREATE TABLE IF NOT EXISTS stem_courses (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    source VARCHAR(100),
    level VARCHAR(50),
    subject VARCHAR(100),
    description TEXT,
    url TEXT,
    metadata_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS user_resources (
    id BIGSERIAL PRIMARY KEY,
    original_resource_id VARCHAR(255),
    title VARCHAR(500) NOT NULL,
    description TEXT,
    content JSONB,
    contributor_id VARCHAR(255),
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS question_banks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    source VARCHAR(100),
    subject VARCHAR(100),
    level VARCHAR(50),
    total_questions INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    bank_id BIGINT REFERENCES question_banks(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(50),
    difficulty INTEGER,
    options JSONB,
    correct_answer TEXT,
    explanation TEXT,
    tags JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS crawler_tasks (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    crawler_type VARCHAR(100),
    config JSONB,
    status VARCHAR(50) DEFAULT 'pending',
    last_run TIMESTAMP,
    next_run TIMESTAMP,
    total_items INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS resource_associations (
    id BIGSERIAL PRIMARY KEY,
    tutorial_id VARCHAR(255),
    material_id VARCHAR(255),
    hardware_project_id VARCHAR(255),
    association_type VARCHAR(50),
    confidence_score FLOAT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_courses_title ON stem_courses USING gin(title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_courses_subject ON stem_courses(subject);
CREATE INDEX IF NOT EXISTS idx_courses_level ON stem_courses(level);
CREATE INDEX IF NOT EXISTS idx_questions_bank_id ON questions(bank_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_crawler_tasks_status ON crawler_tasks(status);
CREATE INDEX IF NOT EXISTS idx_associations_tutorial ON resource_associations(tutorial_id);

-- 插入示例数据（可选）
INSERT INTO question_banks (name, description, source, subject, level)
VALUES 
    ('示例题库 - 物理力学', '高中物理力学基础测试题', 'manual', 'physics', 'high')
ON CONFLICT DO NOTHING;

-- 创建更新触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_stem_courses_updated_at
    BEFORE UPDATE ON stem_courses
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_resources_updated_at
    BEFORE UPDATE ON user_resources
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_question_banks_updated_at
    BEFORE UPDATE ON question_banks
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

COMMENT ON TABLE stem_courses IS 'STEM课程库';
COMMENT ON TABLE user_resources IS '用户贡献资源';
COMMENT ON TABLE question_banks IS '题库管理';
COMMENT ON TABLE questions IS '题目详情';
COMMENT ON TABLE crawler_tasks IS '爬虫任务';
COMMENT ON TABLE resource_associations IS '资源关联关系';
