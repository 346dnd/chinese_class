package repository

import (
	"fmt"

	"github.com/lib/pq"
	"github.com/edu-chinese-classroom/model"
)

func CreateQuestion(question *model.Question) error {
	query := `INSERT INTO questions (student_id, stage_id, task_id, content, keywords, is_related, passed, feedback) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`
	_, err := db.Exec(query, 
		question.StudentId, 
		question.StageId, 
		question.TaskId, 
		question.Content,
		pq.Array(question.Keywords),
		question.IsRelated,
		question.Passed,
		question.Feedback,
	)
	if err != nil {
		return fmt.Errorf("failed to create question: %w", err)
	}
	return nil
}

func GetQuestionsByStudentId(studentId string) ([]model.Question, error) {
	rows, err := db.Query(`SELECT id, student_id, stage_id, task_id, content, keywords, is_related, passed, feedback, created_at FROM questions WHERE student_id = $1`, studentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get questions: %w", err)
	}
	defer rows.Close()

	var questions []model.Question
	for rows.Next() {
		var q model.Question
		err := rows.Scan(
			&q.ID,
			&q.StudentId,
			&q.StageId,
			&q.TaskId,
			&q.Content,
			pq.Array(&q.Keywords),
			&q.IsRelated,
			&q.Passed,
			&q.Feedback,
			&q.CreatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan question: %w", err)
		}
		questions = append(questions, q)
	}
	return questions, nil
}

func UpdateQuestionFeedback(questionId int64, feedback string, passed bool) error {
	query := `UPDATE questions SET feedback = $1, passed = $2 WHERE id = $3`
	_, err := db.Exec(query, feedback, passed, questionId)
	if err != nil {
		return fmt.Errorf("failed to update question feedback: %w", err)
	}
	return nil
}
