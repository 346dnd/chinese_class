package repository

import (
	"fmt"

	"github.com/edu-chinese-classroom/model"
)

func AwardBadge(badge *model.Badge) error {
	query := `INSERT INTO badges (student_id, badge_name, condition, stage_id, award_time) VALUES ($1, $2, $3, $4, $5)`
	_, err := db.Exec(query, 
		badge.StudentId, 
		badge.BadgeName, 
		badge.Condition,
		badge.StageId,
		badge.AwardTime,
	)
	if err != nil {
		return fmt.Errorf("failed to award badge: %w", err)
	}
	return nil
}

func GetBadgesByStudentId(studentId string) ([]model.Badge, error) {
	rows, err := db.Query(`SELECT id, student_id, badge_name, condition, stage_id, award_time FROM badges WHERE student_id = $1`, studentId)
	if err != nil {
		return nil, fmt.Errorf("failed to get badges: %w", err)
	}
	defer rows.Close()

	var badges []model.Badge
	for rows.Next() {
		var b model.Badge
		err := rows.Scan(
			&b.ID,
			&b.StudentId,
			&b.BadgeName,
			&b.Condition,
			&b.StageId,
			&b.AwardTime,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan badge: %w", err)
		}
		badges = append(badges, b)
	}
	return badges, nil
}

func HasBadge(studentId, badgeName string) (bool, error) {
	var count int
	query := `SELECT COUNT(*) FROM badges WHERE student_id = $1 AND badge_name = $2`
	err := db.QueryRow(query, studentId, badgeName).Scan(&count)
	if err != nil {
		return false, fmt.Errorf("failed to check badge: %w", err)
	}
	return count > 0, nil
}
