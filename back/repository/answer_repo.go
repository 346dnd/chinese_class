package repository

import (
	"fmt"

	"github.com/edu-chinese-classroom/model"
)

func CreateAnswer(answer *model.Answer) error {
	query := `INSERT INTO answers (student_id, stage_id, task_id, text_id, blank_id, input, correct, retry_count) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := db.Exec(query, 
		answer.StudentId, 
		answer.StageId, 
		answer.TaskId, 
		answer.TextId,
		answer.BlankId,
		answer.Input,
		answer.Correct,
		answer.RetryCount,
	)
	if err != nil {
		return fmt.Errorf("failed to create answer: %w", err)
	}
	return nil
}

func GetAnswerByBlank(studentId, taskId, blankId string) (*model.Answer, error) {
	answer := &model.Answer{}
	query := `SELECT id, student_id, stage_id, task_id, text_id, blank_id, input, correct, retry_count, created_at FROM answers WHERE student_id = $1 AND task_id = $2 AND blank_id = $3 ORDER BY created_at DESC LIMIT 1`
	err := db.QueryRow(query, studentId, taskId, blankId).Scan(
		&answer.ID,
		&answer.StudentId,
		&answer.StageId,
		&answer.TaskId,
		&answer.TextId,
		&answer.BlankId,
		&answer.Input,
		&answer.Correct,
		&answer.RetryCount,
		&answer.CreatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get answer: %w", err)
	}
	return answer, nil
}

func UpdateAnswer(answer *model.Answer) error {
	query := `UPDATE answers SET input = $1, correct = $2, retry_count = $3 WHERE id = $4`
	_, err := db.Exec(query, answer.Input, answer.Correct, answer.RetryCount, answer.ID)
	if err != nil {
		return fmt.Errorf("failed to update answer: %w", err)
	}
	return nil
}
