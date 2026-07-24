CREATE TABLE IF NOT EXISTS users (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    score INT DEFAULT 0,
    device_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS progress (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    current_task_index INT DEFAULT 0,
    completed_task_ids TEXT[] DEFAULT '{}',
    status VARCHAR(20) DEFAULT 'in_progress',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS answers (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    text_id VARCHAR(50),
    blank_id VARCHAR(50),
    input TEXT NOT NULL,
    correct BOOLEAN DEFAULT FALSE,
    retry_count INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS homework (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    creation_type VARCHAR(50) NOT NULL,
    image_url VARCHAR(255),
    passed BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    score INT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS thoughts (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    text_id VARCHAR(50) NOT NULL,
    proud_aspect VARCHAR(100) NOT NULL,
    text_connection TEXT,
    life_connection TEXT,
    content TEXT NOT NULL,
    image_url VARCHAR(255),
    passed BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS questions (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    stage_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    keywords TEXT[],
    is_related BOOLEAN DEFAULT TRUE,
    passed BOOLEAN DEFAULT FALSE,
    feedback TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS groups (
    id VARCHAR(50) PRIMARY KEY,
    stage_id VARCHAR(50) NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    creation_type VARCHAR(50) NOT NULL,
    member_ids TEXT[] NOT NULL,
    leader_id VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS messages (
    id VARCHAR(50) PRIMARY KEY,
    group_id VARCHAR(50) NOT NULL,
    sender_id VARCHAR(50) NOT NULL,
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    audio_url VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS badges (
    id BIGSERIAL PRIMARY KEY,
    student_id VARCHAR(50) NOT NULL,
    badge_name VARCHAR(100) NOT NULL,
    condition TEXT NOT NULL,
    stage_id VARCHAR(50),
    award_time TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_progress_student_stage ON progress(student_id, stage_id);
CREATE INDEX IF NOT EXISTS idx_answers_student_task ON answers(student_id, task_id);
CREATE INDEX IF NOT EXISTS idx_thoughts_student_text ON thoughts(student_id, text_id);
CREATE INDEX IF NOT EXISTS idx_questions_student ON questions(student_id);
CREATE INDEX IF NOT EXISTS idx_groups_member_ids ON groups USING GIN(member_ids);
CREATE INDEX IF NOT EXISTS idx_messages_group_time ON messages(group_id, timestamp);
CREATE INDEX IF NOT EXISTS idx_badges_student ON badges(student_id);

INSERT INTO users (student_id, name, password_hash) VALUES 
('S2026001', '张三', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq'),
('S2026002', '李四', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq'),
('S2026003', '王五', '$2a$10$N9qo8uLOickgx2ZMRZoMye.IjzqAKL9xL5jvMFVdNJHvGCgTq/VEq')
ON CONFLICT (student_id) DO NOTHING;
