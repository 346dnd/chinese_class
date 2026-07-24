package repository

import (
	"database/sql"
	"fmt"

	"github.com/edu-chinese-classroom/model"
)

func CreateThought(thought *model.Thought) error {
	query := `INSERT INTO thoughts (student_id, stage_id, task_id, text_id, proud_aspect, text_connection, life_connection, content, image_url, passed, feedback) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)`
	_, err := db.Exec(query, 
		thought.StudentId, 
		thought.StageId, 
		thought.TaskId, 
		thought.TextId,
		thought.ProudAspect,
		thought.TextConnection,
		thought.LifeConnection,
		thought.Content,
		thought.ImageUrl,
		thought.Passed,
		thought.Feedback,
	)
	if err != nil {
		return fmt.Errorf("failed to create thought: %w", err)
	}
	return nil
}

func GetThoughtsByStudentId(studentId string) ([]model.Thought, error) {
	rows, err := db.Query(`SELECT id, student_id, stage_id, task_id, text_id, proud_aspect, text_connection, life_connection, content, image_url, passed, feedback, created_at FROM thoughts WHERE student_id = $1`, studentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get thoughts: %w", err)
	}
	defer rows.Close()

	var thoughts []model.Thought
	for rows.Next() {
		var t model.Thought
		err := rows.Scan(
			&t.ID,
			&t.StudentId,
			&t.StageId,
			&t.TaskId,
			&t.TextId,
			&t.ProudAspect,
			&t.TextConnection,
			&t.LifeConnection,
			&t.Content,
			&t.ImageUrl,
			&t.Passed,
			&t.Feedback,
			&t.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan thought: %w", err)
		}
		thoughts = append(thoughts, t)
	}
	return thoughts, nil
}

func UpdateThoughtFeedback(studentId, textId string, feedback string, passed bool) error {
	query := `UPDATE thoughts SET feedback = $1, passed = $2 WHERE student_id = $3 AND text_id = $4`
	_, err := db.Exec(query, feedback, passed, studentId, textId)
	if err != nil {
		return fmt.Errorf("failed to update thought feedback: %w", err)
	}
	return nil
}
