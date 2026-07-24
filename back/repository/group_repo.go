package repository

import (
	"fmt"
	"time"

	"github.com/lib/pq"
	"github.com/edu-chinese-classroom/model"
)

func CreateGroup(group *model.Group) error {
	query := `INSERT INTO groups (id, stage_id, task_id, creation_type, member_ids, leader_id, status) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := db.Exec(query, 
		group.ID, 
		group.StageId, 
		group.TaskId, 
		group.CreationType,
		pq.Array(group.MemberIds),
		group.LeaderId,
		group.Status,
	)
	if err != nil {
		return fmt.Errorf("failed to create group: %w", err)
	}
	return nil
}

func GetGroup(groupId string) (*model.Group, error) {
	group := &model.Group{}
	query := `SELECT id, stage_id, task_id, creation_type, member_ids, leader_id, status, created_at, updated_at FROM groups WHERE id = $1`
	err := db.QueryRow(query, groupId).Scan(
		&group.ID,
		&group.StageId,
		&group.TaskId,
		&group.CreationType,
		pq.Array(&group.MemberIds),
		&group.LeaderId,
		&group.Status,
		&group.CreatedAt,
		&group.UpdatedAt,
	)
	if err != nil {
		return nil, fmt.Errorf("failed to get group: %w", err)
	}
	return group, nil
}

func GetGroupsByMemberId(memberId string) ([]model.Group, error) {
	rows, err := db.Query(`SELECT id, stage_id, task_id, creation_type, member_ids, leader_id, status, created_at, updated_at FROM groups WHERE $1 = ANY(member_ids)`, memberId)
	if err != nil {
		return nil, fmt.Errorf("failed to get groups by member: %w", err)
	}
	defer rows.Close()

	var groups []model.Group
	for rows.Next() {
		var g model.Group
		err := rows.Scan(
			&g.ID,
			&g.StageId,
			&g.TaskId,
			&g.CreationType,
			pq.Array(&g.MemberIds),
			&g.LeaderId,
			&g.Status,
			&g.CreatedAt,
			&g.UpdatedAt,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan group: %w", err)
		}
		groups = append(groups, g)
	}
	return groups, nil
}

func UpdateGroupStatus(groupId, status string) error {
	query := `UPDATE groups SET status = $1, updated_at = $2 WHERE id = $3`
	_, err := db.Exec(query, status, time.Now(), groupId)
	if err != nil {
		return fmt.Errorf("failed to update group status: %w", err)
	}
	return nil
}
