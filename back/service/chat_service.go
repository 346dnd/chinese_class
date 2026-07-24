package service

import (
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/model"
)

type ChatService struct {
	coze *agent.CozeAgent
}

func NewChatService(coze *agent.CozeAgent) *ChatService {
	return &ChatService{coze: coze}
}

func (s *ChatService) Chat(req model.ChatRequest, studentId string) (*model.ChatResponse, error) {
	cozeResp, err := s.coze.Chat(agent.CozeRequest{
		StageId:   req.StageId,
		TaskId:    req.TaskId,
		Message:   req.Message,
		StudentId: studentId,
	})
	if err != nil {
		return nil, err
	}

	return &model.ChatResponse{
		Reply:          cozeResp.Reply,
		RetryCount:     cozeResp.RetryCount,
		RetryExhausted: cozeResp.RetryExhausted,
	}, nil
}

func (s *ChatService) Polish(req model.ChatPolishRequest, studentId string) (*model.ChatPolishResponse, error) {
	return &model.ChatPolishResponse{
		Original: "清明上河图画得很好看，街上有很多人。",
		Polished: "《清明上河图》描绘了北宋汴京的繁华景象——街市上人来人往，有的赶着毛驴，有的挑着担子，有的在茶馆里闲聊，栩栩如生，不愧为'名扬中外的画'。",
	}, nil
}

func (s *ChatService) Create(req model.ChatCreationRequest, studentId string) (*model.ChatCreationResponse, error) {
	if req.Action == "skip" {
		return &model.ChatCreationResponse{
			NextAction: "next_task",
		}, nil
	}

	return &model.ChatCreationResponse{
		NextAction:  "creation_page",
		CreationUrl: "/creation/" + req.OptionId + "?taskId=" + req.TaskId,
	}, nil
}
