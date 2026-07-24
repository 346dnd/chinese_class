package service

import (
	"github.com/edu-chinese-classroom/agent"
	"github.com/edu-chinese-classroom/model"
)

type FeedbackService struct {
	coze *agent.CozeAgent
	tts  *agent.TTSAgent
}

func NewFeedbackService(coze *agent.CozeAgent, tts *agent.TTSAgent) *FeedbackService {
	return &FeedbackService{coze: coze, tts: tts}
}

func (s *FeedbackService) Generate(req model.FeedbackGenerateRequest, studentId string) (*model.FeedbackResponse, error) {
	cozeResp, err := s.coze.GenerateFeedback(req.StageId, req.TaskId, studentId)
	if err != nil {
		return nil, err
	}

	script := cozeResp.Reply
	durationMs := len(script) * 500

	return &model.FeedbackResponse{
		Type:       "audio",
		Script:     script,
		DurationMs: durationMs,
	}, nil
}
