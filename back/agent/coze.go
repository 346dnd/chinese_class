package agent

import (
	"fmt"
	"time"

	"github.com/edu-chinese-classroom/config"
	"github.com/edu-chinese-classroom/pkg/logger"
)

type CozeAgent struct {
	cfg *config.CozeConfig
}

func NewCozeAgent(cfg *config.CozeConfig) *CozeAgent {
	return &CozeAgent{cfg: cfg}
}

type CozeResponse struct {
	Reply           string `json:"reply"`
	RetryCount      int    `json:"retryCount"`
	RetryExhausted  bool   `json:"retryExhausted"`
	CorrectAnswer   string `json:"correctAnswer"`
}

type CozeRequest struct {
	StageId   string `json:"stageId"`
	TaskId    string `json:"taskId"`
	Message   string `json:"message"`
	StudentId string `json:"studentId"`
}

func (c *CozeAgent) Chat(req CozeRequest) (*CozeResponse, error) {
	result, err := c.callCozeAPI(req)
	if err != nil {
		logger.Warn("Coze API call failed, using fallback", logger.WithTrace(req.StudentId))
		return c.getFallbackResponse(req), nil
	}
	return result, nil
}

func (c *CozeAgent) GenerateFeedback(stageId, taskId, studentId string) (*CozeResponse, error) {
	req := CozeRequest{
		StageId:   stageId,
		TaskId:    taskId,
		Message:   "generate feedback",
		StudentId: studentId,
	}
	return c.Chat(req)
}

func (c *CozeAgent) callCozeAPI(req CozeRequest) (*CozeResponse, error) {
	if c.cfg.APIKey == "" {
		return nil, fmt.Errorf("Coze API key not configured")
	}

	time.Sleep(time.Duration(c.cfg.Timeout) * time.Millisecond / 2)

	return &CozeResponse{
		Reply:         "你的回答很棒！继续加油哦！",
		RetryCount:    0,
		RetryExhausted: false,
	}, nil
}

func (c *CozeAgent) getFallbackResponse(req CozeRequest) *CozeResponse {
	fallbackMessages := map[string]string{
		"write-thought": "你的回答很棒！继续加油哦！",
		"ask-question": "你的问题很有深度！继续思考！",
		"fill-blank": "请你再仔细想想，相信你一定能答对！",
		"creation": "你的想法很有趣！我们继续交流吧！",
	}

	msg, ok := fallbackMessages[req.TaskId]
	if !ok {
		msg = "你做得很好！继续努力！"
	}

	return &CozeResponse{
		Reply:          msg,
		RetryCount:     0,
		RetryExhausted: false,
	}
}
