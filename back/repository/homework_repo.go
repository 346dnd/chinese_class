package repository

import (
	"fmt"
	"time"

	"github.com/edu-chinese-classroom/model"
)

func CreateHomework(homework *model.Homework) error {
	query := `INSERT INTO homework (student_id, stage_id, task_id, content, creation_type, image_url, passed, feedback, score) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`
	_, err := db.Exec(query, 
		homework.StudentId, 
		homework.StageId, 
		homework.TaskId, 
		homework.Content,
		homework.CreationType,
		homework.ImageUrl,
		homework.Passed,
		homework.Feedback,
		homework.Score,
	)
	if err != nil {
		return fmt.Errorf("failed to create homework: %w", err)
	}
	return nil
}

func GetHomeworkByStudentId(studentId string) ([]model.Homework, error) {
	rows, err := db.Query(`SELECT id, student_id, stage_id, task_id, content, creation_type, image_url, passed, feedback, score, created_at, updated_at FROM homework WHERE student_id = $1`, studentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get homework: %w", err)
	}
	defer rows.Close()

	var homeworks []model.Homework
	for rows.Next() {
		var h model.Homework
		err := rows.Scan(
			&h.ID,
			&h.StudentId,
			&h.StageId,
			&h.TaskId,
			&h.Content,
			&h.CreationType,
			&h.ImageUrl,
			&h.Passed,
			&h.Feedback,
			&h.Score,
			&h.CreatedAt,
			&h.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan homework: %w", err)
		}
		homeworks = append(homeworks, h)
	}
	return homeworks, nil
}

func UpdateHomework(homework *model.Homework) error {
	query := `UPDATE homework SET passed = $1, feedback = $2, score = $3, updated_at = $4 WHERE id = $5`
	_, err := db.Exec(query, homework.Passed, homework.Feedback, homework.Score, time.Now(), homework.ID)
	if err != nil {
		return fmt.Errorf("failed to update homework: %w", err)
	}
	return nil
}
