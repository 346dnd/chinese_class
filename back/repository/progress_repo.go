package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/lib/pq"
	"github.com/edu-chinese-classroom/model"
)

func GetProgress(studentId, stageId string) (*model.Progress, error) {
	progress := &model.Progress{}
	query := `SELECT id, student_id, stage_id, task_id, current_task_index, completed_task_ids, status, created_at, updated_at FROM progress WHERE student_id = $1 AND stage_id = $2`
	err := db.QueryRow(query, studentId, stageId).Scan(
		&progress.ID,
		&progress.StudentId,
		&progress.StageId,
		&progress.TaskId,
		&progress.CurrentTaskIndex,
		pq.Array(&progress.CompletedTaskIds),
		&progress.Status,
		&progress.CreatedAt,
		&progress.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get progress: %w", err)
	}
	return progress, nil
}

func CreateProgress(progress *model.Progress) error {
	query := `INSERT INTO progress (student_id, stage_id, task_id, current_task_index, completed_task_ids, status) VALUES ($1, $2, $3, $4, $5, $6)`
	_, err := db.Exec(query, progress.StudentId, progress.StageId, progress.TaskId, progress.CurrentTaskIndex, pq.Array(progress.CompletedTaskIds), progress.Status)
	if err != nil {
		return fmt.Errorf("failed to create progress: %w", err)
	}
	return nil
}

func UpdateProgress(progress *model.Progress) error {
	query := `UPDATE progress SET current_task_index = $1, completed_task_ids = $2, status = $3, updated_at = $4 WHERE student_id = $5 AND stage_id = $6`
	_, err := db.Exec(query, progress.CurrentTaskIndex, pq.Array(progress.CompletedTaskIds), progress.Status, time.Now(), progress.StudentId, progress.StageId)
	if err != nil {
		return fmt.Errorf("failed to update progress: %w", err)
	}
	return nil
}

func MarkTaskCompleted(studentId, stageId, taskId string) error {
	query := `UPDATE progress SET completed_task_ids = array_append(completed_task_ids, $1), updated_at = $2 WHERE student_id = $3 AND stage_id = $4`
	_, err := db.Exec(query, taskId, time.Now(), studentId, stageId)
	if err != nil {
		return fmt.Errorf("failed to mark task completed: %w", err)
	}
	return nil
}
