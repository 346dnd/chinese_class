package repository

import (
	"database/sql"
	"fmt"
	"time"

	"github.com/edu-chinese-classroom/model"
)

func GetUserByStudentId(studentId string) (*model.User, error) {
	user := &model.User{}
	query := `SELECT id, student_id, name, password_hash, score, device_id, created_at, updated_at FROM users WHERE student_id = $1`
	err := db.QueryRow(query, studentId).Scan(
		&user.ID,
		&user.StudentId,
		&user.Name,
		&user.PasswordHash,
		&user.Score,
		&user.DeviceId,
		&user.CreatedAt,
		&user.UpdatedAt,
	)
	if err == sql.ErrNoRows {
		return nil, nil
	}
	if err != nil {
		return nil, fmt.Errorf("failed to get user: %w", err)
	}
	return user, nil
}

func CreateUser(user *model.User) error {
	query := `INSERT INTO users (student_id, name, password_hash, score, device_id) VALUES ($1, $2, $3, $4, $5)`
	_, err := db.Exec(query, user.StudentId, user.Name, user.PasswordHash, user.Score, user.DeviceId)
	if err != nil {
		return fmt.Errorf("failed to create user: %w", err)
	}
	return nil
}

func UpdateUserScore(studentId string, score int) error {
	query := `UPDATE users SET score = $1, updated_at = $2 WHERE student_id = $3`
	_, err := db.Exec(query, score, time.Now(), studentId)
	if err != nil {
		return fmt.Errorf("failed to update user score: %w", err)
	}
	return nil
}
