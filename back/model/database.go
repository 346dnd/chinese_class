package model

import (
	"database/sql"
	"time"
)

type User struct {
	ID           int64     `db:"id"`
	StudentId    string    `db:"student_id"`
	Name         string    `db:"name"`
	PasswordHash string    `db:"password_hash"`
	Score        int       `db:"score"`
	DeviceId     sql.NullString `db:"device_id"`
	CreatedAt    time.Time `db:"created_at"`
	UpdatedAt    time.Time `db:"updated_at"`
}

type Progress struct {
	ID                int64      `db:"id"`
	StudentId         string     `db:"student_id"`
	StageId           string     `db:"stage_id"`
	TaskId            string     `db:"task_id"`
	CurrentTaskIndex  int        `db:"current_task_index"`
	CompletedTaskIds  []string   `db:"completed_task_ids"`
	Status            string     `db:"status"`
	CreatedAt         time.Time  `db:"created_at"`
	UpdatedAt         time.Time  `db:"updated_at"`
}

type Answer struct {
	ID         int64     `db:"id"`
	StudentId  string    `db:"student_id"`
	StageId    string    `db:"stage_id"`
	TaskId     string    `db:"task_id"`
	TextId     sql.NullString `db:"text_id"`
	BlankId    sql.NullString `db:"blank_id"`
	Input      string    `db:"input"`
	Correct    bool      `db:"correct"`
	RetryCount int       `db:"retry_count"`
	CreatedAt  time.Time `db:"created_at"`
}

type Homework struct {
	ID            int64     `db:"id"`
	StudentId     string    `db:"student_id"`
	StageId       string    `db:"stage_id"`
	TaskId        string    `db:"task_id"`
	Content       string    `db:"content"`
	CreationType  string    `db:"creation_type"`
	ImageUrl      sql.NullString `db:"image_url"`
	Passed        bool      `db:"passed"`
	Feedback      sql.NullString `db:"feedback"`
	Score         sql.NullInt64  `db:"score"`
	CreatedAt     time.Time `db:"created_at"`
	UpdatedAt     time.Time `db:"updated_at"`
}

type Thought struct {
	ID             int64     `db:"id"`
	StudentId      string    `db:"student_id"`
	StageId        string    `db:"stage_id"`
	TaskId         string    `db:"task_id"`
	TextId         string    `db:"text_id"`
	ProudAspect    string    `db:"proud_aspect"`
	TextConnection sql.NullString `db:"text_connection"`
	LifeConnection sql.NullString `db:"life_connection"`
	Content        string    `db:"content"`
	ImageUrl       sql.NullString `db:"image_url"`
	Passed         bool      `db:"passed"`
	Feedback       sql.NullString `db:"feedback"`
	CreatedAt      time.Time `db:"created_at"`
}

type Question struct {
	ID          int64      `db:"id"`
	StudentId   string     `db:"student_id"`
	StageId     string     `db:"stage_id"`
	TaskId      string     `db:"task_id"`
	Content     string     `db:"content"`
	Keywords    []string   `db:"keywords"`
	IsRelated   bool       `db:"is_related"`
	Passed      bool       `db:"passed"`
	Feedback    sql.NullString `db:"feedback"`
	CreatedAt   time.Time  `db:"created_at"`
}

type Group struct {
	ID            string     `db:"id"`
	StageId       string     `db:"stage_id"`
	TaskId        string     `db:"task_id"`
	CreationType  string     `db:"creation_type"`
	MemberIds     []string   `db:"member_ids"`
	LeaderId      sql.NullString `db:"leader_id"`
	Status        string     `db:"status"`
	CreatedAt     time.Time  `db:"created_at"`
	UpdatedAt     time.Time  `db:"updated_at"`
}

type Message struct {
	ID          string     `db:"id"`
	GroupId     string     `db:"group_id"`
	SenderId    string     `db:"sender_id"`
	Content     string     `db:"content"`
	MessageType string     `db:"message_type"`
	AudioUrl    sql.NullString `db:"audio_url"`
	Timestamp   time.Time  `db:"timestamp"`
}

type Badge struct {
	ID         int64      `db:"id"`
	StudentId  string     `db:"student_id"`
	BadgeName  string     `db:"badge_name"`
	Condition  string     `db:"condition"`
	StageId    sql.NullString `db:"stage_id"`
	AwardTime  time.Time  `db:"award_time"`
}
