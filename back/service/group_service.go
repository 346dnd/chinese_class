package service

import (
	"github.com/google/uuid"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type GroupService struct{}

func NewGroupService() *GroupService {
	return &GroupService{}
}

func (s *GroupService) CreateGroup(req model.GroupCreateRequest, studentId string) (*model.GroupCreateResponse, error) {
	groupId := "group-" + uuid.New().String()[:8]

	group := &model.Group{
		ID:           groupId,
		StageId:      req.StageId,
		TaskId:       req.TaskId,
		CreationType: req.CreationType,
		MemberIds:    req.MemberIds,
		LeaderId:     nullString(studentId),
		Status:       "active",
	}

	err := repository.CreateGroup(group)
	if err != nil {
		return nil, err
	}

	return &model.GroupCreateResponse{
		GroupId:      groupId,
		Members:      req.MemberIds,
		CreationType: req.CreationType,
	}, nil
}

func (s *GroupService) SendMessage(req model.MessageSendRequest, studentId string) (*model.MessageSendResponse, error) {
	msgType := req.MessageType
	if msgType == "" {
		msgType = "text"
	}

	msgId := "msg-" + uuid.New().String()[:8]

	message := &model.Message{
		ID:          msgId,
		GroupId:     req.GroupId,
		SenderId:    studentId,
		Content:     req.Content,
		MessageType: msgType,
	}

	err := repository.CreateMessage(message)
	if err != nil {
		return nil, err
	}

	return &model.MessageSendResponse{
		MessageId: msgId,
		Content:   req.Content,
		Timestamp: message.Timestamp.Format("2006-01-02T15:04:05Z"),
	}, nil
}

func (s *GroupService) GetMessages(req model.MessageListRequest) (*model.MessageListResponse, error) {
	messages, err := repository.GetMessagesByGroupId(req.GroupId, req.Page, req.PageSize)
	if err != nil {
		return nil, err
	}

	count, err := repository.GetMessageCountByGroupId(req.GroupId)
	if err != nil {
		return nil, err
	}

	var items []model.MessageItem
	for _, m := range messages {
		senderName := "未知"
		if m.SenderId != "" {
			user, _ := repository.GetUserByStudentId(m.SenderId)
			if user != nil {
				senderName = user.Name
			}
		}

		items = append(items, model.MessageItem{
			MessageId:   m.ID,
			SenderId:    m.SenderId,
			SenderName:  senderName,
			Content:     m.Content,
			MessageType: m.MessageType,
			Timestamp:   m.Timestamp.Format("2006-01-02T15:04:05Z"),
		})
	}

	return &model.MessageListResponse{
		Messages: items,
		Total:    count,
		Page:     req.Page,
		PageSize: req.PageSize,
	}, nil
}
