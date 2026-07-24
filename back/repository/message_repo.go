package repository

import (
	"fmt"

	"github.com/edu-chinese-classroom/model"
)

func CreateMessage(msg *model.Message) error {
	query := `INSERT INTO messages (id, group_id, sender_id, content, message_type, audio_url, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7)`
	_, err := db.Exec(query, 
		msg.ID, 
		msg.GroupId, 
		msg.SenderId, 
		msg.Content,
		msg.MessageType,
		msg.AudioUrl,
		msg.Timestamp,
	)
	if err != nil {
		return fmt.Errorf("failed to create message: %w", err)
	}
	return nil
}

func GetMessagesByGroupId(groupId string, page, pageSize int) ([]model.Message, error) {
	offset := (page - 1) * pageSize
	rows, err := db.Query(`SELECT id, group_id, sender_id, content, message_type, audio_url, timestamp FROM messages WHERE group_id = $1 ORDER BY timestamp DESC LIMIT $2 OFFSET $3`, groupId, pageSize, offset)
	if err != nil {
		return nil, fmt.Errorf("failed to get messages: %w", err)
	}
	defer rows.Close()

	var messages []model.Message
	for rows.Next() {
		var m model.Message
		err := rows.Scan(
			&m.ID,
			&m.GroupId,
			&m.SenderId,
			&m.Content,
			&m.MessageType,
			&m.AudioUrl,
			&m.Timestamp,
		)
		if err != nil {
			return nil, fmt.Errorf("failed to scan message: %w", err)
		}
		messages = append(messages, m)
	}
	return messages, nil
}

func GetMessageCountByGroupId(groupId string) (int, error) {
	var count int
	query := `SELECT COUNT(*) FROM messages WHERE group_id = $1`
	err := db.QueryRow(query, groupId).Scan(&count)
	if err != nil {
		return 0, fmt.Errorf("failed to get message count: %w", err)
	}
	return count, nil
}
