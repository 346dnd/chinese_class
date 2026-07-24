package service

import (
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/model"
	"github.com/edu-chinese-classroom/repository"
)

type WriteService struct {
	coze *agent.CozeAgent
}

func NewWriteService(coze *agent.CozeAgent) *WriteService {
	return &WriteService{coze: coze}
}

func (s *WriteService) SubmitThought(req model.WriteRequest, studentId string) (*model.WriteResponse, error) {
	thought := &model.Thought{
		StudentId:      studentId,
		StageId:        req.StageId,
		TaskId:         req.TaskId,
		TextId:         req.TextId,
		ProudAspect:    req.ProudAspect,
		TextConnection: nullString(req.TextConnection),
		LifeConnection: nullString(req.LifeConnection),
		Content:        req.Content,
		ImageUrl:       req.ImageUrl,
		Passed:         false,
	}

	err := repository.CreateThought(thought)
	if err != nil {
		return nil, err
	}

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
	passed := len(req.Content) >= 20

	err = repository.UpdateThoughtFeedback(studentId, req.TextId, feedback, passed)
	if err != nil {
		return nil, err
	}

	nextAction := "next_task"
	if !passed {
		nextAction = "retry"
	}

	return &model.WriteResponse{
		Passed:          passed,
		Feedback:        feedback,
		RetryCount:      cozeResp.RetryCount,
		RetryExhausted:  cozeResp.RetryExhausted,
		NextAction:      nextAction,
	}, nil
}

func nullString(s string) *string {
	if s == "" {
		return nil
	}
	return &s
}
