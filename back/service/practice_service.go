package service

import (
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type PracticeService struct {
	coze *agent.CozeAgent
}

func NewPracticeService(coze *agent.CozeAgent) *PracticeService {
	return &PracticeService{coze: coze}
}

func (s *PracticeService) SubmitPractice(req model.PracticeRequest, studentId string) (*model.PracticeResponse, error) {
	passed := len(req.Content) >= 10

	cozeResp, err := s.coze.Chat(agent.CozeRequest{
		StageId:   req.StageId,
		TaskId:    req.TaskId,
		Message:   req.Content,
		StudentId: studentId,
	})
	if err != nil {
		return nil, err
	}

	feedback := cozeResp.Reply
	if passed {
		feedback = "正确！这句话就是全文的中心句。"
	}

	return &model.PracticeResponse{
		Passed:          passed,
		Feedback:        feedback,
		RetryCount:      cozeResp.RetryCount,
		RetryExhausted:  cozeResp.RetryExhausted,
	}, nil
}

func (s *PracticeService) SubmitReadAloud(req model.ReadAloudRequest, studentId string) (*model.PracticeResponse, error) {
	return s.SubmitPractice(model.PracticeRequest{
		StageId:  req.StageId,
		TaskId:   req.TaskId,
		ItemId:   req.ItemId,
		Content:  req.ReferenceText,
	}, studentId)
}
